/**
 * AIKeyManager — Central orchestrator for multi-key load balancing.
 *
 * Provider-agnostic: instantiate with a ProviderKeyConfig for Gemini, OpenAI,
 * Anthropic, or any future provider.
 *
 * Responsibilities:
 *  • Discovers keys from environment variables.
 *  • Maintains a KeyPool with health/cooldown/stats per key.
 *  • Provides getClient() / releaseClient() / markFailure() / markSuccess().
 *  • On HTTP 429: immediately cools the key, retries with the next healthy key.
 *  • When all keys are exhausted: returns a structured AllKeysExhaustedError.
 */

import { KeyPool } from "./KeyPool";
import {
  AllKeysExhaustedError,
  KeyLease,
  PoolStatus,
  ProviderKeyConfig,
} from "./types";

export class AIKeyManager<TClient> {
  private pool: KeyPool;
  private config: ProviderKeyConfig<TClient>;

  /** Cache of instantiated SDK clients keyed by keyId. */
  private clients: Map<string, TClient> = new Map();

  constructor(config: ProviderKeyConfig<TClient>) {
    if (config.apiKeys.length === 0) {
      throw new Error(
        `[AIKeyManager] No API keys configured for provider "${config.provider}". ` +
        `Set GEMINI_API_KEY, GEMINI_API_KEY_2, etc. in your environment.`,
      );
    }

    this.config = config;
    this.pool = new KeyPool(
      config.provider,
      config.apiKeys,
      config.defaultCooldownMs,
      config.maxCooldownMs,
    );
  }

  // ─── Static Factory: Discover Keys from Environment ────────────────────────

  /**
   * Scans process.env for keys matching the given prefix pattern.
   * e.g. discoverKeys("GEMINI_API_KEY") finds GEMINI_API_KEY, GEMINI_API_KEY_2, ...
   */
  static discoverKeys(envPrefix: string, env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {}): string[] {
    const keys: string[] = [];

    // Primary key (e.g. GEMINI_API_KEY)
    const primary = env[envPrefix];
    if (primary) keys.push(primary);

    // Numbered keys (e.g. GEMINI_API_KEY_2, _3, ... up to _20)
    for (let i = 2; i <= 20; i++) {
      const val = env[`${envPrefix}_${i}`];
      if (val) keys.push(val);
    }

    return keys;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Acquire the healthiest available key and return a lease.
   * Throws AllKeysExhaustedError (as a plain object) if every key is cooling.
   */
  getClient(): KeyLease<TClient> {
    const acquired = this.pool.acquireBestKey();

    if (!acquired) {
      const nextRecovery = this.pool.nextRecoveryTime();
      const retryAfterMs = nextRecovery > 0 ? nextRecovery - Date.now() : 30_000;

      const exhausted: AllKeysExhaustedError = {
        type: "ALL_KEYS_RATE_LIMITED",
        retryAfter: Math.max(1, Math.ceil(retryAfterMs / 1000)),
        provider: this.config.provider,
      };

      throw exhausted;
    }

    // Lazily create (and cache) the SDK client for this key.
    if (!this.clients.has(acquired.keyId)) {
      this.clients.set(acquired.keyId, this.config.createClient(acquired.secret));
    }

    const client = this.clients.get(acquired.keyId)!;

    return {
      keyId: acquired.keyId,
      client,
      release: (latencyMs: number) => {
        this.pool.markSuccess(acquired.keyId, latencyMs);
      },
      markFailure: (error: unknown) => {
        const retryAfterMs = AIKeyManager.extractRetryAfter(error);
        this.pool.markFailure(acquired.keyId, retryAfterMs);
      },
    };
  }

  /** Convenience: release a key by ID after success. */
  releaseClient(keyId: string, latencyMs: number): void {
    this.pool.markSuccess(keyId, latencyMs);
  }

  /** Convenience: mark a key as failed by ID. */
  markFailure(keyId: string, error: unknown): void {
    const retryAfterMs = AIKeyManager.extractRetryAfter(error);
    this.pool.markFailure(keyId, retryAfterMs);
  }

  /** Convenience: mark a key as succeeded by ID. */
  markSuccess(keyId: string, latencyMs: number): void {
    this.pool.markSuccess(keyId, latencyMs);
  }

  /** Return a full diagnostic snapshot of every key in the pool. */
  getPoolStatus(): PoolStatus {
    const stats = this.pool.getStats();
    return {
      provider: this.config.provider,
      totalKeys: stats.length,
      healthyKeys: stats.filter((k) => k.health === "HEALTHY").length,
      coolingDownKeys: stats.filter((k) => k.health === "COOLING_DOWN").length,
      deadKeys: stats.filter((k) => k.health === "DEAD").length,
      keys: stats,
    };
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Parse Retry-After from upstream errors.
   * Supports:
   *  - Gemini ApiError (.message contains "Please retry in <N>ms")
   *  - Standard Retry-After header value in seconds
   *  - Numeric status properties
   * Returns milliseconds, or undefined if not parseable.
   */
  static extractRetryAfter(error: unknown): number | undefined {
    if (!error || typeof error !== "object") return undefined;

    const errObj = error as Record<string, unknown>;

    // 1. Gemini SDK: message contains "Please retry in 741.734739ms."
    const message = typeof errObj.message === "string" ? errObj.message : "";
    const msMatch = message.match(/retry\s+in\s+([\d.]+)\s*ms/i);
    if (msMatch) return Math.ceil(parseFloat(msMatch[1]));

    // 2. Gemini SDK: message contains "Please retry in 3.5s."
    const sMatch = message.match(/retry\s+in\s+([\d.]+)\s*s(?:ec)?/i);
    if (sMatch) return Math.ceil(parseFloat(sMatch[1]) * 1000);

    // 3. Standard HTTP Retry-After header (in seconds)
    if (typeof errObj.retryAfter === "number") return errObj.retryAfter * 1000;
    if (typeof errObj.retry_after === "number") return (errObj.retry_after as number) * 1000;

    return undefined;
  }

  /**
   * Detects whether an error is an HTTP 429 (rate limit).
   * Works for Gemini ApiError, Supabase FunctionsHttpError, and generic errors.
   */
  static isRateLimitError(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;

    const errObj = error as Record<string, unknown>;

    // Gemini SDK: ApiError { status: 429 }
    if (errObj.status === 429) return true;

    // Supabase FunctionsHttpError: context.status === 429
    if (typeof errObj.context === "object" && errObj.context !== null) {
      if ((errObj.context as any).status === 429) return true;
    }

    // Message-based detection
    const message = typeof errObj.message === "string" ? errObj.message : "";
    if (
      message.includes("429") ||
      message.toLowerCase().includes("rate limit") ||
      message.includes("RESOURCE_EXHAUSTED") ||
      message.toLowerCase().includes("quota")
    ) {
      return true;
    }

    return false;
  }
}

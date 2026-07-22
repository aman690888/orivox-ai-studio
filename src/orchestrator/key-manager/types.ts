/**
 * AIKeyManager — Types
 *
 * Provider-agnostic types for the multi-key pool / load-balancer subsystem.
 * OpenAI, Anthropic, or any future provider can implement these same interfaces.
 */

// ─── Key Health ────────────────────────────────────────────────────────────────

export type KeyHealth = "HEALTHY" | "COOLING_DOWN" | "DEAD";

export interface KeyStats {
  /** Unique key identifier (never the raw secret — use a fingerprint). */
  keyId: string;
  /** Which AI provider this key belongs to. */
  provider: string;
  /** Current health state. */
  health: KeyHealth;
  /** Epoch-ms when cooldown expires (0 = not cooling). */
  cooldownUntil: number;
  /** Number of in-flight requests right now. */
  activeRequests: number;
  /** Lifetime request count. */
  totalRequests: number;
  /** Lifetime failure count. */
  failures: number;
  /** Running average latency in ms. */
  averageLatencyMs: number;
  /** Epoch-ms of the last time this key was used. */
  lastUsedAt: number;
}

// ─── Pool Status ───────────────────────────────────────────────────────────────

export interface PoolStatus {
  provider: string;
  totalKeys: number;
  healthyKeys: number;
  coolingDownKeys: number;
  deadKeys: number;
  keys: KeyStats[];
}

// ─── All-Keys-Exhausted Error ──────────────────────────────────────────────────

export interface AllKeysExhaustedError {
  type: "ALL_KEYS_RATE_LIMITED";
  retryAfter: number;  // seconds
  provider: string;
}

// ─── Key Lease (returned by getClient) ─────────────────────────────────────────

export interface KeyLease<TClient> {
  keyId: string;
  client: TClient;
  /** Call when the request finishes successfully. */
  release: (latencyMs: number) => void;
  /** Call when the request fails (e.g. 429, 500). */
  markFailure: (error: unknown) => void;
}

// ─── Provider Key Config (what a provider adapter supplies) ────────────────────

export interface ProviderKeyConfig<TClient> {
  /** Human-readable provider name (e.g. "Gemini", "OpenAI"). */
  provider: string;
  /** Raw API key secrets. */
  apiKeys: string[];
  /** Factory: create a provider SDK client from a raw key. */
  createClient: (apiKey: string) => TClient;
  /** Default cooldown in ms when no Retry-After header is given. */
  defaultCooldownMs?: number;
  /** Maximum cooldown cap in ms. */
  maxCooldownMs?: number;
}

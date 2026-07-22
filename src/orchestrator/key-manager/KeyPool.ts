/**
 * KeyPool — Tracks the health, cooldown, and usage statistics of every API key.
 *
 * This class is provider-agnostic. It stores raw key entries and exposes
 * mutation methods (markSuccess / markFailure / startCooldown) that the
 * AIKeyManager orchestrates.
 */

import { KeyHealth, KeyStats } from "./types";

interface KeyEntry {
  /** Stable fingerprint used as the public identifier. */
  keyId: string;
  /** The actual API-key secret — never exposed outside this module. */
  secret: string;
  health: KeyHealth;
  cooldownUntil: number;
  activeRequests: number;
  totalRequests: number;
  failures: number;
  /** Cumulative latency for average computation. */
  totalLatencyMs: number;
  lastUsedAt: number;
  /** Current exponential backoff multiplier (reset on success). */
  consecutiveFailures: number;
}

export class KeyPool {
  private keys: Map<string, KeyEntry> = new Map();

  constructor(
    private readonly provider: string,
    secrets: string[],
    private readonly defaultCooldownMs: number = 15_000,
    private readonly maxCooldownMs: number = 120_000,
  ) {
    for (const secret of secrets) {
      const keyId = KeyPool.fingerprint(secret);
      this.keys.set(keyId, {
        keyId,
        secret,
        health: "HEALTHY",
        cooldownUntil: 0,
        activeRequests: 0,
        totalRequests: 0,
        failures: 0,
        totalLatencyMs: 0,
        lastUsedAt: 0,
        consecutiveFailures: 0,
      });
    }
  }

  /** Derive a short, stable, non-reversible fingerprint from a key. */
  static fingerprint(secret: string): string {
    // Use first 4 + last 4 characters to create a safe identifier.
    const prefix = secret.slice(0, 4);
    const suffix = secret.slice(-4);
    return `key_${prefix}…${suffix}`;
  }

  /** Number of keys in the pool. */
  get size(): number {
    return this.keys.size;
  }

  /** Return a snapshot of all keys (never exposes the raw secret). */
  getStats(): KeyStats[] {
    const now = Date.now();
    const stats: KeyStats[] = [];

    for (const entry of this.keys.values()) {
      // Auto-recover keys whose cooldown has expired.
      if (entry.health === "COOLING_DOWN" && now >= entry.cooldownUntil) {
        entry.health = "HEALTHY";
        entry.cooldownUntil = 0;
      }

      stats.push({
        keyId: entry.keyId,
        provider: this.provider,
        health: entry.health,
        cooldownUntil: entry.cooldownUntil,
        activeRequests: entry.activeRequests,
        totalRequests: entry.totalRequests,
        failures: entry.failures,
        averageLatencyMs: entry.totalRequests > 0
          ? Math.round(entry.totalLatencyMs / entry.totalRequests)
          : 0,
        lastUsedAt: entry.lastUsedAt,
      });
    }

    return stats;
  }

  /**
   * Select the best available key. Returns null if all keys are exhausted.
   *
   * Selection criteria (in priority order):
   *  1. Must be HEALTHY (not COOLING_DOWN or DEAD).
   *  2. Lowest activeRequests (spread load).
   *  3. Least-recently-used (round-robin fairness).
   */
  acquireBestKey(): { keyId: string; secret: string } | null {
    const now = Date.now();
    let best: KeyEntry | null = null;

    for (const entry of this.keys.values()) {
      // Auto-recover expired cooldowns.
      if (entry.health === "COOLING_DOWN" && now >= entry.cooldownUntil) {
        entry.health = "HEALTHY";
        entry.cooldownUntil = 0;
      }

      if (entry.health !== "HEALTHY") continue;

      if (
        best === null ||
        entry.activeRequests < best.activeRequests ||
        (entry.activeRequests === best.activeRequests && entry.lastUsedAt < best.lastUsedAt)
      ) {
        best = entry;
      }
    }

    if (!best) return null;

    best.activeRequests++;
    best.totalRequests++;
    best.lastUsedAt = now;

    return { keyId: best.keyId, secret: best.secret };
  }

  /** Release a key after a successful call. */
  markSuccess(keyId: string, latencyMs: number): void {
    const entry = this.keys.get(keyId);
    if (!entry) return;

    entry.activeRequests = Math.max(0, entry.activeRequests - 1);
    entry.totalLatencyMs += latencyMs;
    entry.consecutiveFailures = 0;

    // If it was recovering from a cooldown, confirm healthy.
    if (entry.health === "COOLING_DOWN" && Date.now() >= entry.cooldownUntil) {
      entry.health = "HEALTHY";
      entry.cooldownUntil = 0;
    }
  }

  /** Mark a key as failed; put it into cooldown with exponential backoff. */
  markFailure(keyId: string, retryAfterMs?: number): void {
    const entry = this.keys.get(keyId);
    if (!entry) return;

    entry.activeRequests = Math.max(0, entry.activeRequests - 1);
    entry.failures++;
    entry.consecutiveFailures++;

    // Calculate cooldown duration.
    const backoff = retryAfterMs ??
      Math.min(this.defaultCooldownMs * Math.pow(2, entry.consecutiveFailures - 1), this.maxCooldownMs);

    entry.cooldownUntil = Date.now() + backoff;
    entry.health = "COOLING_DOWN";
  }

  /** Return the soonest time any cooling key will recover (epoch ms), or 0 if none are cooling. */
  nextRecoveryTime(): number {
    let earliest = Infinity;
    for (const entry of this.keys.values()) {
      if (entry.health === "COOLING_DOWN" && entry.cooldownUntil < earliest) {
        earliest = entry.cooldownUntil;
      }
    }
    return earliest === Infinity ? 0 : earliest;
  }
}

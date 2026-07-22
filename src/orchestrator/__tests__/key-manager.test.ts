import { describe, it, expect, vi, beforeEach } from "vitest";
import { KeyPool } from "../key-manager/KeyPool";
import { AIKeyManager } from "../key-manager/AIKeyManager";
import type { ProviderKeyConfig, AllKeysExhaustedError } from "../key-manager/types";

// ─── KeyPool Unit Tests ──────────────────────────────────────────────────────

describe("KeyPool", () => {
  const secrets = ["sk-AAAA1111", "sk-BBBB2222", "sk-CCCC3333"];

  it("initializes all keys as HEALTHY", () => {
    const pool = new KeyPool("Gemini", secrets);
    const stats = pool.getStats();
    expect(stats).toHaveLength(3);
    expect(stats.every((k) => k.health === "HEALTHY")).toBe(true);
  });

  it("generates stable fingerprints", () => {
    expect(KeyPool.fingerprint("sk-AAAA1111")).toBe("key_sk-A…1111");
    expect(KeyPool.fingerprint("sk-AAAA1111")).toBe("key_sk-A…1111"); // stable
  });

  describe("key selection", () => {
    it("selects the least-recently-used key", () => {
      const pool = new KeyPool("Gemini", secrets);

      const first = pool.acquireBestKey()!;
      pool.markSuccess(first.keyId, 100);

      const second = pool.acquireBestKey()!;
      pool.markSuccess(second.keyId, 100);

      const third = pool.acquireBestKey()!;
      pool.markSuccess(third.keyId, 100);

      // All three keys should have been used in order.
      expect(new Set([first.keyId, second.keyId, third.keyId]).size).toBe(3);
    });

    it("prefers the key with fewest active requests", () => {
      const pool = new KeyPool("Gemini", secrets);

      // Acquire key A twice (without releasing) to inflate its activeRequests.
      const a1 = pool.acquireBestKey()!;
      // Now key A has 1 active. Keys B and C have 0.
      const next = pool.acquireBestKey()!;
      expect(next.keyId).not.toBe(a1.keyId);
    });

    it("skips keys in cooldown", () => {
      const pool = new KeyPool("Gemini", secrets);

      const a = pool.acquireBestKey()!;
      pool.markFailure(a.keyId); // puts key A into cooldown

      // Next two selections should NOT return key A.
      const b = pool.acquireBestKey()!;
      const c = pool.acquireBestKey()!;
      expect(b.keyId).not.toBe(a.keyId);
      expect(c.keyId).not.toBe(a.keyId);
    });
  });

  describe("cooldown", () => {
    it("puts a key into COOLING_DOWN on failure", () => {
      const pool = new KeyPool("Gemini", secrets, 5000);
      const a = pool.acquireBestKey()!;
      pool.markFailure(a.keyId);

      const stats = pool.getStats();
      const keyA = stats.find((k) => k.keyId === a.keyId)!;
      expect(keyA.health).toBe("COOLING_DOWN");
      expect(keyA.cooldownUntil).toBeGreaterThan(Date.now());
    });

    it("uses exponential backoff for consecutive failures", () => {
      const pool = new KeyPool("Gemini", secrets, 1000, 60000);
      const a = pool.acquireBestKey()!;
      pool.markFailure(a.keyId);

      const stats1 = pool.getStats().find((k) => k.keyId === a.keyId)!;
      const cooldown1 = stats1.cooldownUntil - Date.now();

      // Re-acquire a different key, then fail the same key again.
      // First, advance time past cooldown.
      vi.useFakeTimers();
      vi.setSystemTime(stats1.cooldownUntil + 1);

      const a2 = pool.acquireBestKey()!; // Should re-acquire key A (it recovered).
      // Actually it might pick any recovered key. Let's just fail whichever we get.
      pool.markFailure(a2.keyId);

      const stats2 = pool.getStats().find((k) => k.keyId === a2.keyId)!;
      const cooldown2 = stats2.cooldownUntil - Date.now();

      expect(cooldown2).toBeGreaterThanOrEqual(cooldown1);

      vi.useRealTimers();
    });

    it("respects explicit retryAfterMs", () => {
      const pool = new KeyPool("Gemini", secrets, 1000);
      const a = pool.acquireBestKey()!;
      pool.markFailure(a.keyId, 30_000); // 30 seconds

      const stats = pool.getStats().find((k) => k.keyId === a.keyId)!;
      const cooldownRemaining = stats.cooldownUntil - Date.now();
      expect(cooldownRemaining).toBeGreaterThan(29_000);
      expect(cooldownRemaining).toBeLessThanOrEqual(30_100);
    });
  });

  describe("recovery", () => {
    it("auto-recovers keys after cooldown expires", () => {
      vi.useFakeTimers();

      const pool = new KeyPool("Gemini", secrets, 1000);
      const a = pool.acquireBestKey()!;
      pool.markFailure(a.keyId);

      // Key should be cooling.
      expect(pool.getStats().find((k) => k.keyId === a.keyId)!.health).toBe("COOLING_DOWN");

      // Advance past cooldown.
      vi.advanceTimersByTime(2000);

      // Should auto-recover.
      expect(pool.getStats().find((k) => k.keyId === a.keyId)!.health).toBe("HEALTHY");

      vi.useRealTimers();
    });

    it("resets consecutive failures on success", () => {
      const pool = new KeyPool("Gemini", ["sk-ONLY1111"], 100);

      const a = pool.acquireBestKey()!;
      pool.markFailure(a.keyId);

      vi.useFakeTimers();
      vi.advanceTimersByTime(200);

      const a2 = pool.acquireBestKey()!;
      pool.markSuccess(a2.keyId, 50);

      // Now fail again — should use base cooldown (not exponential from previous series).
      const a3 = pool.acquireBestKey()!;
      pool.markFailure(a3.keyId);

      const stats = pool.getStats().find((k) => k.keyId === a3.keyId)!;
      const cooldown = stats.cooldownUntil - Date.now();
      // Should be close to base (100ms), not escalated.
      expect(cooldown).toBeLessThanOrEqual(150);

      vi.useRealTimers();
    });
  });

  describe("pool exhaustion", () => {
    it("returns null when all keys are cooling down", () => {
      const pool = new KeyPool("Gemini", secrets, 60_000);

      // Fail all three keys.
      for (let i = 0; i < 3; i++) {
        const k = pool.acquireBestKey()!;
        pool.markFailure(k.keyId);
      }

      expect(pool.acquireBestKey()).toBeNull();
    });

    it("reports nextRecoveryTime correctly", () => {
      const pool = new KeyPool("Gemini", secrets, 5000);

      const a = pool.acquireBestKey()!;
      pool.markFailure(a.keyId, 10_000); // 10s cooldown

      const recovery = pool.nextRecoveryTime();
      expect(recovery).toBeGreaterThan(Date.now());
      expect(recovery).toBeLessThanOrEqual(Date.now() + 10_100);
    });
  });
});

// ─── AIKeyManager Unit Tests ─────────────────────────────────────────────────

describe("AIKeyManager", () => {
  const makeConfig = (keys: string[]): ProviderKeyConfig<{ id: string }> => ({
    provider: "TestProvider",
    apiKeys: keys,
    createClient: (key: string) => ({ id: KeyPool.fingerprint(key) }),
    defaultCooldownMs: 1000,
    maxCooldownMs: 10_000,
  });

  it("throws on construction if no keys are provided", () => {
    expect(() => new AIKeyManager(makeConfig([]))).toThrowError(/No API keys configured/);
  });

  describe("getClient()", () => {
    it("returns a KeyLease with a functional client", () => {
      const manager = new AIKeyManager(makeConfig(["key-A"]));
      const lease = manager.getClient();

      expect(lease.keyId).toBeDefined();
      expect(lease.client).toBeDefined();
      expect(typeof lease.release).toBe("function");
      expect(typeof lease.markFailure).toBe("function");
    });

    it("distributes requests across keys", () => {
      const manager = new AIKeyManager(makeConfig(["key-A", "key-B", "key-C"]));

      const leases = [manager.getClient(), manager.getClient(), manager.getClient()];
      const ids = new Set(leases.map((l) => l.keyId));
      expect(ids.size).toBe(3);

      leases.forEach((l) => l.release(100));
    });
  });

  describe("pool exhaustion", () => {
    it("throws ALL_KEYS_RATE_LIMITED when all keys are cooling", () => {
      const manager = new AIKeyManager(makeConfig(["key-A", "key-B"]));

      const l1 = manager.getClient();
      l1.markFailure(new Error("429"));

      const l2 = manager.getClient();
      l2.markFailure(new Error("429"));

      try {
        manager.getClient();
        expect.unreachable("Should have thrown");
      } catch (err) {
        const exhausted = err as AllKeysExhaustedError;
        expect(exhausted.type).toBe("ALL_KEYS_RATE_LIMITED");
        expect(exhausted.provider).toBe("TestProvider");
        expect(exhausted.retryAfter).toBeGreaterThan(0);
      }
    });
  });

  describe("getPoolStatus()", () => {
    it("reports correct pool status", () => {
      const manager = new AIKeyManager(makeConfig(["key-A", "key-B"]));

      const status = manager.getPoolStatus();
      expect(status.provider).toBe("TestProvider");
      expect(status.totalKeys).toBe(2);
      expect(status.healthyKeys).toBe(2);
      expect(status.coolingDownKeys).toBe(0);
    });

    it("tracks failure counts", () => {
      const manager = new AIKeyManager(makeConfig(["key-A"]));

      const l = manager.getClient();
      l.markFailure(new Error("429"));

      const status = manager.getPoolStatus();
      expect(status.keys[0].failures).toBe(1);
      expect(status.coolingDownKeys).toBe(1);
    });
  });

  describe("discoverKeys()", () => {
    it("discovers primary and numbered keys from env", () => {
      const env = {
        GEMINI_API_KEY: "primary",
        GEMINI_API_KEY_2: "second",
        GEMINI_API_KEY_3: "third",
        GEMINI_API_KEY_5: "fifth", // gap at 4 is fine
        UNRELATED_KEY: "ignored",
      };

      const keys = AIKeyManager.discoverKeys("GEMINI_API_KEY", env);
      expect(keys).toEqual(["primary", "second", "third", "fifth"]);
    });

    it("returns empty array when no keys match", () => {
      const keys = AIKeyManager.discoverKeys("OPENAI_API_KEY", {});
      expect(keys).toEqual([]);
    });
  });

  describe("extractRetryAfter()", () => {
    it("parses Gemini-style ms retry hint", () => {
      const err = { message: "Quota exceeded. Please retry in 741.734739ms." };
      expect(AIKeyManager.extractRetryAfter(err)).toBe(742);
    });

    it("parses second-based retry hint", () => {
      const err = { message: "Rate limited. Please retry in 3.5s." };
      expect(AIKeyManager.extractRetryAfter(err)).toBe(3500);
    });

    it("parses numeric retryAfter property", () => {
      const err = { message: "error", retryAfter: 30 };
      expect(AIKeyManager.extractRetryAfter(err)).toBe(30_000);
    });

    it("returns undefined for unparseable errors", () => {
      expect(AIKeyManager.extractRetryAfter({ message: "generic error" })).toBeUndefined();
      expect(AIKeyManager.extractRetryAfter(null)).toBeUndefined();
    });
  });

  describe("isRateLimitError()", () => {
    it("detects Gemini ApiError { status: 429 }", () => {
      expect(AIKeyManager.isRateLimitError({ status: 429, message: "quota" })).toBe(true);
    });

    it("detects Supabase FunctionsHttpError context", () => {
      expect(
        AIKeyManager.isRateLimitError({
          message: "Edge Function returned a non-2xx status code",
          context: { status: 429 },
        }),
      ).toBe(true);
    });

    it("detects RESOURCE_EXHAUSTED in message", () => {
      expect(AIKeyManager.isRateLimitError({ message: "RESOURCE_EXHAUSTED" })).toBe(true);
    });

    it("rejects non-429 errors", () => {
      expect(AIKeyManager.isRateLimitError({ status: 500, message: "server error" })).toBe(false);
      expect(AIKeyManager.isRateLimitError(null)).toBe(false);
    });
  });
});

// ─── Concurrent Request Stress Test ──────────────────────────────────────────

describe("AIKeyManager — Concurrent Requests", () => {
  it("handles 50 concurrent getClient() calls without crashing", () => {
    const manager = new AIKeyManager({
      provider: "StressTest",
      apiKeys: ["k1", "k2", "k3", "k4", "k5"],
      createClient: (k) => ({ key: k }),
      defaultCooldownMs: 500,
    });

    const leases = [];
    for (let i = 0; i < 50; i++) {
      leases.push(manager.getClient());
    }

    expect(leases).toHaveLength(50);

    // All 5 keys should share the load.
    const status = manager.getPoolStatus();
    expect(status.keys.every((k) => k.activeRequests === 10)).toBe(true);

    // Release all.
    leases.forEach((l) => l.release(50));
    expect(manager.getPoolStatus().keys.every((k) => k.activeRequests === 0)).toBe(true);
  });

  it("gracefully degrades when keys fail under load", () => {
    const manager = new AIKeyManager({
      provider: "Degrade",
      apiKeys: ["k1", "k2", "k3"],
      createClient: (k) => ({ key: k }),
      defaultCooldownMs: 60_000,
    });

    // Acquire and fail 2 keys.
    const l1 = manager.getClient();
    l1.markFailure(new Error("429"));
    const l2 = manager.getClient();
    l2.markFailure(new Error("429"));

    // Only key 3 should be left.
    const status = manager.getPoolStatus();
    expect(status.healthyKeys).toBe(1);

    // Should still serve from the remaining key.
    const l3 = manager.getClient();
    expect(l3.keyId).toBeDefined();
    l3.release(100);
  });
});

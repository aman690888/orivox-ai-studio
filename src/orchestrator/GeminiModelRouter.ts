/**
 * GeminiModelRouter — Integrates the AIKeyManager with the IModelRouter contract.
 *
 * This replaces the single-key constructor approach with a multi-key pool.
 * The router is still provider-specific (Gemini), but the key management
 * subsystem it delegates to is fully provider-agnostic.
 */

import { GoogleGenAI } from "@google/genai";
import { IModelRouter } from "./ModelRouter";
import { ModelCapabilities } from "./types";
import { AIKeyManager } from "./key-manager";

export class GeminiModelRouter implements IModelRouter {
  private keyManager: AIKeyManager<GoogleGenAI>;

  constructor(apiKeys?: string[]) {
    const keys = apiKeys ?? AIKeyManager.discoverKeys("GEMINI_API_KEY");

    this.keyManager = new AIKeyManager<GoogleGenAI>({
      provider: "Gemini",
      apiKeys: keys,
      createClient: (apiKey: string) => new GoogleGenAI({ apiKey }),
      defaultCooldownMs: 15_000,
      maxCooldownMs: 120_000,
    });
  }

  /**
   * Route a prompt through the healthiest available Gemini key.
   * On 429: cools the key and retries with the next available key.
   */
  public async routeToJSON<T>(prompt: string, capabilities: ModelCapabilities, signal: AbortSignal): Promise<T> {
    const model = "gemini-3.1-flash-lite";
    const maxAttempts = this.keyManager.getPoolStatus().totalKeys + 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (signal.aborted) throw new Error("Cancelled");

      const lease = this.keyManager.getClient(); // throws AllKeysExhaustedError if pool is empty
      const startTime = Date.now();

      try {
        const response = await lease.client.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        if (!response.text) {
          throw new Error("[GeminiModelRouter] Received empty response from model.");
        }

        let text = response.text;
        text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        const parsed = JSON.parse(text) as T;

        // Success — release the key.
        lease.release(Date.now() - startTime);
        return parsed;

      } catch (err: unknown) {
        const latency = Date.now() - startTime;

        if (AIKeyManager.isRateLimitError(err)) {
          // Cool this key and try the next one.
          lease.markFailure(err);
          console.warn(
            `[GeminiModelRouter] Key ${lease.keyId} rate-limited (attempt ${attempt + 1}/${maxAttempts}). Trying next key.`,
          );
          continue;
        }

        // Non-rate-limit error — release the key (it's still healthy) and propagate.
        lease.release(latency);
        throw err;
      }
    }

    // Should only be reached if all keys cycled through and all 429'd.
    throw this.keyManager.getPoolStatus();
  }

  /** Expose pool diagnostics for monitoring / admin endpoints. */
  public getPoolStatus() {
    return this.keyManager.getPoolStatus();
  }
}

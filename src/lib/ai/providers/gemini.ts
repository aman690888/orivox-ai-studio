import { BaseAIProvider } from "./base";
import { OutlineResponse, GenerationOptions } from "../types";
import { Slide, SlideKind } from "@/lib/mock";
import { supabase } from "@/lib/supabase";
import { AIError, AIRateLimitError, AIAuthenticationError, AICancellationError } from "../errors";

export class GeminiProvider extends BaseAIProvider {
  providerName = "gemini";

  private mapError(err: unknown): Error {
    console.error("[Edge Function error details]:", err);

    const errObj = err as Record<string, unknown> | null | undefined;
    const message = typeof errObj?.message === "string" ? errObj.message : String(err);
    const status = errObj?.status || errObj?.status_code || errObj?.statusCode;

    if (
      status === 429 ||
      message.includes("429") ||
      message.includes("rate limit") ||
      message.includes("Quota")
    ) {
      return new AIRateLimitError(this.providerName, "Gemini rate limit reached.", err);
    }

    if (
      status === 401 ||
      status === 403 ||
      message.includes("unauthorized") ||
      message.includes("403") ||
      message.includes("API key")
    ) {
      return new AIAuthenticationError(
        this.providerName,
        "Authentication failed. Unauthorized request.",
        err,
      );
    }

    return new AIError(message, this.providerName, "EDGE_FUNCTION_GEMINI_ERROR", err);
  }

  async generateOutline(prompt: string, options?: GenerationOptions): Promise<OutlineResponse> {
    console.log(`[Frontend-Edge] Requesting generate-outline for prompt: "${prompt}"`);
    this.checkCancellation(options);

    return this.withRetry(async () => {
      try {
        this.checkCancellation(options);

        const { data, error } = await supabase.functions.invoke("generate-outline", {
          body: { prompt, config: options?.config },
          signal: options?.signal,
        });

        if (error) {
          throw error;
        }

        this.checkCancellation(options);
        return data as OutlineResponse;
      } catch (err) {
        const errorObj = err as Record<string, unknown> | null | undefined;
        if (errorObj?.name === "AbortError" || err instanceof AICancellationError) {
          throw new AICancellationError(this.providerName);
        }
        throw this.mapError(err);
      }
    });
  }

  async generateSlides(outline: OutlineResponse, options?: GenerationOptions): Promise<Slide[]> {
    console.log(`[Frontend-Edge] Requesting generate-slides for outline: "${outline.title}"`);
    this.checkCancellation(options);

    return this.withRetry(async () => {
      try {
        this.checkCancellation(options);

        const { data, error } = await supabase.functions.invoke("generate-slides", {
          body: { outline, config: options?.config },
          signal: options?.signal,
        });

        if (error) {
          throw error;
        }

        this.checkCancellation(options);

        const rawSlides = (data.slides || []) as Array<{
          title: string;
          bullets?: string[];
          kind: string;
          notes?: string;
        }>;

        return rawSlides.map((s, index) => ({
          id: `slide-${index}-${Date.now()}`,
          title: s.title,
          bullets: s.bullets || [],
          kind: s.kind as SlideKind,
          notes: s.notes,
        }));
      } catch (err) {
        const errorObj = err as Record<string, unknown> | null | undefined;
        if (errorObj?.name === "AbortError" || err instanceof AICancellationError) {
          throw new AICancellationError(this.providerName);
        }
        throw this.mapError(err);
      }
    });
  }

  async generateSpeakerNotes(slide: Slide, options?: GenerationOptions): Promise<string> {
    this.checkCancellation(options);

    return this.withRetry(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.checkCancellation(options);
      return `Presenter talking points for: ${slide.title}. Make sure to explain the key items.`;
    });
  }
}

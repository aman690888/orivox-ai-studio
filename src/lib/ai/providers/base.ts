import { AIProviderInterface, OutlineResponse, GenerationOptions } from "../types";
import { Slide } from "@/lib/mock";
import { AICancellationError } from "../errors";

export abstract class BaseAIProvider implements AIProviderInterface {
  abstract providerName: string;

  abstract generateOutline(prompt: string, options?: GenerationOptions): Promise<OutlineResponse>;
  abstract generateSlides(outline: OutlineResponse, options?: GenerationOptions): Promise<Slide[]>;
  abstract generateSpeakerNotes(slide: Slide, options?: GenerationOptions): Promise<string>;

  protected checkCancellation(options?: GenerationOptions): void {
    if (options?.signal?.aborted) {
      throw new AICancellationError(this.providerName);
    }
  }

  protected async withRetry<R>(fn: () => Promise<R>, retries = 2, delayMs = 1000): Promise<R> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof AICancellationError) {
        throw error;
      }
      if (retries <= 0) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return this.withRetry(fn, retries - 1, delayMs * 2);
    }
  }
}

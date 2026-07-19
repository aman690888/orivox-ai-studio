import { BaseAIProvider } from "./base";
import { OutlineResponse, GenerationOptions } from "../types";
import { Slide } from "@/lib/mock";

export class OpenAIProvider extends BaseAIProvider {
  providerName = "openai";

  async generateOutline(prompt: string, options?: GenerationOptions): Promise<OutlineResponse> {
    this.checkCancellation(options);

    // Simulate generation latency
    return this.withRetry(
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        this.checkCancellation(options);

        return {
          title: `OpenAI Outline: ${prompt}`,
          outline: [
            {
              title: "Introduction to Theme",
              description: "First introduction slide",
              kind: "cover",
            },
            { title: "Detailed Analysis", description: "Second detail slide", kind: "content" },
          ],
        };
      },
      1,
      500,
    );
  }

  async generateSlides(outline: OutlineResponse, options?: GenerationOptions): Promise<Slide[]> {
    this.checkCancellation(options);

    return this.withRetry(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.checkCancellation(options);

      return outline.outline.map((o, idx) => ({
        id: `openai-slide-${idx}-${Date.now()}`,
        kind: o.kind,
        title: o.title,
        bullets: [o.description, "Next content item"],
      }));
    });
  }

  async generateSpeakerNotes(slide: Slide, options?: GenerationOptions): Promise<string> {
    this.checkCancellation(options);

    return this.withRetry(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.checkCancellation(options);
      return `Speaker notes for slide: ${slide.title}. Remember to highlight bullet details.`;
    });
  }
}

import { BaseAIProvider } from "./base";
import { OutlineResponse, GenerationOptions } from "../types";
import { Slide } from "@/lib/mock";

export class AnthropicProvider extends BaseAIProvider {
  providerName = "anthropic";

  async generateOutline(prompt: string, options?: GenerationOptions): Promise<OutlineResponse> {
    this.checkCancellation(options);

    return this.withRetry(
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        this.checkCancellation(options);

        return {
          title: `Anthropic Outline: ${prompt}`,
          outline: [
            { title: "Intro Deck", description: "Claude-drafted cover slide", kind: "cover" },
            { title: "Key Visuals", description: "Claude-drafted diagram slide", kind: "diagram" },
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
        id: `anthropic-slide-${idx}-${Date.now()}`,
        kind: o.kind,
        title: o.title,
        bullets: [o.description, "Claude extra bullet context"],
      }));
    });
  }

  async generateSpeakerNotes(slide: Slide, options?: GenerationOptions): Promise<string> {
    this.checkCancellation(options);

    return this.withRetry(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.checkCancellation(options);
      return `Speaker notes by Claude: Emphasize ${slide.title} transition times.`;
    });
  }
}

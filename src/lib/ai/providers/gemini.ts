import { BaseAIProvider } from "./base";
import { OutlineResponse, GenerationOptions } from "../types";
import { Slide } from "@/lib/mock";

export class GeminiProvider extends BaseAIProvider {
  providerName = "gemini";

  async generateOutline(prompt: string, options?: GenerationOptions): Promise<OutlineResponse> {
    this.checkCancellation(options);

    return this.withRetry(
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        this.checkCancellation(options);

        return {
          title: `Gemini Outline: ${prompt}`,
          outline: [
            {
              title: "Gemini Cover Layout",
              description: "Google Gemini cover details",
              kind: "cover",
            },
            { title: "Stat Highlights", description: "Google Gemini chart details", kind: "chart" },
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
        id: `gemini-slide-${idx}-${Date.now()}`,
        kind: o.kind,
        title: o.title,
        bullets: [o.description, "Gemini auto-generated stats"],
      }));
    });
  }

  async generateSpeakerNotes(slide: Slide, options?: GenerationOptions): Promise<string> {
    this.checkCancellation(options);

    return this.withRetry(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.checkCancellation(options);
      return `Speaker notes by Gemini: Focus on stat details on slide: ${slide.title}`;
    });
  }
}

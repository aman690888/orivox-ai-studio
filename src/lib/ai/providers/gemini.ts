import { GoogleGenAI, GenerateContentConfig } from "@google/genai";
import { BaseAIProvider } from "./base";
import { OutlineResponse, GenerationOptions } from "../types";
import { Slide, SlideKind } from "@/lib/mock";
import { DEFAULT_GEMINI_CONFIG } from "../config";
import { AIError, AIRateLimitError, AIAuthenticationError, AICancellationError } from "../errors";
import { PRESENTATION_OUTLINE_PROMPT } from "../prompts/presentation";
import { SPEAKER_NOTES_PROMPT } from "../prompts/speaker-notes";

export class GeminiProvider extends BaseAIProvider {
  providerName = "gemini";
  private client: GoogleGenAI | null = null;

  constructor() {
    super();
    // In Vite applications, env variables are loaded from import.meta.env
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  private getClient(): GoogleGenAI {
    if (!this.client) {
      throw new AIAuthenticationError(
        this.providerName,
        "Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your local .env file.",
      );
    }
    return this.client;
  }

  private mapError(err: unknown): Error {
    console.error("[Gemini error details]:", err);

    const errObj = err as Record<string, unknown> | null | undefined;
    const message = typeof errObj?.message === "string" ? errObj.message : String(err);
    const status = errObj?.status || errObj?.status_code || errObj?.statusCode;

    // Detect rate limit / quota issues
    if (
      status === 429 ||
      message.includes("429") ||
      message.includes("Quota exceeded") ||
      message.includes("rate limit")
    ) {
      return new AIRateLimitError(
        this.providerName,
        "Gemini API quota or rate limit exceeded.",
        err,
      );
    }

    // Detect authentication / key issues
    if (
      status === 401 ||
      status === 403 ||
      message.includes("API key not valid") ||
      message.includes("unauthorized") ||
      message.includes("403")
    ) {
      return new AIAuthenticationError(
        this.providerName,
        "Gemini API key authentication failed.",
        err,
      );
    }

    return new AIError(message, this.providerName, "UNKNOWN_GEMINI_ERROR", err);
  }

  async generateOutline(prompt: string, options?: GenerationOptions): Promise<OutlineResponse> {
    console.log(`[Gemini] Generating outline for prompt: "${prompt}"`);
    this.checkCancellation(options);

    const client = this.getClient();
    const model = options?.config?.modelName || DEFAULT_GEMINI_CONFIG.modelName!;

    const outlineSchema = {
      type: "object",
      properties: {
        title: { type: "string" },
        outline: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              kind: {
                type: "string",
                enum: ["cover", "content", "chart", "diagram", "quote", "closing"],
              },
            },
            required: ["title", "description", "kind"],
          },
        },
      },
      required: ["title", "outline"],
    };

    return this.withRetry(async () => {
      try {
        this.checkCancellation(options);

        const response = await client.models.generateContent({
          model,
          contents: PRESENTATION_OUTLINE_PROMPT(prompt),
          config: {
            responseMimeType: "application/json",
            responseSchema: outlineSchema as unknown as GenerateContentConfig["responseSchema"],
            temperature: options?.config?.temperature ?? DEFAULT_GEMINI_CONFIG.temperature,
            maxOutputTokens: options?.config?.maxTokens ?? DEFAULT_GEMINI_CONFIG.maxTokens,
          },
        });

        this.checkCancellation(options);

        const text = response.text;
        if (!text) {
          throw new AIError(
            "Gemini returned an empty outline response",
            this.providerName,
            "EMPTY_RESPONSE",
          );
        }

        const data = JSON.parse(text) as OutlineResponse;
        console.log(`[Gemini] Outline generated successfully: "${data.title}"`);
        return data;
      } catch (err) {
        if (err instanceof AICancellationError) throw err;
        throw this.mapError(err);
      }
    });
  }

  async generateSlides(outline: OutlineResponse, options?: GenerationOptions): Promise<Slide[]> {
    console.log(`[Gemini] Generating slides for outline: "${outline.title}"`);
    this.checkCancellation(options);

    const client = this.getClient();
    const model = options?.config?.modelName || DEFAULT_GEMINI_CONFIG.modelName!;

    const slidesSchema = {
      type: "object",
      properties: {
        slides: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              bullets: {
                type: "array",
                items: { type: "string" },
              },
              kind: {
                type: "string",
                enum: ["cover", "content", "chart", "diagram", "quote", "closing"],
              },
              notes: { type: "string" },
            },
            required: ["title", "kind"],
          },
        },
      },
      required: ["slides"],
    };

    const promptText = `
    Based on the following presentation outline, generate the content for all the slides.
    
    Presentation Title: "${outline.title}"
    Outline Items:
    ${JSON.stringify(outline.outline, null, 2)}
    
    Make sure to match the requested slide 'kind' for each slide. Include 2-4 bullets per slide when layout allows (like content, cover, closing). Return notes for the speaker as well.
    `;

    return this.withRetry(async () => {
      try {
        this.checkCancellation(options);

        const response = await client.models.generateContent({
          model,
          contents: promptText,
          config: {
            responseMimeType: "application/json",
            responseSchema: slidesSchema as unknown as GenerateContentConfig["responseSchema"],
            temperature: options?.config?.temperature ?? DEFAULT_GEMINI_CONFIG.temperature,
            maxOutputTokens: options?.config?.maxTokens ?? DEFAULT_GEMINI_CONFIG.maxTokens,
          },
        });

        this.checkCancellation(options);

        const text = response.text;
        if (!text) {
          throw new AIError(
            "Gemini returned an empty slides response",
            this.providerName,
            "EMPTY_RESPONSE",
          );
        }

        const rawData = JSON.parse(text) as {
          slides: Array<{
            title: string;
            bullets?: string[];
            kind: string;
            notes?: string;
          }>;
        };

        const slides: Slide[] = rawData.slides.map((s, index) => ({
          id: `slide-${index}-${Date.now()}`,
          title: s.title,
          bullets: s.bullets || [],
          kind: s.kind as SlideKind,
          notes: s.notes,
        }));

        console.log(`[Gemini] Generated ${slides.length} slides successfully.`);
        return slides;
      } catch (err) {
        if (err instanceof AICancellationError) throw err;
        throw this.mapError(err);
      }
    });
  }

  async generateSpeakerNotes(slide: Slide, options?: GenerationOptions): Promise<string> {
    console.log(`[Gemini] Generating speaker notes for slide: "${slide.title}"`);
    this.checkCancellation(options);

    const client = this.getClient();
    const model = options?.config?.modelName || DEFAULT_GEMINI_CONFIG.modelName!;

    return this.withRetry(async () => {
      try {
        this.checkCancellation(options);

        const response = await client.models.generateContent({
          model,
          contents: SPEAKER_NOTES_PROMPT(slide),
          config: {
            temperature: options?.config?.temperature ?? DEFAULT_GEMINI_CONFIG.temperature,
            maxOutputTokens: options?.config?.maxTokens ?? DEFAULT_GEMINI_CONFIG.maxTokens,
          },
        });

        this.checkCancellation(options);

        const text = response.text;
        if (!text) {
          throw new AIError(
            "Gemini returned empty speaker notes",
            this.providerName,
            "EMPTY_RESPONSE",
          );
        }

        console.log(`[Gemini] Speaker notes generated successfully for slide: "${slide.title}"`);
        return text;
      } catch (err) {
        if (err instanceof AICancellationError) throw err;
        throw this.mapError(err);
      }
    });
  }
}

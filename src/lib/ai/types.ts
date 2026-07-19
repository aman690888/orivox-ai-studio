import { SlideKind, Slide } from "@/lib/mock";

export type AIProviderName = "openai" | "anthropic" | "gemini";

export interface AIModelConfig {
  provider: AIProviderName;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerationOptions {
  config?: AIModelConfig;
  signal?: AbortSignal;
  onChunk?: (chunk: string) => void;
}

export interface OutlineItem {
  title: string;
  description: string;
  kind: SlideKind;
}

export interface OutlineResponse {
  title: string;
  outline: OutlineItem[];
}

export interface AIProviderInterface {
  generateOutline(prompt: string, options?: GenerationOptions): Promise<OutlineResponse>;
  generateSlides(outline: OutlineResponse, options?: GenerationOptions): Promise<Slide[]>;
  generateSpeakerNotes(slide: Slide, options?: GenerationOptions): Promise<string>;
  streamSlides?(
    outline: OutlineResponse,
    options?: GenerationOptions,
  ): AsyncGenerator<Slide[], void, unknown>;
}

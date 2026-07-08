import { getAIProvider } from "..";
import { GenerationOptions, OutlineResponse } from "../types";
import { Slide } from "@/lib/mock";

export async function generatePresentationOutline(
  topic: string,
  options?: GenerationOptions,
): Promise<OutlineResponse> {
  const providerName = options?.config?.provider || "openai";
  const provider = getAIProvider(providerName);

  return provider.generateOutline(topic, options);
}

export async function generatePresentationSlides(
  outline: OutlineResponse,
  options?: GenerationOptions,
): Promise<Slide[]> {
  const providerName = options?.config?.provider || "openai";
  const provider = getAIProvider(providerName);

  return provider.generateSlides(outline, options);
}

export async function generateFullPresentation(
  topic: string,
  options?: GenerationOptions,
): Promise<{ title: string; slides: Slide[] }> {
  const outline = await generatePresentationOutline(topic, options);
  const slides = await generatePresentationSlides(outline, options);

  return {
    title: outline.title,
    slides,
  };
}

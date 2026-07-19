import { getAIProvider } from "..";
import { GenerationOptions } from "../types";
import { Slide } from "@/lib/mock";

export async function generateSlideSpeakerNotes(
  slide: Slide,
  options?: GenerationOptions,
): Promise<string> {
  const providerName = options?.config?.provider || "openai";
  const provider = getAIProvider(providerName);

  return provider.generateSpeakerNotes(slide, options);
}

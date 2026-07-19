import { OpenAIProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";
import { GeminiProvider } from "./providers/gemini";
import { AIProviderName, AIProviderInterface } from "./types";

const providers: Record<AIProviderName, AIProviderInterface> = {
  openai: new OpenAIProvider(),
  anthropic: new AnthropicProvider(),
  gemini: new GeminiProvider(),
};

export function getAIProvider(name: AIProviderName = "openai"): AIProviderInterface {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`AI Provider "${name}" is not registered.`);
  }
  return provider;
}

export * from "./types";
export * from "./errors";
export * from "./prompts/presentation";
export * from "./prompts/slides";
export * from "./prompts/speaker-notes";
export * from "./services/presentation-generator";
export * from "./services/slide-generator";
export * from "./config";

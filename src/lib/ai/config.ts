import { AIModelConfig } from "./types";

export const DEFAULT_GEMINI_CONFIG: AIModelConfig = {
  provider: "gemini",
  modelName: "gemini-2.5-flash",
  temperature: 0.7,
  maxTokens: 2048,
};

export const AI_CONFIGS = {
  defaultProvider: "gemini" as const,
  models: {
    gemini: {
      flash: "gemini-2.5-flash",
      pro: "gemini-2.5-pro",
    },
    openai: {
      gpt4o: "gpt-4o",
      gpt4oMini: "gpt-4o-mini",
    },
    anthropic: {
      sonnet: "claude-3-5-sonnet-20241022",
    },
  },
};

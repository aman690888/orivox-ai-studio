import { AIModelConfig } from "./types";

export const CANONICAL_GEMINI_MODEL = "gemini-3.1-flash-lite";

export const DEFAULT_GEMINI_CONFIG: AIModelConfig = {
  provider: "gemini",
  modelName: CANONICAL_GEMINI_MODEL,
  temperature: 0.7,
  maxTokens: 2048,
};

export const AI_CONFIGS = {
  defaultProvider: "gemini" as const,
  models: {
    gemini: {
      flash: CANONICAL_GEMINI_MODEL,
      pro: CANONICAL_GEMINI_MODEL,
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

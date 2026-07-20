export interface ModelDefinition {
  id: string; // e.g., "gpt-4o", "claude-3-5-sonnet"
  provider: "openai" | "anthropic" | "google" | "local";
  capabilities: {
    reasoning_ability: number; // 0.0 - 1.0
    json_support: boolean;
    multimodal_support: boolean;
    image_generation: boolean;
  };
  context_length: number;
  latency_tier: "low" | "medium" | "high";
  pricing_tier: "low" | "medium" | "high";
  supported_tools: string[];
}

export const ModelRegistry: Record<string, ModelDefinition> = {
  "gpt-4o": {
    id: "gpt-4o",
    provider: "openai",
    capabilities: {
      reasoning_ability: 0.95,
      json_support: true,
      multimodal_support: true,
      image_generation: false,
    },
    context_length: 128000,
    latency_tier: "medium",
    pricing_tier: "high",
    supported_tools: ["function_calling", "json_mode"],
  },
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    provider: "openai",
    capabilities: {
      reasoning_ability: 0.75,
      json_support: true,
      multimodal_support: true,
      image_generation: false,
    },
    context_length: 128000,
    latency_tier: "low",
    pricing_tier: "low",
    supported_tools: ["function_calling", "json_mode"],
  },
  "claude-3-5-sonnet": {
    id: "claude-3-5-sonnet",
    provider: "anthropic",
    capabilities: {
      reasoning_ability: 0.98,
      json_support: true,
      multimodal_support: true,
      image_generation: false,
    },
    context_length: 200000,
    latency_tier: "medium",
    pricing_tier: "high",
    supported_tools: ["function_calling"],
  },
};

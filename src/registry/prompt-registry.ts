export interface PromptVersion {
  version: string;
  hash: string;
  created_at: string;
  template: string;
  compatible_models: string[];
  change_history: string;
}

export interface PromptTemplateDef {
  prompt_id: string;
  active_version: string;
  versions: Record<string, PromptVersion>;
}

export const PromptRegistry: Record<string, PromptTemplateDef> = {
  "intent-extraction": {
    prompt_id: "intent-extraction",
    active_version: "v1.0.0",
    versions: {
      "v1.0.0": {
        version: "v1.0.0",
        hash: "a1b2c3d4",
        created_at: "2026-07-20T00:00:00Z",
        template: "You are an expert Presentation Strategist...",
        compatible_models: ["gpt-4o", "claude-3-5-sonnet"],
        change_history: "Initial version",
      }
    }
  }
};

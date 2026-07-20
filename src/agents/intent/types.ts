export interface InferredField<T> {
  value: T;
  confidence: number; // 0.0 to 1.0
}

export interface PresentationIntent {
  topic: InferredField<string>;
  audience: InferredField<string>;
  audience_persona: InferredField<string>;
  audience_knowledge_level: InferredField<"Beginner" | "Intermediate" | "Expert">;
  purpose: InferredField<string>;
  presentation_goal: InferredField<string>;
  presentation_type: InferredField<string>;
  presentation_length: InferredField<number>;
  language: InferredField<string>;
  culture: InferredField<string>;
  tone: InferredField<string>;
  storytelling_style: InferredField<string>;
  visual_density: InferredField<"Low" | "Medium" | "High">;
  information_density: InferredField<"Low" | "Medium" | "High">;
  image_style: InferredField<string>;
  color_mood: InferredField<string>;
  animation_preference: InferredField<string>;
  accessibility_preference: InferredField<string>;
  presenter_mode: InferredField<boolean>;
  export_mode: InferredField<boolean>;
  complexity: InferredField<"Simple" | "Standard" | "Complex">;
  research_requirement: InferredField<boolean>;
  citation_requirement: InferredField<boolean>;
  web_search_requirement: InferredField<boolean>;
}

export interface ClarificationRequest {
  clarificationRequired: true;
  questions: string[];
  missingFields: string[];
}

export type IntentAgentOutput = PresentationIntent | ClarificationRequest;

export interface IntentAgentInput {
  userPrompt: string;
}

import { IAgent, ModelCapabilities } from "@/orchestrator/types";
import { IModelRouter } from "@/orchestrator/ModelRouter";
import { IntentAgentOutput, IntentAgentInput, PresentationIntent, ClarificationRequest, InferredField } from "./types";

export class IntentAgent implements IAgent<IntentAgentInput, IntentAgentOutput> {
  public id = "intent-agent";
  public model_requirements: ModelCapabilities = {
    needs_reasoning: false,
    needs_json_mode: true,
  };

  private readonly MIN_CONFIDENCE_THRESHOLD = 0.1;

  constructor(private modelRouter: IModelRouter) {}

  public async execute(context: IntentAgentInput, signal: AbortSignal): Promise<IntentAgentOutput> {
    const rawResponse = await this.modelRouter.routeToJSON<any>(
      this.buildPrompt(context.userPrompt),
      this.model_requirements,
      signal
    );

    if (rawResponse.clarificationRequired) {
      return this.parseClarification(rawResponse);
    }

    const parsed = this.parse(rawResponse);
    return this.validate(parsed); // Returns Clarification if confidence is too low
  }

  public parseClarification(rawPayload: any): ClarificationRequest {
    return {
      clarificationRequired: true,
      questions: Array.isArray(rawPayload.questions) ? rawPayload.questions : [],
      missingFields: Array.isArray(rawPayload.missingFields) ? rawPayload.missingFields : [],
    };
  }

  public parse(rawPayload: any): PresentationIntent {
    const wrap = (val: any, conf: number = 0.5): InferredField<any> => ({
      value: val?.value !== undefined ? val.value : val,
      confidence: val?.confidence !== undefined ? val.confidence : conf,
    });

    return {
      topic: wrap(rawPayload?.topic, 0.9),
      audience: wrap(rawPayload?.audience || "General"),
      audience_persona: wrap(rawPayload?.audience_persona || "General Public"),
      audience_knowledge_level: wrap(rawPayload?.audience_knowledge_level || "Beginner"),
      purpose: wrap(rawPayload?.purpose || "Inform"),
      presentation_goal: wrap(rawPayload?.presentation_goal || "Educate"),
      presentation_type: wrap(rawPayload?.presentation_type || "Presentation"),
      presentation_length: wrap(typeof rawPayload?.presentation_length === "number" ? rawPayload.presentation_length : 10),
      language: wrap(rawPayload?.language || "English"),
      culture: wrap(rawPayload?.culture || "Global"),
      tone: wrap(rawPayload?.tone || "Professional"),
      storytelling_style: wrap(rawPayload?.storytelling_style || "Direct"),
      visual_density: wrap(rawPayload?.visual_density || "Medium"),
      information_density: wrap(rawPayload?.information_density || "Medium"),
      image_style: wrap(rawPayload?.image_style || "Photography"),
      color_mood: wrap(rawPayload?.color_mood || "Neutral"),
      animation_preference: wrap(rawPayload?.animation_preference || "Subtle"),
      accessibility_preference: wrap(rawPayload?.accessibility_preference || "Standard"),
      presenter_mode: wrap(rawPayload?.presenter_mode ?? false),
      export_mode: wrap(rawPayload?.export_mode ?? true),
      complexity: wrap(rawPayload?.complexity || "Standard"),
      research_requirement: wrap(rawPayload?.research_requirement ?? false),
      citation_requirement: wrap(rawPayload?.citation_requirement ?? false),
      web_search_requirement: wrap(rawPayload?.web_search_requirement ?? false),
    };
  }

  public validate(intent: PresentationIntent): IntentAgentOutput {
    const lowConfidenceFields: string[] = [];
    
    // Check all fields for confidence threshold
    Object.entries(intent).forEach(([key, field]) => {
      if (field.confidence < this.MIN_CONFIDENCE_THRESHOLD) {
        lowConfidenceFields.push(key);
      }
    });

    // if (lowConfidenceFields.length > 0 || intent.topic.confidence < 0.1) {
    //   return {
    //     clarificationRequired: true,
    //     questions: ["Could you provide more specific details about your goal and audience?"],
    //     missingFields: lowConfidenceFields,
    //   };
    // }

    if (intent.presentation_length.value <= 0 || intent.presentation_length.value > 100) {
      throw new Error(`[IntentAgent] Validation Error: Invalid presentation length (${intent.presentation_length.value}).`);
    }

    return intent;
  }

  private buildPrompt(userPrompt: string): string {
    return `
You are an expert Presentation Strategist parsing a user request.
Extract the core constraints into a strict JSON object. For every field, assign a confidence score (0.0 to 1.0).
DO NOT ask for clarification. If the prompt is vague, make your best guess.

USER PROMPT:
"""
${userPrompt}
"""
`;
  }
}

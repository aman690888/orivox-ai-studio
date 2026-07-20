import { IAgent, ModelCapabilities } from "@/orchestrator/types";
import { IModelRouter } from "@/orchestrator/ModelRouter";
import { ClarificationRequest } from "@/agents/intent/types";
import { ContentWriterInput, ContentOutput, SlideContentOutput, PopulatedPlaceholder } from "./types";
import { DetailedContentPlaceholder } from "@/agents/content-planner/types";

export class ContentWriterAgent implements IAgent<ContentWriterInput, ContentOutput | ClarificationRequest> {
  public id = "content-writer-agent";
  
  public model_requirements: ModelCapabilities = {
    needs_reasoning: true,
    needs_json_mode: true,
  };

  private readonly MIN_CONFIDENCE_THRESHOLD = 0.1;

  constructor(private modelRouter: IModelRouter) {}

  public async execute(context: ContentWriterInput, signal: AbortSignal): Promise<ContentOutput | ClarificationRequest> {
    const rawResponse = await this.modelRouter.routeToJSON<any>(
      this.buildPrompt(context),
      this.model_requirements,
      signal
    );

    if (rawResponse.clarificationRequired) {
      return this.parseClarification(rawResponse);
    }

    const parsed = this.parse(rawResponse);
    return this.validate(parsed, context);
  }

  private parseClarification(rawPayload: any): ClarificationRequest {
    return {
      clarificationRequired: true,
      questions: Array.isArray(rawPayload.questions) ? rawPayload.questions : [],
      missingFields: Array.isArray(rawPayload.missingFields) ? rawPayload.missingFields : [],
    };
  }

  private parse(rawPayload: any): ContentOutput {
    const slides: SlideContentOutput[] = Array.isArray(rawPayload?.slides) ? rawPayload.slides.map((sl: any) => ({
      slide_id: sl.slide_id || "unknown",
      populated_placeholders: Array.isArray(sl.populated_placeholders) ? sl.populated_placeholders.map((ph: any) => ({
        placeholder_id: ph.placeholder_id || "unknown",
        value: ph.value,
        word_count: typeof ph.word_count === "number" ? ph.word_count : this.calculateWordCount(ph.value),
        content_type: ph.content_type || "unknown",
      })) : []
    })) : [];

    return {
      slides,
      global_confidence_score: typeof rawPayload?.global_confidence_score === "number" ? rawPayload.global_confidence_score : 1.0,
    };
  }

  private calculateWordCount(value: any): number {
    if (typeof value === "string") {
      return value.trim().split(/\s+/).filter(Boolean).length;
    } else if (Array.isArray(value)) {
      return value.reduce((sum: number, item: any) => sum + this.calculateWordCount(item), 0);
    } else if (typeof value === "object" && value !== null) {
      return Object.values(value).reduce((sum: number, item: any) => sum + this.calculateWordCount(item), 0);
    }
    return 0;
  }

  private validate(output: ContentOutput, context: ContentWriterInput): ContentOutput | ClarificationRequest {
    if (output.global_confidence_score < this.MIN_CONFIDENCE_THRESHOLD) {
      return {
        clarificationRequired: true,
        questions: ["The required tone and formatting rules clash with the provided subject matter. Please clarify."],
        missingFields: [],
      };
    }

    // Determine the expected universe of placeholders to validate against
    const expectedPlaceholders = new Map<string, DetailedContentPlaceholder>();
    context.contentPlan.slides.forEach(slide => {
      slide.placeholders.forEach(ph => {
        if (!context.target_placeholder_ids || context.target_placeholder_ids.includes(ph.placeholder_id)) {
          expectedPlaceholders.set(ph.placeholder_id, ph);
        }
      });
    });

    const filledPlaceholders = new Set<string>();

    output.slides.forEach(slideOut => {
      slideOut.populated_placeholders.forEach(phOut => {
        // Validation: No duplicate placeholders
        if (filledPlaceholders.has(phOut.placeholder_id)) {
          throw new Error(`[ContentWriterAgent] Validation Error: Duplicate placeholder_id populated '${phOut.placeholder_id}'.`);
        }
        filledPlaceholders.add(phOut.placeholder_id);

        const expected = expectedPlaceholders.get(phOut.placeholder_id);
        if (!expected) {
          throw new Error(`[ContentWriterAgent] Validation Error: Populated unknown placeholder '${phOut.placeholder_id}'.`);
        }

        // Validation: Word Count Limits
        const actualWordCount = this.calculateWordCount(phOut.value);
        // Add a small 10% buffer for mathematical safety
        if (actualWordCount > expected.max_words * 1.1) {
           throw new Error(`[ContentWriterAgent] Validation Error: Placeholder '${phOut.placeholder_id}' exceeded max word count (${actualWordCount} > ${expected.max_words}).`);
        }
        if (actualWordCount < Math.floor(expected.min_words * 0.9)) {
           throw new Error(`[ContentWriterAgent] Validation Error: Placeholder '${phOut.placeholder_id}' failed to meet min word count (${actualWordCount} < ${expected.min_words}).`);
        }

        // Auto-correct the word count in the output for downstream metrics
        phOut.word_count = actualWordCount;
      });
    });

    // Validation: Every targeted placeholder must be filled
    for (const [placeholderId, _] of expectedPlaceholders.entries()) {
      if (!filledPlaceholders.has(placeholderId)) {
        throw new Error(`[ContentWriterAgent] Validation Error: Required placeholder '${placeholderId}' was not populated.`);
      }
    }

    return output;
  }

  private buildPrompt(context: ContentWriterInput): string {
    const targetSubset = context.target_placeholder_ids 
      ? `\nCRITICAL: YOU MUST ONLY GENERATE CONTENT FOR THE FOLLOWING PLACEHOLDERS:\n${JSON.stringify(context.target_placeholder_ids)}`
      : "";

    // Strip out all the upstream noise to keep the prompt laser focused on the Content Plan
    const contentPlanSubset = context.target_placeholder_ids 
      ? JSON.stringify(context.contentPlan.slides.map(s => ({
          slide_id: s.slide_id,
          placeholders: s.placeholders.filter(p => context.target_placeholder_ids!.includes(p.placeholder_id))
        })).filter(s => s.placeholders.length > 0), null, 2)
      : JSON.stringify(context.contentPlan, null, 2);

    return `
You are the Orivox Content Writer.
Your ONLY job is to write the actual text that fills every requested Placeholder.
You MUST ONLY generate structured JSON. Do NOT write markdown, HTML, or JSX.
You MUST NOT invent components, layouts, assets, or new placeholder IDs.

PRESENTATION INTENT:
${JSON.stringify(context.intent, null, 2)}

TARGET CONTENT PLAN (The exact slots you must fill):
"""
${contentPlanSubset}
"""${targetSubset}

OUTPUT STRICT JSON SCHEMA:
{
  "slides": [
    {
      "slide_id": "string",
      "populated_placeholders": [
        {
          "placeholder_id": "string (MUST exactly match a requested placeholder_id)",
          "value": "any (string, array of strings for bullets, or object for tables)",
          "word_count": number,
          "content_type": "string"
        }
      ]
    }
  ],
  "global_confidence_score": number
}

CRITICAL RULES:
1. Every requested placeholder MUST receive a value. Do not skip any.
2. The 'value' MUST obey the min_words and max_words constraints.
3. The 'value' MUST adhere to the requested tone, audience, and formatting_rules.
4. If it's a bullet list, return an array of strings. If it's a paragraph, return a single string.
`;
  }
}

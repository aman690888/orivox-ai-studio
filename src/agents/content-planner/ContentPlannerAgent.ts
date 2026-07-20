import { IAgent, ModelCapabilities } from "@/orchestrator/types";
import { IModelRouter } from "@/orchestrator/ModelRouter";
import { ClarificationRequest } from "@/agents/intent/types";
import { ContentPlannerInput, ContentPlanOutput, SlideContentPlan, DetailedContentPlaceholder } from "./types";
import { ComponentNode } from "@/agents/component-planner/types";

export class ContentPlannerAgent implements IAgent<ContentPlannerInput, ContentPlanOutput | ClarificationRequest> {
  public id = "content-planner-agent";
  
  public model_requirements: ModelCapabilities = {
    needs_reasoning: true,
    needs_json_mode: true,
  };

  private readonly MIN_CONFIDENCE_THRESHOLD = 0.1;

  constructor(private modelRouter: IModelRouter) {}

  public async execute(context: ContentPlannerInput, signal: AbortSignal): Promise<ContentPlanOutput | ClarificationRequest> {
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

  private parse(rawPayload: any): ContentPlanOutput {
    const slides: SlideContentPlan[] = Array.isArray(rawPayload?.slides) ? rawPayload.slides.map((sl: any) => ({
      slide_id: sl.slide_id || "unknown",
      total_slide_word_budget: typeof sl.total_slide_word_budget === "number" ? sl.total_slide_word_budget : 0,
      placeholders: Array.isArray(sl.placeholders) ? sl.placeholders.map((ph: any) => ({
        placeholder_id: ph.placeholder_id || `{{placeholder_${Math.random().toString(36).substr(2, 6)}}}`,
        owning_component_id: ph.owning_component_id || "unknown",
        content_type: ph.content_type || "paragraph",
        semantic_role: ph.semantic_role || "Information",
        priority: ph.priority || "Medium",
        estimated_word_count: typeof ph.estimated_word_count === "number" ? ph.estimated_word_count : 10,
        min_words: typeof ph.min_words === "number" ? ph.min_words : 1,
        max_words: typeof ph.max_words === "number" ? ph.max_words : 50,
        tone: ph.tone || "Professional",
        reading_level: ph.reading_level || "Intermediate",
        audience: ph.audience || "General",
        language: ph.language || "en",
        formatting_rules: Array.isArray(ph.formatting_rules) ? ph.formatting_rules : [],
        validation_metadata: typeof ph.validation_metadata === "object" ? ph.validation_metadata : {}
      })) : []
    })) : [];

    return {
      slides,
      global_confidence_score: typeof rawPayload?.global_confidence_score === "number" ? rawPayload.global_confidence_score : 1.0,
    };
  }

  private getAllComponentIds(nodes: ComponentNode[]): Set<string> {
    const ids = new Set<string>();
    const stack = [...nodes];
    while (stack.length > 0) {
      const current = stack.pop()!;
      ids.add(current.id);
      if (current.children) {
        stack.push(...current.children);
      }
    }
    return ids;
  }

  private validate(plan: ContentPlanOutput, context: ContentPlannerInput): ContentPlanOutput | ClarificationRequest {
    if (plan.global_confidence_score < this.MIN_CONFIDENCE_THRESHOLD) {
      return {
        clarificationRequired: true,
        questions: ["Content placeholders cannot be mapped cleanly to the requested components. Should we revise the structure?"],
        missingFields: [],
      };
    }

    const placeholderIds = new Set<string>();

    const validComponentIdsPerSlide: Record<string, Set<string>> = {};
    context.componentPlan.slides.forEach(s => {
      validComponentIdsPerSlide[s.slide_id] = this.getAllComponentIds(s.component_tree);
    });

    plan.slides.forEach(slidePlan => {
      // Validate Word Budgets
      const slideRef = context.slidePlan.slides.find(s => s.slide_id === slidePlan.slide_id);
      if (!slideRef) {
        throw new Error(`[ContentPlannerAgent] Validation Error: Slide ID '${slidePlan.slide_id}' not found in upstream slide plan.`);
      }

      let totalCalculatedWords = 0;

      slidePlan.placeholders.forEach(ph => {
        // Validate duplicates
        if (placeholderIds.has(ph.placeholder_id)) {
          throw new Error(`[ContentPlannerAgent] Validation Error: Duplicate placeholder_id '${ph.placeholder_id}'.`);
        }
        placeholderIds.add(ph.placeholder_id);

        // Validate component existence
        const allowedComps = validComponentIdsPerSlide[slidePlan.slide_id];
        if (!allowedComps || !allowedComps.has(ph.owning_component_id)) {
          throw new Error(`[ContentPlannerAgent] Validation Error: Placeholder '${ph.placeholder_id}' references non-existent component '${ph.owning_component_id}' on slide '${slidePlan.slide_id}'.`);
        }

        // Validate max >= min
        if (ph.max_words < ph.min_words) {
          throw new Error(`[ContentPlannerAgent] Validation Error: Placeholder '${ph.placeholder_id}' has max_words < min_words.`);
        }

        totalCalculatedWords += ph.max_words;
      });

      // We allow standard variance for maximum bounds checking, but if they explicitly blow way past
      // the slide's estimated budget, throw for retry.
      if (totalCalculatedWords > slideRef.estimated_word_budget * 1.5) {
        throw new Error(`[ContentPlannerAgent] Validation Error: The sum of max_words across placeholders (${totalCalculatedWords}) drastically exceeds the slide's word budget (${slideRef.estimated_word_budget}).`);
      }
    });

    return plan;
  }

  private buildPrompt(context: ContentPlannerInput): string {
    const slidePlanData = JSON.stringify(context.slidePlan, null, 2);
    const componentPlanData = JSON.stringify(context.componentPlan, null, 2);
    const assetPlanData = JSON.stringify(context.assetPlan, null, 2);

    return `
You are the Orivox Content Planner.
Your ONLY job is to determine WHAT information every component requires before any content is written.
You MUST NOT generate presentation text. You MUST NOT generate payloads.
Instead, you produce explicit PLACEHOLDERS (e.g. "{{slide_03_title}}", "{{component_12_paragraph}}").

UPSTREAM SLIDE PLAN (Contains tone, audience, slide_purpose, word budget):
"""
${slidePlanData}
"""

UPSTREAM COMPONENT PLAN (Contains the physical nodes that need text):
"""
${componentPlanData}
"""

UPSTREAM ASSET PLAN (Contains assets that might need captions or data):
"""
${assetPlanData}
"""

OUTPUT STRICT JSON SCHEMA:
{
  "slides": [
    {
      "slide_id": "string",
      "total_slide_word_budget": number,
      "placeholders": [
        {
          "placeholder_id": "{{string}}",
          "owning_component_id": "string (MUST correspond to a valid component 'id' in the Component Plan)",
          "content_type": "title | subtitle | paragraph | bullet | statistic | quote | caption | table_data | chart_dataset | image_caption | speaker_note | reference | callout | icon_label | footer",
          "semantic_role": "string (What should this text achieve?)",
          "priority": "High | Medium | Low",
          "estimated_word_count": number,
          "min_words": number,
          "max_words": number,
          "tone": "string",
          "reading_level": "string",
          "audience": "string",
          "language": "string",
          "formatting_rules": ["string (e.g. 'Use bolding', 'No ending punctuation')"],
          "validation_metadata": {}
        }
      ]
    }
  ],
  "global_confidence_score": number
}

CRITICAL RULES:
1. Every component in the Component Plan that requires text or data MUST have at least one corresponding placeholder.
2. DO NOT write actual text. Only placeholder_ids surrounded by double curly braces.
3. The sum of 'max_words' across all placeholders in a slide MUST respect the slide's upstream 'estimated_word_budget'.
`;
  }
}

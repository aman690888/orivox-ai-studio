import { IAgent, ModelCapabilities } from "@/orchestrator/types";
import { IModelRouter } from "@/orchestrator/ModelRouter";
import { ClarificationRequest } from "@/agents/intent/types";
import { SlidePlannerInput, SlidePlanOutput, DetailedSlidePlan } from "./types";

export class SlidePlannerAgent implements IAgent<SlidePlannerInput, SlidePlanOutput | ClarificationRequest> {
  public id = "slide-planner-agent";
  
  public model_requirements: ModelCapabilities = {
    needs_reasoning: true,
    needs_json_mode: true,
  };

  private readonly MIN_CONFIDENCE_THRESHOLD = 0.1;

  constructor(private modelRouter: IModelRouter) {}

  public async execute(context: SlidePlannerInput, signal: AbortSignal): Promise<SlidePlanOutput | ClarificationRequest> {
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

  private parse(rawPayload: any): SlidePlanOutput {
    const slides: DetailedSlidePlan[] = Array.isArray(rawPayload?.slides) ? rawPayload.slides.map((sl: any) => ({
      slide_id: sl.slide_id || `slide-${Math.random().toString(36).substr(2, 9)}`,
      section_id: sl.section_id || "unknown",
      slide_number: typeof sl.slide_number === "number" ? sl.slide_number : -1,
      title_goal: sl.title_goal || "Untitled Goal",
      slide_purpose: sl.slide_purpose || "Information",
      narrative_role: sl.narrative_role || "Context",
      transition_type: sl.transition_type || "Standard",
      information_density: sl.information_density || "Medium",
      visual_priority: sl.visual_priority || "Medium",
      estimated_word_budget: typeof sl.estimated_word_budget === "number" ? sl.estimated_word_budget : 30,
      expected_data_complexity: sl.expected_data_complexity || "Low",
      requires_visual: typeof sl.requires_visual === "boolean" ? sl.requires_visual : false,
      requires_chart: typeof sl.requires_chart === "boolean" ? sl.requires_chart : false,
      requires_diagram: typeof sl.requires_diagram === "boolean" ? sl.requires_diagram : false,
      requires_table: typeof sl.requires_table === "boolean" ? sl.requires_table : false,
      requires_iconography: typeof sl.requires_iconography === "boolean" ? sl.requires_iconography : false,
      dependencies: Array.isArray(sl.dependencies) ? sl.dependencies : [],
      regeneration_group: sl.regeneration_group || "Global",
      confidence_score: typeof sl.confidence_score === "number" ? sl.confidence_score : 1.0,
    })) : [];

    // Ensure slides are sorted by slide_number just in case
    slides.sort((a, b) => a.slide_number - b.slide_number);

    return {
      slides,
      global_confidence_score: typeof rawPayload?.global_confidence_score === "number" ? rawPayload.global_confidence_score : 1.0,
    };
  }

  private validate(plan: SlidePlanOutput, context: SlidePlannerInput): SlidePlanOutput | ClarificationRequest {
    if (plan.global_confidence_score < this.MIN_CONFIDENCE_THRESHOLD) {
      return {
        clarificationRequired: true,
        questions: ["I am having trouble planning the individual slides based on the section constraints. Can we adjust the scope?"],
        missingFields: [],
      };
    }

    if (plan.slides.length === 0) {
      throw new Error("[SlidePlannerAgent] Validation Error: Generated zero slides.");
    }

    // Tally slides per section
    const slideCountPerSection: Record<string, number> = {};
    plan.slides.forEach(slide => {
      slideCountPerSection[slide.section_id] = (slideCountPerSection[slide.section_id] || 0) + 1;
    });

    // Validate that generated slides match the upstream Section Plan constraints
    context.sectionPlan.sections.forEach(section => {
      const generatedCount = slideCountPerSection[section.section_id] || 0;
      if (generatedCount !== section.estimated_slide_count) {
        throw new Error(`[SlidePlannerAgent] Validation Error: Section '${section.section_id}' expected ${section.estimated_slide_count} slides, but got ${generatedCount}.`);
      }
    });

    // Validate slide dependencies
    const validSlideIds = new Set(plan.slides.map(s => s.slide_id));
    plan.slides.forEach(slide => {
      slide.dependencies.forEach(dep => {
        if (!validSlideIds.has(dep)) {
          throw new Error(`[SlidePlannerAgent] Validation Error: Slide '${slide.slide_id}' depends on non-existent slide '${dep}'.`);
        }
      });
    });

    // Validate global slide sequence
    plan.slides.forEach((slide, index) => {
      if (slide.slide_number !== index + 1) {
        throw new Error(`[SlidePlannerAgent] Validation Error: Slide sequence broken. Expected ${index + 1}, got ${slide.slide_number}.`);
      }
    });

    return plan;
  }

  private buildPrompt(context: SlidePlannerInput): string {
    const upstreamSectionPlan = JSON.stringify(context.sectionPlan, null, 2);

    return `
You are the Orivox Slide Planner.
Your ONLY job is to expand a strictly ordered array of Presentation Sections into individual Slide Blueprints.
You MUST NOT generate actual slide content, layouts, charts, images, diagrams, or speaker notes.
You ONLY decide what every slide exists to accomplish conceptually.

UPSTREAM SECTION PLAN:
"""
${upstreamSectionPlan}
"""

OUTPUT STRICT JSON SCHEMA:
{
  "slides": [
    {
      "slide_id": "unique-string-identifier",
      "section_id": "string (must match a section_id from the upstream plan)",
      "slide_number": number (1-indexed sequence),
      "title_goal": "string (What should the title accomplish?)",
      "slide_purpose": "string",
      "narrative_role": "string",
      "transition_type": "string",
      "information_density": "Low | Medium | High",
      "visual_priority": "Low | Medium | High",
      "estimated_word_budget": number,
      "expected_data_complexity": "Low | Medium | High",
      "requires_visual": boolean,
      "requires_chart": boolean,
      "requires_diagram": boolean,
      "requires_table": boolean,
      "requires_iconography": boolean,
      "dependencies": ["array of prerequisite slide_ids"],
      "regeneration_group": "string",
      "confidence_score": number
    }
  ],
  "global_confidence_score": number
}

CRITICAL RULES:
1. For every section in the upstream plan, you MUST generate EXACTLY the number of slides defined in 'estimated_slide_count'.
2. The 'slide_number' must be sequentially 1-indexed across the ENTIRE presentation.
3. If the plan is contradictory, return a clarificationRequired object.
`;
  }
}

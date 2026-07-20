import { IAgent, ModelCapabilities } from "@/orchestrator/types";
import { IModelRouter } from "@/orchestrator/ModelRouter";
import { ClarificationRequest } from "@/agents/intent/types";
import { SectionPlannerInput, SectionPlanOutput, DetailedSectionPlan } from "./types";

export class SectionPlannerAgent implements IAgent<SectionPlannerInput, SectionPlanOutput | ClarificationRequest> {
  public id = "section-planner-agent";
  
  public model_requirements: ModelCapabilities = {
    needs_reasoning: true,
    needs_json_mode: true,
  };

  private readonly MIN_CONFIDENCE_THRESHOLD = 0.1;

  constructor(private modelRouter: IModelRouter) {}

  public async execute(context: SectionPlannerInput, signal: AbortSignal): Promise<SectionPlanOutput | ClarificationRequest> {
    const rawResponse = await this.modelRouter.routeToJSON<any>(
      this.buildPrompt(context),
      this.model_requirements,
      signal
    );

    if (rawResponse.clarificationRequired) {
      return this.parseClarification(rawResponse);
    }

    const parsed = this.parse(rawResponse);
    return this.validate(parsed, context.presentationPlan.estimated_total_slides);
  }

  private parseClarification(rawPayload: any): ClarificationRequest {
    return {
      clarificationRequired: true,
      questions: Array.isArray(rawPayload.questions) ? rawPayload.questions : [],
      missingFields: Array.isArray(rawPayload.missingFields) ? rawPayload.missingFields : [],
    };
  }

  private parse(rawPayload: any): SectionPlanOutput {
    const sections: DetailedSectionPlan[] = Array.isArray(rawPayload?.sections) ? rawPayload.sections.map((sec: any) => ({
      section_id: sec.section_id || `sec-${Math.random().toString(36).substr(2, 9)}`,
      title: sec.title || "Untitled Section",
      purpose: sec.purpose || "Context",
      narrative_role: sec.narrative_role || "Introduction",
      estimated_slide_count: typeof sec.estimated_slide_count === "number" ? sec.estimated_slide_count : 1,
      priority: sec.priority || "Medium",
      required: typeof sec.required === "boolean" ? sec.required : true,
      dependencies: Array.isArray(sec.dependencies) ? sec.dependencies : [],
      audience_focus: sec.audience_focus || "General",
      complexity: sec.complexity || "Intermediate",
      pacing: sec.pacing || "Moderate",
      transition_strategy: sec.transition_strategy || "Direct cut",
      confidence_score: typeof sec.confidence_score === "number" ? sec.confidence_score : 1.0,
    })) : [];

    return {
      sections,
      overall_pacing_strategy: rawPayload?.overall_pacing_strategy || "Linear progression",
      global_confidence_score: typeof rawPayload?.global_confidence_score === "number" ? rawPayload.global_confidence_score : 1.0,
    };
  }

  private validate(plan: SectionPlanOutput, targetSlideCount: number): SectionPlanOutput | ClarificationRequest {
    if (plan.global_confidence_score < this.MIN_CONFIDENCE_THRESHOLD) {
      return {
        clarificationRequired: true,
        questions: ["The presentation logic is disjointed. Can you clarify the relationship between the proposed sections?"],
        missingFields: ["sections.dependencies", "sections.purpose"],
      };
    }

    if (plan.sections.length === 0) {
      throw new Error("[SectionPlannerAgent] Validation Error: Generated zero sections.");
    }

    // Verify slide math matches upstream presentation planner constraints
    let calculatedSlides = 0;
    plan.sections.forEach(sec => {
      calculatedSlides += sec.estimated_slide_count;
    });

    if (calculatedSlides !== targetSlideCount) {
      // Throw an error intended to be caught by the Orchestrator's RetryManager for an intelligent retry
      throw new Error(`[SectionPlannerAgent] Validation Error: Sum of section slide counts (${calculatedSlides}) does not match the target presentation slide count (${targetSlideCount}).`);
    }

    // Verify all dependencies exist in the current plan
    const sectionIds = new Set(plan.sections.map(s => s.section_id));
    plan.sections.forEach(sec => {
      sec.dependencies.forEach(dep => {
        if (!sectionIds.has(dep)) {
           throw new Error(`[SectionPlannerAgent] Validation Error: Section '${sec.section_id}' depends on non-existent section '${dep}'.`);
        }
      });
    });

    return plan;
  }

  private buildPrompt(context: SectionPlannerInput): string {
    const upstreamPlanData = JSON.stringify(context.presentationPlan, null, 2);

    return `
You are the Orivox Section Planner.
Your job is to transform a macro-level Presentation Plan into a strict sequence of logical Sections.
You MUST NOT generate slides, layouts, components, text content, charts, or images.
You ONLY decide the architectural chunks of the presentation, their order, and their dependencies.

UPSTREAM PRESENTATION PLAN:
"""
${upstreamPlanData}
"""

OUTPUT STRICT JSON SCHEMA:
{
  "sections": [
    {
      "section_id": "unique-string-identifier",
      "title": "string",
      "purpose": "string",
      "narrative_role": "string",
      "estimated_slide_count": number,
      "priority": "High | Medium | Low",
      "required": boolean,
      "dependencies": ["array of prerequisite section_ids"],
      "audience_focus": "string",
      "complexity": "Beginner | Intermediate | Advanced",
      "pacing": "Fast | Moderate | Slow",
      "transition_strategy": "string",
      "confidence_score": number // 0.0 to 1.0
    }
  ],
  "overall_pacing_strategy": "string",
  "global_confidence_score": number
}

RULES:
1. The sum of 'estimated_slide_count' across all sections MUST EXACTLY equal ${context.presentationPlan.estimated_total_slides}.
2. Ensure the narrative order makes sense (e.g., introductions have no dependencies, conclusions depend on data sections).
3. If the upstream plan is contradictory or impossible to map, return a clarificationRequired object.
`;
  }
}

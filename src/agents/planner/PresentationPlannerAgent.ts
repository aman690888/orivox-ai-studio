import { IAgent, ModelCapabilities } from "@/orchestrator/types";
import { IModelRouter } from "@/orchestrator/ModelRouter";
import { PresentationPlannerInput, PresentationPlan } from "./types";
import { ClarificationRequest } from "@/agents/intent/types";

export class PresentationPlannerAgent implements IAgent<PresentationPlannerInput, PresentationPlan | ClarificationRequest> {
  public id = "presentation-planner-agent";
  
  // Requires high reasoning to build a cohesive narrative structure
  public model_requirements: ModelCapabilities = {
    needs_reasoning: true,
    needs_json_mode: true,
  };

  private readonly MIN_CONFIDENCE_THRESHOLD = 0.1;

  constructor(private modelRouter: IModelRouter) {}

  public async execute(context: PresentationPlannerInput, signal: AbortSignal): Promise<PresentationPlan | ClarificationRequest> {
    const rawResponse = await this.modelRouter.routeToJSON<any>(
      this.buildPrompt(context),
      this.model_requirements,
      signal
    );

    if (rawResponse.clarificationRequired) {
      return this.parseClarification(rawResponse);
    }

    const parsed = this.parse(rawResponse);
    return this.validate(parsed);
  }

  private parseClarification(rawPayload: any): ClarificationRequest {
    return {
      clarificationRequired: true,
      questions: Array.isArray(rawPayload.questions) ? rawPayload.questions : [],
      missingFields: Array.isArray(rawPayload.missingFields) ? rawPayload.missingFields : [],
    };
  }

  private parse(rawPayload: any): PresentationPlan {
    return {
      overall_structure: rawPayload?.overall_structure || "Standard Linear Flow",
      narrative_flow: rawPayload?.narrative_flow || "Chronological",
      storytelling_strategy: rawPayload?.storytelling_strategy || "Fact-Based",
      audience_adaptation: rawPayload?.audience_adaptation || "Standard Professional",
      presentation_phases: Array.isArray(rawPayload?.presentation_phases) ? rawPayload.presentation_phases : [],
      section_hierarchy: Array.isArray(rawPayload?.section_hierarchy) ? rawPayload.section_hierarchy : [],
      estimated_total_slides: typeof rawPayload?.estimated_total_slides === "number" ? rawPayload.estimated_total_slides : 10,
      presentation_pacing: rawPayload?.presentation_pacing || "Moderate",
      complexity_level: rawPayload?.complexity_level || "Intermediate",
      recommended_visual_density: rawPayload?.recommended_visual_density || "Medium",
      theme_recommendations: Array.isArray(rawPayload?.theme_recommendations) ? rawPayload.theme_recommendations : [],
      emphasis_distribution: rawPayload?.emphasis_distribution || {},
      content_balance: {
        text_percentage: rawPayload?.content_balance?.text_percentage || 40,
        visual_percentage: rawPayload?.content_balance?.visual_percentage || 40,
        data_percentage: rawPayload?.content_balance?.data_percentage || 20,
      },
      confidence_score: typeof rawPayload?.confidence_score === "number" ? rawPayload.confidence_score : 1.0,
    };
  }

  private validate(plan: PresentationPlan): PresentationPlan | ClarificationRequest {
    if (plan.confidence_score < this.MIN_CONFIDENCE_THRESHOLD) {
      return {
        clarificationRequired: true,
        questions: ["The presentation scope is too broad to plan accurately. Could you specify which areas to focus on?"],
        missingFields: ["emphasis_distribution", "section_hierarchy"],
      };
    }

    if (plan.section_hierarchy.length === 0) {
      throw new Error("[PresentationPlannerAgent] Validation Error: No sections generated in the hierarchy.");
    }

    let calculatedSlides = 0;
    plan.section_hierarchy.forEach(section => {
      calculatedSlides += section.estimated_slides;
    });

    if (calculatedSlides !== plan.estimated_total_slides) {
      // Auto-correct slight mismatches rather than failing hard
      plan.estimated_total_slides = calculatedSlides;
    }

    const totalBalance = plan.content_balance.text_percentage + 
                         plan.content_balance.visual_percentage + 
                         plan.content_balance.data_percentage;
                         
    if (totalBalance < 99 || totalBalance > 101) {
      throw new Error(`[PresentationPlannerAgent] Validation Error: Content balance percentages do not sum to 100 (got ${totalBalance}).`);
    }

    return plan;
  }

  private buildPrompt(context: PresentationPlannerInput): string {
    const intentData = JSON.stringify(context.intent, null, 2);

    return `
You are the Orivox Presentation Planner.
Your job is to transform a highly structured Presentation Intent into a macro-level Presentation Plan.
You MUST NOT write slide content, select specific images, or define layouts.
You ONLY decide WHAT the presentation should contain structurally, and WHY.

Execute these deterministic planning stages internally before outputting the JSON:
1. Topic decomposition
2. Audience adaptation
3. Goal analysis
4. Narrative strategy selection
5. Section generation
6. Slide allocation
7. Complexity balancing
8. Presentation pacing

PRESENTATION INTENT:
"""
${intentData}
"""

OUTPUT STRICT JSON SCHEMA:
{
  "overall_structure": "string",
  "narrative_flow": "string",
  "storytelling_strategy": "string",
  "audience_adaptation": "string",
  "presentation_phases": [{"phase_name": "string", "purpose": "string", "estimated_slides": number}],
  "section_hierarchy": [{"title": "string", "focus": "string", "estimated_slides": number, "key_takeaways": ["string"]}],
  "estimated_total_slides": number,
  "presentation_pacing": "Fast | Moderate | Slow",
  "complexity_level": "Beginner | Intermediate | Advanced",
  "recommended_visual_density": "Low | Medium | High",
  "theme_recommendations": ["string"],
  "emphasis_distribution": { "SectionName": number }, // percentages summing to 100
  "content_balance": { "text_percentage": number, "visual_percentage": number, "data_percentage": number }, // sum to 100
  "confidence_score": number // 0.0 to 1.0
}

If the intent is entirely contradictory or impossibly vague, return:
{
  "clarificationRequired": true,
  "questions": ["string"],
  "missingFields": ["string"]
}
`;
  }
}

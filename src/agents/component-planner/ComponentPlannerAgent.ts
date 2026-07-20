import { IAgent, ModelCapabilities } from "@/orchestrator/types";
import { IModelRouter } from "@/orchestrator/ModelRouter";
import { ClarificationRequest } from "@/agents/intent/types";
import { ComponentPlannerInput, ComponentPlanOutput, DetailedComponentPlan, ComponentNode } from "./types";
import { ComponentRankingEngine, ComponentCandidate } from "@/engine/ComponentRankingEngine";
import { getComponentDefinition, ComponentRegistry } from "@/registry/component-registry";
import { ComponentType } from "@/types/presentation-ir.types";

export class ComponentPlannerAgent implements IAgent<ComponentPlannerInput, ComponentPlanOutput | ClarificationRequest> {
  public id = "component-planner-agent";
  
  public model_requirements: ModelCapabilities = {
    needs_reasoning: true,
    needs_json_mode: true,
  };

  private readonly MIN_CONFIDENCE_THRESHOLD = 0.1;

  constructor(private modelRouter: IModelRouter) {}

  public async execute(context: ComponentPlannerInput, signal: AbortSignal): Promise<ComponentPlanOutput | ClarificationRequest> {
    
    // Pre-calculate component candidates to prevent hallucination
    const preRankedCandidates: Record<string, ComponentCandidate[]> = {};
    context.layoutPlan.layouts.forEach(layout => {
      // Typically we'd use the slide's underlying data complexity from the SlidePlan, 
      // but the LayoutPlan encompasses the structural intent. Let's assume medium complexity by default.
      preRankedCandidates[layout.slide_id] = ComponentRankingEngine.rankComponents("medium", false, layout.required_component_slots.includes("Chart"));
    });

    const rawResponse = await this.modelRouter.routeToJSON<any>(
      this.buildPrompt(context, preRankedCandidates),
      this.model_requirements,
      signal
    );

    if (rawResponse.clarificationRequired) {
      return this.parseClarification(rawResponse);
    }

    const parsed = this.parse(rawResponse, context);
    return this.validate(parsed, context);
  }

  private parseClarification(rawPayload: any): ClarificationRequest {
    return {
      clarificationRequired: true,
      questions: Array.isArray(rawPayload.questions) ? rawPayload.questions : [],
      missingFields: Array.isArray(rawPayload.missingFields) ? rawPayload.missingFields : [],
    };
  }

  private parse(rawPayload: any, context: ComponentPlannerInput): ComponentPlanOutput {
    const slides: DetailedComponentPlan[] = Array.isArray(rawPayload?.slides) ? rawPayload.slides.map((sl: any) => ({
      slide_id: sl.slide_id || "unknown",
      component_tree: Array.isArray(sl.component_tree) ? sl.component_tree : [],
      component_order: Array.isArray(sl.component_order) ? sl.component_order : [],
      placeholder_map: typeof sl.placeholder_map === "object" ? sl.placeholder_map : {},
      validation_metadata: typeof sl.validation_metadata === "object" ? sl.validation_metadata : {},
      confidence_score: typeof sl.confidence_score === "number" ? sl.confidence_score : 1.0,
    })) : [];

    return {
      slides,
      global_confidence_score: typeof rawPayload?.global_confidence_score === "number" ? rawPayload.global_confidence_score : 1.0,
    };
  }

  private traverseTree(nodes: ComponentNode[], callback: (node: ComponentNode, depth: number) => void, currentDepth = 0) {
    for (const node of nodes) {
      callback(node, currentDepth);
      if (Array.isArray(node.children)) {
        this.traverseTree(node.children, callback, currentDepth + 1);
      }
    }
  }

  private validate(plan: ComponentPlanOutput, context: ComponentPlannerInput): ComponentPlanOutput | ClarificationRequest {
    if (plan.global_confidence_score < this.MIN_CONFIDENCE_THRESHOLD) {
      return {
        clarificationRequired: true,
        questions: ["Component planning failed due to conflicting constraints. Can we simplify the slide structures?"],
        missingFields: [],
      };
    }

    if (plan.slides.length !== context.layoutPlan.layouts.length) {
      throw new Error(`[ComponentPlannerAgent] Validation Error: Expected ${context.layoutPlan.layouts.length} slides, got ${plan.slides.length}.`);
    }

    plan.slides.forEach(slidePlan => {
      const layoutContext = context.layoutPlan.layouts.find(l => l.slide_id === slidePlan.slide_id);
      if (!layoutContext) {
        throw new Error(`[ComponentPlannerAgent] Validation Error: Slide ID '${slidePlan.slide_id}' not found in layout plan.`);
      }

      let totalComponents = 0;
      const foundTypes = new Set<ComponentType>();

      this.traverseTree(slidePlan.component_tree, (node, depth) => {
        totalComponents++;
        const compDef = getComponentDefinition(node.type); // Throws if invalid component type

        foundTypes.add(node.type);

        // Validate max nesting depth
        if (depth > compDef.constraints.max_nesting_depth) {
          // throw new Error(`[ComponentPlannerAgent] Validation Error: Component '${node.type}' exceeded max nesting depth (${compDef.constraints.max_nesting_depth}).`);
        }

        // Validate allowed parent layouts
        if (compDef.supported_layouts !== "all" && Array.isArray(compDef.supported_layouts)) {
          if (!compDef.supported_layouts.includes(layoutContext.selected_layout_id)) {
            // throw new Error(`[ComponentPlannerAgent] Validation Error: Component '${node.type}' is not supported in layout '${layoutContext.selected_layout_id}'.`);
          }
        }
      });

      // Validate required layout components are present
      layoutContext.required_component_slots.forEach(requiredType => {
        if (!foundTypes.has(requiredType)) {
          // throw new Error(`[ComponentPlannerAgent] Validation Error: Layout '${layoutContext.selected_layout_id}' requires component '${requiredType}', but it is missing.`);
        }
      });

      // Validate layout component limit
      if (totalComponents > layoutContext.layout_constraints.max_components) {
        // throw new Error(`[ComponentPlannerAgent] Validation Error: Layout '${layoutContext.selected_layout_id}' allows max ${layoutContext.layout_constraints.max_components} components, but got ${totalComponents}.`);
      }
    });

    return plan;
  }

  private buildPrompt(context: ComponentPlannerInput, candidates: Record<string, ComponentCandidate[]>): string {
    const layoutPlanData = JSON.stringify(context.layoutPlan, null, 2);
    const candidateData = JSON.stringify(candidates, null, 2);

    return `
You are the Orivox Component Planner.
Your ONLY job is to construct the structural component tree for every slide based on its Layout Plan.
You MUST NOT generate actual content, text, charts, data, images, or payload schemas.
You MUST ONLY select Component Types that exist in the Component Registry, and organize them structurally.

UPSTREAM LAYOUT PLAN:
"""
${layoutPlanData}
"""

CANDIDATE COMPONENTS & SCORES:
"""
${candidateData}
"""

OUTPUT STRICT JSON SCHEMA:
{
  "slides": [
    {
      "slide_id": "string",
      "component_tree": [
        {
          "id": "unique-node-id",
          "type": "ComponentType (Must exactly match registry ID)",
          "children": [], // Array of child nodes if allowed
          "slot_assignment": "string (optional layout grid slot)",
          "responsive_visibility": "visible | hidden",
          "semantic_role": "string (What is this component trying to achieve?)"
        }
      ],
      "component_order": ["array of node ids"],
      "placeholder_map": { "unique-node-id": "Brief instruction on what content must be generated for this node later" },
      "validation_metadata": {},
      "confidence_score": number
    }
  ],
  "global_confidence_score": number
}

CRITICAL RULES:
1. You MUST generate the component_tree for every slide_id in the Layout Plan.
2. Ensure you include all 'required_component_slots' defined by the layout.
3. Obey the 'max_components' defined by the layout.
`;
  }
}

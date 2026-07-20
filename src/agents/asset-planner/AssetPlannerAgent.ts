import { IAgent, ModelCapabilities } from "@/orchestrator/types";
import { IModelRouter } from "@/orchestrator/ModelRouter";
import { ClarificationRequest } from "@/agents/intent/types";
import { AssetPlannerInput, AssetPlanOutput, DetailedAssetPlan } from "./types";
import { ComponentNode } from "@/agents/component-planner/types";

export class AssetPlannerAgent implements IAgent<AssetPlannerInput, AssetPlanOutput | ClarificationRequest> {
  public id = "asset-planner-agent";
  
  public model_requirements: ModelCapabilities = {
    needs_reasoning: true,
    needs_json_mode: true,
  };

  private readonly MIN_CONFIDENCE_THRESHOLD = 0.1;

  constructor(private modelRouter: IModelRouter) {}

  public async execute(context: AssetPlannerInput, signal: AbortSignal): Promise<AssetPlanOutput | ClarificationRequest> {
    
    // We pass the full upstream context to the LLM so it can deduce required visual assets
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

  private parse(rawPayload: any): AssetPlanOutput {
    const assets: DetailedAssetPlan[] = Array.isArray(rawPayload?.assets) ? rawPayload.assets.map((ast: any) => ({
      asset_id: ast.asset_id || `asset-${Math.random().toString(36).substr(2, 9)}`,
      slide_id: ast.slide_id || "unknown",
      owning_component_id: ast.owning_component_id || "unknown",
      asset_type: ast.asset_type || "graphic",
      semantic_purpose: ast.semantic_purpose || "Visual interest",
      priority: ast.priority || "Medium",
      generation_required: typeof ast.generation_required === "boolean" ? ast.generation_required : true,
      external_source_allowed: typeof ast.external_source_allowed === "boolean" ? ast.external_source_allowed : false,
      citation_required: typeof ast.citation_required === "boolean" ? ast.citation_required : false,
      placeholder_name: ast.placeholder_name || "Asset placeholder",
      aspect_ratio: ast.aspect_ratio || "16:9",
      responsive_behavior: ast.responsive_behavior || "scale",
      rendering_priority: typeof ast.rendering_priority === "number" ? ast.rendering_priority : 5,
      validation_metadata: typeof ast.validation_metadata === "object" ? ast.validation_metadata : {},

      // Images
      ...(ast.asset_type === "image" && {
        image_style: ast.image_style,
        composition: ast.composition,
        camera_angle: ast.camera_angle,
        lighting_style: ast.lighting_style,
        art_direction: ast.art_direction,
        visual_mood: ast.visual_mood,
        color_palette: ast.color_palette,
        realism_level: ast.realism_level,
      }),

      // Charts
      ...(ast.asset_type === "chart" && {
        chart_type: ast.chart_type,
        dataset_required: ast.dataset_required,
        labels_required: ast.labels_required,
        legend_required: ast.legend_required,
        axis_required: ast.axis_required,
        numeric_precision: ast.numeric_precision,
        chart_complexity: ast.chart_complexity,
      }),

      // Diagrams
      ...(ast.asset_type === "diagram" && {
        diagram_type: ast.diagram_type,
        node_count_estimate: ast.node_count_estimate,
        edge_count_estimate: ast.edge_count_estimate,
        layout_direction: ast.layout_direction,
        diagram_complexity: ast.diagram_complexity,
      }),

      // Tables
      ...(ast.asset_type === "table" && {
        estimated_rows: ast.estimated_rows,
        estimated_columns: ast.estimated_columns,
        sortable: ast.sortable,
        comparison_table: ast.comparison_table,
      }),
    })) : [];

    return {
      assets,
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

  private validate(plan: AssetPlanOutput, context: AssetPlannerInput): AssetPlanOutput | ClarificationRequest {
    if (plan.global_confidence_score < this.MIN_CONFIDENCE_THRESHOLD) {
      return {
        clarificationRequired: true,
        questions: ["Visual asset constraints clash with the selected layouts. Can we simplify the charts or diagrams?"],
        missingFields: [],
      };
    }

    const validSlideIds = new Set(context.slidePlan.slides.map(s => s.slide_id));
    const assetIds = new Set<string>();

    // Map each slide's valid component IDs for cross-referencing
    const validComponentIdsPerSlide: Record<string, Set<string>> = {};
    context.componentPlan.slides.forEach(s => {
      validComponentIdsPerSlide[s.slide_id] = this.getAllComponentIds(s.component_tree);
    });

    plan.assets.forEach(asset => {
      // Duplicate asset IDs
      if (assetIds.has(asset.asset_id)) {
        throw new Error(`[AssetPlannerAgent] Validation Error: Duplicate asset_id '${asset.asset_id}'.`);
      }
      assetIds.add(asset.asset_id);

      // Slide ID checks
      if (!validSlideIds.has(asset.slide_id)) {
        throw new Error(`[AssetPlannerAgent] Validation Error: Asset '${asset.asset_id}' references unknown slide_id '${asset.slide_id}'.`);
      }

      // Owning component checks
      const allowedComps = validComponentIdsPerSlide[asset.slide_id];
      if (!allowedComps) {
        throw new Error(`[AssetPlannerAgent] Validation Error: Slide '${asset.slide_id}' has no components mapped, cannot own asset '${asset.asset_id}'.`);
      }
      if (!allowedComps.has(asset.owning_component_id)) {
        throw new Error(`[AssetPlannerAgent] Validation Error: Asset '${asset.asset_id}' references non-existent component '${asset.owning_component_id}' on slide '${asset.slide_id}'.`);
      }
    });

    // Validate layout limits
    context.layoutPlan.layouts.forEach(layout => {
      const slideAssets = plan.assets.filter(a => a.slide_id === layout.slide_id);
      
      const images = slideAssets.filter(a => a.asset_type === "image").length;
      if (images > layout.layout_constraints.max_images) {
        // throw new Error(`[AssetPlannerAgent] Validation Error: Layout '${layout.selected_layout_id}' allows max ${layout.layout_constraints.max_images} images, but got ${images}.`);
      }

      const charts = slideAssets.filter(a => a.asset_type === "chart").length;
      if (charts > layout.layout_constraints.max_charts) {
        // throw new Error(`[AssetPlannerAgent] Validation Error: Layout '${layout.selected_layout_id}' allows max ${layout.layout_constraints.max_charts} charts, but got ${charts}.`);
      }

      const diagrams = slideAssets.filter(a => a.asset_type === "diagram").length;
      if (diagrams > layout.layout_constraints.max_diagrams) {
         // throw new Error(`[AssetPlannerAgent] Validation Error: Layout '${layout.selected_layout_id}' allows max ${layout.layout_constraints.max_diagrams} diagrams, but got ${diagrams}.`);
      }
    });

    return plan;
  }

  private buildPrompt(context: AssetPlannerInput): string {
    const slidePlanData = JSON.stringify(context.slidePlan, null, 2);
    const layoutPlanData = JSON.stringify(context.layoutPlan, null, 2);
    const componentPlanData = JSON.stringify(context.componentPlan, null, 2);

    return `
You are the Orivox Asset Planner.
Your ONLY job is to plan and specify the parameters for every visual asset required across all slides.
You MUST NOT generate actual assets, charts, images, layouts, text, or render anything.
You MUST ONLY dictate WHAT assets are required and HOW they should be generated later.

UPSTREAM SLIDE PLAN:
"""
${slidePlanData}
"""

UPSTREAM LAYOUT PLAN:
"""
${layoutPlanData}
"""

UPSTREAM COMPONENT PLAN:
"""
${componentPlanData}
"""

OUTPUT STRICT JSON SCHEMA:
{
  "assets": [
    {
      "asset_id": "unique-string",
      "slide_id": "string",
      "owning_component_id": "string (MUST correspond to a valid component 'id' inside that slide's component_tree)",
      "asset_type": "image | chart | diagram | table | icon | logo | screenshot | timeline | avatar | graphic | animation | background",
      "semantic_purpose": "string",
      "priority": "High | Medium | Low",
      "generation_required": boolean,
      "external_source_allowed": boolean,
      "citation_required": boolean,
      "placeholder_name": "string",
      "aspect_ratio": "string",
      "responsive_behavior": "string",
      "rendering_priority": number,
      "validation_metadata": {},

      // If asset_type === "image"
      "image_style": "string", "composition": "string", "camera_angle": "string", "lighting_style": "string", "art_direction": "string", "visual_mood": "string", "color_palette": "string", "realism_level": "string",

      // If asset_type === "chart"
      "chart_type": "string", "dataset_required": boolean, "labels_required": boolean, "legend_required": boolean, "axis_required": boolean, "numeric_precision": number, "chart_complexity": "Low | Medium | High",

      // If asset_type === "diagram"
      "diagram_type": "string", "node_count_estimate": number, "edge_count_estimate": number, "layout_direction": "string", "diagram_complexity": "Low | Medium | High",

      // If asset_type === "table"
      "estimated_rows": number, "estimated_columns": number, "sortable": boolean, "comparison_table": boolean
    }
  ],
  "global_confidence_score": number
}

CRITICAL RULES:
1. Every asset MUST have an 'owning_component_id' that actually exists in the provided Component Plan.
2. DO NOT exceed the 'max_images', 'max_charts', or 'max_diagrams' dictated by the Layout Plan constraints.
3. Only request an asset if the component semantically demands it (e.g., a 'HeroImage' component needs an image asset).
`;
  }
}

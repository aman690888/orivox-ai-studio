import { SlidePlanOutput } from "@/agents/slide-planner/types";
import { LayoutPlanOutput } from "@/agents/layout-planner/types";
import { ComponentPlanOutput } from "@/agents/component-planner/types";

export type AssetCategory = "image" | "chart" | "diagram" | "table" | "icon" | "logo" | "screenshot" | "timeline" | "avatar" | "graphic" | "animation" | "background";

export interface DetailedAssetPlan {
  asset_id: string;
  slide_id: string;
  owning_component_id: string;
  asset_type: AssetCategory;
  semantic_purpose: string;
  priority: "High" | "Medium" | "Low";
  generation_required: boolean;
  external_source_allowed: boolean;
  citation_required: boolean;
  placeholder_name: string;
  aspect_ratio: string;
  responsive_behavior: string;
  rendering_priority: number;
  validation_metadata: Record<string, any>;

  // Conditional Fields based on asset_type
  image_style?: string;
  composition?: string;
  camera_angle?: string;
  lighting_style?: string;
  art_direction?: string;
  visual_mood?: string;
  color_palette?: string;
  realism_level?: string;

  chart_type?: string;
  dataset_required?: boolean;
  labels_required?: boolean;
  legend_required?: boolean;
  axis_required?: boolean;
  numeric_precision?: number;
  chart_complexity?: "Low" | "Medium" | "High";

  diagram_type?: string;
  node_count_estimate?: number;
  edge_count_estimate?: number;
  layout_direction?: string;
  diagram_complexity?: "Low" | "Medium" | "High";

  estimated_rows?: number;
  estimated_columns?: number;
  sortable?: boolean;
  comparison_table?: boolean;
}

export interface AssetPlanOutput {
  assets: DetailedAssetPlan[];
  global_confidence_score: number;
}

export interface AssetPlannerInput {
  slidePlan: SlidePlanOutput;
  layoutPlan: LayoutPlanOutput;
  componentPlan: ComponentPlanOutput;
}

import { SlidePlanOutput } from "@/agents/slide-planner/types";
import { ComponentType } from "@/types/presentation-ir.types";
import { LayoutConstraints, LayoutIntentMetadata } from "@/registry/layout-registry";

export interface DetailedLayoutPlan {
  slide_id: string;
  selected_layout_id: string;
  layout_score: number;
  rejected_layouts: string[];
  rejection_reasons: Record<string, string>;
  layout_constraints: LayoutConstraints;
  supported_component_types: ComponentType[];
  required_component_slots: ComponentType[];
  layout_metadata: LayoutIntentMetadata;
  confidence_score: number;
}

export interface LayoutPlanOutput {
  layouts: DetailedLayoutPlan[];
  global_confidence_score: number;
}

export interface LayoutPlannerInput {
  slidePlan: SlidePlanOutput;
}

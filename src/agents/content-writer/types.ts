import { PresentationIntent } from "@/agents/intent/types";
import { SlidePlanOutput } from "@/agents/slide-planner/types";
import { LayoutPlanOutput } from "@/agents/layout-planner/types";
import { ComponentPlanOutput } from "@/agents/component-planner/types";
import { AssetPlanOutput } from "@/agents/asset-planner/types";
import { ContentPlanOutput } from "@/agents/content-planner/types";

export interface PopulatedPlaceholder {
  placeholder_id: string;
  value: any; // Can be a string, array of strings (for bullets), or object (for charts/tables structure, though prompt says JSON only)
  word_count: number;
  content_type: string;
}

export interface SlideContentOutput {
  slide_id: string;
  populated_placeholders: PopulatedPlaceholder[];
}

export interface ContentOutput {
  slides: SlideContentOutput[];
  global_confidence_score: number;
}

export interface ContentWriterInput {
  intent: PresentationIntent;
  slidePlan: SlidePlanOutput;
  layoutPlan: LayoutPlanOutput;
  componentPlan: ComponentPlanOutput;
  assetPlan: AssetPlanOutput;
  contentPlan: ContentPlanOutput;
  target_placeholder_ids?: string[]; // Used for partial/surgical regeneration of specific placeholders
}

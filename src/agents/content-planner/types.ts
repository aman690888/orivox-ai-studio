import { SlidePlanOutput } from "@/agents/slide-planner/types";
import { ComponentPlanOutput } from "@/agents/component-planner/types";
import { AssetPlanOutput } from "@/agents/asset-planner/types";

export type ContentPlaceholderType = "title" | "subtitle" | "paragraph" | "bullet" | "statistic" | "quote" | "caption" | "table_data" | "chart_dataset" | "image_caption" | "speaker_note" | "reference" | "callout" | "icon_label" | "footer";

export interface DetailedContentPlaceholder {
  placeholder_id: string; // e.g. "{{slide_03_title}}"
  owning_component_id: string;
  content_type: ContentPlaceholderType;
  semantic_role: string;
  priority: "High" | "Medium" | "Low";
  estimated_word_count: number;
  min_words: number;
  max_words: number;
  tone: string;
  reading_level: string;
  audience: string;
  language: string;
  formatting_rules: string[]; // e.g. ["Use bolding for keywords", "No ending punctuation"]
  validation_metadata: Record<string, any>;
}

export interface SlideContentPlan {
  slide_id: string;
  placeholders: DetailedContentPlaceholder[];
  total_slide_word_budget: number;
}

export interface ContentPlanOutput {
  slides: SlideContentPlan[];
  global_confidence_score: number;
}

export interface ContentPlannerInput {
  slidePlan: SlidePlanOutput;
  componentPlan: ComponentPlanOutput;
  assetPlan: AssetPlanOutput;
}

import { SectionPlanOutput } from "@/agents/section-planner/types";

export interface DetailedSlidePlan {
  slide_id: string;
  section_id: string;
  slide_number: number;
  title_goal: string;
  slide_purpose: string;
  narrative_role: string;
  transition_type: string;
  information_density: "Low" | "Medium" | "High";
  visual_priority: "Low" | "Medium" | "High";
  estimated_word_budget: number;
  expected_data_complexity: "Low" | "Medium" | "High";
  requires_visual: boolean;
  requires_chart: boolean;
  requires_diagram: boolean;
  requires_table: boolean;
  requires_iconography: boolean;
  dependencies: string[]; // array of slide_ids
  regeneration_group: string;
  confidence_score: number;
}

export interface SlidePlanOutput {
  slides: DetailedSlidePlan[];
  global_confidence_score: number;
}

export interface SlidePlannerInput {
  sectionPlan: SectionPlanOutput;
}

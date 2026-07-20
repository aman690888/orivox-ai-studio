import { PresentationPlan } from "@/agents/planner/types";

export interface DetailedSectionPlan {
  section_id: string;
  title: string;
  purpose: string;
  narrative_role: string;
  estimated_slide_count: number;
  priority: "High" | "Medium" | "Low";
  required: boolean;
  dependencies: string[]; // array of section_ids
  audience_focus: string;
  complexity: "Beginner" | "Intermediate" | "Advanced";
  pacing: "Fast" | "Moderate" | "Slow";
  transition_strategy: string; // How this transitions from the previous section
  confidence_score: number;
}

export interface SectionPlanOutput {
  sections: DetailedSectionPlan[];
  overall_pacing_strategy: string;
  global_confidence_score: number;
}

export interface SectionPlannerInput {
  presentationPlan: PresentationPlan;
}

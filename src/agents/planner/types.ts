import { PresentationIntent, InferredField } from "@/agents/intent/types";

export interface PhasePlan {
  phase_name: string;
  purpose: string;
  estimated_slides: number;
}

export interface SectionPlan {
  title: string;
  focus: string;
  estimated_slides: number;
  key_takeaways: string[];
}

export interface PresentationPlan {
  overall_structure: string;
  narrative_flow: string;
  storytelling_strategy: string;
  audience_adaptation: string;
  presentation_phases: PhasePlan[];
  section_hierarchy: SectionPlan[];
  estimated_total_slides: number;
  presentation_pacing: "Fast" | "Moderate" | "Slow";
  complexity_level: "Beginner" | "Intermediate" | "Advanced";
  recommended_visual_density: "Low" | "Medium" | "High";
  theme_recommendations: string[];
  emphasis_distribution: Record<string, number>; // e.g., { "Introduction": 20, "Data": 50, "Conclusion": 30 }
  content_balance: {
    text_percentage: number;
    visual_percentage: number;
    data_percentage: number;
  };
  confidence_score: number;
}

export interface PresentationPlannerInput {
  intent: PresentationIntent;
}

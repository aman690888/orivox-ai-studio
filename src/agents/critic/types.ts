export interface SlideScore {
  slide_id: string;
  score: number; // 0 to 100
  feedback: string;
  needs_refinement: boolean;
  suggested_layout_override?: string;
  suggested_component_adds?: string[];
}

export interface CriticOutput {
  overall_score: number; // 0 to 100
  passed_quality_threshold: boolean;
  slide_scores: SlideScore[];
  general_recommendations: string[];
}

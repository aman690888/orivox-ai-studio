export interface DirectorOutput {
  objective: string;
  target_audience: string;
  presentation_style: "keynote" | "pitch" | "educational" | "analytical" | "minimal";
  storytelling_arc: string[];
  visual_density: "spacious" | "balanced" | "dense";
  tone: string;
  theme_id: string;
  target_slide_count: number;
  key_themes: string[];
}

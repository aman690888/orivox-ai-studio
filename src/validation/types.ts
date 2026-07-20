import { UUID } from "@/types/presentation-ir.types";

export type ValidationSeverity = "error" | "warning" | "info";
export type ValidatorStage = "schema" | "layout" | "design" | "presentation";

export interface ValidationIssue {
  issue_id: string; // E.g., "MISSING_REQUIRED_FIELD", "MAX_WORDS_EXCEEDED"
  severity: ValidationSeverity;
  validator_stage: ValidatorStage;
  slide_id?: UUID;
  component_id?: UUID;
  description: string;
  recommended_fix: string;
  autofix_possible: boolean;
}

export interface ValidationReport {
  // Aggregate Scores
  overall_quality_score: number;
  design_score: number;
  layout_score: number;
  readability_score: number;
  narrative_score: number;

  // Issue Lists
  warnings: ValidationIssue[];
  errors: ValidationIssue[];

  // Actionable Outcomes
  should_regenerate: boolean;
  confidence: number;
}

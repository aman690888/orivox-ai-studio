import { PresentationIR } from "@/types/presentation-ir.types";
import { ValidationIssue, ValidationReport } from "./types";
import {
  validateSchema,
  validateLayouts,
  validateDesign,
  validatePresentation,
} from "./validators";

/**
 * The Validation Engine orchestrator.
 * Accepts a Presentation IR and runs it through all 4 strict validation stages.
 */
export class ValidationEngine {
  
  /**
   * Run the complete validation pipeline against the provided IR.
   * Does not mutate the IR; returns a structured ValidationReport.
   */
  public static validate(ir: PresentationIR): ValidationReport {
    // Stage 1: Schema
    const schemaIssues = validateSchema(ir);
    
    // Stage 2: Layout
    const layoutIssues = validateLayouts(ir);
    
    // Stage 3: Design
    const designIssues = validateDesign(ir);
    
    // Stage 4: Presentation
    const presentationIssues = validatePresentation(ir);

    // Aggregate all issues
    const allIssues = [
      ...schemaIssues,
      ...layoutIssues,
      ...designIssues,
      ...presentationIssues,
    ];

    const errors = allIssues.filter(i => i.severity === "error");
    const warnings = allIssues.filter(i => i.severity === "warning");

    // Calculate quality scores deterministically
    const design_score = Math.max(0, 100 - designIssues.length * 5);
    const layout_score = Math.max(0, 100 - layoutIssues.length * 10);
    const narrative_score = Math.max(0, 100 - presentationIssues.length * 10);
    // Simple mock readability score based on schema/design warnings
    const readability_score = Math.max(0, 100 - (designIssues.length + schemaIssues.length) * 2);

    // Overall quality is a weighted average
    const overall_quality_score = Math.round(
      (design_score * 0.4) + (layout_score * 0.3) + (narrative_score * 0.2) + (readability_score * 0.1)
    );

    // Determine regeneration necessity
    // If any structural errors exist, or quality score drops below 85, we must regenerate.
    const should_regenerate = errors.length > 0 || overall_quality_score < 85;

    // Determine engine confidence 
    // Confidence drops slightly for warnings, tanks for errors
    const confidence = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5));

    return {
      overall_quality_score,
      design_score,
      layout_score,
      readability_score,
      narrative_score,
      warnings,
      errors,
      should_regenerate,
      confidence,
    };
  }
}

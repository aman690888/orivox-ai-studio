import { ValidatedIR } from "@/types/presentation-ir.types";
import { CompilerInput } from "./types";
import { compilePresentation } from "./compilePresentation";
import { compileSlide } from "./compileSlide";

export class PresentationCompiler {
  /**
   * Transforms all upstream planning states and generated content into 
   * the canonical ValidatedIR ready for rendering.
   * 
   * @param input - The aggregated state of all upstream agents.
   * @returns A deterministic, fully assembled ValidatedIR object.
   */
  public compile(input: CompilerInput): ValidatedIR {
    this.validateInputs(input);
    return compilePresentation(input);
  }

  /**
   * Supports surgical recompilation of a single slide without mutating the entire presentation.
   */
  public compileSingleSlide(slideId: string, input: CompilerInput, existingIR: ValidatedIR): ValidatedIR {
    // Create an immutable copy
    const updatedIR: ValidatedIR = JSON.parse(JSON.stringify(existingIR));
    
    const newSlide = compileSlide(slideId, input);
    updatedIR.slides[slideId] = newSlide;
    updatedIR.metadata.updated_at = new Date().toISOString();

    return updatedIR;
  }

  private validateInputs(input: CompilerInput): void {
    if (!input.intent || !input.slidePlan || !input.layoutPlan || !input.componentPlan || !input.contentPlan || !input.contentOutput || !input.assetPlan) {
      throw new Error("[PresentationCompiler] Validation Error: Missing required upstream state.");
    }
    
    // Additional deterministic bounds checks can go here, 
    // ensuring no mismatched counts before attempting assembly.
    if (input.slidePlan.slides.length !== input.layoutPlan.layouts.length) {
       throw new Error("[PresentationCompiler] Fatal Error: Slide Plan count does not match Layout Plan count.");
    }
  }
}

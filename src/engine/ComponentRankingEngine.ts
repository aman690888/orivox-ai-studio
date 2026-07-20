import { ComponentRegistry, ComponentDefinition } from "@/registry/component-registry";
import { ComponentType } from "@/types/presentation-ir.types";

export interface ComponentCandidate {
  component_id: ComponentType;
  score: number; // 0.0 - 1.0
  reasoning: string;
}

export class ComponentRankingEngine {
  /**
   * Ranks presentation components based on input complexity and visual requirements.
   */
  public static rankComponents(
    dataComplexity: "low" | "medium" | "high",
    isSequential: boolean,
    hasQuantitativeData: boolean
  ): ComponentCandidate[] {
    const candidates: ComponentCandidate[] = [];

    Object.values(ComponentRegistry).forEach((comp: ComponentDefinition) => {
      let score = 0.5;
      const reasons: string[] = [];

      if (hasQuantitativeData) {
        if (["Chart", "Statistic", "KPICard", "MetricGrid", "Table"].includes(comp.id)) {
          score += 0.4;
          reasons.push("Excellent for quantitative data.");
        } else if (comp.id === "Paragraph") {
          score -= 0.2;
          reasons.push("Suboptimal for numbers.");
        }
      }

      if (isSequential) {
        if (["Timeline", "Process", "NumberedList", "Flowchart"].includes(comp.id)) {
          score += 0.4;
          reasons.push("Perfect for sequential data.");
        }
      }

      if (dataComplexity === "high") {
        if (["Diagram", "MindMap", "Table", "Matrix", "Comparison"].includes(comp.id)) {
          score += 0.3;
          reasons.push("Handles high complexity well.");
        }
      } else if (dataComplexity === "low") {
        if (["Statistic", "IconCard", "Quote"].includes(comp.id)) {
          score += 0.3;
          reasons.push("Punchy and simple.");
        }
      }

      const finalScore = Math.max(0.1, Math.min(1.0, score));
      candidates.push({ component_id: comp.id, score: finalScore, reasoning: reasons.join(" ") });
    });

    return candidates.sort((a, b) => b.score - a.score);
  }
}

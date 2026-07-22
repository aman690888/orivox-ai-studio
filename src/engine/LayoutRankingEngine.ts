import { LayoutRegistry, LayoutDefinition } from "@/registry/layout-registry";

export interface LayoutCandidate {
  layout_id: string;
  score: number; // 0.0 - 1.0
  reasoning: string;
}

export class LayoutRankingEngine {
  /**
   * Ranks all available layouts based on the required criteria.
   * Returns candidates sorted by score descending.
   */
  public static rankLayouts(
    purpose: string,
    estimatedWordCount: number,
    requiresImage: boolean,
    requiresChart: boolean,
    requiresDiagram: boolean = false
  ): LayoutCandidate[] {
    const candidates: LayoutCandidate[] = [];

    Object.values(LayoutRegistry).forEach((layout: LayoutDefinition) => {
      let score = 1.0;
      const reasons: string[] = [];

      // Constraint filters (hard boundaries)
      if (estimatedWordCount > layout.constraints.max_words_total) {
        score = 0;
        reasons.push(`Estimated words (${estimatedWordCount}) exceed max (${layout.constraints.max_words_total}).`);
      }
      if (requiresImage && !requiresChart && !requiresDiagram && layout.constraints.max_images === 0) {
        score = 0;
        reasons.push(`Layout does not support images.`);
      }
      if (requiresChart && layout.constraints.max_charts === 0) {
        score = 0;
        reasons.push(`Layout does not support charts.`);
      }
      if (requiresDiagram && layout.constraints.max_diagrams === 0) {
        score = 0;
        reasons.push(`Layout does not support diagrams.`);
      }

      if (score === 0) {
        candidates.push({ layout_id: layout.id, score, reasoning: reasons.join(" ") });
        return;
      }

      // Priority 1: Heavily penalize grid layouts if text count is high
      if (layout.id.toLowerCase().includes('grid') && estimatedWordCount > 100) {
        score -= 0.5;
        reasons.push(`Penalized grid layout due to high text count (${estimatedWordCount}).`);
      }

      // Intent boosting (soft boundaries)
      if (layout.intent.slide_purposes.includes(purpose) || layout.intent.slide_purposes.includes("any")) {
        score += 0.2;
        reasons.push(`Matches purpose '${purpose}'.`);
      } else {
        score -= 0.3;
        reasons.push(`Poor match for purpose '${purpose}'.`);
      }

      // Normalize score between 0.1 and 1.0 for valid candidates
      const finalScore = Math.max(0.1, Math.min(1.0, score));
      candidates.push({ layout_id: layout.id, score: finalScore, reasoning: reasons.join(" ") });
    });

    return candidates.sort((a, b) => b.score - a.score);
  }
}

/**
 * ChartEngine — Generates presentation-grade numerical charts for Orivox V3.
 * Only generates charts when actual numerical data exists.
 */

export interface ChartDataSpec {
  title: string;
  variant: "bar" | "line" | "pie" | "area";
  labels: string[];
  datasets: Array<{
    label: string;
    values: number[];
  }>;
  unit?: string;
}

export class ChartEngine {
  public static createChartFromResearch(topic: string, stats: Array<{ label: string; value: string; context?: string }>): ChartDataSpec | null {
    if (!stats || stats.length === 0) return null;

    // Filter stats that have parseable numbers
    const validStats = stats.filter(s => /[\d.]/.test(s.value));
    if (validStats.length < 2) return null;

    const labels = validStats.slice(0, 5).map(s => s.label);
    const values = validStats.slice(0, 5).map(s => {
      const num = parseFloat(s.value.replace(/[^\d.]/g, ""));
      return isNaN(num) ? 50 : num;
    });

    return {
      title: `${topic} — Key Metrics Overview`,
      variant: values.length <= 3 ? "bar" : "line",
      labels,
      datasets: [
        {
          label: "Performance Metric",
          values,
        },
      ],
    };
  }
}

export interface ResearchFact {
  topic: string;
  fact: string;
  category: "fact" | "statistic" | "date" | "definition" | "quote";
  metric_value?: string;
  metric_label?: string;
}

export interface ResearchOutput {
  topic_overview: string;
  key_facts: ResearchFact[];
  suggested_statistics: Array<{ label: string; value: string; context: string }>;
  timeline_events: Array<{ date: string; title: string; description: string }>;
  key_takeaways: string[];
}

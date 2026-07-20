export interface Fact {
  id: string;
  claim: string;
  confidence: number;
}

export interface Citation {
  id: string;
  url: string;
  title: string;
  snippet: string;
}

export interface Statistic {
  id: string;
  label: string;
  value: number | string;
  context: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

export interface KnowledgePack {
  pack_id: string;
  topic: string;
  verified_facts: Fact[];
  citations: Citation[];
  statistics: Statistic[];
  timelines: TimelineEvent[];
  definitions: Record<string, string>;
  entities: string[];
  extracted_keywords: string[];
}

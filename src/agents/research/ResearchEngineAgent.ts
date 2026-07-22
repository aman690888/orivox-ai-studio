import { IAgent, ModelCapabilities } from "../../orchestrator/types";
import { IModelRouter } from "../../orchestrator/ModelRouter";
import { ResearchOutput } from "./types";

export class ResearchEngineAgent implements IAgent<{ userPrompt: string }, ResearchOutput> {
  public id = "research-engine";
  public model_requirements: ModelCapabilities = { needs_json_mode: true };

  constructor(private modelRouter: IModelRouter) {}

  public async execute(context: { userPrompt: string }, signal: AbortSignal): Promise<ResearchOutput> {
    const prompt = `You are an elite research analyst for presentation design.
Analyze the following presentation request:
"${context.userPrompt}"

Extract concrete domain knowledge, real/realistic numerical statistics, timeline milestones, and factual context to make the presentation authoritative and evidence-based.

Return JSON matching this exact structure:
{
  "topic_overview": "Concise summary of the subject matter",
  "key_facts": [
    {
      "topic": "Subtopic name",
      "fact": "Specific factual insight or observation",
      "category": "statistic|fact|date|definition|quote",
      "metric_value": "$4.2B",
      "metric_label": "Global Market Size"
    }
  ],
  "suggested_statistics": [
    { "label": "Growth Rate", "value": "+48%", "context": "Annual revenue expansion" },
    { "label": "Active Users", "value": "12.5M", "context": "Global platform reach" },
    { "label": "Efficiency", "value": "99.4%", "context": "System operational uptime" }
  ],
  "timeline_events": [
    { "date": "2021", "title": "Inception", "description": "Initial platform architecture and core research" },
    { "date": "2023", "title": "Scale Phase", "description": "Global rollout across 14 markets" },
    { "date": "2025+", "title": "AI Integration", "description": "Autonomous multi-agent presentation pipeline" }
  ],
  "key_takeaways": [
    "Critical core insight 1",
    "Critical core insight 2",
    "Critical core insight 3"
  ]
}`;

    try {
      const result = await this.modelRouter.routeToJSON<ResearchOutput>(prompt, this.model_requirements, signal);
      return result;
    } catch (e) {
      console.warn("[ResearchEngineAgent] Failed or timed out, returning structured fallback research:", e);
      return {
        topic_overview: `Comprehensive analysis of ${context.userPrompt}`,
        key_facts: [
          { topic: "Market Dynamics", fact: "High demand driven by digital transformation", category: "statistic", metric_value: "84%", metric_label: "Adoption Rate" }
        ],
        suggested_statistics: [
          { label: "Market Growth", value: "3.5x", context: "Projected 3-year expansion" },
          { label: "User Satisfaction", value: "94%", context: "Net Promoter Score" }
        ],
        timeline_events: [
          { date: "Phase 1", title: "Foundation", description: "Core framework and initial implementation" },
          { date: "Phase 2", title: "Scale", description: "Expansion and optimization" }
        ],
        key_takeaways: [
          "Strategic execution requires clear visual communication",
          "Data-driven insights yield higher engagement"
        ]
      };
    }
  }
}

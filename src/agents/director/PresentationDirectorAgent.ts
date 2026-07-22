import { IAgent, ModelCapabilities } from "../../orchestrator/types";
import { IModelRouter } from "../../orchestrator/ModelRouter";
import { DirectorOutput } from "./types";
import { ResearchOutput } from "../research/types";

export class PresentationDirectorAgent implements IAgent<{ userPrompt: string; research?: ResearchOutput }, DirectorOutput> {
  public id = "presentation-director";
  public model_requirements: ModelCapabilities = { needs_reasoning: true, needs_json_mode: true };

  constructor(private modelRouter: IModelRouter) {}

  public async execute(context: { userPrompt: string; research?: ResearchOutput }, signal: AbortSignal): Promise<DirectorOutput> {
    const prompt = `You are a World-Class Presentation Director (ex-Apple Keynote Lead / Pitch Deck Strategist).
Your task is to plan the high-level strategy for this deck. DO NOT write slide bullet points or titles.

User Prompt: "${context.userPrompt}"
Topic Overview: "${context.research?.topic_overview || context.userPrompt}"

Determine:
1. Core Objective (What must the audience feel/do after this presentation?)
2. Audience Profile
3. Presentation Style (keynote|pitch|educational|analytical|minimal)
4. Narrative Arc (Array of 4-6 storytelling chapters e.g. ["The Awakening", "The Problem", "The Paradigm Shift", "Data & Proof", "Call to Action"])
5. Visual Density (spacious|balanced|dense)
6. Tone (e.g. "Visionary, Authoritative, Inspiring")
7. Target Theme ID (modern-dark | apple | startup | cyberpunk | glassmorphism | corporate)
8. Ideal Slide Count (numeric, between 8 and 14)

Return JSON matching:
{
  "objective": "Primary goal of the presentation",
  "target_audience": "Specific audience segment",
  "presentation_style": "keynote",
  "storytelling_arc": ["Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4", "Chapter 5"],
  "visual_density": "balanced",
  "tone": "Inspiring and Data-Backed",
  "theme_id": "modern-dark",
  "target_slide_count": 10,
  "key_themes": ["Innovation", "Scalability", "Customer Impact"]
}`;

    try {
      const result = await this.modelRouter.routeToJSON<DirectorOutput>(prompt, this.model_requirements, signal);
      return result;
    } catch (e) {
      console.warn("[PresentationDirectorAgent] Falling back to default strategic plan:", e);
      return {
        objective: `Deliver an engaging presentation on ${context.userPrompt}`,
        target_audience: "Executive Leadership & Key Stakeholders",
        presentation_style: "keynote",
        storytelling_arc: ["Context & Vision", "Core Opportunity", "Solution & Evidence", "Strategic Roadmap", "Next Steps"],
        visual_density: "balanced",
        tone: "Professional, Authoritative, Inspiring",
        theme_id: "modern-dark",
        target_slide_count: 10,
        key_themes: ["Strategy", "Execution", "Value Creation"]
      };
    }
  }
}

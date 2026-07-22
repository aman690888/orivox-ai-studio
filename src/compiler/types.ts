import { PresentationIntent } from "@/agents/intent/types";
import { PresentationPlan } from "@/agents/planner/types";
import { SectionPlanOutput } from "@/agents/section-planner/types";
import { SlidePlanOutput } from "@/agents/slide-planner/types";
import { LayoutPlanOutput } from "@/agents/layout-planner/types";
import { ComponentPlanOutput } from "@/agents/component-planner/types";
import { AssetPlanOutput } from "@/agents/asset-planner/types";
import { ContentPlanOutput } from "@/agents/content-planner/types";
import { ContentOutput } from "@/agents/content-writer/types";
import { DirectorOutput } from "@/agents/director/types";
import { ResearchOutput } from "@/agents/research/types";
import { CriticOutput } from "@/agents/critic/types";

export interface CompilerInput {
  presentation_id?: string;
  intent: PresentationIntent;
  presentationPlan: PresentationPlan;
  sectionPlan: SectionPlanOutput;
  slidePlan: SlidePlanOutput;
  layoutPlan: LayoutPlanOutput;
  componentPlan: ComponentPlanOutput;
  assetPlan: AssetPlanOutput;
  contentPlan: ContentPlanOutput;
  contentOutput: ContentOutput;
  director?: DirectorOutput;
  research?: ResearchOutput;
  critic?: CriticOutput;
}

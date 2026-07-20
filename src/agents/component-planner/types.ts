import { ComponentType } from "@/types/presentation-ir.types";
import { LayoutPlanOutput } from "@/agents/layout-planner/types";

export interface ComponentNode {
  id: string; // e.g., "node-title", "node-chart"
  type: ComponentType;
  children: ComponentNode[]; // Nesting if supported by component registry constraints
  slot_assignment?: string; // Optional identifier for where it goes in the layout grid
  responsive_visibility?: "visible" | "hidden";
  semantic_role: string;
}

export interface DetailedComponentPlan {
  slide_id: string;
  component_tree: ComponentNode[];
  component_order: string[]; // array of node IDs in expected logical rendering sequence
  placeholder_map: Record<string, string>; // Maps node ID to what data is expected (e.g. "Needs Q3 revenue chart")
  validation_metadata: Record<string, any>;
  confidence_score: number;
}

export interface ComponentPlanOutput {
  slides: DetailedComponentPlan[];
  global_confidence_score: number;
}

export interface ComponentPlannerInput {
  layoutPlan: LayoutPlanOutput;
}

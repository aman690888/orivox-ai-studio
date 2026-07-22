import { SlideIR, ComponentIR, AssetIR } from "@/types/presentation-ir.types";
import { CompilerInput } from "./types";
import { ComponentNode } from "@/agents/component-planner/types";
import { DetailedContentPlaceholder } from "@/agents/content-planner/types";
import { PopulatedPlaceholder } from "@/agents/content-writer/types";

import { ChartEngine } from "../engine/ChartEngine";
import { DiagramEngine } from "../engine/DiagramEngine";

export function compileSlide(slideId: string, input: CompilerInput): SlideIR {
  const slidePlan = input.slidePlan.slides.find(s => s.slide_id === slideId);
  const layoutPlan = input.layoutPlan.layouts.find(l => l.slide_id === slideId);
  const componentPlan = input.componentPlan.slides.find(c => c.slide_id === slideId);
  const contentPlan = input.contentPlan.slides.find(c => c.slide_id === slideId);
  const contentOutput = input.contentOutput.slides.find(c => c.slide_id === slideId);
  const assetsForSlide = input.assetPlan.assets.filter(a => a.slide_id === slideId);

  if (!slidePlan || !layoutPlan || !componentPlan || !contentPlan || !contentOutput) {
    throw new Error(`[PresentationCompiler] Missing upstream dependencies to compile slide '${slideId}'.`);
  }

  const componentsData: Record<string, ComponentIR> = {};
  const componentOrder: string[] = [];

  const placeholderMap = new Map<string, DetailedContentPlaceholder>();
  contentPlan.placeholders.forEach(ph => placeholderMap.set(ph.placeholder_id, ph));

  const populatedMap = new Map<string, PopulatedPlaceholder>();
  contentOutput.populated_placeholders.forEach(ph => populatedMap.set(ph.placeholder_id, ph));

  function resolveComponent(node: ComponentNode): ComponentIR {
    const compIR: ComponentIR = {
      id: node.id,
      type: node.type,
      data: {},
      slot_assignment: node.slot_assignment,
      semantic_role: node.semantic_role
    };

    // Gather all placeholders owned by this component
    const ownedPlaceholders = contentPlan!.placeholders.filter(ph => ph.owning_component_id === node.id);
    
    ownedPlaceholders.forEach(ph => {
      const populated = populatedMap.get(ph.placeholder_id);
      if (!populated) {
        throw new Error(`[PresentationCompiler] Missing populated content for placeholder '${ph.placeholder_id}' in component '${node.id}'.`);
      }
      
      // We map the resolved content. A sophisticated mapper would know exactly which key in `data` to bind to.
      // For now, we bind dynamically or to standard keys.
      if (ph.content_type === "title" || ph.content_type === "subtitle" || ph.content_type === "paragraph") {
        compIR.data.content = populated.value;
      } else if (ph.content_type === "bullet") {
        compIR.data.items = populated.value;
      } else {
        // Fallback or generic mapping
        compIR.data[ph.content_type] = populated.value;
      }
    });

    // Resolve owned assets
    const ownedAssets = assetsForSlide.filter(a => a.owning_component_id === node.id);
    ownedAssets.forEach(asset => {
      if (asset.asset_type === "image" || asset.asset_type === "animation") {
        compIR.data.asset_id = asset.asset_id;
      }
    });

    // Invoke Visual Engines
    if (node.type === "Chart") {
      const topic = input.intent?.topic?.value || input.director?.objective || "Overview";
      const stats = input.research?.suggested_statistics || [];
      const spec = ChartEngine.createChartFromResearch(topic, stats);
      if (spec) {
        compIR.data.title = spec.title;
        compIR.data.variant = spec.variant;
        compIR.data.labels = spec.labels;
        compIR.data.datasets = spec.datasets;
      }
    } else if (node.type === "Diagram" || node.type === "Flowchart" || node.type === "MindMap") {
      const topic = input.intent?.topic?.value || "System Process";
      const spec = DiagramEngine.generateDiagram(topic, slidePlan!.slide_purpose);
      compIR.data.variant = spec.variant;
      compIR.data.mermaid_string = spec.mermaid_string;
    }

    return compIR;
  }

  // Linearize the tree into the flat components dictionary and the order array
  function traverse(nodes: ComponentNode[]) {
    nodes.forEach(node => {
      componentsData[node.id] = resolveComponent(node);
      componentOrder.push(node.id);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  }

  traverse(componentPlan.component_tree);

  return {
    id: slideId,
    purpose: slidePlan.slide_purpose,
    layout_id: layoutPlan.selected_layout_id,
    components: componentOrder,
    components_data: componentsData,
    section_id: slidePlan.section_id,
  };
}

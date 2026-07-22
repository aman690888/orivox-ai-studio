import { IModelRouter } from "./src/orchestrator/ModelRouter";
import { ModelCapabilities } from "./src/orchestrator/types";
import { PipelineRunner } from "./src/pipeline/PipelineRunner";

class MockModelRouter implements IModelRouter {
  public async routeToJSON<T>(prompt: string, capabilities: ModelCapabilities, signal: AbortSignal): Promise<T> {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 100));

    // Return deeply mocked data depending on what's asked
    if (prompt.includes("Orivox Intent Agent")) {
      return {
        topic: { value: "AI in Healthcare", confidence: 0.99 },
        audience: { value: "Medical Professionals", confidence: 0.9 },
        tone: { value: "Professional", confidence: 0.95 },
        presentation_type: { value: "Educational", confidence: 0.9 }
      } as any;
    }

    if (prompt.includes("Orivox Presentation Planner")) {
      return {
        overall_structure: "Classic",
        narrative_flow: "Problem-Solution",
        storytelling_strategy: "Data-driven",
        audience_adaptation: "Technical",
        presentation_phases: [ { phase_name: "Intro", purpose: "Hook", estimated_slides: 1 } ],
        section_hierarchy: [ { title: "Intro", focus: "Hook", estimated_slides: 1, key_takeaways: [] }, { title: "Body", focus: "Data", estimated_slides: 1, key_takeaways: [] } ],
        estimated_total_slides: 2,
        presentation_pacing: "Moderate",
        complexity_level: "Intermediate",
        recommended_visual_density: "Medium",
        theme_recommendations: ["Medical"],
        emphasis_distribution: { "Intro": 100 },
        content_balance: { text_percentage: 40, visual_percentage: 40, data_percentage: 20 },
        confidence_score: 0.9
      } as any;
    }

    if (prompt.includes("Orivox Section Planner")) {
      return {
        sections: [
          { section_id: "sec-1", title: "Intro", purpose: "Hook", order: 1, estimated_slide_count: 1 },
          { section_id: "sec-2", title: "Applications", purpose: "Inform", order: 2, estimated_slide_count: 1 }
        ],
        global_confidence_score: 0.9
      } as any;
    }

    if (prompt.includes("Orivox Slide Planner")) {
      return {
        slides: [
          { slide_id: "slide-1", section_id: "sec-1", slide_number: 1, slide_purpose: "Title Slide", required_visual_emphasis: "High", estimated_word_budget: 10, expected_complexity: "Low", transition_out: "Fade" },
          { slide_id: "slide-2", section_id: "sec-2", slide_number: 2, slide_purpose: "Show Data", required_visual_emphasis: "High", estimated_word_budget: 30, expected_complexity: "High", transition_out: "None" }
        ],
        global_confidence_score: 0.9
      } as any;
    }

    if (prompt.includes("Orivox Layout Planner")) {
      return {
        layouts: [
          { slide_id: "slide-1", selected_layout_id: "layout-title", confidence_score: 0.9, required_component_slots: ["Title", "Subtitle"], layout_constraints: { max_components: 2, max_images: 1, max_charts: 0, max_diagrams: 0 } },
          { slide_id: "slide-2", selected_layout_id: "layout-chart-left", confidence_score: 0.9, required_component_slots: ["Title", "Chart"], layout_constraints: { max_components: 3, max_images: 0, max_charts: 1, max_diagrams: 0 } }
        ],
        global_confidence_score: 0.9
      } as any;
    }

    if (prompt.includes("Orivox Component Planner")) {
      return {
        slides: [
          {
            slide_id: "slide-1",
            component_tree: [
              { id: "comp-title-1", type: "Title", children: [], semantic_role: "Main Header" },
              { id: "comp-sub-1", type: "Subtitle", children: [], semantic_role: "Sub Header" }
            ],
            component_order: ["comp-title-1", "comp-sub-1"],
            placeholder_map: {},
            validation_metadata: {},
            confidence_score: 0.9
          },
          {
            slide_id: "slide-2",
            component_tree: [
              { id: "comp-title-2", type: "Title", children: [], semantic_role: "Main Header" },
              { id: "comp-chart-1", type: "Chart", children: [], semantic_role: "Data Display" }
            ],
            component_order: ["comp-title-2", "comp-chart-1"],
            placeholder_map: {},
            validation_metadata: {},
            confidence_score: 0.9
          }
        ],
        global_confidence_score: 0.9
      } as any;
    }

    if (prompt.includes("Orivox Asset Planner")) {
      return {
        assets: [
          {
            asset_id: "asset-chart-1",
            slide_id: "slide-2",
            owning_component_id: "comp-chart-1",
            asset_type: "chart",
            semantic_purpose: "Show AI adoption growth",
            priority: "High",
            generation_required: true,
            external_source_allowed: false,
            citation_required: true,
            placeholder_name: "Adoption Chart",
            aspect_ratio: "16:9",
            responsive_behavior: "scale",
            rendering_priority: 1,
            validation_metadata: {},
            chart_type: "line",
            dataset_required: true,
            labels_required: true,
            legend_required: true,
            axis_required: true,
            numeric_precision: 1,
            chart_complexity: "Medium"
          }
        ],
        global_confidence_score: 0.9
      } as any;
    }

    if (prompt.includes("Orivox Content Planner")) {
      return {
        slides: [
          {
            slide_id: "slide-1",
            total_slide_word_budget: 10,
            placeholders: [
              { placeholder_id: "{{title_1}}", owning_component_id: "comp-title-1", content_type: "title", max_words: 5, min_words: 1 },
              { placeholder_id: "{{sub_1}}", owning_component_id: "comp-sub-1", content_type: "subtitle", max_words: 5, min_words: 1 }
            ]
          },
          {
            slide_id: "slide-2",
            total_slide_word_budget: 20,
            placeholders: [
              { placeholder_id: "{{title_2}}", owning_component_id: "comp-title-2", content_type: "title", max_words: 5, min_words: 1 },
              { placeholder_id: "{{chart_data_1}}", owning_component_id: "comp-chart-1", content_type: "chart_dataset", max_words: 15, min_words: 1 }
            ]
          }
        ],
        global_confidence_score: 0.9
      } as any;
    }

    if (prompt.includes("Orivox Content Writer")) {
      return {
        slides: [
          {
            slide_id: "slide-1",
            populated_placeholders: [
              { placeholder_id: "{{title_1}}", value: "AI in Healthcare", word_count: 3, content_type: "title" },
              { placeholder_id: "{{sub_1}}", value: "The Future is Now", word_count: 4, content_type: "subtitle" }
            ]
          },
          {
            slide_id: "slide-2",
            populated_placeholders: [
              { placeholder_id: "{{title_2}}", value: "Adoption Rates", word_count: 2, content_type: "title" },
              { placeholder_id: "{{chart_data_1}}", value: { x: ["2021", "2022"], y: [10, 50] }, word_count: 4, content_type: "chart_dataset" }
            ]
          }
        ],
        global_confidence_score: 0.9
      } as any;
    }

    return {} as any;
  }
}

async function runDemo() {
  const runner = new PipelineRunner(new MockModelRouter());
  const ir = await runner.executePipeline("Create a 10-slide presentation about Artificial Intelligence in Healthcare.");
  console.log("Final PresentationIR Output:");
  console.log(JSON.stringify(ir, null, 2));
}

runDemo().catch(console.error);

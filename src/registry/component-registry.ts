import { ComponentType } from "@/types/presentation-ir.types";

export interface ComponentConstraints {
  max_words?: number;
  max_items?: number;
  min_items?: number;
  allowed_media_types?: string[];
  max_nesting_depth: number;
}

export interface ComponentDefinition {
  id: ComponentType; // Enforces mapping to Presentation IR
  semantic_purpose: string;
  supported_layouts: "all" | string[]; // Layout IDs this component is allowed in
  allowed_parent_layouts: "slide" | "grid" | "split" | "matrix" | "any";
  required_fields: string[];
  optional_fields: string[];
  payload_schema: Record<string, "string" | "number" | "boolean" | "array" | "object">;
  default_values: Record<string, any>;
  constraints: ComponentConstraints;
  responsive_behavior: "scale" | "stack" | "scroll" | "hide" | "reflow";
  editable_fields: string[];
  validation_metadata: Record<string, any>;
}

export const ComponentRegistry: Record<ComponentType, ComponentDefinition> = {
  Title: {
    id: "Title",
    semantic_purpose: "Primary heading for a slide or distinct section.",
    supported_layouts: "all",
    allowed_parent_layouts: "slide",
    required_fields: ["content"],
    optional_fields: ["alignment"],
    payload_schema: {
      content: "string",
      alignment: "string"
    },
    default_values: { alignment: "left" },
    constraints: { max_words: 10, max_nesting_depth: 0 },
    responsive_behavior: "scale",
    editable_fields: ["content"],
    validation_metadata: { max_chars: 50 }
  },
  
  Subtitle: {
    id: "Subtitle",
    semantic_purpose: "Secondary context or bridge.",
    supported_layouts: "all",
    allowed_parent_layouts: "slide",
    required_fields: ["content"],
    optional_fields: ["alignment"],
    payload_schema: { content: "string", alignment: "string" },
    default_values: { alignment: "left" },
    constraints: { max_words: 15, max_nesting_depth: 0 },
    responsive_behavior: "scale",
    editable_fields: ["content"],
    validation_metadata: { max_chars: 80 }
  },

  Paragraph: {
    id: "Paragraph",
    semantic_purpose: "Core reading material explaining complex points.",
    supported_layouts: "all",
    allowed_parent_layouts: "any",
    required_fields: ["content"],
    optional_fields: [],
    payload_schema: { content: "string" },
    default_values: {},
    constraints: { max_words: 45, max_nesting_depth: 0 },
    responsive_behavior: "reflow",
    editable_fields: ["content"],
    validation_metadata: {}
  },

  BulletList: {
    id: "BulletList",
    semantic_purpose: "Scanning-optimized unordered list.",
    supported_layouts: ["layout-split-img-left", "layout-split-img-right", "layout-two-column", "layout-three-column"],
    allowed_parent_layouts: "any",
    required_fields: ["items"],
    optional_fields: [],
    payload_schema: { items: "array" },
    default_values: { items: [] },
    constraints: { max_items: 6, min_items: 2, max_nesting_depth: 1 },
    responsive_behavior: "stack",
    editable_fields: ["items"],
    validation_metadata: { max_words_per_item: 15 }
  },

  NumberedList: {
    id: "NumberedList",
    semantic_purpose: "Sequential list for instructions.",
    supported_layouts: ["layout-split-img-left", "layout-split-img-right"],
    allowed_parent_layouts: "any",
    required_fields: ["items"],
    optional_fields: [],
    payload_schema: { items: "array" },
    default_values: { items: [] },
    constraints: { max_items: 6, min_items: 2, max_nesting_depth: 1 },
    responsive_behavior: "stack",
    editable_fields: ["items"],
    validation_metadata: { max_words_per_item: 15 }
  },

  Quote: {
    id: "Quote",
    semantic_purpose: "Social proof or emphatic highlight.",
    supported_layouts: ["layout-quote", "layout-split-img-left", "layout-split-img-right"],
    allowed_parent_layouts: "any",
    required_fields: ["text"],
    optional_fields: ["author", "role"],
    payload_schema: { text: "string", author: "string", role: "string" },
    default_values: {},
    constraints: { max_words: 35, max_nesting_depth: 0 },
    responsive_behavior: "scale",
    editable_fields: ["text", "author", "role"],
    validation_metadata: {}
  },

  Callout: {
    id: "Callout",
    semantic_purpose: "Breaking the flow to highlight a risk, tip, or success.",
    supported_layouts: "all",
    allowed_parent_layouts: "any",
    required_fields: ["text", "intent"],
    optional_fields: [],
    payload_schema: { text: "string", intent: "string" },
    default_values: { intent: "info" },
    constraints: { max_words: 25, max_nesting_depth: 0 },
    responsive_behavior: "reflow",
    editable_fields: ["text", "intent"],
    validation_metadata: { intents_allowed: ["info", "warning", "success"] }
  },

  Image: {
    id: "Image",
    semantic_purpose: "Contextual visual support.",
    supported_layouts: "all",
    allowed_parent_layouts: "any",
    required_fields: ["asset_id"],
    optional_fields: ["caption", "bleed"],
    payload_schema: { asset_id: "string", caption: "string", bleed: "boolean" },
    default_values: { bleed: false },
    constraints: { max_nesting_depth: 0, allowed_media_types: ["image/jpeg", "image/png", "image/webp"] },
    responsive_behavior: "scale",
    editable_fields: ["asset_id", "caption"],
    validation_metadata: {}
  },

  HeroImage: {
    id: "HeroImage",
    semantic_purpose: "Massive emotional opening visual.",
    supported_layouts: ["layout-cover-hero"],
    allowed_parent_layouts: "slide",
    required_fields: ["asset_id"],
    optional_fields: ["overlay_opacity"],
    payload_schema: { asset_id: "string", overlay_opacity: "number" },
    default_values: { overlay_opacity: 40 },
    constraints: { max_nesting_depth: 0 },
    responsive_behavior: "scale",
    editable_fields: ["asset_id", "overlay_opacity"],
    validation_metadata: { required_aspect: "cover" }
  },

  Icon: {
    id: "Icon",
    semantic_purpose: "Vector symbolic representation.",
    supported_layouts: "all",
    allowed_parent_layouts: "any",
    required_fields: ["icon_name"],
    optional_fields: ["color"],
    payload_schema: { icon_name: "string", color: "string" },
    default_values: {},
    constraints: { max_nesting_depth: 0 },
    responsive_behavior: "scale",
    editable_fields: ["icon_name", "color"],
    validation_metadata: {}
  },

  IconCard: {
    id: "IconCard",
    semantic_purpose: "Small visual block for lists or grids.",
    supported_layouts: "all",
    allowed_parent_layouts: "grid",
    required_fields: ["icon", "title"],
    optional_fields: ["description"],
    payload_schema: { icon: "string", title: "string", description: "string" },
    default_values: {},
    constraints: { max_nesting_depth: 0 },
    responsive_behavior: "stack",
    editable_fields: ["icon", "title", "description"],
    validation_metadata: { max_chars_title: 30 }
  },

  FeatureCard: {
    id: "FeatureCard",
    semantic_purpose: "Detailed card for key highlights.",
    supported_layouts: "all",
    allowed_parent_layouts: "grid",
    required_fields: ["title", "description"],
    optional_fields: ["icon", "image_asset_id"],
    payload_schema: { title: "string", description: "string", icon: "string", image_asset_id: "string" },
    default_values: {},
    constraints: { max_nesting_depth: 0 },
    responsive_behavior: "stack",
    editable_fields: ["title", "description", "icon"],
    validation_metadata: { max_words: 30 }
  },

  IconGrid: {
    id: "IconGrid",
    semantic_purpose: "Layout container for multiple icons and short text.",
    supported_layouts: ["layout-grid-four"],
    allowed_parent_layouts: "slide",
    required_fields: ["items"],
    optional_fields: [],
    payload_schema: { items: "array" },
    default_values: { items: [] },
    constraints: { max_items: 8, max_nesting_depth: 2 },
    responsive_behavior: "stack",
    editable_fields: ["items"],
    validation_metadata: {}
  },

  Timeline: {
    id: "Timeline",
    semantic_purpose: "Chronological or sequential storytelling.",
    supported_layouts: ["layout-timeline-hz", "layout-timeline-vt"],
    allowed_parent_layouts: "slide",
    required_fields: ["nodes"],
    optional_fields: ["orientation"],
    payload_schema: { nodes: "array", orientation: "string" },
    default_values: { orientation: "horizontal" },
    constraints: { max_items: 8, max_nesting_depth: 2 },
    responsive_behavior: "stack",
    editable_fields: ["nodes"],
    validation_metadata: {}
  },

  Process: {
    id: "Process",
    semantic_purpose: "Sequential instructions.",
    supported_layouts: ["layout-process-flow"],
    allowed_parent_layouts: "slide",
    required_fields: ["steps"],
    optional_fields: [],
    payload_schema: { steps: "array" },
    default_values: { steps: [] },
    constraints: { max_items: 5, max_nesting_depth: 1 },
    responsive_behavior: "stack",
    editable_fields: ["steps"],
    validation_metadata: {}
  },

  Comparison: {
    id: "Comparison",
    semantic_purpose: "Direct Us vs Them evaluation.",
    supported_layouts: ["layout-compare-vs", "layout-pros-cons"],
    allowed_parent_layouts: "slide",
    required_fields: ["left_column", "right_column"],
    optional_fields: ["highlight_side"],
    payload_schema: { left_column: "object", right_column: "object", highlight_side: "string" },
    default_values: { highlight_side: "right" },
    constraints: { max_nesting_depth: 2 },
    responsive_behavior: "stack",
    editable_fields: ["left_column", "right_column"],
    validation_metadata: {}
  },

  Table: {
    id: "Table",
    semantic_purpose: "Raw structured data.",
    supported_layouts: ["layout-table"],
    allowed_parent_layouts: "slide",
    required_fields: ["headers", "rows"],
    optional_fields: [],
    payload_schema: { headers: "array", rows: "array" },
    default_values: { headers: [], rows: [] },
    constraints: { max_items: 8, max_nesting_depth: 0 },
    responsive_behavior: "scroll",
    editable_fields: ["headers", "rows"],
    validation_metadata: { max_columns: 5, max_rows: 8 }
  },

  KPICard: {
    id: "KPICard",
    semantic_purpose: "Key metric tracking.",
    supported_layouts: ["layout-kpi-dash"],
    allowed_parent_layouts: "grid",
    required_fields: ["label", "value"],
    optional_fields: ["trend", "sparkline_data"],
    payload_schema: { label: "string", value: "string", trend: "string", sparkline_data: "array" },
    default_values: {},
    constraints: { max_nesting_depth: 0 },
    responsive_behavior: "scale",
    editable_fields: ["label", "value", "trend"],
    validation_metadata: {}
  },

  Statistic: {
    id: "Statistic",
    semantic_purpose: "Emphasize a single powerful number.",
    supported_layouts: ["layout-big-number", "layout-stats-dash"],
    allowed_parent_layouts: "any",
    required_fields: ["value", "label"],
    optional_fields: ["trend"],
    payload_schema: { value: "string", label: "string", trend: "string" },
    default_values: {},
    constraints: { max_nesting_depth: 0 },
    responsive_behavior: "scale",
    editable_fields: ["value", "label", "trend"],
    validation_metadata: { max_chars_value: 6, max_chars_label: 20 }
  },

  MetricGrid: {
    id: "MetricGrid",
    semantic_purpose: "Grouping of KPIs or Statistics.",
    supported_layouts: ["layout-stats-dash", "layout-kpi-dash"],
    allowed_parent_layouts: "slide",
    required_fields: ["metrics"],
    optional_fields: [],
    payload_schema: { metrics: "array" },
    default_values: { metrics: [] },
    constraints: { max_items: 6, max_nesting_depth: 2 },
    responsive_behavior: "stack",
    editable_fields: ["metrics"],
    validation_metadata: {}
  },

  Chart: {
    id: "Chart",
    semantic_purpose: "Visualizing numerical datasets.",
    supported_layouts: ["layout-chart-left", "layout-chart-right", "layout-chart-bar-full", "layout-chart-pie-full", "layout-chart-line-full"],
    allowed_parent_layouts: "slide",
    required_fields: ["variant", "datasets", "labels"],
    optional_fields: [],
    payload_schema: { variant: "string", datasets: "array", labels: "array" },
    default_values: { variant: "bar" },
    constraints: { max_items: 6, max_nesting_depth: 0 },
    responsive_behavior: "scale",
    editable_fields: ["datasets", "labels"],
    validation_metadata: { variants: ["bar", "line", "pie", "area", "scatter"] }
  },

  Diagram: {
    id: "Diagram",
    semantic_purpose: "Relational, hierarchical, or systemic data.",
    supported_layouts: ["layout-diagram-arch", "layout-diagram-tree"],
    allowed_parent_layouts: "slide",
    required_fields: ["variant", "mermaid_string"],
    optional_fields: [],
    payload_schema: { variant: "string", mermaid_string: "string" },
    default_values: { variant: "arch" },
    constraints: { max_nesting_depth: 0 },
    responsive_behavior: "scale",
    editable_fields: ["mermaid_string"],
    validation_metadata: {}
  },

  Flowchart: {
    id: "Flowchart",
    semantic_purpose: "Decision tree logic.",
    supported_layouts: ["layout-flowchart"],
    allowed_parent_layouts: "slide",
    required_fields: ["mermaid_string"],
    optional_fields: [],
    payload_schema: { mermaid_string: "string" },
    default_values: {},
    constraints: { max_nesting_depth: 0 },
    responsive_behavior: "scale",
    editable_fields: ["mermaid_string"],
    validation_metadata: {}
  },

  MindMap: {
    id: "MindMap",
    semantic_purpose: "Brainstorming and hierarchy of ideas.",
    supported_layouts: ["layout-mindmap"],
    allowed_parent_layouts: "slide",
    required_fields: ["mermaid_string"],
    optional_fields: [],
    payload_schema: { mermaid_string: "string" },
    default_values: {},
    constraints: { max_nesting_depth: 0 },
    responsive_behavior: "scale",
    editable_fields: ["mermaid_string"],
    validation_metadata: {}
  },

  CodeBlock: {
    id: "CodeBlock",
    semantic_purpose: "Developer-focused context.",
    supported_layouts: ["layout-code-spotlight", "layout-split-img-right", "layout-split-img-left"],
    allowed_parent_layouts: "any",
    required_fields: ["language", "code"],
    optional_fields: [],
    payload_schema: { language: "string", code: "string" },
    default_values: { language: "typescript" },
    constraints: { max_nesting_depth: 0 },
    responsive_behavior: "scroll",
    editable_fields: ["language", "code"],
    validation_metadata: { max_lines: 20 }
  },

  Video: {
    id: "Video",
    semantic_purpose: "Motion visuals and demonstrations.",
    supported_layouts: ["layout-video-bleed"],
    allowed_parent_layouts: "slide",
    required_fields: ["asset_id"],
    optional_fields: ["autoplay", "loop", "muted"],
    payload_schema: { asset_id: "string", autoplay: "boolean", loop: "boolean", muted: "boolean" },
    default_values: { autoplay: true, loop: true, muted: true },
    constraints: { max_nesting_depth: 0, allowed_media_types: ["video/mp4", "video/webm"] },
    responsive_behavior: "scale",
    editable_fields: ["asset_id"],
    validation_metadata: {}
  },

  CTA: {
    id: "CTA",
    semantic_purpose: "The final action button.",
    supported_layouts: ["layout-cta"],
    allowed_parent_layouts: "slide",
    required_fields: ["label", "url"],
    optional_fields: [],
    payload_schema: { label: "string", url: "string" },
    default_values: {},
    constraints: { max_nesting_depth: 0 },
    responsive_behavior: "reflow",
    editable_fields: ["label", "url"],
    validation_metadata: {}
  },

  Testimonial: {
    id: "Testimonial",
    semantic_purpose: "Customer feedback.",
    supported_layouts: ["layout-quote", "layout-grid-four"],
    allowed_parent_layouts: "any",
    required_fields: ["quote", "author"],
    optional_fields: ["role", "avatar_asset_id"],
    payload_schema: { quote: "string", author: "string", role: "string", avatar_asset_id: "string" },
    default_values: {},
    constraints: { max_words: 40, max_nesting_depth: 0 },
    responsive_behavior: "scale",
    editable_fields: ["quote", "author", "role"],
    validation_metadata: {}
  },

  TeamCard: {
    id: "TeamCard",
    semantic_purpose: "Introduce key personnel.",
    supported_layouts: ["layout-team-roster"],
    allowed_parent_layouts: "grid",
    required_fields: ["name", "role", "avatar_asset_id"],
    optional_fields: ["bio"],
    payload_schema: { name: "string", role: "string", avatar_asset_id: "string", bio: "string" },
    default_values: {},
    constraints: { max_nesting_depth: 0 },
    responsive_behavior: "stack",
    editable_fields: ["name", "role", "bio"],
    validation_metadata: {}
  },

  PricingCard: {
    id: "PricingCard",
    semantic_purpose: "Evaluating options and costs.",
    supported_layouts: ["layout-pricing-tiers"],
    allowed_parent_layouts: "grid",
    required_fields: ["tier", "price", "features"],
    optional_fields: ["highlighted"],
    payload_schema: { tier: "string", price: "string", features: "array", highlighted: "boolean" },
    default_values: { highlighted: false },
    constraints: { max_items: 10, max_nesting_depth: 1 },
    responsive_behavior: "stack",
    editable_fields: ["tier", "price", "features"],
    validation_metadata: {}
  },

  FAQ: {
    id: "FAQ",
    semantic_purpose: "Answering objections.",
    supported_layouts: ["layout-faq-accordion"],
    allowed_parent_layouts: "slide",
    required_fields: ["items"],
    optional_fields: [],
    payload_schema: { items: "array" },
    default_values: { items: [] },
    constraints: { max_items: 5, max_nesting_depth: 1 },
    responsive_behavior: "stack",
    editable_fields: ["items"],
    validation_metadata: {}
  },

  Footer: {
    id: "Footer",
    semantic_purpose: "Global slide footing (page numbers, disclaimers).",
    supported_layouts: "all",
    allowed_parent_layouts: "slide",
    required_fields: ["content"],
    optional_fields: ["show_slide_number"],
    payload_schema: { content: "string", show_slide_number: "boolean" },
    default_values: { show_slide_number: true },
    constraints: { max_words: 10, max_nesting_depth: 0 },
    responsive_behavior: "hide",
    editable_fields: ["content"],
    validation_metadata: {}
  },

  SectionDivider: {
    id: "SectionDivider",
    semantic_purpose: "Structural breathing room between narrative arcs.",
    supported_layouts: ["layout-section-header"],
    allowed_parent_layouts: "slide",
    required_fields: ["title"],
    optional_fields: ["subtitle"],
    payload_schema: { title: "string", subtitle: "string" },
    default_values: {},
    constraints: { max_nesting_depth: 0 },
    responsive_behavior: "scale",
    editable_fields: ["title", "subtitle"],
    validation_metadata: {}
  }
};

/**
 * Helper to fetch a component definition by ID.
 * Throws an error if hallucinated (used by Validator).
 */
export function getComponentDefinition(id: ComponentType): ComponentDefinition {
  const component = ComponentRegistry[id];
  if (!component) {
    throw new Error(`[Registry Error]: Component ID '${id}' is not a valid registered component.`);
  }
  return component;
}

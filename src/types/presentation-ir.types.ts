/**
 * Orivox V3 - Presentation Intermediate Representation (IR)
 * Source of Truth: docs/presentation-ir.md
 * 
 * This file contains the foundational type definitions for the Orivox V3 architecture.
 * Every agent, validator, and renderer must communicate via these types.
 */

// ----------------------------------------------------------------------
// 1. PRIMITIVES & ROOT
// ----------------------------------------------------------------------

export type UUID = string;

export interface PresentationIR {
  id: UUID;
  version: "3.0.0"; // Schema versioning
  metadata: PresentationMetadata;
  theme: PresentationTheme;
  slide_order: UUID[]; // Rendering sequence
  slides: Record<UUID, SlideIR>; // Normalized dictionary
  assets?: Record<UUID, AssetIR>; // Global asset dictionary
  collaboration?: CollaborationMetadata;
  export_metadata?: ExportMetadata;
}

export interface PresentationMetadata {
  title: string;
  author_id: UUID; // Immutable
  created_at: string; // ISO 8601 string, Immutable
  updated_at: string; // ISO 8601 string
  audience: string;
  tone: string;
  ai_reasoning?: Record<string, any>;
  regeneration_count?: number;
}

export interface PresentationTheme {
  id: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    heading: string;
    body: string;
  };
}

// ----------------------------------------------------------------------
// 2. SLIDES & LAYOUTS
// ----------------------------------------------------------------------

export interface SlideIR {
  id: UUID;
  purpose: string;
  layout_id: string; // References Layout Library ID (e.g., 'layout-split-img-left')
  components: UUID[]; // References to ComponentIR
  components_data: Record<UUID, ComponentIR>; // Normalized component dictionary scoped to slide
  section_id?: UUID;
  speaker_notes?: string;
  animations?: AnimationConfig;
  background_asset_id?: UUID;
  regeneration_metadata?: RegenerationMetadata;
}

export interface SectionIR {
  id: UUID;
  title: string;
  order_index: number;
}

export interface AnimationConfig {
  type: "fade" | "slide-up" | "slide-left" | "slide-right" | "zoom";
  duration_ms: number;
}

export interface RegenerationMetadata {
  retry_count: number;
  last_error?: string;
  reasoning?: string;
}

// ----------------------------------------------------------------------
// 3. COMPONENTS
// ----------------------------------------------------------------------

export interface ComponentIR {
  id: UUID;
  type: ComponentType;
  data: any; // Strictly typed below in specific payloads
  style_overrides?: Record<string, string | number>;
  slot_assignment?: string;
  semantic_role?: string;
}

export type ComponentType = 
  | "Title" 
  | "Subtitle" 
  | "Paragraph" 
  | "BulletList" 
  | "NumberedList" 
  | "Quote" 
  | "Callout"
  | "Image" 
  | "HeroImage"
  | "Icon" 
  | "IconCard"
  | "FeatureCard"
  | "IconGrid" 
  | "Timeline" 
  | "Process" 
  | "Comparison" 
  | "Table" 
  | "KPICard" 
  | "Statistic" 
  | "MetricGrid" 
  | "Chart" 
  | "Diagram" 
  | "Flowchart" 
  | "MindMap" 
  | "CodeBlock" 
  | "Video" 
  | "CTA" 
  | "Testimonial" 
  | "TeamCard" 
  | "PricingCard" 
  | "FAQ" 
  | "Footer" 
  | "SectionDivider";

// Component Payload Examples (Enforced by Validator, conceptually defined here)
export interface TitleData {
  content: string;
  alignment?: "left" | "center" | "right";
}

export interface ChartData {
  variant: "bar" | "line" | "pie" | "area" | "scatter";
  labels: string[];
  datasets: Array<{
    label: string;
    values: number[];
  }>;
}

export interface DiagramData {
  variant: "flow" | "mindmap" | "org" | "arch";
  mermaid_string: string;
}

// ----------------------------------------------------------------------
// 4. ASSETS
// ----------------------------------------------------------------------

export interface AssetIR {
  id: UUID;
  type: "image" | "video" | "icon";
  url: string;
  alt_text?: string;
  blurhash?: string;
  generation_prompt?: string;
}

// ----------------------------------------------------------------------
// 5. COLLABORATION & EXPORT
// ----------------------------------------------------------------------

export interface CollaborationMetadata {
  last_edited_by: UUID;
  cursor_positions?: Record<UUID, any>;
  history?: any[]; // Array of JSON Patches
}

export interface ExportMetadata {
  aspect_ratio: "16:9" | "4:3";
  resolution: "1080p" | "4k";
  watermark: boolean;
}

// ----------------------------------------------------------------------
// 6. IR LIFECYCLE STAGES
// ----------------------------------------------------------------------

export interface PromptIR extends Omit<PresentationIR, "slides" | "slide_order" | "assets"> {
  stage: "prompt";
}

export interface PlanningIR extends Omit<PresentationIR, "assets"> {
  stage: "planning";
  // Slides exist, but their components_data might be empty shells
}

export interface ContentIR extends PresentationIR {
  stage: "content";
  // Raw content populated, but validation hasn't confirmed constraints
}

export interface ValidatedIR extends PresentationIR {
  stage: "validated";
  // Guaranteed to pass the ValidationEngine
}

export interface RenderIR extends PresentationIR {
  stage: "render";
  // Optimized for UI (e.g. assets pre-fetched/cached)
}

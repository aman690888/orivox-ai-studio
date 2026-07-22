import { ComponentType } from "@/types/presentation-ir.types";

/**
 * Metadata defining structural constraints for a layout.
 */
export interface LayoutConstraints {
  max_words_total: number;
  max_images: number;
  max_charts: number;
  max_diagrams: number;
  max_components: number;
  supported_components: ComponentType[];
  required_components: ComponentType[];
}

/**
 * Metadata dictating when AI should choose this layout.
 */
export interface LayoutIntentMetadata {
  slide_purposes: string[]; // e.g., ["introduction", "transition", "comparison"]
  tones: string[];
  best_use_cases: string[];
  tags: string[];
}

/**
 * The canonical Layout definition.
 */
export interface LayoutDefinition {
  id: string; // e.g., "layout-cover-hero"
  name: string;
  family: "cover" | "split" | "grid" | "full" | "timeline" | "diagram" | "data" | "closing";
  constraints: LayoutConstraints;
  intent: LayoutIntentMetadata;
  responsive_rules: string[]; // Human-readable fallback rules for the renderer/AI logic
}

/**
 * The Orivox V3 Layout Registry.
 * Single source of truth for all layout metadata.
 */
export const LayoutRegistry: Record<string, LayoutDefinition> = {
  "layout-cover-hero": {
    id: "layout-cover-hero",
    name: "Hero Cover",
    family: "cover",
    constraints: {
      max_words_total: 15,
      max_images: 1,
      max_charts: 0,
      max_diagrams: 0,
      max_components: 2,
      supported_components: ["Title", "Subtitle"],
      required_components: ["Title"],
    },
    intent: {
      slide_purposes: ["introduction"],
      tones: ["persuasive", "visionary"],
      best_use_cases: ["Pitch Deck Cover", "Product Launch"],
      tags: ["Marketing", "Sales", "Corporate", "Startup"],
    },
    responsive_rules: ["Title scales from 64px to 32px on mobile", "Background image crops to center focus"],
  },

  "layout-cover-minimal": {
    id: "layout-cover-minimal",
    name: "Minimal Cover",
    family: "cover",
    constraints: {
      max_words_total: 20,
      max_images: 0,
      max_charts: 0,
      max_diagrams: 0,
      max_components: 4,
      supported_components: ["Title", "Subtitle", "Paragraph"],
      required_components: ["Title"],
    },
    intent: {
      slide_purposes: ["introduction"],
      tones: ["professional", "academic"],
      best_use_cases: ["Academic Presentation", "Internal Report"],
      tags: ["Corporate", "Academic", "Research"],
    },
    responsive_rules: ["Standard padding scales to 16px on mobile"],
  },

  "layout-split-img-left": {
    id: "layout-split-img-left",
    name: "Split Image Left",
    family: "split",
    constraints: {
      max_words_total: 45,
      max_images: 1,
      max_charts: 0,
      max_diagrams: 0,
      max_components: 4,
      supported_components: ["Title", "Subtitle", "Paragraph", "BulletList", "Callout"],
      required_components: ["Title"], // image is handled via background_asset_id or explicit component
    },
    intent: {
      slide_purposes: ["introduction", "explanation", "showcase"],
      tones: ["any"],
      best_use_cases: ["Concept introductions", "Feature highlights"],
      tags: ["Business", "Marketing", "Educational"],
    },
    responsive_rules: ["Stacks vertically on mobile (Image top, Text bottom)"],
  },

  "layout-split-img-right": {
    id: "layout-split-img-right",
    name: "Split Image Right",
    family: "split",
    constraints: {
      max_words_total: 45,
      max_images: 1,
      max_charts: 0,
      max_diagrams: 0,
      max_components: 4,
      supported_components: ["Title", "Subtitle", "Paragraph", "BulletList", "Callout"],
      required_components: ["Title"],
    },
    intent: {
      slide_purposes: ["explanation", "showcase"],
      tones: ["any"],
      best_use_cases: ["Concept introductions (mirrored rhythm)"],
      tags: ["Business", "Marketing", "Educational"],
    },
    responsive_rules: ["Stacks vertically on mobile (Text top, Image bottom)"],
  },

  "layout-center-title": {
    id: "layout-center-title",
    name: "Centered Title",
    family: "cover",
    constraints: {
      max_words_total: 20,
      max_images: 0,
      max_charts: 0,
      max_diagrams: 0,
      max_components: 2,
      supported_components: ["Title", "Subtitle"],
      required_components: ["Title"],
    },
    intent: {
      slide_purposes: ["transition", "bold-claim"],
      tones: ["any"],
      best_use_cases: ["Topic transitions", "Emphatic statements"],
      tags: ["Corporate", "Startup", "General"],
    },
    responsive_rules: ["Centers vertically and horizontally"],
  },

  "layout-two-column": {
    id: "layout-two-column",
    name: "Two Column",
    family: "grid",
    constraints: {
      max_words_total: 60,
      max_images: 0,
      max_charts: 0,
      max_diagrams: 0,
      max_components: 6,
      supported_components: ["Title", "Paragraph", "BulletList", "IconCard"],
      required_components: ["Title"],
    },
    intent: {
      slide_purposes: ["comparison", "dual-features"],
      tones: ["any"],
      best_use_cases: ["Contrasting concepts", "Pros/Cons"],
      tags: ["Corporate", "Startup", "Educational"],
    },
    responsive_rules: ["Stacks vertically into a single column on mobile"],
  },

  "layout-grid-four": {
    id: "layout-grid-four",
    name: "Four Card Grid",
    family: "grid",
    constraints: {
      max_words_total: 80,
      max_images: 0,
      max_charts: 0,
      max_diagrams: 0,
      max_components: 5, // Title + 4 Cards
      supported_components: ["Title", "IconCard"],
      required_components: ["Title", "IconCard"],
    },
    intent: {
      slide_purposes: ["features", "benefits", "swot"],
      tones: ["any"],
      best_use_cases: ["Feature lists", "Value propositions"],
      tags: ["Marketing", "Sales", "Startup"],
    },
    responsive_rules: ["Breaks to 2x2 on tablets", "Breaks to 1x4 on mobile"],
  },

  "layout-chart-left": {
    id: "layout-chart-left",
    name: "Chart Left",
    family: "data",
    constraints: {
      max_words_total: 150,
      max_images: 0,
      max_charts: 1,
      max_diagrams: 0,
      max_components: 4,
      supported_components: ["Title", "Subtitle", "Paragraph", "Chart"],
      required_components: ["Chart"],
    },
    intent: {
      slide_purposes: ["data", "evidence", "statistics"],
      tones: ["analytical", "professional"],
      best_use_cases: ["Data visualization with contextual explanation"],
      tags: ["Research", "Business", "Technical"],
    },
    responsive_rules: ["Chart stacks above text on mobile"],
  },

  "layout-process-flow": {
    id: "layout-process-flow",
    name: "Process Flow",
    family: "diagram",
    constraints: {
      max_words_total: 150,
      max_images: 0,
      max_charts: 0,
      max_diagrams: 1,
      max_components: 2,
      supported_components: ["Title", "Diagram"],
      required_components: ["Diagram"],
    },
    intent: {
      slide_purposes: ["instruction", "process", "architecture"],
      tones: ["any"],
      best_use_cases: ["Sequential instructions", "Logic flows"],
      tags: ["Technical", "Educational"],
    },
    responsive_rules: ["Diagram renders as vertical list on mobile if horizontal overflow occurs"],
  },

  "layout-quote": {
    id: "layout-quote",
    name: "Quote Focus",
    family: "full",
    constraints: {
      max_words_total: 35,
      max_images: 0,
      max_charts: 0,
      max_diagrams: 0,
      max_components: 2,
      supported_components: ["Quote", "Title"],
      required_components: ["Quote"],
    },
    intent: {
      slide_purposes: ["testimonial", "social-proof", "bold-claim"],
      tones: ["any"],
      best_use_cases: ["Customer testimonials", "Key insights"],
      tags: ["Marketing", "Sales"],
    },
    responsive_rules: ["Quote font size scales down heavily on mobile"],
  },

  "layout-cta": {
    id: "layout-cta",
    name: "Call To Action",
    family: "closing",
    constraints: {
      max_words_total: 20,
      max_images: 0,
      max_charts: 0,
      max_diagrams: 0,
      max_components: 3,
      supported_components: ["Title", "Subtitle", "CTA"],
      required_components: ["Title", "CTA"],
    },
    intent: {
      slide_purposes: ["action", "closing"],
      tones: ["persuasive", "direct"],
      best_use_cases: ["Ending slide", "Next steps"],
      tags: ["Sales", "Marketing", "Startup"],
    },
    responsive_rules: ["Center aligned stack on mobile"],
  }
};

/**
 * Helper to fetch a layout definition by ID.
 * Throws an error if hallucinated (used by Validator).
 */
export function getLayoutDefinition(id: string): LayoutDefinition {
  const layout = LayoutRegistry[id];
  if (!layout) {
    throw new Error(`[Registry Error]: Layout ID '${id}' is not a valid registered layout.`);
  }
  return layout;
}

# Orivox V3 - AI Presentation Operating System Specification

This document serves as the single source of truth for the Orivox V3 architecture. It outlines the technical specifications for a highly scalable, JSON-driven presentation generation engine capable of competing with state-of-the-art platforms like Gamma, Beautiful.ai, and Pitch. 

---

## 1. SYSTEM OVERVIEW

Orivox V3 utilizes an agentic, pipeline-driven architecture. The core principle is a strict separation of concerns: AI generates purely semantic, validated JSON which a deterministic React engine later renders.

**Pipeline Flow:**
`User Prompt` → `Presentation Director` → `Research Engine` → `Story Planner` → `Layout Planner` → `Content Generator` → `Visual Planner` → `Validator` → `Renderer`

### Module Responsibilities:
- **User Prompt**: The raw, natural language input or structured data provided by the user (e.g., "A 10-slide deck pitching a B2B SaaS product for HR").
- **Presentation Director**: The orchestrator. Analyzes the prompt to define the audience, tone, global theme, and delegates tasks to specialized sub-agents.
- **Research Engine**: Connects to search APIs and vector databases to gather factual data, statistics, and domain context.
- **Story Planner**: Synthesizes research into a high-level narrative arc (e.g., Problem → Solution → Market → Team → Ask).
- **Layout Planner**: Assigns precise, component-driven layouts to each slide based on the narrative arc and required data density.
- **Content Generator**: Writes the actual text (titles, paragraphs, bullet points, data points, speaker notes) fitting the constraints of the assigned layouts.
- **Visual Planner**: Decides where and how images, charts, icons, and diagrams should be integrated.
- **Validator**: An automated, deterministic gatekeeper that checks the JSON output against structural and qualitative rules.
- **Renderer**: A pure, stateless React engine that converts validated JSON into DOM elements without any AI involvement.

---

## 2. PRESENTATION JSON SCHEMA

The entire presentation state is stored as a single, master JSON document.

```json
{
  "presentation": {
    "id": "uuid",
    "metadata": {
      "title": "String",
      "author": "String",
      "audience": "String (e.g., 'C-Suite', 'Technical', 'General')",
      "tone": "String (e.g., 'Professional', 'Persuasive', 'Visionary')",
      "style": "String (e.g., 'Minimalist', 'Data-Heavy', 'Storytelling')",
      "status": "Enum ('draft', 'generating', 'completed', 'failed')"
    },
    "theme": {
      "id": "String (e.g., 'dark-electric')",
      "fonts": {
        "heading": "String",
        "body": "String"
      },
      "colors": {
        "primary": "String (hex/oklch)",
        "accent": "String",
        "background": "String"
      }
    },
    "sources": [
      {
        "id": "String",
        "title": "String",
        "url": "String",
        "reliability_score": "Number (0-1)"
      }
    ],
    "slides": [
      // Array of Slide JSON Objects (See Section 3)
    ]
  }
}
```

**Field Definitions:**
- `id`: Globally unique identifier for the presentation.
- `metadata`: Contextual data guiding the AI and defining the deck's identity.
- `theme`: The visual styling blueprint overriding defaults.
- `sources`: Citations gathered by the Research Engine to ensure factual accuracy.
- `slides`: The ordered array of individual slide configurations.

---

## 3. SLIDE JSON SCHEMA

Each slide is a standalone entity with a strict schema dictating its semantic content and visual structure.

```json
{
  "id": "uuid",
  "order": "Number",
  "title": "String",
  "subtitle": "String (Optional)",
  "purpose": "String (e.g., 'Introduction', 'Data Evidence', 'Call to Action')",
  "layout": "String (ID matching Layout Library)",
  "theme_override": "Object (Optional - localized theme changes)",
  "components": [
    // Array of Component Objects (See Section 4)
  ],
  "visuals": {
    "background": "VisualObject (Optional)",
    "primary": "VisualObject (Optional)"
  },
  "animations": {
    "entrance": "String (e.g., 'fade-in', 'slide-up')",
    "duration": "Number (ms)"
  },
  "speaker_notes": "String (Rich text for presenter)",
  "sources_referenced": ["String (Array of Source IDs)"]
}
```

**Field Definitions:**
- `id`: Unique identifier for the slide.
- `title`: Primary headline of the slide.
- `purpose`: Semantic role of the slide within the story arc.
- `layout`: Determines how the `components` are structurally arranged on the canvas.
- `components`: The actual content blocks (text, data, lists).
- `visuals`: Asset configurations (images, charts, diagrams).
- `animations`: Instructions for the Renderer regarding slide transitions.
- `speaker_notes`: Automatically generated script for the presenter.

---

## 4. COMPONENT SYSTEM

The component system represents atomic pieces of content. The Renderer maps these directly to React components.

### Core Components
1. **Title / Subtitle**: Text blocks with strict typography hierarchies.
2. **Paragraph**: Body text with character limits.
3. **Bullet List**: Array of text strings.
4. **Cards**: Array of objects containing `icon`, `title`, and `description`.
5. **Quote**: Object with `text`, `author`, and `role`.
6. **Statistic**: Object with `value`, `label`, and `trend` (up/down).
7. **Chart**: Object with `type` (bar, line, pie), `labels`, and `datasets`.
8. **Timeline**: Array of events with `date`, `title`, and `description`.
9. **Roadmap**: Array of phases (e.g., Q1, Q2) with associated tasks.
10. **Checklist**: Array of boolean items.
11. **Comparison**: Two-column layout comparing `Entity A` vs `Entity B`.
12. **Table**: Structured 2D array of strings/numbers.
13. **Process**: Step-by-step numbered flowchart array.
14. **Architecture**: Node and edge definitions for system design diagrams.
15. **Mind Map**: Hierarchical JSON representing interconnected ideas.
16. **Flowchart**: Logic tree with decision branches.
17. **Gallery**: Grid of images with optional captions.
18. **Code Block**: Object with `language` and `code` string.
19. **Equation**: LaTeX formatted mathematical string.
20. **FAQ**: Array of `question` and `answer` pairs.
21. **KPI**: Grid of key performance indicators.
22. **Callout**: Highlighted box with `type` (warning, info, tip) and `text`.

### Component Contract (Example: Statistic)
- **JSON Schema**: 
  ```json
  {
    "type": "Statistic",
    "data": { "value": "84%", "label": "Revenue Growth", "trend": "up" }
  }
  ```
- **Rendering Rules**: Must render the `value` at 4x `label` size. If `trend` is up, show a green upward arrow.
- **Validation Rules**: `value` must be < 10 characters. `label` must be < 30 characters.

---

## 5. LAYOUT LIBRARY

Layouts dictate the spatial arrangement of components. The Layout Planner assigns these intelligently to avoid visual fatigue.

1. **Title Slide**: Center-aligned massive text. Maximum text density: Low. Best for: Openings.
2. **Split 50/50**: Text left, Media right. Maximum text density: Medium. Best for: Concept introductions.
3. **Split 30/70**: Sidebar navigation/context left, deep data right.
4. **Three Column Cards**: Three equal cards with icons. Best for: Value propositions.
5. **Four Grid**: 2x2 grid. Best for: SWOTS, Features.
6. **Hero Background**: Full bleed image with white text overlay. Best for: Emotional impact.
7. **Big Statistic**: Giant number, minimal text. Best for: Shock value / key metrics.
8. **Timeline Horizontal**: Bottom axis, alternating top points.
9. **Process Vertical**: Zig-zag downward flow.
10. **Quote Focus**: Massive quotation marks, serif font focus.
11. **Chart Primary**: 80% screen area dedicated to a chart, 20% to insight text.
12. **Comparison Table**: Classic vs-table.
13. **Logo Grid**: "Trusted By" arrays.
14. **Team Roster**: Circular avatars with roles.
15. **Roadmap Track**: Multi-lane Gantt-style approximation.
16. **Architecture Canvas**: Freeform node rendering area.
17. **Code Spotlight**: Dark-mode terminal window with syntax highlighting.
18. **Device Mockup**: Image rendered inside an iPhone/MacBook frame.
19. **Checklist Centered**: Left-aligned list in the center of the screen.
20. **Map Focus**: Geographic bounding box with plotted points.
21. **Agenda List**: Numbered list with high vertical spacing.
22. **Section Header**: Solid background color, large text, transitions to new topics.
23. **KPI Dashboard**: 2x3 grid of metrics.
24. **Funnel Diagram**: Layered inverted triangle.
25. **Venn Diagram**: Overlapping circles with text in intersections.
26. **Matrix 2x2**: Gartner-style magic quadrant.
27. **Video Bleed**: Auto-playing looping background video.
28. **Feature List**: Icon + Title + Body repeating down the left.
29. **FAQ Accordion**: Staggered Q&A blocks.
30. **Call to Action**: QR code, link, and massive button visualization.

---

## 6. VISUAL SYSTEM

Visuals are handled declaratively. The Renderer resolves the instructions into actual assets.

### Visual Types:
- **Hero Image / Stock Photo**: Generated via Unsplash API or AI Image Generation (Midjourney/DALL-E).
- **Icons**: Resolved via Lucide-react or custom SVG libraries.
- **Charts**: Rendered using Recharts based on JSON datasets.
- **Diagrams / Mind Maps / Architecture**: Rendered via Mermaid.js or React Flow.
- **Video**: Muted MP4 loops (stock).

### Strategy & Fallbacks:
- **Generation Source**: Visual Planner specifies an `intent` (e.g., "Abstract tech background"). The system resolves this asynchronously.
- **Rendering Strategy**: Images are lazily loaded with blur-hashes.
- **Fallback Behavior**: If an image fails to load or generate, fallback to a CSS gradient matching the theme's `accent` color. If a chart dataset is invalid, render a graceful "Data Unavailable" state rather than crashing.

---

## 7. AI AGENTS

Orivox V3 uses a Multi-Agent architecture to handle the complexity of presentations.

### 1. Presentation Director
- **Inputs**: Raw user prompt.
- **Outputs**: Global parameters (`audience`, `tone`, `style`), Task plan.
- **Contract**: JSON outlining the overarching goal.
- **Failure**: Defaults to 'General' audience and 'Professional' tone.

### 2. Research Agent
- **Inputs**: Keywords from Director.
- **Outputs**: Verified facts, sources, data points.
- **Failure**: Returns empty source array, forcing the Content Writer to rely on foundational knowledge and avoid specific statistics.

### 3. Story Planner
- **Inputs**: Prompt, Audience, Research.
- **Outputs**: An array of slide outlines (Titles and Purposes).

### 4. Layout Planner
- **Inputs**: Slide outlines.
- **Outputs**: Assigns a specific layout ID to each slide ensuring variety (e.g., no three 'Split 50/50' layouts in a row).

### 5. Content Writer
- **Inputs**: Layout constraints, Slide Purpose, Research.
- **Outputs**: Exact JSON component data matching the layout limits (e.g., exactly 3 bullet points if assigned a Three Column layout).

### 6. Visual Planner
- **Inputs**: Content Writer output.
- **Outputs**: Search terms or generation prompts for images/icons.

### 7. Validator
- **Inputs**: The final assembled JSON.
- **Outputs**: Pass/Fail boolean + Error logs.
- **Failure**: Kicks the JSON back to the specific offending agent (e.g., Content Writer) for regeneration.

---

## 8. VALIDATION ENGINE

The Validation Engine is a strict TypeScript module that runs before saving to the database. If JSON fails, it never reaches the Renderer.

**Automated Quality Rules:**
- **No empty slides**: Every slide must have at least a title and one component.
- **No placeholder text**: Rejects exact matches of "Lorem ipsum" or "Insert text here".
- **No duplicate slides**: Detects if two slides have 90% string similarity.
- **No repeated layouts**: Prevents the same layout from appearing more than 3 times sequentially.
- **Maximum words**: Body paragraphs cannot exceed 45 words (enforces brevity).
- **Maximum bullets**: Lists cannot exceed 6 items (cognitive load limit).
- **Image requirements**: Hero layouts must contain a valid `visuals.background`.
- **Chart requirements**: Datasets must contain matching array lengths for labels and values.
- **Overflow detection**: Calculates character count vs layout bounding boxes.

---

## 9. RENDERING ENGINE

The Renderer is completely dumb to AI. It operates purely as a state-driven view layer.

- **Strict Contracts**: Consumes the validated JSON.
- **Component Mapping**: Uses a factory pattern to map `"type": "Statistic"` to a `<Statistic data={...} />` React component.
- **Layout Mapping**: Maps `"layout": "Split 50/50"` to a `<SplitLayout left={...} right={...} />` wrapper.
- **Theme Injection**: Maps `theme.colors` into CSS variables at the root level (`--primary`, `--accent`).
- **Resilience**: Every component is wrapped in an Error Boundary. If a component fails to render, it returns a blank, non-intrusive container rather than crashing the deck.

---

## 10. EXTENSIBILITY

Orivox V3 is designed as a modular ecosystem.

- **Adding Layouts**: Developers add a new React layout component and register its ID and constraints in the Layout Library registry. The AI Layout Planner simply receives the updated registry instructions.
- **Adding Components**: Adding a `<PricingTable />` requires updating the Component System registry. The Content Writer is automatically prompted with the new JSON schema structure.
- **Adding Themes**: Themes are pure JSON objects. They can be added to the database without any code changes.
- **Model Agnostic**: Because agents communicate via strict JSON schemas (using tools like OpenAI Structured Outputs or Gemini JSON mode), the underlying LLM can be swapped out instantly without breaking the frontend renderer.

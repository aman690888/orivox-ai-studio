# Orivox V3 - Presentation Intermediate Representation (IR)

This document defines the single canonical data model—the Presentation IR—used throughout the entire Orivox pipeline. Every AI agent, validator, renderer, exporter, and editor must communicate *only* through this representation. Hallucinated schemas or rogue JSON blobs are fundamentally rejected.

---

## 1. IR EVOLUTION LIFECYCLE
The Presentation IR is progressively enhanced. It starts as a skeleton and is mutated deterministically by each agent in the pipeline until it becomes fully renderable.

1. **Prompt IR**: Raw user input + `Metadata` (Tone, Audience).
2. **Outline IR**: Injects `Sections` and `Slide` titles.
3. **Narrative IR**: Injects `Speaker Notes` and slide `Purpose`.
4. **Layout IR**: Injects structural `Layout` IDs into slides.
5. **Component IR**: Populates raw text/data into `Components`.
6. **Asset IR**: Resolves `Asset` links (Images, Charts).
7. **Validated IR**: Passes all architectural rules; locked for rendering.
8. **Renderable IR**: Final state consumed by the React view layer.
9. **Export IR**: Flattened state injected with `Export Metadata` (PDF sizing, fonts).

---

## 2. THE PRESENTATION HIERARCHY & ENTITIES

All entities share the following primitive behaviors:
- **IDs**: UUID v4 mandatory for all nodes (`Presentation`, `Section`, `Slide`, `Component`, `Asset`).
- **References**: Parent-child mapping must be absolute. Nested relationships are permitted inside slides, but slides themselves are normalized into a flat map keyed by UUID to support future CRDT/Operational Transforms.
- **Mutability**: AI logic operates immutably (returning entirely new IR states). The Editor operates mutably via atomic patches.

### 2.1 Presentation (Root)
- **Purpose**: The global wrapper for the document state.
- **Ownership**: Presentation Director Agent.
- **Required Fields**: `id`, `version`, `metadata`, `theme`, `slide_order` (array of UUIDs), `slides` (map of UUID -> Slide).
- **Optional Fields**: `collaboration`, `export_metadata`.
- **Validation Rules**: `version` must map to a supported Orivox schema (e.g., `"3.0.0"`).
- **Versioning**: Breaking changes to the IR require a schema migration script.

### 2.2 Metadata
- **Purpose**: Contextual intelligence and global settings.
- **Required Fields**: `title`, `author_id`, `created_at`, `updated_at`, `audience`, `tone`.
- **Optional Fields**: `ai_reasoning` (JSON object explaining why certain global decisions were made), `regeneration_count`.
- **Mutable vs Immutable**: `created_at` and `author_id` are strictly immutable.

### 2.3 Theme
- **Purpose**: Global aesthetic enforcement.
- **Required Fields**: `id`, `colors` (primary, accent, background, text), `typography` (heading, body).
- **Extensibility**: Custom themes inject into this exact schema; the renderer maps these directly to CSS variables.

### 2.4 Sections
- **Purpose**: Narrative grouping.
- **Required Fields**: `id`, `title`, `order_index`.
- **Relationships**: Slides hold a `section_id` foreign key.

### 2.5 Slide
- **Purpose**: The atomic rendering canvas.
- **Ownership**: Layout Planner & Content Writer.
- **Required Fields**: `id`, `purpose`, `layout_id`, `components` (Array of Component UUIDs).
- **Optional Fields**: `section_id`, `speaker_notes`, `animations`, `background_asset_id`, `regeneration_metadata` (logs AI retries).
- **Lifecycle**: Generated -> Validated -> Rendered -> (Optionally) Edited -> Re-validated.

### 2.6 Layout
- **Purpose**: Structural mapping (referencing `docs/layout-library.md`).
- **Required Fields**: `id` (must match a registered Layout ID, e.g., `"layout-split-img-left"`).
- **Validation Rules**: Total nested components must strictly adhere to the limits mapped in the Layout Library.

### 2.7 Components
- **Purpose**: Semantic data wrappers (referencing `docs/component-library.md`).
- **Ownership**: Content Writer.
- **Required Fields**: `id`, `type` (e.g., `"Title"`, `"Statistic"`), `data` (JSON payload strictly matching the `type`).
- **Optional Fields**: `style_overrides` (e.g., custom alignment).
- **Chart Datasets**: Must contain `labels` (Array<String>) and `series` (Array<Object>).
- **Diagram Definitions**: Must contain a raw `mermaid_string`.

### 2.8 Assets
- **Purpose**: External media management.
- **Ownership**: Visual Planner.
- **Required Fields**: `id`, `type` (`"image"`, `"video"`, `"icon"`), `url`.
- **Optional Fields**: `alt_text`, `blurhash` (for progressive rendering), `generation_prompt` (if AI generated).
- **Asset Linking**: Components reference Assets via `asset_id`. Assets live in a normalized global `assets` map at the Presentation root to allow deduplication (e.g., using the same logo across 10 slides).

### 2.9 Animations
- **Purpose**: Slide and component transition logic.
- **Required Fields**: `type` (e.g., `"fade"`, `"slide-up"`), `duration_ms`.

### 2.10 Speaker Notes & Presenter Mode
- **Purpose**: Teleprompter content.
- **Required Fields**: `content` (Markdown string).
- **Presenter Mode Metadata**: `estimated_duration_seconds`, `auto_advance` (boolean).

### 2.11 Collaboration & Edit History
- **Purpose**: Multiplayer foundation.
- **Required Fields**: `last_edited_by`, `cursor_positions` (ephemeral), `history` (Array of JSON Patches).

### 2.12 Export Metadata
- **Purpose**: Instructions for the headless browser (Puppeteer) or PDF engine.
- **Required Fields**: `aspect_ratio` (e.g., `"16:9"`), `resolution`, `watermark` (boolean).

---

## 3. STRICT PROTOCOLS

1. **The Law of Exclusivity**: If a property is not defined in this IR document (or the explicitly referenced Layout/Component libraries), it does not exist. The renderer will strip it, and the validator will log a warning.
2. **Normalized State Management**: Slides and Assets are stored as flat objects keyed by UUIDs. The `slide_order` array determines rendering sequence. This prevents massive array-mutation bugs during drag-and-drop or multiplayer syncing.
3. **Traceability**: Every slide contains `ai_reasoning` metadata indicating *why* the AI chose the layout, and *why* it included specific data. If a user queries the AI in the Editor ("Why did you use a pie chart here?"), the agent reads the IR `ai_reasoning` block, it does not hallucinate an excuse.

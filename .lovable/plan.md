
# Orivox — UX & Architecture Revision

Preserve all current visual design, tokens, typography, glass, motion, and component styling. This plan changes flow, layout logic, and interactions only.

## 1. Home → Workspace handoff

- Strip generation logic from Home. `PromptBox` on Home only captures text.
- On submit (button click or Enter): navigate to `/workspace/new?prompt=<encoded>`.
- Workspace reads the `prompt` search param via `Route.useSearch()` (validated with a small `validateSearch`) and treats it as the seed user message. If absent, workspace opens with an empty conversation and a focused composer.
- Home sections stay: single **Continue working** card (see §8), Recent Presentations grid, AI Suggestions chips (chips prefill the Home PromptBox — they do NOT navigate directly), Categories row, "Create new presentation" button that routes to `/workspace/new` with no prompt.

## 2. AI Workspace redesign (signature screen)

Route: `workspace.$id.tsx`. Full-bleed, no app sidebar. Not a plain 3-column grid — an AI-first workspace with a dominant center canvas, a conversation rail that feels like a chat surface, and a right rail that morphs between two modes.

**Left rail — Conversation (~380px, resizable)**
- Chat transcript: user + AI messages, streamed text (typewriter for AI), inline citation chips, suggested follow-up chips under the latest AI message.
- Composer pinned to bottom (glass), slash commands (`/chart`, `/diagram`, `/image`, `/tone`), attachment affordance (mock).
- Header: deck title (inline-editable), status pill ("Generating…" → "Ready"), "Open Viewer" button.

**Center — Presentation Canvas (flex, hero of the screen)**
- The deck literally grows here. No blank loading screens. Progressive reveal driven by a scripted timeline:
  1. Prompt echo card fades in.
  2. Research cards stream in (source tiles with favicons + snippets, staggered).
  3. Outline cards materialize (section headers → bullets fill in).
  4. Outline cards morph (shared layoutId) into slide thumbnails on a horizontal filmstrip; the active slide expands into a large canvas above the filmstrip.
  5. Charts render inside their slide (bars/lines animate up).
  6. Diagrams draw their nodes and connectors.
  7. Speaker notes fade in under the active slide.
  8. Final state: full deck, filmstrip scrollable, active slide editable-feeling.
- Shimmer skeletons for anything not yet generated; every element uses spring transitions.
- "Open Viewer" CTA appears once the deck is complete.

**Right rail — Morphing panel (~340px)**
- **Mode A · AI Thinking** (during generation): vertical checklist of steps (Understanding Request → Researching → Finding Sources → Planning Outline → Choosing Layouts → Designing Slides → Creating Charts → Creating Diagrams → Writing Speaker Notes → Final Review). Each step animates pending → active (shimmer bar) → complete (check + subtle glow). Progress ring at the top.
- **Mode B · AI Assistant** (after generation): Quick Actions grid, Recent Actions list, Contextual Suggestions, AI Prompt Box at the bottom.
- **Mode C · Element Selected** (see §4).
- Transition between modes: same panel container, `AnimatePresence` with a crossfade + slight upward slide, header title morphs, height animates. No panel swap — same surface, different content.

**State machine** (client-only, timer-driven):
`idle → understanding → researching → outlining → designing → charting → diagramming → noting → reviewing → ready`
Progression is scripted with `setTimeout`s so every visitor sees the same choreographed reveal. The state also drives which mock content appears in the Canvas and which step is active in the right rail.

## 3. Viewer stays separate

- `/present/$id` remains the Viewer (reading + refinement), reached from the Workspace via "Open Viewer".
- Viewer header has a "Back to Workspace" link (uses shared layoutId on the deck title for a smooth handoff).
- No generation logic in the Viewer.

## 4. Remove floating toolbar → right-panel selection mode

- Delete the floating `SelectionToolbar` concept.
- In both Workspace and Viewer, selecting an element (title, bullet, chart, diagram, image, table) sets a `selectedElement` state and swaps the right panel into **Element Selected** mode:
  - Header: element type + tiny preview.
  - AI Prompt box (element-scoped).
  - Quick Actions: Modern, Minimal, Professional, Replace, Simplify.
  - Divider → Manual Controls: Resize, Color, Font, Alignment, Animation.
- Deselect (Esc or click empty canvas) → panel morphs back to AI Assistant.
- Same `AnimatePresence` morph pattern as §2 so the panel feels like one living surface.

## 5. Generation is not a route

- Delete the planned `/generate` route from the earlier plan. Generation is entirely a Workspace state (§2). The URL never changes during generation.

## 6. Sidebar simplification

- Sidebar items: **Home**, **Presentations**, **Settings**. Remove Favorites and Trash.
- Update `_app` layout accordingly. Delete `_app.favorites.tsx` and `_app.trash.tsx` from the planned routes.

## 7. Command Palette (global, ⌘K / Ctrl+K)

- Built on shadcn `Command` inside a `Dialog`, styled with the existing glass tokens.
- Global keybind registered in `_app` layout (works on Home, Presentations, Settings; also mounted in Workspace and Viewer).
- Sections:
  - **Search Presentations** (fuzzy over mock decks)
  - **Actions**: Create Presentation, Open Settings, Export current, Duplicate current, Delete current
  - **Recent**: last 5 presentations
- Interactions: keyboard-first, arrow-key focus, animated list re-ordering as user types (Motion `layout` on rows), subtle result-count pill, `↵` to run, `Esc` to close. Raycast/Cursor-style empty state and section headers.

## 8. Continue Working

- Replace the two Continue cards with one large featured card at the top of Home:
  - Deck title, thumbnail preview, progress bar (e.g. 75% Complete), "Continue →" CTA routing to `/workspace/<id>`.
  - Hover: subtle lift + glow using existing tokens.
- Recent Presentations grid sits directly below.

## 9. Micro-interactions pass

Applied across the app using existing tokens/motion presets:
- Page transitions via `AnimatePresence` in `__root.tsx` (fade + 4px rise, spring).
- Shared-element animations with `layoutId`: Home card → Workspace title; Workspace outline card → slide thumb; Workspace deck title → Viewer deck title.
- Progressive slide generation (§2).
- Animated AI thinking checklist with per-step spring.
- Morphing right panel (§2, §4).
- Card hover: 1px border brighten + soft glow, no scale jump.
- Skeleton shimmers for any not-yet-loaded mock data.
- Spring defaults centralized in `src/lib/motion.ts`.

## 10. Preservation guardrails

- No changes to: color tokens, typography, spacing scale, radius, glass surfaces, existing component visual styling, iconography, or branding.
- Only add new components where behavior requires it (CommandPalette, morphing RightPanel container, scripted generation timeline hook). Reuse existing primitives for everything else.

## File changes summary

- **New**: `src/components/command/CommandPalette.tsx`, `src/components/workspace/RightPanel.tsx` (mode switcher), `src/components/workspace/AIThinking.tsx`, `src/components/workspace/ElementSelectedPanel.tsx`, `src/hooks/useGenerationTimeline.ts`, `src/hooks/useCommandPalette.ts`, `src/lib/motion.ts`.
- **Modified**: `src/routes/_app.home.tsx` (featured card + prompt-only submit), `src/routes/_app.tsx` (sidebar items, ⌘K mount), `src/routes/workspace.$id.tsx` (search-param prompt, state machine, morphing right panel, no separate generation UI), `src/routes/present.$id.tsx` (right-panel selection mode instead of floating toolbar, "Back to Workspace"), `__root.tsx` (page-transition wrapper).
- **Removed from plan**: `_app.favorites.tsx`, `_app.trash.tsx`, standalone `/generate` route, floating `SelectionToolbar` component.

## Out of scope

Still no backend, no real AI, no real auth, no real exports. All behavior scripted with timers over mock data.

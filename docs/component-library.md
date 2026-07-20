# Orivox V3 - Component Library Specification

This document defines the permanent, atomic UI vocabulary for Orivox V3. The AI models must build presentations *exclusively* from these components. The Renderer is strictly bound to this vocabulary; hallucinated components will be rejected by the Validation Engine and will crash the specific slide rendering.

---

## 1. COMPONENT SYSTEM RULES

### Global Constraints & Relationships
- **Maximum Nesting Depth**: 3 levels deep (e.g., `Grid` -> `Icon Card` -> `Statistic`). Beyond 3 levels, the UI becomes unreadable on standard projectors.
- **Valid Parent-Child Relationships**: Structural components (`Grid`, `Matrix`, `Split`) can contain content components (`Title`, `Image`). Content components cannot contain structural components.
- **Illegal Combinations**: Do not nest a `Chart` inside an `Icon Card`. Do not place a `Quote` inside a `Callout`. Do not place a `Table` inside a `Grid` cell.
- **Required Spacing**: Inter-component spacing is enforced by the parent layout container (gap: 16px to 32px based on density). Components do not have their own external margins.
- **Overflow Handling**: Text uses `text-overflow: ellipsis` or line-clamping if boundaries are exceeded. Images use `object-fit: cover`.
- **Fallback Behavior**: If a component's primary asset fails to load (e.g., `Image` 404s, `Chart` receives malformed data), the component reverts to a branded skeleton state or a graceful "Data Unavailable" block. It must never break the rest of the slide layout.

---

## 2. TYPOGRAPHY & TEXT COMPONENTS

### Title
- **Purpose**: Primary heading for a slide or distinct section.
- **JSON Contract**: `{ "type": "Title", "content": "String" }`
- **Fields**: Required: `content`. Optional: `alignment` (left|center).
- **Constraints**: Maximum 50 characters.
- **Visual Hierarchy**: H1 (Display size). Top of the structural flow.
- **When to Use**: Exactly once per slide (enforced).
- **When NOT to Use**: Never use as body text or within a card.

### Subtitle
- **Purpose**: Secondary context or bridge.
- **JSON Contract**: `{ "type": "Subtitle", "content": "String" }`
- **Visual Hierarchy**: H2, muted opacity (60%).
- **Constraints**: Maximum 80 characters.

### Paragraph
- **Purpose**: Core reading material.
- **JSON Contract**: `{ "type": "Paragraph", "content": "String" }`
- **Constraints**: Max 45 words.
- **When to Use**: Explaining complex, nuanced points.
- **When NOT to Use**: Do not use if the point can be made via a Bullet List.

### Bullet List / Checklist / Numbered Process
- **Purpose**: Scanning-optimized text.
- **JSON Contract**: `{ "type": "List", "variant": "bullet|check|number", "items": ["String"] }`
- **Constraints**: Max 6 items. Max 15 words per item.

### Quote
- **Purpose**: Social proof or emphatic highlight.
- **JSON Contract**: `{ "type": "Quote", "text": "String", "author": "String", "role": "String" }`
- **Visual Hierarchy**: Massive serif font, stylized quotation marks.

---

## 3. CARD & DATA COMPONENTS

### Statistic / Metric Card
- **Purpose**: Emphasize a single powerful number.
- **JSON Contract**: `{ "type": "Statistic", "value": "String", "label": "String", "trend": "up|down|flat" }`
- **Constraints**: `value` max 6 characters (e.g., "$4.2M"). `label` max 20 characters.
- **When to Use**: ROI claims, growth metrics.

### Icon Card / Feature Card / Profile Card
- **Purpose**: Modular grouping of related micro-content.
- **JSON Contract**: `{ "type": "Card", "variant": "icon|feature|profile", "title": "String", "body": "String", "asset_id": "String" }`
- **Constraints**: Must be placed within a Grid or Split layout. `body` max 20 words.
- **When to Use**: Listing features, team members, or distinct benefits.

### Comparison Card / Pricing Card
- **Purpose**: Evaluating options.
- **JSON Contract**: `{ "type": "PricingCard", "tier": "String", "price": "String", "features": ["String"], "highlighted": true|false }`
- **When to Use**: SaaS models, competitor analysis.

---

## 4. CHARTS & GRAPH COMPONENTS

### Bar Chart / Line Chart / Area Chart / Pie Chart / Scatter Plot
- **Purpose**: Visualizing numerical datasets.
- **JSON Contract**: 
  ```json
  { 
    "type": "Chart", 
    "variant": "bar|line|pie|area|scatter", 
    "datasets": [{ "label": "String", "values": ["Number"] }],
    "labels": ["String"]
  }
  ```
- **Constraints**: Max 6 datasets. Max 12 labels (e.g., 12 months). Pie charts max 5 slices.
- **Visual Hierarchy**: Draws immediate attention. Strip all grid lines; highlight only the highest/lowest data point.
- **When to Use**: When exact numerical progression or proportional breakdown is critical.
- **When NOT to Use**: If there are only 2 data points, use two `Statistic` components instead.

---

## 5. DIAGRAM & FLOW COMPONENTS

### Timeline / Roadmap / Steps / Process Flow
- **Purpose**: Chronological or sequential storytelling.
- **JSON Contract**: `{ "type": "Timeline", "orientation": "horizontal|vertical", "nodes": [{ "title": "String", "date": "String", "desc": "String" }] }`
- **Constraints**: Horizontal max 5 nodes. Vertical max 8 nodes.
- **When to Use**: Product launches, historical overviews.

### Flowchart / Mind Map / Organization Chart / Architecture Diagram
- **Purpose**: Relational, hierarchical, or systemic data.
- **JSON Contract**: `{ "type": "Diagram", "variant": "flow|mindmap|org|arch", "mermaid_string": "String" }`
- **Constraints**: Limit nodes to prevent illegibility on projectors. 
- **Error Handling**: If `mermaid_string` fails compilation, render a graceful text fallback summarizing the nodes.

### Matrix / Grid
- **Purpose**: 2x2 categorical plotting (e.g., SWOT, Magic Quadrant).
- **JSON Contract**: `{ "type": "Matrix", "quadrants": [{ "label": "String", "items": ["String"] }] }`
- **Constraints**: Exactly 4 quadrants.

---

## 6. MEDIA & ASSET COMPONENTS

### Hero Image / Stock Image / Illustration
- **Purpose**: Visual grounding and emotional impact.
- **JSON Contract**: `{ "type": "Image", "intent": "String", "url": "String", "bleed": true|false }`
- **Constraints**: Must maintain aspect ratio (`object-fit: cover`).
- **Fallback Behavior**: Render a branded CSS gradient if the URL 404s.

### Logo Cloud / Gallery
- **Purpose**: Trust building and visual grouping.
- **JSON Contract**: `{ "type": "LogoCloud", "logos": ["String (URLs)"] }`
- **When to Use**: "Trusted By" slides, partner ecosystems.

---

## 7. UTILITY & STRUCTURAL COMPONENTS

### Callout / Warning Box / Success Box
- **Purpose**: Breaking the flow to highlight a risk, tip, or success.
- **JSON Contract**: `{ "type": "Callout", "intent": "info|warning|success", "text": "String" }`
- **Interaction**: Muted background (10% opacity) of the intent color, distinct left border.

### Table
- **Purpose**: Raw data comparison.
- **JSON Contract**: `{ "type": "Table", "headers": ["String"], "rows": [["String"]] }`
- **Constraints**: Max 5 columns. Max 8 rows. 
- **When NOT to Use**: If data can be visualized as a chart, never use a table.

### Code Block
- **Purpose**: Developer-focused context.
- **JSON Contract**: `{ "type": "CodeBlock", "language": "String", "code": "String" }`
- **Constraints**: Max 20 lines of code.

### FAQ
- **Purpose**: Answering common objections.
- **JSON Contract**: `{ "type": "FAQ", "items": [{ "q": "String", "a": "String" }] }`
- **Interaction Support**: Accordion expansion.

### CTA Button
- **Purpose**: The final action.
- **JSON Contract**: `{ "type": "CTA", "label": "String", "url": "String" }`
- **When to Use**: Only on the final "Thank You" or "Action" slide.

### Section Divider / Spacer / Footer
- **Purpose**: Structural breathing room.
- **Constraints**: Generated automatically by the Layout Engine based on narrative arcs.

---

## Component Scoring & AI Guidance
The Validation Engine scores components on their adherence to constraints. 
- If the AI writes a `Paragraph` with 60 words, the component fails validation and returns to the Content Writer agent.
- If the AI nests a `Chart` inside a `Callout`, the Layout Engine throws an `IllegalCombinationException` and resets the slide structure to a standard Split layout.

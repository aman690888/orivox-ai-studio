# Orivox V3 - Layout Library Specification

This document defines the official, handcrafted layout system for the Orivox V3 Rendering Engine. The AI Layout Planner never generates layouts from scratch; it strictly selects from this validated library.

## Layout Design Principles
- **Clear Visual Hierarchy**: The eye must effortlessly follow a Z-pattern or F-pattern.
- **Minimal Cognitive Load**: Constrain data density to prevent overwhelming the viewer.
- **Excellent Readability**: Typography must scale perfectly. Minimum 16px body, 32px headers on desktop.
- **Balanced Whitespace**: Padding and margins are non-negotiable. Content never bleeds unless intentional.
- **Presentation-First Typography**: High-contrast, legible sans-serif or clean serif fonts.
- **No Overcrowding**: Strict limits on words, bullets, and cards per layout.
- **Professional Appearance**: Alignment, symmetry, and rhythm govern all layouts.
- **Theme Agnostic**: Flawless support for dark mode, light mode, and accessibility constraints (WCAG AA).

---

## The 40 Premium Layouts

### 1. Hero Cover (`layout-cover-hero`)
- **Purpose**: High-impact opening slide.
- **When to Use**: The very first slide of a highly visual, emotionally driven deck.
- **Components**: Title (H1), Subtitle (H2), Visual (Background Image).
- **Max Word Count**: 15 words.
- **Recommended Images**: 1 full-bleed.
- **Visual Hierarchy**: Background Image -> Massive Center Title -> Subtitle.
- **Responsive Rules**: Title scales from 64px to 32px on mobile.
- **Desktop Preview**:
  ```text
  +---------------------------+
  | [ Full Bleed Image / Vid ]|
  |                           |
  |       MAIN TITLE          |
  |        Subtitle           |
  |                           |
  +---------------------------+
  ```
- **Mobile Behavior**: Image crops to center focus; text anchors to bottom-left.
- **Strengths**: Maximum emotional impact.
- **Weaknesses**: Cannot convey complex information.
- **Validation Rules**: Must have `visuals.background`. Title < 50 chars.
- **Example Topics**: Pitch Deck Cover, Product Launch.
- **Tags**: Marketing, Sales, Corporate, Startup.
- **AI Selection Rules**: If `slide.order == 1` and `tone == persuasive/visionary` -> `layout-cover-hero`.

### 2. Minimal Cover (`layout-cover-minimal`)
- **Purpose**: Elegant, text-focused opening.
- **When to Use**: Academic, internal, or highly professional settings.
- **Components**: Title, Subtitle, Author, Date.
- **Max Word Count**: 20 words.
- **Recommended Images**: 0 (solid/gradient background).
- **Visual Hierarchy**: Title -> Author -> Date.
- **Desktop Preview**:
  ```text
  +---------------------------+
  |                           |
  |  TITLE                    |
  |  Subtitle                 |
  |                           |
  |  Author / Date            |
  +---------------------------+
  ```
- **Validation Rules**: Title < 60 chars.
- **Tags**: Corporate, Academic, Research.
- **AI Selection Rules**: If `slide.order == 1` and `tone == professional/academic` -> `layout-cover-minimal`.

### 3. Split Image Left (`layout-split-img-left`)
- **Purpose**: Introduce a concept alongside a contextual image.
- **When to Use**: When a high-quality visual supports a medium-length explanation.
- **Components**: Title, Paragraph, Bullet List, Visual (Primary).
- **Max Word Count**: 45 words.
- **Recommended Images**: 1 (left half).
- **Desktop Preview**:
  ```text
  +-------------+-------------+
  |             | Title       |
  |   IMAGE     | Paragraph   |
  |   (50%)     | - Bullet 1  |
  |             | - Bullet 2  |
  +-------------+-------------+
  ```
- **Mobile Behavior**: Stacks vertically (Image top, Text bottom).
- **Validation Rules**: `visuals.primary` required. Bullets <= 3.
- **AI Selection Rules**: If `purpose == introduction` and `has_visual == true` -> `layout-split-img-left`.

### 4. Split Image Right (`layout-split-img-right`)
- **Purpose**: Concept introduction (mirrored).
- **When to Use**: Used sequentially after a Split Image Left to create a zig-zag reading rhythm.
- **Max Word Count**: 45 words.
- **Recommended Images**: 1 (right half).
- **Desktop Preview**:
  ```text
  +-------------+-------------+
  | Title       |             |
  | Paragraph   |   IMAGE     |
  | - Bullet 1  |   (50%)     |
  |             |             |
  +-------------+-------------+
  ```
- **AI Selection Rules**: If previous slide was `layout-split-img-left` -> `layout-split-img-right`.

### 5. Centered Title (`layout-center-title`)
- **Purpose**: Transition or emphatic statement.
- **When to Use**: Transitioning between major topics or stating a bold claim.
- **Components**: Title, Subtitle (optional).
- **Max Word Count**: 20 words.
- **Recommended Images**: 0.
- **Desktop Preview**:
  ```text
  +---------------------------+
  |                           |
  |       BIG STATEMENT       |
  |         subtitle          |
  |                           |
  +---------------------------+
  ```
- **AI Selection Rules**: If `purpose == transition` or `purpose == bold-claim` -> `layout-center-title`.

### 6. Two Column (`layout-two-column`)
- **Purpose**: Compare or list two equal ideas.
- **When to Use**: Contrasting concepts, dual features, or pros/cons.
- **Components**: Title, 2x Paragraphs/Lists.
- **Max Word Count**: 60 words total.
- **Recommended Images**: 0-2 icons.
- **Desktop Preview**:
  ```text
  +---------------------------+
  |           Title           |
  | [Icon]          [Icon]    |
  | Column 1        Column 2  |
  | Text block      Text block|
  +---------------------------+
  ```
- **Validation Rules**: Exactly 2 child components in the main container.
- **AI Selection Rules**: If `purpose == comparison` or `items.length == 2` -> `layout-two-column`.

### 7. Three Column (`layout-three-column`)
- **Purpose**: Display three equal pillars, values, or features.
- **Max Word Count**: 75 words total.
- **Desktop Preview**:
  ```text
  +---------------------------+
  |           Title           |
  |  [Col 1]  [Col 2]  [Col 3]|
  |   text     text     text  |
  +---------------------------+
  ```
- **Validation Rules**: Exactly 3 child components.
- **AI Selection Rules**: If `items.length == 3` -> `layout-three-column`.

### 8. Four Card Grid (`layout-grid-four`)
- **Purpose**: High-density feature/benefit list.
- **Components**: Title, 4x Cards (Icon + Title + Desc).
- **Max Word Count**: 80 words.
- **Desktop Preview**:
  ```text
  +---------------------------+
  |           Title           |
  |  [Card 1]       [Card 2]  |
  |  [Card 3]       [Card 4]  |
  +---------------------------+
  ```
- **AI Selection Rules**: If `items.length == 4` -> `layout-grid-four`.

### 9. Icon Cards (`layout-cards-icon`)
- **Purpose**: Visual list of features. Uses distinct borders/backgrounds for cards.
- **AI Selection Rules**: If `purpose == features` and `items.length <= 4` -> `layout-cards-icon`.

### 10. Feature Cards (`layout-cards-feature`)
- **Purpose**: Larger cards with imagery.
- **AI Selection Rules**: If `purpose == showcase` and `items.length <= 3` -> `layout-cards-feature`.

### 11. Comparison (`layout-compare-vs`)
- **Purpose**: Direct "Us vs Them" comparison.
- **Components**: Left block (Them), Right block (Us). Right block highlighted.
- **Desktop Preview**:
  ```text
  +---------------------------+
  | Competitor |   Orivox     |
  | - Slow     | + Fast       |
  | - Ugly     | + Beautiful  |
  +---------------------------+
  ```
- **AI Selection Rules**: If `purpose == competitor-analysis` -> `layout-compare-vs`.

### 12. Pros vs Cons (`layout-pros-cons`)
- **Purpose**: Neutral evaluation.
- **Components**: Green left column, Red right column.

### 13. Timeline Horizontal (`layout-timeline-hz`)
- **Purpose**: Chronological progression.
- **Max Items**: 5.
- **Desktop Preview**:
  ```text
  +---------------------------+
  | 2024    2025    2026      |
  |  |--------|--------|      |
  | V1       V2       V3      |
  +---------------------------+
  ```
- **AI Selection Rules**: If `purpose == history` or `purpose == roadmap` -> `layout-timeline-hz`.

### 14. Timeline Vertical (`layout-timeline-vt`)
- **Purpose**: Detailed step-by-step history.
- **Max Items**: 6.
- **Mobile Behavior**: Best layout for timelines on mobile.

### 15. Roadmap (`layout-roadmap-gantt`)
- **Purpose**: Future planning across tracks/teams.
- **Max Items**: 3 tracks, 4 quarters.

### 16. Milestones (`layout-milestones`)
- **Purpose**: 3-4 major goals highlighted with massive numbers.

### 17. Process Flow (`layout-process-flow`)
- **Purpose**: Sequential instructions.
- **Desktop Preview**: `[Step 1] -> [Step 2] -> [Step 3]`
- **AI Selection Rules**: If `purpose == instruction` -> `layout-process-flow`.

### 18. Cycle Diagram (`layout-diagram-cycle`)
- **Purpose**: Repeating process (e.g., Build-Measure-Learn).
- **Max Items**: 3 to 5 nodes arranged in a circle.

### 19. Architecture Diagram (`layout-diagram-arch`)
- **Purpose**: System design.
- **Components**: Rendered via Mermaid.js inside a dedicated container.

### 20. Mind Map (`layout-mindmap`)
- **Purpose**: Brainstorming / Hierarchy of ideas.

### 21. Flowchart (`layout-flowchart`)
- **Purpose**: Decision tree logic.

### 22. Tree Diagram (`layout-diagram-tree`)
- **Purpose**: Org charts or file structures.

### 23. Statistics Dashboard (`layout-stats-dash`)
- **Purpose**: 4 to 6 key metrics.
- **Desktop Preview**:
  ```text
  +---------------------------+
  | 84%       $2M       10x   |
  | Growth    ARR       ROI   |
  +---------------------------+
  ```

### 24. KPI Dashboard (`layout-kpi-dash`)
- **Purpose**: Metrics + Line charts sparklines.

### 25. Big Number (`layout-big-number`)
- **Purpose**: Single massive statistic.
- **Desktop Preview**:
  ```text
  +---------------------------+
  |                           |
  |          99.9%            |
  |         Uptime            |
  +---------------------------+
  ```
- **AI Selection Rules**: If `purpose == shock-value` or `items.length == 1` -> `layout-big-number`.

### 26. Chart Left (`layout-chart-left`)
- **Purpose**: Data visualization with right-hand explanation.
- **Components**: Recharts Component (Left 60%), Text (Right 40%).

### 27. Chart Right (`layout-chart-right`)
- **Purpose**: Mirror of Chart Left.

### 28. Bar Chart (`layout-chart-bar-full`)
- **Purpose**: Full-screen bar chart comparing categories.
- **Validation Rules**: Dataset must have < 10 categories to prevent overcrowding.

### 29. Pie Chart (`layout-chart-pie-full`)
- **Purpose**: Composition data. Max 5 slices.

### 30. Line Chart (`layout-chart-line-full`)
- **Purpose**: Time series data.

### 31. Table (`layout-table`)
- **Purpose**: Raw structured data.
- **Validation Rules**: Max 5 columns, 8 rows.

### 32. Checklist (`layout-checklist`)
- **Purpose**: Requirements or To-Dos.
- **Desktop Preview**: Stacked items with checkmark icons.

### 33. FAQ (`layout-faq-accordion`)
- **Purpose**: Answering objections.
- **Max Items**: 5 Q&A blocks.

### 34. Case Study (`layout-case-study`)
- **Purpose**: Problem, Solution, Result.
- **Desktop Preview**: 
  ```text
  +---------------------------+
  | [Client Logo]             |
  | Problem: ...              |
  | Solution: ...             |
  | Result: +45% Revenue      |
  +---------------------------+
  ```

### 35. Quote (`layout-quote`)
- **Purpose**: Social proof.
- **Components**: Large text wrapped in quotes, Avatar, Author Name, Role.
- **Desktop Preview**:
  ```text
  +---------------------------+
  |      "Orivox is magic"    |
  |       (Avatar) John Doe   |
  +---------------------------+
  ```
- **AI Selection Rules**: If `purpose == testimonial` -> `layout-quote`.

### 36. Gallery (`layout-gallery-grid`)
- **Purpose**: Visual portfolio.
- **Components**: 3-6 images in a masonry or fixed grid.

### 37. Team (`layout-team-roster`)
- **Purpose**: Introduce key personnel.
- **Components**: Circular images, Name, Title. Max 4 per slide.

### 38. Pricing (`layout-pricing-tiers`)
- **Purpose**: SaaS style 3-tier pricing table.

### 39. SWOT (`layout-swot-matrix`)
- **Purpose**: Strengths, Weaknesses, Opportunities, Threats 2x2 grid.
- **Validation Rules**: Exactly 4 specific quadrants required.

### 40. Matrix (`layout-matrix-2x2`)
- **Purpose**: Magic quadrant evaluation.

### 41. Conclusion (`layout-conclusion`)
- **Purpose**: Summarize key points.

### 42. Call To Action (`layout-cta`)
- **Purpose**: Drive next steps.
- **Components**: Strong verb title, QR code or Button.
- **AI Selection Rules**: If `slide.order == slides.length - 1` and `purpose == action` -> `layout-cta`.

### 43. Thank You (`layout-thank-you`)
- **Purpose**: Final slide.
- **Components**: "Thank You", Contact Info, Social Links.
- **AI Selection Rules**: If `slide.order == slides.length` -> `layout-thank-you`.

---

## Layout Selection Logic (For AI Planners)

1. **Sequential Rhythm**: Do not repeat the same structural layout consecutively. (e.g., Do not use `layout-two-column` three times in a row).
2. **Text Constraint Checking**: If the Research Engine provides 150 words of vital information, the AI must either summarize it to fit `layout-split-img-left` (max 45 words), OR span it across two slides.
3. **Intent Matching**:
   - `purpose = data` → Use `layout-chart-*` or `layout-stats-dash`.
   - `purpose = list` → Check `items.length`. (2 = `layout-two-column`, 3 = `layout-three-column`, 4 = `layout-grid-four`).
   - `purpose = narrative` → Use `layout-split-img-*` for paced storytelling.

---

## Extensibility

This library is the baseline. As Orivox scales, developers will add new layouts to the registry. The AI Layout Planner simply ingests the updated registry constraints (JSON Schema) and immediately knows how to utilize the new designs without prompt refactoring.

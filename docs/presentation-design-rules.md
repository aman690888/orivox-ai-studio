# Orivox V3 - Universal Presentation Design Rules

This document establishes the permanent, universal design language for all Orivox presentations. These rules define the constraints and heuristics that the AI and Rendering Engine must follow to programmatically guarantee presentations that rival Gamma, Pitch, and Beautiful.ai in aesthetic quality and professional polish.

The AI will **never** invent visual design. It will strictly operate within the boundaries defined here.

---

## 1. CORE DESIGN PRINCIPLES
Our design language is rooted in clarity, elegance, and extreme focus. Inspired by the meticulousness of Apple Keynote and the functional beauty of Stripe and Linear, every slide must feel effortless to consume.

### Visual Hierarchy & Alignment
- **Rule of One**: Every slide must have exactly one primary focal point (e.g., a massive statistic, a hero image, or a central claim). Secondary information must be visibly subordinated through size and opacity.
- **Alignment**: Left-alignment is the universal default for all text blocks. Center-alignment is strictly reserved for Hero covers, bold singular statements, and Section Dividers.
- **Ideal Scan Path**: Content must support the F-pattern (for text-heavy layouts) or the Z-pattern (for split layouts). The eye should never jump backwards.
- **Maximum Focal Points**: Never exceed 3 simultaneous focal points (e.g., Title, Chart, Callout).

### Whitespace & Negative Space
- **Negative Space as Structure**: Whitespace is not empty space; it is the structural scaffolding of the slide. 
- **The 40% Rule**: At least 40% of every slide's surface area must remain completely empty to reduce cognitive load.
- **Padding Hierarchies**: Margins around the slide perimeter must always be larger than the gaps between components, forcing content to group cohesively toward the center.

### Reading Flow & Density
- **Maximum Information Density**: No more than 45 words of body copy per slide. If a topic requires more, it must be split across two slides.
- **Maximum Eye Movements**: The viewer should capture the essence of a slide in fewer than 3 saccades (eye jumps).
- **Contrast Rules**: WCAG AA compliance is mandatory. Text on images requires a minimum 40% opacity scrim/overlay or a backdrop blur (glassmorphism).

---

## 2. NARRATIVE RHYTHM & PACING
A presentation is a cinematic experience. It requires pacing to maintain attention.

- **Slide Pacing**: Fast pacing. It is better to have 20 highly focused slides than 10 dense ones. 
- **Narrative Rhythm**: The AI must enforce an alternating rhythm. A dense data slide (e.g., a Chart) must be followed by a low-density "breather" slide (e.g., a massive Quote or single Statistic).
- **Section Dividers**: Every major narrative shift must be preceded by a Section Divider—a solid, high-contrast background with a massive, centered title to reset the viewer's attention.
- **Hero Covers**: The opening must evoke emotion. It demands a high-quality visual, zero clutter, and a title under 50 characters.
- **Ending Slides**: The final slide must feature a singular, undeniable Call to Action (CTA) or a clean "Thank You" with minimal contact info. No lingering data.

---

## 3. COMPONENT SPECIFIC RULES

### Typography
- **Hierarchy**: H1 (Display) must be 2.5x larger than the Body text. H2 (Subtitle) must use a lower font weight or a muted color (e.g., 60% opacity) to establish immediate subordination.
- **Line Length**: Body text lines must never exceed 65 characters to preserve readability.

### Imagery & Color
- **Image Usage**: Images must bleed to the edge (edge-to-edge) or be contained within heavily rounded, perfectly masked containers (e.g., 24px border radius). Never use raw, unstyled square images.
- **Color Usage**: Backgrounds are muted (pure black/white or deep tinted neutrals). Brand accent colors are strictly reserved for primary actions, active chart elements, and focus rings. Never use accent colors for body text.

### Charts, Data & Diagrams
- **Chart Usage**: Strip away all grid lines, borders, and axis labels unless absolutely critical. Use a single pop of the accent color to highlight the key data point; everything else remains gray.
- **Table Design**: No vertical borders. Subtle horizontal borders only. Ample cell padding. Highlight the most important column or row.
- **Diagram Usage**: Diagrams must flow top-to-bottom or left-to-right. Use unified node shapes and soft, curved connecting lines.

### Cards, Comparisons, & Lists
- **Card Design**: Cards require a subtle 1px border or a soft, diffused shadow. Maximum 4 cards per row. Every card must have an icon.
- **Comparison Rules**: "Us vs. Them" layouts must visually highlight the winning side (e.g., higher contrast background, primary accent color) while visually muting the competitor side.
- **Timeline Rules**: Maximum 5 nodes per timeline. Alternating text blocks (top/bottom) to preserve horizontal space.
- **Callout Design**: Callouts use a 10% opacity background of the alert color (e.g., yellow for warning) with a matching icon and left border accent.

---

## 4. QUANTITATIVE SCORING SYSTEMS
Every slide generated by the AI is theoretically measurable against these programmatic thresholds to guarantee Gamma/Pitch-level polish.

### 1. Information Density Score (0-100)
- **Formula**: `100 - (Total Words / 45 * 50) - (Total Components * 5)`
- **Target**: > 70
- **Penalty**: Slides with > 45 words or > 6 distinct components fail instantly.

### 2. Visual Balance Score (0-100)
- **Formula**: Evaluates the spatial distribution of bounding boxes across the X and Y axes.
- **Target**: Perfect symmetry or intentional adherence to the golden ratio (e.g., 30/70 split).
- **Penalty**: Heavy clustering on one side of the screen with an empty opposing side results in a failing score.

### 3. Whitespace Score (0-100)
- **Formula**: `(Empty Canvas Area / Total Canvas Area) * 100`
- **Target**: 40 - 60
- **Penalty**: < 30% whitespace triggers an immediate layout reallocation.

### 4. Hierarchy Score (0-100)
- **Formula**: `(H1 Font Size / Body Font Size) * 10 + (Contrast Ratio differences)`
- **Target**: > 80
- **Penalty**: If the Title and Body text differ by less than 4pt, hierarchy is considered broken.

### 5. Readability Score (0-100)
- **Formula**: Combines Flesch-Kincaid grade level with character-per-line counts.
- **Target**: Grade 8-10, Lines < 65 chars.
- **Penalty**: Long paragraphs or tiny text fail.

### 6. Narrative Flow Score (0-100)
- **Formula**: Evaluates the sequence of layouts in the master deck.
- **Target**: High variance.
- **Penalty**: Three identical layouts in a row (e.g., three "Split 50/50" slides) reduces the score by 50 points, forcing the Layout Planner to inject variety.

### 7. Presentation Polish Score (0-100)
- **Formula**: Aggregate of all the above scores.
- **Target**: > 85
- **Enforcement**: Any slide that falls below 85 points during the Validation phase is rejected, and the AI agents are forced to regenerate the content for that slide using tighter constraints.

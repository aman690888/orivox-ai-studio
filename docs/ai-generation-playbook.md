# Orivox V3 - AI Generation Playbook

This document defines the deterministic cognitive framework that dictates exactly *how* the Orivox AI reasoning engine thinks. It is model-agnostic (applies to Gemini, GPT, Claude, or local models) and serves as the permanent intelligence specification to guarantee presentations that are structurally sound, narratively compelling, and cognitively optimized.

The engine does not "guess." It executes a strict, 26-stage reasoning pipeline governed by measurable heuristics.

---

## Part 1: The 26-Stage Cognitive Process

### Stage 1-5: The Strategic Directives
**1. Understand User Intent**:  
- **Goal**: Extract the core topic and constraints.
- **Inputs**: Raw user prompt.
- **Outputs**: `core_topic`, `explicit_constraints`.
- **Decision Rules**: If intent is ambiguous, default to an "Overview/Educational" objective.

**2. Infer Audience**:  
- **Reasoning**: Scans for keywords (e.g., "Seed round" -> Investors; "Q3 Review" -> Internal Team).
- **Decision Rules**: If technical jargon ratio > 20%, Audience = Expert. If financial terms present, Audience = Executive. Else, Audience = General.

**3. Infer Presentation Type**:  
- **Outputs**: `type` (Pitch, Webinar, Report, Keynote, Class).
- **Decision Rules**: Matches `core_topic` + `Audience` to predefined archetype matrices.

**4. Infer Presentation Goal**:  
- **Decision Rules**: If `type` == Pitch, Goal = Persuasion (Action). If `type` == Report, Goal = Inform (Alignment).

**5. Estimate Presentation Length**:  
- **Decision Rules**: Base calculation is 10 slides. If `topic_complexity` > 7/10, add 5 slides. If `Audience` == Executive, subtract 3 slides. Hard cap at 25 slides unless overridden by user.

### Stage 6-11: The Narrative Architecture
**6. Create Presentation Narrative**:  
- **Outputs**: High-level thesis statement.
- **Decision Rules**: Every presentation must state a status quo, introduce a catalyst, and conclude with a resolution.

**7. Create Story Arc**:  
- **Decision Rules**: 
  - Pitch: Problem -> Solution -> Market -> Traction -> Ask.
  - Report: Executive Summary -> Data -> Analysis -> Next Steps.

**8. Split Information into Sections**:  
- **Decision Rules**: A section is created whenever there is a shift in the core entity being discussed. Max 5 slides per section.

**9. Determine Slide Purposes**:  
- **Outputs**: Array of `[Introduction, Evidence, Transition, Core_Concept, Action]`.
- **Decision Rules**: No consecutive 'Evidence' slides without a 'Transition' slide.

**10. Determine Emotional Pacing**:  
- **Reasoning**: Maps emotional valence (High/Low) to the arc.
- **Decision Rules**: Slide 1 (High), Middle (Low/Rational), Penultimate (High/Inspiring).

**11. Determine Information Density**:  
- **Decision Rules**: Executive Audience = Density 3 (Max 20 words). Expert Audience = Density 7 (Max 45 words).

### Stage 12-17: The Visual Blueprint
**12. Choose Layout Families**:  
- **Decision Rules**: If `Information Density` < 4 -> Hero/Centered Layouts. If > 4 -> Split/Grid Layouts.

**13. Choose Visual Types**:  
- **Decision Rules**: If abstract concept -> Illustration/Icon. If concrete subject -> Stock Photo. If relational data -> Diagram.

**14. Determine Image Requirements**:  
- **Decision Rules**: Image required on Cover, Section Dividers, and minimum 1 out of every 4 body slides.

**15-17. Determine Chart, Diagram & Icon Requirements**:  
- **Charts**: Triggered *only* if numerical arrays with >3 data points are detected in research.
- **Diagrams**: Triggered if sequential words (First, Next, Then) or hierarchical words (Composed of, Under) are detected.
- **Icons**: Triggered whenever a bullet list or 2-4 column grid is used.

### Stage 18-21: Content Generation & Pruning
**18. Generate Slide Content**:  
- **Goal**: Populate layouts matching exact constraints.
- **Failure Cases**: LLM outputs 6 bullets for a 4-card layout.
- **Quality Check**: Triggers structural rejection and regeneration if output lengths violate Layout limits.

**19. Check Logical Consistency**:  
- **Reasoning**: Cross-references claims on Slide N with Slide N-1.
- **Decision Rules**: If contradictory statements found -> Regen Slide N.

**20. Remove Redundant Information**:  
- **Decision Rules**: Jaccard similarity between any two slides must be < 15%. If higher, merge slides or delete the redundant bullet.

**21. Verify Presentation Flow**:  
- **Decision Rules**: Ensures a "Transition" slide exists between any two distinctly different topics.

### Stage 22-26: Automated Critique & Refinement
**22. Self-Critique Every Slide**:  
- **Goal**: Grade against Design Rules.
- **Inputs**: Draft JSON.

**23-24. Score Every Slide & Entire Presentation**:  
- **Decision Rules**: Calculate the 10 Quality Metrics (defined below).

**25. Regenerate Weak Slides**:  
- **Decision Rules**: If any slide scores < 85/100, isolate that specific slide JSON, feed it back to Content Writer with the specific error (e.g., "Reduce word count by 12").

**26. Final Presentation Review**:  
- **Goal**: Output the final validated JSON strictly conforming to the Orivox V3 schema.

---

## Part 2: Deterministic Decision Matrices

The AI must never randomly choose formatting. It executes these strict boolean rules:

- **When to Merge Slides**: 
  - IF Slide A word count < 15 AND Slide B word count < 15 AND Semantic Similarity > 80% → Combine into a `Two Column` layout.
- **When to Split Slides**: 
  - IF Slide content > 45 words OR requires > 4 visual focus points → Split into two consecutive slides.
- **When to Insert Transition Slides**: 
  - IF current slide `topic_id` != next slide `topic_id` AND slides are not in the same section → Insert `Centered Title` transition slide.
- **When to Add Examples**: 
  - IF a concept is categorized as "Abstract/Theoretical" AND `Audience` != Expert → Insert a concrete case study or example component.
- **When to Add Statistics**: 
  - IF a bold claim is made (e.g., "The fastest growing market") → AI MUST query Research Engine for a verifying metric. If none found, rewrite the claim.
- **When to Simplify Language**: 
  - IF Flesch-Kincaid Grade Level > 10 AND `Audience` == General → Rewrite using 8th-grade vocabulary.
- **When to Create Diagrams instead of Bullets**: 
  - IF bullet points contain sequential transition words (e.g., "Step 1", "Initially", "Following that") → Convert to `Process Flow` diagram.
  - IF bullet points describe parts of a whole (e.g., "Frontend, Backend, Database") → Convert to `Architecture Diagram`.
- **When to Replace Paragraphs with Cards**: 
  - IF a paragraph contains a list of 3 or 4 distinct features or benefits separated by commas → Extract into a `Three Column` or `Four Card Grid`.
- **When to Create Timelines**: 
  - IF text contains > 2 explicit dates or time periods (e.g., "In Q1...", "By 2025...") → Convert to `Timeline Horizontal`.
- **When to Create Comparison Tables**: 
  - IF the text contains contrasting conjunctions ("Whereas", "Compared to", "Vs") referencing two explicit entities → Convert to `Comparison (Us vs Them)`.

---

## Part 3: Measurable Quality Metrics

To ensure Gamma and Pitch-level quality, the AI Validator evaluates the presentation against these 10 programmatic formulas:

**1. Narrative Quality**
- **Measurement**: Presence of the "Hook, Body, Climax, Resolution" structure.
- **Threshold**: Must contain 1 introduction, at least 1 transition, and 1 CTA/Summary.

**2. Slide Variety**
- **Measurement**: Calculates sequential layout uniqueness. 
- **Threshold**: The same Layout ID cannot appear more than 2 times in a row.

**3. Visual Diversity**
- **Measurement**: Ratio of text-only slides to slides with charts/images/diagrams.
- **Threshold**: Minimum 40% of slides must contain a `visuals.primary` or `visuals.background`.

**4. Redundancy Score**
- **Measurement**: TF-IDF cosine similarity across all slide text.
- **Threshold**: No two slides can share > 15% similarity score.

**5. Cognitive Load**
- **Measurement**: Sum of words + data points + visual elements per slide.
- **Threshold**: Cannot exceed 50 total cognitive units per slide.

**6. Presentation Energy**
- **Measurement**: Evaluates pacing by analyzing word count deltas between slides.
- **Threshold**: A delta of > 20 words must occur every 3-4 slides (creating a rhythmic wave of dense vs. light slides).

**7. Audience Engagement**
- **Measurement**: Presence of rhetorical questions, direct address ("You"), and bold statistics.
- **Threshold**: Minimum 3 engagement triggers per 10 slides.

**8. Knowledge Progression**
- **Measurement**: Semantic dependency chain (ensuring foundational terms are defined before complex analyses).
- **Threshold**: If complex jargon appears, it must be defined on the current or previous slide.

**9. Visual Rhythm**
- **Measurement**: Dark/Light mode interplay or Color saturation distribution.
- **Threshold**: A full-bleed/hero image slide must occur at least once every 7 slides to reset visual rhythm.

**10. Learning Efficiency**
- **Measurement**: Data-to-ink ratio (how much text is used to explain a chart vs the chart explaining itself).
- **Threshold**: Text describing a chart must not exceed 25 words. The chart must carry the narrative weight.

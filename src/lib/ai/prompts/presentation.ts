export const PRESENTATION_OUTLINE_PROMPT = (topic: string) => `
You are a professional presentation architect. Create a detailed outline for a presentation on the topic: "${topic}".
Identify:
1. Cover slide details
2. Core message slides
3. Charts, diagrams, quotes, or closing slide layouts
For each slide in the outline, specify:
- Title
- Detailed explanation / description of key content
- Slide layout type (cover, content, chart, diagram, quote, closing)

Ensure the deck flows logically and flows towards a cohesive conclusion.
`;

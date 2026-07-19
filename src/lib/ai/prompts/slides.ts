import { OutlineItem } from "../types";

export const SLIDE_GENERATION_PROMPT = (item: OutlineItem) => `
You are designing a slide.
Slide Title: "${item.title}"
Slide Description: "${item.description}"
Layout Kind: "${item.kind}"

Draft the slide content including:
1. Short, snappy text titles
2. Supporting bullets or metadata elements
3. If layout is a chart/diagram, specify appropriate structured keys or labels

Ensure professional tone, minimal text, and high visual impact.
`;

import { Slide } from "@/lib/mock";

export const SPEAKER_NOTES_PROMPT = (slide: Slide) => `
You are a public speaking coach. Create professional presenter speaker notes for the following slide:
Slide Title: "${slide.title}"
Slide Bullets: ${JSON.stringify(slide.bullets || [])}
Layout Type: "${slide.kind}"

Draft concise, conversational prompts, transition phrases, and talking points. Limit response to 100 words.
`;

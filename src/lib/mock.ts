

export const suggestions = [
  "A pitch deck for a solo-founder AI startup",
  "The state of generative video in 2026",
  "A quarterly review for a design team",
  "An intro to vector databases for engineers",
  "A keynote on the future of work",
];

export const categories = [
  { name: "Pitch deck", hint: "Investor-ready" },
  { name: "Product review", hint: "Data-driven" },
  { name: "Lecture", hint: "Educational" },
  { name: "Research", hint: "Long-form" },
  { name: "Internal", hint: "Team updates" },
];

export type SlideKind = "cover" | "content" | "chart" | "diagram" | "quote" | "closing";

export type Slide = {
  id: string;
  kind: SlideKind;
  title: string;
  bullets?: string[];
  notes?: string;
};



export const thinkingSteps = [
  "Understanding request",
  "Researching",
  "Finding sources",
  "Planning outline",
  "Choosing layouts",
  "Designing slides",
  "Creating charts",
  "Creating diagrams",
  "Writing speaker notes",
  "Final review",
] as const;

export const quickActions = [
  "Make it punchier",
  "Add a data slide",
  "Shorten to 10",
  "More visual",
  "Add closing CTA",
];



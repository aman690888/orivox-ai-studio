export type Presentation = {
  id: string;
  title: string;
  category: string;
  updated: string;
  slides: number;
  progress?: number;
  accent: "electric" | "violet" | "emerald" | "amber";
};

export const presentations: Presentation[] = [
  {
    id: "healthcare-ai",
    title: "AI in Healthcare",
    category: "Research",
    updated: "2h ago",
    slides: 18,
    progress: 75,
    accent: "electric",
  },
  {
    id: "q4-review",
    title: "Q4 Product Review",
    category: "Business",
    updated: "Yesterday",
    slides: 24,
    accent: "violet",
  },
  {
    id: "series-b",
    title: "Series B Pitch Deck",
    category: "Pitch",
    updated: "3 days ago",
    slides: 14,
    accent: "emerald",
  },
  {
    id: "design-systems",
    title: "The Future of Design Systems",
    category: "Lecture",
    updated: "1 week ago",
    slides: 32,
    accent: "amber",
  },
  {
    id: "climate-2030",
    title: "Climate Outlook 2030",
    category: "Research",
    updated: "2 weeks ago",
    slides: 21,
    accent: "electric",
  },
  {
    id: "onboarding",
    title: "Team Onboarding Guide",
    category: "Internal",
    updated: "3 weeks ago",
    slides: 12,
    accent: "violet",
  },
];

export const featured: Presentation = presentations[0];

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

export const demoSlides: Slide[] = [
  {
    id: "s1",
    kind: "cover",
    title: "AI in Healthcare",
    bullets: ["A 2026 outlook"],
    notes: "Open with the stakes: 4.5B lives touched by AI-assisted care by 2030.",
  },
  {
    id: "s2",
    kind: "content",
    title: "The three shifts",
    bullets: ["Diagnostics moves upstream", "Care becomes continuous", "Trust becomes the moat"],
    notes: "Frame the shifts as parallel, not sequential.",
  },
  {
    id: "s3",
    kind: "chart",
    title: "AI diagnostic accuracy vs. clinicians",
    notes: "Chart shows AI overtaking on imaging tasks, still behind on rare disease.",
  },
  {
    id: "s4",
    kind: "diagram",
    title: "The continuous care loop",
    notes: "Sensors → model → clinician → intervention → sensors.",
  },
  {
    id: "s5",
    kind: "content",
    title: "Where trust breaks",
    bullets: ["Opaque models", "Bias in training data", "Regulatory drift"],
    notes: "Land each risk with a concrete 2025 example.",
  },
  {
    id: "s6",
    kind: "quote",
    title: '"The stethoscope of the 21st century is a model."',
    notes: "Attribute to Dr. Topol.",
  },
  {
    id: "s7",
    kind: "chart",
    title: "Investment by category, 2020–2026",
    notes: "Note the 2024 inflection in ambient documentation.",
  },
  {
    id: "s8",
    kind: "closing",
    title: "What to build now",
    bullets: ["Workflow-first", "Regulated by design", "Human-in-the-loop"],
    notes: "End with a call to action for founders in the room.",
  },
];

export const research = [
  { source: "Nature Medicine", title: "Ambient AI reduces clinician burnout by 32%", year: "2025" },
  {
    source: "The Lancet Digital",
    title: "Multimodal models in early-stage oncology",
    year: "2025",
  },
  { source: "NEJM AI", title: "The regulatory gap in continuous monitoring", year: "2026" },
  { source: "Stanford HAI", title: "State of medical AI benchmarks", year: "2026" },
];

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

export const followUps = [
  "Add a slide on privacy",
  "Make the tone more executive",
  "Include a competitive landscape",
];

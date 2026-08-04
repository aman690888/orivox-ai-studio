import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  Search,
  FileText,
  Wand2,
  Presentation,
  LayoutTemplate,
  PieChart,
  Network,
  Download,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { PromptBox } from "@/components/prompt/PromptBox";
import { useState } from "react";
import Marquee from "react-fast-marquee";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orivox — Stop making presentations." },
      { name: "description", content: "The AI Presentation Operating System." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  const go = (p: string) =>
    navigate({ to: "/workspace/$id", params: { id: "new" }, search: { prompt: p } });

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-black font-sans selection:bg-black selection:text-white flex flex-col border-x border-black max-w-[1440px] mx-auto">
      {/* Header */}
      <header className="border-b border-black grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black sticky top-0 z-50 bg-[#F9F9F7]">
        <div className="p-4 flex items-center justify-center md:justify-start">
          <Logo />
        </div>
        <nav className="flex items-center justify-center gap-8 p-4 text-sm font-bold uppercase tracking-widest">
          <a className="hover:underline" href="#features">Features</a>
          <a className="hover:underline" href="#workflow">Workflow</a>
          <a className="hover:underline" href="#faq">FAQ</a>
        </nav>
        <div className="flex items-center justify-center md:justify-end gap-4 p-4">
          <Link to="/auth" className="text-sm font-bold uppercase hover:underline">
            Sign In
          </Link>
          <Link to="/auth" className="border border-black bg-black text-[#F9F9F7] px-6 py-2 text-sm font-bold uppercase hover:bg-transparent hover:text-black transition-colors">
            Subscribe
          </Link>
        </div>
      </header>

      {/* Marquee Ticker */}
      <div className="border-b border-black py-2 bg-black text-[#F9F9F7] text-xs font-mono uppercase tracking-widest overflow-hidden">
        <Marquee speed={50} gradient={false}>
          <span className="mx-4">BREAKING: ORIVOX 2.0 RELEASED</span> •
          <span className="mx-4">1,000,000+ SLIDES GENERATED</span> •
          <span className="mx-4">THE DEATH OF POWERPOINT</span> •
          <span className="mx-4">AI PRESENTATION SYSTEM LIVE</span> •
          <span className="mx-4">NO MORE DRAGGING BOXES</span> •
          <span className="mx-4">CINEMATIC DECKS IN SECONDS</span> •
        </Marquee>
      </div>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 border-b border-black divide-y md:divide-y-0 md:divide-x divide-black">
          {/* Main Hero Text */}
          <div className="md:col-span-8 p-8 md:p-16 flex flex-col justify-center @container">
            <h1 className="font-serif leading-[0.85] tracking-tighter mb-8 text-balance text-[clamp(2rem,10cqw,8rem)]">
              STOP MAKING PRESENTATIONS.
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-2xl leading-snug">
              The AI presentation operating system. From raw thoughts to stunning cinematic decks in seconds.
            </p>
          </div>
          
          {/* Action Area */}
          <div className="md:col-span-4 flex flex-col divide-y divide-black bg-black text-[#F9F9F7]">
             <div className="p-8 flex-1 flex flex-col justify-center">
                <h3 className="font-bold uppercase tracking-widest mb-4">Start your prompt</h3>
                <div className="bg-[#F9F9F7] text-black p-2 border border-black">
                    <PromptBox
                        value={prompt}
                        onChange={setPrompt}
                        onSubmit={go}
                        placeholder="A pitch deck on AI in healthcare..."
                    />
                </div>
             </div>
             <div className="p-8 flex flex-col gap-2">
                <span className="font-bold uppercase tracking-widest text-xs mb-2 text-neutral-400">Trending Topics</span>
                {["Pitch deck", "Q3 Earnings Report", "Product Launch"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setPrompt(`A ${t.toLowerCase()} on `)}
                        className="text-left border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-colors font-mono text-sm"
                    >
                        {t}
                    </button>
                ))}
             </div>
          </div>
        </section>

        {/* Features - Grid Layout */}
        <section id="features" className="border-b border-black">
            <div className="border-b border-black p-4 bg-black text-[#F9F9F7]">
                <h2 className="font-bold uppercase tracking-widest text-xl text-center">I. The New Standard</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black">
                <div className="p-8 flex flex-col">
                    <Wand2 className="h-12 w-12 mb-6" />
                    <h3 className="font-serif text-3xl mb-4 leading-none">Live Generation</h3>
                    <p className="text-lg leading-relaxed">Watch your slides materialize in real-time as you chat. Describe what you want, and Orivox builds it instantly. No more dragging boxes.</p>
                </div>
                <div className="p-8 flex flex-col">
                    <PieChart className="h-12 w-12 mb-6" />
                    <h3 className="font-serif text-3xl mb-4 leading-none">Beautiful Charts</h3>
                    <p className="text-lg leading-relaxed">Paste raw data or describe a trend. Orivox generates stunning, accurate charts automatically.</p>
                </div>
                <div className="flex flex-col divide-y divide-black">
                    <div className="p-8 flex-1">
                        <Network className="h-8 w-8 mb-4" />
                        <h3 className="font-serif text-2xl mb-2">Smart Layouts</h3>
                        <p>AI selects the perfect layout for your content.</p>
                    </div>
                    <div className="p-8 flex-1 bg-black text-[#F9F9F7]">
                        <Download className="h-8 w-8 mb-4" />
                        <h3 className="font-serif text-2xl mb-2">Export Anywhere</h3>
                        <p>Export to PDF, PPTX, or share instantly via link.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="border-b border-black">
            <div className="border-b border-black p-4">
                <h2 className="font-bold uppercase tracking-widest text-xl text-center">II. The Method</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-black">
                {[
                    { icon: Search, label: "01. Research", body: "Pulls from the open web and your context." },
                    { icon: FileText, label: "02. Outline", body: "Structures the narrative automatically." },
                    { icon: LayoutTemplate, label: "03. Design", body: "Generates cinematic layouts and charts." },
                    { icon: Presentation, label: "04. Present", body: "Complete with auto-generated speaker notes." },
                ].map((s) => (
                    <div key={s.label} className="p-8">
                        <s.icon className="h-8 w-8 mb-8" />
                        <h3 className="font-bold uppercase tracking-widest text-lg mb-4">{s.label}</h3>
                        <p className="font-serif text-lg leading-snug">{s.body}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="grid grid-cols-1 md:grid-cols-12 border-b border-black divide-y md:divide-y-0 md:divide-x divide-black">
            <div className="md:col-span-4 p-10 md:p-12 bg-[#090909] flex flex-col justify-center relative overflow-hidden">
                {/* Subtle radial gradient for depth */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_50%)] pointer-events-none"></div>
                
                <div className="relative z-10">
                    <h2 className="font-serif text-5xl md:text-6xl leading-[1.1] text-[#FAFAFA] tracking-tight mb-6 text-balance">
                        Frequently Asked Questions
                    </h2>
                    <p className="font-mono text-sm uppercase tracking-widest text-neutral-400">
                        Everything you need to know about Orivox.
                    </p>
                </div>
            </div>
            <div className="md:col-span-8 p-8">
                <Accordion type="single" collapsible className="w-full border-black">
                    {[
                        [
                        "Is Orivox just another AI wrapper?",
                        "No. Orivox is a custom-built rendering engine and AI pipeline designed specifically for presentations. It doesn't just generate text; it builds actual interactive, editable slides.",
                        ],
                        [
                        "Can I edit the slides manually?",
                        "Absolutely. Orivox provides full element-level control. You can drag, drop, recolor, and edit anything on the canvas.",
                        ],
                        ["Which export formats are supported?", "You can export to PDF, PowerPoint (PPTX), or share a live web link."],
                        [
                        "Does Orivox use my data to train models?",
                        "No. Your data is yours. We do not use user presentations to train our foundational models.",
                        ],
                    ].map(([q, a], i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border-b border-black last:border-0 data-[state=open]:bg-neutral-200">
                        <AccordionTrigger className="text-left font-bold uppercase tracking-widest py-6 hover:no-underline">{q}</AccordionTrigger>
                        <AccordionContent className="font-serif text-lg leading-relaxed pb-6 pr-12">{a}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>

        {/* CTA */}
        <section className="p-16 md:p-32 text-center flex flex-col items-center justify-center bg-[#F9F9F7]">
             <h2 className="font-serif text-6xl md:text-8xl leading-none mb-8 tracking-tighter">THE END OF BORING.</h2>
             <Link
                to="/auth"
                className="border-2 border-black bg-black text-[#F9F9F7] px-12 py-6 text-xl font-bold uppercase tracking-widest hover:bg-[#F9F9F7] hover:text-black transition-colors flex items-center gap-4"
             >
                Subscribe Now <ArrowRight className="h-6 w-6" />
             </Link>
        </section>
      </main>

      <footer className="border-t border-black p-8 flex flex-col md:flex-row items-center justify-between font-mono text-sm uppercase tracking-widest bg-black text-[#F9F9F7]">
        <Logo />
        <div className="flex items-center gap-8 my-8 md:my-0">
            <a href="#" className="hover:underline">Twitter</a>
            <a href="#" className="hover:underline">GitHub</a>
            <a href="#" className="hover:underline">Discord</a>
        </div>
        <div>© 2026 ORIVOX INC.</div>
      </footer>
    </div>
  );
}

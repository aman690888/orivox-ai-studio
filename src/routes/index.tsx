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
    <div className="min-h-screen bg-[#FCFCFC] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white flex flex-col mx-auto">
      {/* Header */}
      <header className="h-[72px] border-b border-neutral-200 flex items-center justify-between px-8 sticky top-0 z-50 bg-[#FCFCFC]/80 backdrop-blur-xl">
        <div className="flex items-center">
          <div className="scale-90 origin-left">
            <Logo />
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <a className="hover:text-neutral-900 transition-colors" href="#features">Features</a>
          <a className="hover:text-neutral-900 transition-colors" href="#workflow">Workflow</a>
          <a className="hover:text-neutral-900 transition-colors" href="#faq">FAQ</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
            Log In
          </Link>
          <Link to="/auth" className="bg-neutral-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all shadow-md shadow-neutral-900/10">
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="max-w-[1440px] mx-auto w-full px-8 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Main Hero Text */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-medium mb-8 w-max border border-neutral-200">
              <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
              Orivox 2.0 is now live
            </div>
            <h1 className="font-serif leading-[1.05] tracking-tight mb-6 text-balance text-5xl md:text-7xl text-neutral-900">
              Stop making presentations.
            </h1>
            <p className="text-lg md:text-xl font-normal text-neutral-500 max-w-xl leading-relaxed">
              The AI presentation operating system. From raw thoughts to stunning cinematic decks in seconds. Give it a prompt, and watch the magic happen.
            </p>
          </div>
          
          {/* Action Area */}
          <div className="lg:col-span-5 relative">
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-transparent blur-3xl -z-10 rounded-[3rem]"></div>
             <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] rounded-[24px] p-8 flex flex-col">
                <h3 className="font-medium text-neutral-800 mb-6">What would you like to create?</h3>
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-1 mb-6 transition-shadow focus-within:shadow-md focus-within:border-neutral-300">
                    <PromptBox
                        value={prompt}
                        onChange={setPrompt}
                        onSubmit={go}
                        placeholder="A pitch deck on AI in healthcare..."
                    />
                </div>
                
                <div className="flex flex-col gap-3">
                    <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Examples</span>
                    <div className="flex flex-wrap gap-2">
                        {["Startup Pitch", "Q3 Earnings", "Product Launch"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setPrompt(`A ${t.toLowerCase()} deck for `)}
                                className="text-left bg-neutral-50 border border-neutral-200 text-neutral-600 px-3 py-1.5 rounded-full hover:bg-neutral-100 hover:text-neutral-900 transition-colors text-sm"
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
             </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-[1440px] mx-auto w-full px-8 py-24 border-t border-neutral-100">
            <div className="mb-16 text-center max-w-2xl mx-auto">
                <h2 className="font-serif text-4xl mb-4 tracking-tight">The new standard for decks</h2>
                <p className="text-neutral-500 text-lg">Everything you need to build stunning presentations, powered by an intelligent design engine.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 rounded-[24px] bg-neutral-50 border border-neutral-100 transition-transform hover:-translate-y-1">
                    <div className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-center mb-6">
                        <Wand2 className="h-5 w-5 text-neutral-700" />
                    </div>
                    <h3 className="font-medium text-xl mb-3">Live Generation</h3>
                    <p className="text-neutral-500 leading-relaxed">Watch your slides materialize in real-time as you chat. Describe what you want, and Orivox builds it instantly.</p>
                </div>
                <div className="p-8 rounded-[24px] bg-neutral-50 border border-neutral-100 transition-transform hover:-translate-y-1">
                    <div className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-center mb-6">
                        <PieChart className="h-5 w-5 text-neutral-700" />
                    </div>
                    <h3 className="font-medium text-xl mb-3">Beautiful Charts</h3>
                    <p className="text-neutral-500 leading-relaxed">Paste raw data or describe a trend. Orivox generates stunning, accurate charts automatically styled to your theme.</p>
                </div>
                <div className="grid grid-rows-2 gap-8">
                    <div className="p-8 rounded-[24px] bg-neutral-50 border border-neutral-100 flex flex-col justify-center">
                        <h3 className="font-medium text-xl mb-2">Smart Layouts</h3>
                        <p className="text-neutral-500 text-sm">AI selects the perfect layout for your content.</p>
                    </div>
                    <div className="p-8 rounded-[24px] bg-neutral-900 text-white shadow-xl flex flex-col justify-center">
                        <h3 className="font-medium text-xl mb-2">Export Anywhere</h3>
                        <p className="text-neutral-400 text-sm">Export to PDF, PPTX, or share instantly via link.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="max-w-[1440px] mx-auto w-full px-8 py-24 border-t border-neutral-100">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {[
                    { icon: Search, label: "01. Research", body: "Pulls from the open web and your context." },
                    { icon: FileText, label: "02. Outline", body: "Structures the narrative automatically." },
                    { icon: LayoutTemplate, label: "03. Design", body: "Generates cinematic layouts and charts." },
                    { icon: Presentation, label: "04. Present", body: "Complete with auto-generated speaker notes." },
                ].map((s) => (
                    <div key={s.label} className="p-8 rounded-[24px] bg-white border border-neutral-100 shadow-sm">
                        <div className="h-10 w-10 bg-neutral-50 rounded-xl flex items-center justify-center mb-8">
                            <s.icon className="h-5 w-5 text-neutral-600" />
                        </div>
                        <h3 className="font-medium text-neutral-900 mb-2">{s.label}</h3>
                        <p className="text-neutral-500 text-sm leading-relaxed">{s.body}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-[1000px] mx-auto w-full px-8 py-24 border-t border-neutral-100">
            <div className="mb-12 text-center">
                <h2 className="font-serif text-4xl tracking-tight mb-4">Frequently Asked Questions</h2>
                <p className="text-neutral-500">Everything you need to know about Orivox.</p>
            </div>
            <div className="bg-white rounded-[24px] border border-neutral-100 shadow-sm p-2 md:p-8">
                <Accordion type="single" collapsible className="w-full">
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
                        <AccordionItem key={i} value={`item-${i}`} className="border-b border-neutral-100 last:border-0">
                        <AccordionTrigger className="text-left font-medium py-6 hover:no-underline hover:text-neutral-600 transition-colors">{q}</AccordionTrigger>
                        <AccordionContent className="text-neutral-500 leading-relaxed pb-6 pr-12">{a}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>

        {/* CTA */}
        <section className="max-w-[1440px] mx-auto w-full px-8 py-32 text-center flex flex-col items-center justify-center">
             <div className="bg-neutral-900 rounded-[32px] w-full py-24 px-8 text-white relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none"></div>
                 <h2 className="font-serif text-5xl md:text-7xl leading-tight mb-8 tracking-tight relative z-10 text-balance">
                    The end of boring presentations.
                 </h2>
                 <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 bg-white text-neutral-900 px-8 py-4 rounded-full text-lg font-medium hover:bg-neutral-100 transition-transform hover:scale-105 relative z-10"
                 >
                    Get Started <ArrowRight className="h-5 w-5" />
                 </Link>
             </div>
        </section>
      </main>

      <footer className="border-t border-neutral-100 px-8 py-12 flex flex-col md:flex-row items-center justify-between text-sm text-neutral-500 max-w-[1440px] mx-auto w-full">
        <div className="scale-90 origin-left mb-6 md:mb-0 grayscale opacity-70">
            <Logo />
        </div>
        <div className="flex items-center gap-8 mb-6 md:mb-0">
            <a href="#" className="hover:text-neutral-900 transition-colors">Twitter</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">GitHub</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Discord</a>
        </div>
        <div>© 2026 Orivox Inc.</div>
      </footer>
    </div>
  );
}

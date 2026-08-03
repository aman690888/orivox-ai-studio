import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  Search,
  FileText,
  Wand2,
  Presentation,
  Sparkles,
  LayoutTemplate,
  PieChart,
  Network,
  Download,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { PromptBox } from "@/components/prompt/PromptBox";
import { useState, useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orivox — Stop making presentations. Start describing ideas." },
      {
        name: "description",
        content:
          "The AI Presentation Operating System. Describe an idea; Orivox researches, outlines, designs, and refines your presentation.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(
    "A pitch deck on AI in healthcare, 10 slides, executive tone"
  );
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const go = (p: string) =>
    navigate({ to: "/workspace/$id", params: { id: "new" }, search: { prompt: p } });

  return (
    <div className="relative min-h-screen bg-[#050505] text-white selection:bg-white/20 overflow-hidden font-sans">
      
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 z-0 flex justify-center">
        <div className="absolute -top-40 h-[600px] w-[1000px] rounded-[100%] bg-white/[0.03] blur-[100px]" />
        <div className="absolute top-[20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-fuchsia-500/10 blur-[150px] mix-blend-screen" />
      </div>

      {/* Grid Pattern */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-400 md:flex">
            <a className="transition-colors hover:text-white" href="#how">
              Workflow
            </a>
            <a className="transition-colors hover:text-white" href="#features">
              Features
            </a>
            <a className="transition-colors hover:text-white" href="#faq">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              to="/auth"
              className="text-sm font-medium text-neutral-400 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-24">
        {/* Massive Cinematic Hero */}
        <section ref={heroRef} className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-center px-6 text-center">
          <motion.div style={{ y, opacity }} className="flex flex-col items-center">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-neutral-300 backdrop-blur-md"
            >
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Orivox 2.0 is now live</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-5xl text-balance text-6xl font-medium tracking-tighter md:text-8xl lg:text-[100px] leading-[1.05]"
            >
              Stop making presentations.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                Start describing ideas.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-8 max-w-2xl text-balance text-lg text-neutral-400 md:text-xl"
            >
              The AI presentation operating system. From raw thoughts to stunning cinematic decks in seconds. You provide the vision, Orivox does the rest.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-20 mt-12 w-full max-w-3xl"
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-xl">
                <PromptBox
                  value={prompt}
                  onChange={setPrompt}
                  onSubmit={go}
                  placeholder="Describe your presentation..."
                />
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {["Pitch deck", "Q3 Earnings Report", "Product Launch", "Market Analysis"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setPrompt(`A ${t.toLowerCase()} on `)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Animated Floating Presentation Cards */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 100, rotate: -10 }}
              animate={{ opacity: 0.5, y: 0, rotate: -5 }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              className="absolute left-[5%] top-[30%] h-64 w-96 rounded-xl border border-white/10 bg-black/50 shadow-2xl backdrop-blur-xl hidden lg:block"
            >
               <div className="p-6 h-full flex flex-col justify-between opacity-50">
                  <div className="w-1/3 h-4 bg-white/20 rounded-md"></div>
                  <div className="space-y-3">
                     <div className="w-full h-2 bg-white/10 rounded-full"></div>
                     <div className="w-5/6 h-2 bg-white/10 rounded-full"></div>
                     <div className="w-4/6 h-2 bg-white/10 rounded-full"></div>
                  </div>
               </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 100, rotate: 10 }}
              animate={{ opacity: 0.3, y: 0, rotate: 8 }}
              transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
              className="absolute right-[5%] top-[20%] h-72 w-80 rounded-xl border border-white/10 bg-black/50 shadow-2xl backdrop-blur-xl hidden lg:block"
            >
               <div className="p-6 h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                  <div className="w-32 h-32 rounded-full border-4 border-indigo-500/30 border-t-indigo-500"></div>
                  <div className="w-1/2 h-3 bg-white/20 rounded-md"></div>
               </div>
            </motion.div>
          </div>
        </section>

        {/* Asymmetric Bento-box Feature Grids */}
        <section id="features" className="relative mx-auto max-w-7xl px-6 py-32">
          <SectionTitle eyebrow="Features" title="A new standard for presentations." />
          
          <div className="mt-20 grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2 h-auto md:h-[600px]">
            {/* Large Bento Box 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 md:col-span-2 md:row-span-2 flex flex-col justify-end"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <div className="absolute top-8 right-8 text-white/20 group-hover:text-white/40 transition-colors">
                <Wand2 className="h-24 w-24" />
              </div>
              <div className="relative z-20 mt-auto">
                <h3 className="text-3xl font-medium tracking-tight text-white mb-3">Live Generation</h3>
                <p className="text-lg text-neutral-400">
                  Watch your slides materialize in real-time as you chat. Describe what you want, and Orivox builds it instantly. No more dragging boxes.
                </p>
              </div>
            </motion.div>

            {/* Small Bento Box 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 md:col-span-2"
            >
              <PieChart className="h-8 w-8 text-indigo-400 mb-6" />
              <h3 className="text-xl font-medium text-white mb-2">Beautiful Charts</h3>
              <p className="text-neutral-400">
                Paste raw data or describe a trend. Orivox generates stunning, accurate charts automatically.
              </p>
            </motion.div>

            {/* Small Bento Box 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 md:col-span-1"
            >
               <Network className="h-8 w-8 text-fuchsia-400 mb-6" />
              <h3 className="text-xl font-medium text-white mb-2">Smart Layouts</h3>
              <p className="text-neutral-400 text-sm">
                AI selects the perfect layout for your content.
              </p>
            </motion.div>

            {/* Small Bento Box 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 md:col-span-1"
            >
               <Download className="h-8 w-8 text-emerald-400 mb-6" />
              <h3 className="text-xl font-medium text-white mb-2">Export anywhere</h3>
              <p className="text-neutral-400 text-sm">
                Export to PDF, PPTX, or share instantly via link.
              </p>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="relative mx-auto max-w-7xl px-6 py-32 border-t border-white/5">
          <SectionTitle eyebrow="Workflow" title="Four steps to a masterpiece." />
          <div className="mt-20 grid gap-6 md:grid-cols-4">
            {[
              { icon: Search, label: "Research", body: "Pulls from the open web and your context." },
              { icon: FileText, label: "Outline", body: "Structures the narrative automatically." },
              { icon: LayoutTemplate, label: "Design", body: "Generates cinematic layouts and charts." },
              { icon: Presentation, label: "Present", body: "Complete with auto-generated speaker notes." },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-colors"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">{s.label}</h3>
                <p className="text-neutral-400 leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="relative mx-auto max-w-3xl px-6 py-32 border-t border-white/5">
          <SectionTitle eyebrow="FAQ" title="Frequently asked questions" />
          <div className="mt-16">
            <Accordion type="single" collapsible className="space-y-4">
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
                <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-2 data-[state=open]:bg-white/10 transition-colors">
                  <AccordionTrigger className="text-left text-lg font-medium text-white hover:no-underline">{q}</AccordionTrigger>
                  <AccordionContent className="text-neutral-400 text-base leading-relaxed">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="relative mx-auto max-w-5xl px-6 py-32">
          <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/5 p-16 text-center shadow-2xl backdrop-blur-xl">
             <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
            <h2 className="text-balance text-4xl font-medium tracking-tight text-white md:text-6xl">
              Ready to stop making presentations?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-400">
              Join thousands of professionals saving hours every week with Orivox.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
               <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-medium text-black transition-transform hover:scale-105"
               >
                  Get started for free <ArrowRight className="h-4 w-4" />
               </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <div className="flex items-center gap-6">
             <a href="#" className="hover:text-white transition-colors">Twitter</a>
             <a href="#" className="hover:text-white transition-colors">GitHub</a>
             <a href="#" className="hover:text-white transition-colors">Discord</a>
          </div>
          <div>© 2026 Orivox Inc.</div>
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <div className="text-sm font-medium uppercase tracking-widest text-indigo-400 mb-4">{eyebrow}</div>
      <h2 className="text-balance text-4xl font-medium tracking-tight text-white md:text-5xl">
        {title}
      </h2>
    </div>
  );
}

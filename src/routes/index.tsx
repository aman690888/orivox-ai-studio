import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  Search,
  FileText,
  Wand2,
  Presentation,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { PromptBox } from "@/components/prompt/PromptBox";
import { useState } from "react";
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
    "A pitch deck on AI in healthcare, 10 slides, executive tone",
  );

  const go = (p: string) =>
    navigate({ to: "/workspace/$id", params: { id: "new" }, search: { prompt: p } });

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-electric/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-96 right-0 h-[400px] w-[500px] rounded-full bg-violet/10 blur-[120px]" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a className="transition hover:text-foreground" href="#how">
            How it works
          </a>
          <a className="transition hover:text-foreground" href="#features">
            Features
          </a>
          <a className="transition hover:text-foreground" href="#faq">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="hidden text-sm text-muted-foreground transition hover:text-foreground md:inline"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            className="rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-16 text-center md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground backdrop-blur"
        >
          <Sparkles className="h-3 w-3 text-electric" />
          Orivox v1 · The AI Presentation OS
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
        >
          Stop making presentations.
          <br />
          <span className="bg-gradient-to-r from-electric to-violet bg-clip-text text-transparent">
            Start describing ideas.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground md:text-lg"
        >
          Orivox is your AI presentation partner. Describe an idea; it researches, outlines,
          designs, and refines the deck alongside you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-10 max-w-2xl"
        >
          <PromptBox
            value={prompt}
            onChange={setPrompt}
            onSubmit={go}
            placeholder="Describe your presentation..."
          />
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
            {["Pitch deck", "Research report", "Product review", "Keynote"].map((t) => (
              <button
                key={t}
                onClick={() => setPrompt(`A ${t.toLowerCase()} on `)}
                className="rounded-full border border-border bg-white/[0.02] px-3 py-1 text-muted-foreground transition hover:border-white/20 hover:text-foreground"
              >
                {t}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <SectionTitle eyebrow="How Orivox thinks" title="Four steps. Zero busywork." />
        <div className="mt-14 grid gap-4 md:grid-cols-4">
          {[
            { icon: Search, label: "Research", body: "Pulls from the open web and your context." },
            {
              icon: FileText,
              label: "Outline",
              body: "Structures the story before touching a slide.",
            },
            {
              icon: Presentation,
              label: "Slides",
              body: "Designs layouts, charts, and speaker notes.",
            },
            { icon: Wand2, label: "Refinement", body: "Conversational edits at any zoom level." },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-5"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                <s.icon className="h-4 w-4 text-electric" />
              </div>
              <div className="text-sm font-medium">{s.label}</div>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <SectionTitle eyebrow="Features" title="Everything a great deck needs." />
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            ["Live generation", "Watch slides materialize while you chat."],
            ["Element-level edits", "Select anything; ask for anything."],
            ["Charts from data", "Describe the story, get the chart."],
            ["Diagrams that draw themselves", "Systems, flows, org charts."],
            ["Speaker notes included", "Never open a notes doc again."],
            ["Export anywhere", "PDF, PPTX, or shareable link."],
          ].map(([t, d], i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.06 }}
              className="glass rounded-2xl p-5"
            >
              <div className="text-sm font-medium">{t}</div>
              <p className="mt-1.5 text-sm text-muted-foreground">{d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 mx-auto max-w-2xl px-6 pb-24">
        <SectionTitle eyebrow="FAQ" title="Answers before you ask." />
        <div className="mt-10">
          <Accordion type="single" collapsible className="space-y-2">
            {[
              [
                "Is Orivox a Canva alternative?",
                "No. Orivox never asks you to design. You describe an idea; the AI designs the deck.",
              ],
              [
                "Can I edit slides manually?",
                "Yes. Select any element to open manual controls alongside AI edits.",
              ],
              ["Which export formats are supported?", "PDF, PPTX, and shareable links."],
              [
                "Does Orivox research on its own?",
                "Yes. It pulls from the open web and surfaces its sources.",
              ],
              [
                "Can I bring my own data?",
                "Yes. Attach files or paste data; Orivox turns it into charts.",
              ],
              ["Is there a free plan?", "Yes, with generous limits."],
            ].map(([q, a]) => (
              <AccordionItem key={q} value={q} className="glass rounded-xl border-0 px-4">
                <AccordionTrigger className="text-left text-sm">{q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24 text-center">
        <div className="glass rounded-3xl p-10">
          <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Your next deck writes itself.
          </h2>
          <p className="mt-3 text-muted-foreground">Free to try. No credit card required.</p>
          <Link
            to="/auth"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo />{" "}
          </div>
          <div>© 2026 Orivox</div>
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</div>
      <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
    </div>
  );
}

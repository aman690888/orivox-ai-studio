import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Search,
  FileText,
  Wand2,
  Presentation,
  LayoutTemplate,
  PieChart,
  Download,
  Zap,
  Star,
  CheckCircle2,
  ChevronDown,
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
      { title: "Orivox — Stop making boring presentations." },
      { name: "description", content: "The AI Presentation Operating System. Sketchy, fast, and magical." },
    ],
  }),
  component: Landing,
});

// ─── Reusable Wobbly Radius Values ───────────────────────────────────────────
const R = {
  wobbly: "255px 15px 225px 15px / 15px 225px 15px 255px",
  wobblyMd: "8px 42px 12px 38px / 42px 12px 38px 8px",
  wobblyBtn: "18px 6px 22px 8px / 6px 22px 8px 18px",
  wobblyCard: "6px 38px 6px 42px / 38px 6px 42px 6px",
  tag: "4px 22px 6px 18px / 22px 6px 18px 4px",
};

// ─── Wobbly Button ────────────────────────────────────────────────────────────
function WobblyBtn({
  children,
  onClick,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-2 px-6 py-3 text-lg font-[Patrick_Hand] border-[3px] border-[#2d2d2d] cursor-pointer transition-all duration-100 select-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";
  const variants = {
    primary:
      "bg-white text-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] hover:bg-[#ff4d4d] hover:text-white hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px]",
    secondary:
      "bg-[#e5e0d8] text-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] hover:bg-[#2d5da1] hover:text-white hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px]",
  };
  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
      style={{ borderRadius: R.wobblyBtn }}
    >
      {children}
    </button>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  body,
  rotate = 0,
  tape = false,
  postit = false,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  rotate?: number;
  tape?: boolean;
  postit?: boolean;
}) {
  return (
    <div
      className={`relative p-7 border-[3px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] transition-all duration-100 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#2d2d2d] ${postit ? "bg-[#fff9c4]" : "bg-white"}`}
      style={{ borderRadius: R.wobblyCard, transform: `rotate(${rotate}deg)` }}
    >
      {tape && (
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 w-14 h-5 bg-gray-300/60 border border-dashed border-gray-400/40"
          style={{ borderRadius: "2px", transform: "translateX(-50%) rotate(-1deg)" }}
        />
      )}
      <div
        className="flex items-center justify-center w-12 h-12 border-[2.5px] border-[#2d2d2d] mb-5 bg-[#fdfbf7]"
        style={{ borderRadius: "50% 40% 50% 45% / 45% 50% 45% 50%" }}
      >
        <Icon size={22} strokeWidth={2.5} className="text-[#2d2d2d]" />
      </div>
      <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Kalam, cursive" }}>
        {title}
      </h3>
      <p className="text-base leading-relaxed text-[#4a4440]" style={{ fontFamily: "Patrick Hand, cursive" }}>
        {body}
      </p>
    </div>
  );
}

// ─── Step Card ────────────────────────────────────────────────────────────────
function StepCard({
  num,
  icon: Icon,
  title,
  body,
}: {
  num: string;
  icon: React.ElementType;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-start gap-4 p-6 bg-white border-[2px] border-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d]" style={{ borderRadius: R.wobblyMd }}>
      <div className="flex items-center gap-3">
        <span
          className="text-2xl font-bold text-white bg-[#2d2d2d] px-3 py-1"
          style={{ fontFamily: "Kalam, cursive", borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
        >
          {num}
        </span>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <h3 className="text-lg font-bold" style={{ fontFamily: "Kalam, cursive" }}>{title}</h3>
      <p className="text-sm leading-relaxed text-[#4a4440]" style={{ fontFamily: "Patrick Hand, cursive" }}>{body}</p>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
function Landing() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  const go = (p: string) =>
    navigate({ to: "/workspace/$id", params: { id: "new" }, search: { prompt: p } });

  return (
    <div
      className="min-h-screen text-[#2d2d2d] flex flex-col"
      style={{ fontFamily: "Patrick Hand, cursive", background: "#fdfbf7", backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)", backgroundSize: "24px 24px" }}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#fdfbf7]/90 backdrop-blur-sm border-b-[3px] border-[#2d2d2d] border-dashed">
        <div className="max-w-5xl mx-auto px-6 h-[72px] flex items-center justify-between gap-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-base" style={{ fontFamily: "Patrick Hand, cursive" }}>
            {["Features", "Workflow", "Pricing", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="relative text-[#2d2d2d] hover:text-[#ff4d4d] transition-colors duration-100 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-[#ff4d4d] after:transition-all after:duration-200"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="hidden md:block text-sm text-[#2d2d2d] hover:text-[#ff4d4d] transition-colors"
              style={{ fontFamily: "Patrick Hand, cursive" }}
            >
              Log in
            </Link>
            <Link to="/auth">
              <WobblyBtn>
                Get Started <ArrowRight size={18} strokeWidth={2.5} />
              </WobblyBtn>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
          {/* Announcement badge */}
          <div className="flex justify-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#fff9c4] border-[2px] border-[#2d2d2d] text-sm shadow-[3px_3px_0px_0px_#2d2d2d] animate-wiggle"
              style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
            >
              <Star size={14} strokeWidth={2.5} className="text-[#ff4d4d]" />
              ✨ Orivox 2.0 just dropped — it's kinda magical
              <Star size={14} strokeWidth={2.5} className="text-[#ff4d4d]" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Headline + CTA */}
            <div className="flex flex-col gap-6">
              <h1
                className="text-5xl md:text-7xl font-bold leading-tight text-[#2d2d2d]"
                style={{ fontFamily: "Kalam, cursive" }}
              >
                Stop making
                {" "}
                <span
                  className="relative inline-block text-[#ff4d4d]"
                >
                  boring
                  {/* wavy underline */}
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 8" preserveAspectRatio="none" height="8">
                    <path d="M0,4 Q10,0 20,4 Q30,8 40,4 Q50,0 60,4 Q70,8 80,4 Q90,0 100,4" stroke="#ff4d4d" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>
                {" "}
                slides.
              </h1>

              <p className="text-xl md:text-2xl text-[#4a4440] leading-relaxed" style={{ fontFamily: "Patrick Hand, cursive" }}>
                The AI presentation OS. Give it a rough idea and watch it turn into a{" "}
                <em>genuinely beautiful</em> deck in seconds. No dragging boxes. No templates. Just{" "}
                <span className="font-bold text-[#2d5da1]">magic</span>.
              </p>

              <div className="flex flex-wrap gap-4 items-center mt-2">
                <Link to="/auth">
                  <WobblyBtn>
                    Try it free <ArrowRight size={18} strokeWidth={2.5} />
                  </WobblyBtn>
                </Link>
                <WobblyBtn variant="secondary" onClick={() => go("A product launch pitch deck for a B2B SaaS company")}>
                  See a demo <Zap size={18} strokeWidth={2.5} />
                </WobblyBtn>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex -space-x-3">
                  {["#ff4d4d", "#2d5da1", "#2d2d2d", "#e5a020"].map((c, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: c, borderRadius: "50% 45% 50% 45% / 45% 50% 45% 50%", zIndex: 4 - i }}
                    >
                      {["K", "A", "J", "M"][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-[#6b6460]" style={{ fontFamily: "Patrick Hand, cursive" }}>
                  Loved by <strong className="text-[#2d2d2d]">1,000+</strong> creators already
                </p>
              </div>
            </div>

            {/* Right: Prompt Card */}
            <div className="relative">
              {/* Decorative bouncing circle */}
              <div
                className="hidden md:flex absolute -top-8 -right-6 w-16 h-16 bg-[#fff9c4] border-[3px] border-[#2d2d2d] items-center justify-center text-2xl animate-gentle-bounce shadow-[3px_3px_0px_0px_#2d2d2d]"
                style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
              >
                ✏️
              </div>

              <div
                className="relative bg-white border-[3px] border-[#2d2d2d] p-7 shadow-[8px_8px_0px_0px_#2d2d2d]"
                style={{ borderRadius: R.wobblyCard }}
              >
                {/* Tape strip decoration */}
                <div
                  className="absolute -top-4 left-1/2 w-14 h-5 bg-gray-300/60 border border-dashed border-gray-400/50"
                  style={{ borderRadius: "2px", transform: "translateX(-50%) rotate(-1.5deg)" }}
                />

                <p className="text-sm font-bold uppercase tracking-widest text-[#6b6460] mb-4" style={{ fontFamily: "Kalam, cursive" }}>
                  ✍️ What do you want to create?
                </p>

                <div
                  className="border-[2px] border-[#2d2d2d] p-1 mb-5 bg-[#fdfbf7] focus-within:border-[#2d5da1] focus-within:ring-2 focus-within:ring-[#2d5da1]/20 transition-all"
                  style={{ borderRadius: R.wobblyMd }}
                >
                  <PromptBox
                    value={prompt}
                    onChange={setPrompt}
                    onSubmit={go}
                    placeholder="A pitch deck for my AI startup..."
                  />
                </div>

                {/* Example prompts */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-[#6b6460]" style={{ fontFamily: "Kalam, cursive" }}>
                    💡 Try one of these:
                  </span>
                  {[
                    "🚀 Startup pitch for investors",
                    "📊 Q3 earnings report",
                    "🌍 Product launch keynote",
                  ].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setPrompt(ex.replace(/^.{2} /, ""))}
                      className="text-left text-sm px-3 py-2 bg-[#fdfbf7] border-[2px] border-dashed border-[#2d2d2d] hover:bg-[#e5e0d8] hover:border-solid transition-all duration-100"
                      style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Divider / Stats ── */}
        <section className="py-12 border-y-[3px] border-dashed border-[#2d2d2d] bg-[#fff9c4]">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { val: "1M+", label: "Slides generated" },
              { val: "< 30s", label: "Avg. generation time" },
              { val: "4.9★", label: "User rating" },
              { val: "100%", label: "No dragging boxes" },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center text-center p-5 bg-white border-[2.5px] border-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] hover:rotate-1 transition-transform duration-100"
                style={{ borderRadius: "50% 40% 55% 45% / 40% 55% 45% 50%", minHeight: "100px" }}
              >
                <span className="text-3xl font-bold text-[#ff4d4d]" style={{ fontFamily: "Kalam, cursive" }}>
                  {stat.val}
                </span>
                <span className="text-sm mt-1 text-[#4a4440]" style={{ fontFamily: "Patrick Hand, cursive" }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="max-w-5xl mx-auto px-6 py-20">
          {/* Section label */}
          <div className="flex flex-col items-center mb-14">
            <div
              className="inline-block px-4 py-1 text-sm bg-[#2d2d2d] text-white mb-4 shadow-[3px_3px_0px_0px_#ff4d4d]"
              style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive", transform: "rotate(-1deg)" }}
            >
              The Good Stuff
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-center" style={{ fontFamily: "Kalam, cursive" }}>
              Everything you need.{" "}
              <span className="text-[#2d5da1]">Nothing you don't.</span>
            </h2>
            <p className="text-lg text-[#4a4440] text-center mt-4 max-w-xl" style={{ fontFamily: "Patrick Hand, cursive" }}>
              Built from the ground up for humans who'd rather think than drag boxes around.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Wand2}
              title="Live Generation"
              body="Watch slides appear in real-time as you chat. It's like having a designer on call at 2am. A really fast designer."
              rotate={-1}
              tape={true}
            />
            <FeatureCard
              icon={PieChart}
              title="Auto Charts"
              body="Paste your data and it makes a beautiful chart. No Excel, no crying. Just ✨."
              rotate={1}
              postit={true}
            />
            <FeatureCard
              icon={LayoutTemplate}
              title="Smart Layouts"
              body="The AI picks the perfect layout for each slide. Different content, different look. Always intentional."
              rotate={-0.5}
              tape={true}
            />
            <FeatureCard
              icon={Download}
              title="Export Anywhere"
              body="PDF, PPTX, or live link. Share it, present it, email it. We don't judge."
              rotate={0.5}
            />
            <FeatureCard
              icon={Zap}
              title="Blazing Fast"
              body="From blank prompt to full deck in under 30 seconds. Seriously. We timed it."
              rotate={-1}
              postit={true}
            />
            <FeatureCard
              icon={CheckCircle2}
              title="Actually Editable"
              body="Full element-level control. Click anything, change anything. It's yours once it's made."
              rotate={1}
              tape={true}
            />
          </div>
        </section>

        {/* ── Workflow ── */}
        <section
          id="workflow"
          className="py-20 border-y-[3px] border-dashed border-[#2d2d2d]"
          style={{ background: "rgba(229, 224, 216, 0.3)" }}
        >
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex flex-col items-center mb-14">
              <div
                className="inline-block px-4 py-1 text-sm bg-[#ff4d4d] text-white mb-4 shadow-[3px_3px_0px_0px_#2d2d2d]"
                style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive", transform: "rotate(1deg)" }}
              >
                How It Works
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-center" style={{ fontFamily: "Kalam, cursive" }}>
                Four steps.{" "}
                <span className="text-[#ff4d4d]">Infinite results.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Squiggly connector (desktop only) */}
              <div className="hidden md:block absolute top-10 left-[22%] right-[22%] z-0 pointer-events-none">
                <svg viewBox="0 0 300 20" width="100%" height="20">
                  <path
                    d="M0,10 Q25,2 50,10 Q75,18 100,10 Q125,2 150,10 Q175,18 200,10 Q225,2 250,10 Q275,18 300,10"
                    stroke="#2d2d2d"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <StepCard num="01" icon={Search} title="Research" body="Pulls from the web & your context to understand the topic." />
              <StepCard num="02" icon={FileText} title="Outline" body="Structures the narrative automatically. No blank page panic." />
              <StepCard num="03" icon={LayoutTemplate} title="Design" body="Picks cinematic layouts, charts, and visual hierarchy." />
              <StepCard num="04" icon={Presentation} title="Present" body="Speaker notes included. Just show up and present." />
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="max-w-5xl mx-auto px-6 py-20">
          <div className="flex flex-col items-center mb-14">
            <div
              className="inline-block px-4 py-1 text-sm bg-[#2d5da1] text-white mb-4 shadow-[3px_3px_0px_0px_#2d2d2d]"
              style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive", transform: "rotate(-0.5deg)" }}
            >
              Got Questions?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-center" style={{ fontFamily: "Kalam, cursive" }}>
              Frequently asked stuff
            </h2>
          </div>

          <div
            className="bg-white border-[3px] border-[#2d2d2d] shadow-[6px_6px_0px_0px_#2d2d2d] p-6 md:p-10"
            style={{ borderRadius: R.wobblyCard }}
          >
            <Accordion type="single" collapsible className="w-full">
              {[
                [
                  "Is Orivox just another AI wrapper? 🤨",
                  "Nope! Orivox is a custom-built rendering engine and AI pipeline built specifically for presentations. It doesn't just generate text — it builds interactive, editable slides with real layouts and charts.",
                ],
                [
                  "Can I edit slides after they're generated? ✏️",
                  "100%. Full element-level control. Click anything, change anything. Colors, fonts, content — it's all yours.",
                ],
                [
                  "How fast is it actually? ⚡",
                  "We're talking under 30 seconds for a full deck. Sometimes less. We genuinely timed it.",
                ],
                [
                  "What export formats do you support? 📤",
                  "PDF, PowerPoint (PPTX), and shareable live web links. We've got you covered.",
                ],
                [
                  "Is my data used to train AI models? 🔒",
                  "Absolutely not. Your data is yours. We never use your presentations to train our models.",
                ],
              ].map(([q, a], i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-b-[2px] border-dashed border-[#e5e0d8] last:border-0"
                >
                  <AccordionTrigger
                    className="text-left py-5 hover:no-underline hover:text-[#ff4d4d] transition-colors"
                    style={{ fontFamily: "Kalam, cursive", fontSize: "1.1rem" }}
                  >
                    {q}
                  </AccordionTrigger>
                  <AccordionContent
                    className="text-base text-[#4a4440] pb-5 leading-relaxed"
                    style={{ fontFamily: "Patrick Hand, cursive" }}
                  >
                    {a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-24 border-t-[3px] border-dashed border-[#2d2d2d] bg-[#2d2d2d]">
          <div className="max-w-3xl mx-auto px-6 text-center flex flex-col items-center gap-8">
            {/* Decorative scribble */}
            <div
              className="w-20 h-20 bg-[#fff9c4] border-[3px] border-[#fdfbf7] flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_#ff4d4d] animate-gentle-bounce"
              style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
            >
              🎉
            </div>

            <h2
              className="text-5xl md:text-7xl font-bold text-[#fdfbf7] leading-tight"
              style={{ fontFamily: "Kalam, cursive" }}
            >
              The end of{" "}
              <span className="text-[#ff4d4d]">boring.</span>
            </h2>

            <p className="text-xl text-[#e5e0d8] max-w-lg" style={{ fontFamily: "Patrick Hand, cursive" }}>
              Stop spending hours on slides that nobody reads. Spend 30 seconds on Orivox instead. Your time is worth more.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/auth">
                <div
                  className="inline-flex items-center gap-2 px-8 py-4 text-xl font-bold bg-[#ff4d4d] text-white border-[3px] border-[#fdfbf7] shadow-[4px_4px_0px_0px_#fdfbf7] hover:shadow-[2px_2px_0px_0px_#fdfbf7] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-100 cursor-pointer"
                  style={{ borderRadius: R.wobblyBtn, fontFamily: "Kalam, cursive" }}
                >
                  Start for free <ArrowRight size={20} strokeWidth={2.5} />
                </div>
              </Link>
              <Link to="/auth">
                <div
                  className="inline-flex items-center gap-2 px-8 py-4 text-xl font-bold bg-transparent text-[#fdfbf7] border-[3px] border-[#fdfbf7] shadow-[4px_4px_0px_0px_rgba(253,251,247,0.3)] hover:shadow-[2px_2px_0px_0px_rgba(253,251,247,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100 cursor-pointer"
                  style={{ borderRadius: R.wobblyBtn, fontFamily: "Kalam, cursive" }}
                >
                  See pricing <ChevronDown size={20} strokeWidth={2.5} />
                </div>
              </Link>
            </div>

            <p className="text-sm text-[#6b6460]" style={{ fontFamily: "Patrick Hand, cursive" }}>
              No credit card required · Free plan forever · Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#2d2d2d] border-t-[3px] border-dashed border-[#4a4440] px-8 py-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="opacity-90 grayscale invert">
            <Logo />
          </div>
          <div className="flex items-center gap-8 text-[#e5e0d8] text-sm" style={{ fontFamily: "Patrick Hand, cursive" }}>
            {["Twitter", "GitHub", "Discord"].map((link) => (
              <a
                key={link}
                href="#"
                className="hover:text-[#ff4d4d] hover:line-through transition-all duration-100"
              >
                {link}
              </a>
            ))}
          </div>
          <div className="text-[#6b6460] text-sm" style={{ fontFamily: "Patrick Hand, cursive" }}>
            © 2026 Orivox Inc. — made with ✏️
          </div>
        </div>
      </footer>
    </div>
  );
}

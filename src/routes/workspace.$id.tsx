import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowUp,
  Play,
  Sparkles,
  Circle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { AIThinking } from "@/components/workspace/AIThinking";
import { AIAssistant, ElementSelectedPanel } from "@/components/workspace/RightPanels";
import { SlideCanvas } from "@/components/workspace/SlideCanvas";
import { useGenerationTimeline } from "@/hooks/useGenerationTimeline";
import { demoSlides, research, followUps } from "@/lib/mock";

const searchSchema = z.object({ prompt: z.string().optional() });

export const Route = createFileRoute("/workspace/$id")({
  head: () => ({ meta: [{ title: "Workspace — Orivox" }] }),
  validateSearch: searchSchema,
  component: Workspace,
});

type Message = { id: number; role: "user" | "ai"; text: string; ts: number; stream?: boolean };

function Workspace() {
  const { id } = Route.useParams();
  const { prompt } = Route.useSearch();
  const navigate = useNavigate();

  const seededPrompt =
    prompt || (id === "new" ? "" : "AI in healthcare, 2026 outlook, executive tone");
  const nextIdRef = useRef(1);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (!seededPrompt) return [];
    const uId = nextIdRef.current++;
    const aiId = nextIdRef.current++;
    return [
      { id: uId, role: "user", text: seededPrompt, ts: Date.now() },
      {
        id: aiId,
        role: "ai",
        text: "Got it. Researching the topic and drafting an outline now.",
        ts: Date.now() + 1,
        stream: true,
      },
    ];
  });
  const [selectedEl, setSelectedEl] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [composer, setComposer] = useState("");
  const [title, setTitle] = useState(seededPrompt ? "Untitled deck" : "New presentation");
  const [timelineOpen, setTimelineOpen] = useState(true);

  const active = messages.length > 0;
  const gen = useGenerationTimeline(active);

  useEffect(() => {
    if (gen.isReady) setTitle("AI in Healthcare");
  }, [gen.isReady]);

  const conversationRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    conversationRef.current?.scrollTo({
      top: conversationRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const uId = nextIdRef.current++;
    setMessages((m) => [...m, { id: uId, role: "user", text, ts: Date.now() }]);
    setComposer("");
    setTimeout(() => {
      const aiId = nextIdRef.current++;
      setMessages((m) => [
        ...m,
        {
          id: aiId,
          role: "ai",
          text: "On it — updating the deck now.",
          ts: Date.now(),
          stream: true,
        },
      ]);
    }, 600);
  };

  const rightMode: "thinking" | "assistant" | "selected" = selectedEl
    ? "selected"
    : gen.isReady
      ? "assistant"
      : "thinking";

  // How many slides are visible during generation
  const generatedCount = useMemo(() => {
    if (gen.isReady) return demoSlides.length;
    if (!gen.showSlides) return 0;
    return Math.min(demoSlides.length, 2 + (gen.showCharts ? 2 : 0) + (gen.showDiagrams ? 2 : 0));
  }, [gen.isReady, gen.showSlides, gen.showCharts, gen.showDiagrams]);
  const visibleSlides = demoSlides.slice(0, generatedCount);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Logo showWord={false} />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md bg-transparent px-2 py-1 text-sm outline-none focus:bg-white/5"
          />
          <StatusPill ready={gen.isReady} generating={active && !gen.isReady} />
        </div>
        <div className="flex items-center gap-2">
          {gen.showSlides && !gen.isReady && (
            <span className="hidden font-mono text-[11px] text-muted-foreground md:inline">
              {generatedCount} / {demoSlides.length} slides
            </span>
          )}
          <motion.button
            whileHover={{ scale: gen.isReady ? 1.02 : 1 }}
            onClick={() => navigate({ to: "/present/$id", params: { id } })}
            disabled={!gen.isReady}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition hover:border-white/25 disabled:opacity-40"
          >
            <Play className="h-3 w-3" /> Open Viewer
          </motion.button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Conversation — 18% */}
        <aside className="flex w-[18%] min-w-[280px] shrink-0 flex-col border-r border-border">
          <div className="flex-1 overflow-y-auto px-4 py-5" ref={conversationRef}>
            {/* Collapsible timeline */}
            {active && (
              <div className="mb-4 overflow-hidden rounded-xl border border-border bg-white/[0.02]">
                <button
                  onClick={() => setTimelineOpen((o) => !o)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left"
                >
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-electric" /> Generation timeline
                  </div>
                  {timelineOpen ? (
                    <ChevronUp className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {timelineOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 px-3 pb-3">
                        {gen.steps.map((s, i) => {
                          const st = gen.stepStatus(i);
                          return (
                            <div key={s} className="flex items-center gap-2 text-[11px]">
                              <span className="flex h-3.5 w-3.5 items-center justify-center">
                                {st === "done" && <Check className="h-3 w-3 text-electric" />}
                                {st === "active" && (
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-electric" />
                                )}
                                {st === "pending" && (
                                  <span className="h-1 w-1 rounded-full bg-white/20" />
                                )}
                              </span>
                              <span
                                className={
                                  st === "pending"
                                    ? "text-muted-foreground"
                                    : st === "active"
                                      ? "text-foreground"
                                      : "text-muted-foreground line-through decoration-white/10"
                                }
                              >
                                {s}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8, x: m.role === "user" ? 6 : -6 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 26 }}
                  className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "ai" ? (
                    <div className="max-w-[92%]">
                      <div className="mb-1.5 flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-electric to-violet">
                          <Sparkles className="h-2.5 w-2.5 text-background" />
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Orivox
                        </div>
                        <div className="text-[10px] text-muted-foreground/60">{formatTs(m.ts)}</div>
                      </div>
                      <div className="text-sm text-foreground/90">
                        {m.stream ? <StreamText text={m.text} /> : m.text}
                      </div>

                      {/* Citation chips on the first AI message */}
                      {i === 1 && gen.showResearch && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {research.slice(0, 3).map((r) => (
                            <span
                              key={r.title}
                              className="rounded-md border border-border bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-muted-foreground"
                            >
                              {r.source}
                            </span>
                          ))}
                        </div>
                      )}

                      {i === messages.length - 1 && gen.isReady && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {followUps.map((f) => (
                            <button
                              key={f}
                              onClick={() => send(f)}
                              className="rounded-full border border-border bg-white/[0.02] px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-electric/40 hover:bg-electric/5 hover:text-foreground"
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="max-w-[92%]">
                      <div className="rounded-2xl bg-white/[0.06] px-3.5 py-2 text-sm text-foreground">
                        {m.text}
                      </div>
                      <div className="mt-1 text-right text-[10px] text-muted-foreground/60">
                        {formatTs(m.ts)}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {messages.length === 0 && (
              <div className="mt-20 text-center text-sm text-muted-foreground">
                <Sparkles className="mx-auto mb-3 h-5 w-5 text-electric" />
                Describe a presentation to begin.
              </div>
            )}
          </div>

          <div className="border-t border-border p-3">
            <div className="glass flex items-end gap-2 rounded-xl p-2">
              <textarea
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(composer);
                  }
                }}
                placeholder="Ask Orivox to change anything..."
                rows={1}
                className="max-h-24 min-h-6 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => send(composer)}
                disabled={!composer.trim()}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background transition disabled:opacity-30"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* CENTER: Canvas — 64% */}
        <main
          className="flex flex-1 flex-col overflow-hidden bg-[oklch(0.14_0.008_270)]"
          onClick={() => setSelectedEl(null)}
        >
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="mx-auto max-w-4xl">
              {messages.length === 0 && (
                <div className="flex h-[60vh] items-center justify-center text-center text-muted-foreground">
                  <div>
                    <Sparkles className="mx-auto mb-3 h-6 w-6 text-electric" />
                    <div className="text-lg text-foreground/80">Describe your presentation.</div>
                    <div className="mt-1 text-sm">Your deck will grow here as Orivox works.</div>
                  </div>
                </div>
              )}

              {/* Research phase */}
              <AnimatePresence>
                {gen.showResearch && !gen.showSlides && (
                  <motion.div
                    key="research"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-6"
                  >
                    <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                      Sources
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {research.map((r, i) => (
                        <motion.div
                          key={r.title}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.12 }}
                          className="glass rounded-xl p-3"
                        >
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            {r.source} · {r.year}
                          </div>
                          <div className="mt-1 text-sm">{r.title}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Outline phase */}
              <AnimatePresence>
                {gen.showOutline && !gen.showSlides && (
                  <motion.div
                    key="outline"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-6"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        Outline
                      </div>
                      <button className="rounded-md border border-electric/40 bg-electric/10 px-2.5 py-1 text-[11px] text-electric transition hover:bg-electric/20">
                        Approve outline
                      </button>
                    </div>
                    <div className="space-y-2">
                      {demoSlides.map((s, i) => (
                        <motion.div
                          key={s.id}
                          layoutId={`slide-${s.id}`}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="glass flex items-center gap-3 rounded-xl px-4 py-3"
                        >
                          <div className="w-6 font-mono text-xs text-muted-foreground">
                            {String(i + 1).padStart(2, "0")}
                          </div>
                          <div className="text-sm">{s.title}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Slides phase */}
              {gen.showSlides && visibleSlides.length > 0 && (
                <>
                  <div className="mx-auto max-w-3xl">
                    {/* Slide progress */}
                    {!gen.isReady && (
                      <div className="mb-3 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Designing slides</span>
                        <span className="font-mono">
                          {generatedCount} / {demoSlides.length} generated
                        </span>
                      </div>
                    )}
                    <motion.div
                      key={visibleSlides[activeSlide]?.id}
                      layoutId={`slide-${visibleSlides[activeSlide]?.id}`}
                    >
                      <SlideCanvas
                        slide={visibleSlides[activeSlide]}
                        onSelect={setSelectedEl}
                        selected={selectedEl}
                      />
                    </motion.div>
                    {gen.showNotes && visibleSlides[activeSlide]?.notes && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 rounded-xl border border-border bg-white/[0.02] p-3 text-xs text-muted-foreground"
                      >
                        <span className="mr-1.5 text-foreground/70">Notes:</span>{" "}
                        {visibleSlides[activeSlide]?.notes}
                      </motion.div>
                    )}
                  </div>

                  {/* Filmstrip */}
                  <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-2">
                    {demoSlides.map((s, i) => {
                      const shown = i < visibleSlides.length;
                      return (
                        <motion.button
                          key={s.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (shown) setActiveSlide(i);
                          }}
                          className={`relative aspect-video w-28 shrink-0 overflow-hidden rounded-md border transition ${
                            i === activeSlide && shown ? "border-electric/60" : "border-border"
                          } ${shown ? "opacity-100" : "opacity-40"}`}
                        >
                          {shown ? (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-2">
                              <div className="line-clamp-2 text-[9px] text-white/60">{s.title}</div>
                            </div>
                          ) : (
                            <div className="relative flex h-full items-center justify-center bg-white/[0.02]">
                              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                              <Circle className="h-3 w-3 text-white/20" />
                            </div>
                          )}
                          <div className="absolute left-1 top-1 rounded bg-black/40 px-1 font-mono text-[8px] text-white/70">
                            {i + 1}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Success card */}
                  <AnimatePresence>
                    {gen.isReady && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 220, damping: 26, delay: 0.2 }}
                        className="glass mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl p-5"
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 18,
                              delay: 0.35,
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/15"
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          </motion.div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Presentation ready</div>
                            <div className="text-xs text-muted-foreground">
                              Reviewed and ready to present.
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            onClick={() => navigate({ to: "/present/$id", params: { id } })}
                            className="flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background transition hover:opacity-90"
                          >
                            <Play className="h-3 w-3" /> Open Viewer
                          </motion.button>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                          {[
                            { label: "Slides", value: demoSlides.length.toString() },
                            { label: "Sources", value: research.length.toString() },
                            { label: "Charts", value: "2" },
                          ].map((s) => (
                            <div
                              key={s.label}
                              className="rounded-xl border border-border bg-white/[0.02] py-2.5"
                            >
                              <div className="font-mono text-lg text-foreground">{s.value}</div>
                              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                {s.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT: Morphing panel — 18% */}
        <aside className="w-[18%] min-w-[280px] shrink-0 border-l border-border">
          <div className="flex h-full flex-col p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={rightMode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex h-full flex-col"
              >
                {rightMode === "thinking" && (
                  <AIThinking steps={gen.steps} status={gen.stepStatus} />
                )}
                {rightMode === "assistant" && <AIAssistant />}
                {rightMode === "selected" && selectedEl && (
                  <ElementSelectedPanel
                    element={selectedEl}
                    onDeselect={() => setSelectedEl(null)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatusPill({ ready, generating }: { ready: boolean; generating: boolean }) {
  const label = ready ? "Ready" : generating ? "Generating" : "Idle";
  const color = ready ? "text-emerald-400" : generating ? "text-electric" : "text-muted-foreground";
  const dot = ready ? "bg-emerald-400" : generating ? "bg-electric animate-pulse" : "bg-white/30";
  return (
    <motion.div
      layout
      className={`ml-2 flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[10px] ${color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </motion.div>
  );
}

function formatTs(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function StreamText({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, 14);
    return () => window.clearInterval(id);
  }, [text]);
  return (
    <span>
      {text.slice(0, n)}
      {n < text.length && (
        <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-electric/70" />
      )}
    </span>
  );
}

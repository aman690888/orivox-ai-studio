import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowUp, Play, Sparkles, X, Circle } from "lucide-react";
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

type Message = { role: "user" | "ai"; text: string; ts: number };

function Workspace() {
  const { id } = Route.useParams();
  const { prompt } = Route.useSearch();
  const navigate = useNavigate();

  const seededPrompt = prompt || (id === "new" ? "" : "AI in healthcare, 2026 outlook, executive tone");
  const [messages, setMessages] = useState<Message[]>(() =>
    seededPrompt
      ? [
          { role: "user", text: seededPrompt, ts: Date.now() },
          { role: "ai", text: "Got it. Researching the topic and drafting an outline now.", ts: Date.now() + 1 },
        ]
      : []
  );
  const [selectedEl, setSelectedEl] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [composer, setComposer] = useState("");
  const [title, setTitle] = useState(seededPrompt ? "Untitled deck" : "New presentation");

  const active = messages.length > 0;
  const gen = useGenerationTimeline(active);

  useEffect(() => {
    if (gen.isReady) setTitle("AI in Healthcare");
  }, [gen.isReady]);

  const conversationRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    conversationRef.current?.scrollTo({ top: conversationRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text, ts: Date.now() }]);
    setComposer("");
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: "Updating the deck now.", ts: Date.now() }]);
    }, 600);
  };

  const rightMode: "thinking" | "assistant" | "selected" = selectedEl
    ? "selected"
    : gen.isReady
    ? "assistant"
    : "thinking";

  const visibleSlides = gen.isReady
    ? demoSlides
    : gen.showSlides
    ? demoSlides.slice(0, Math.min(demoSlides.length, 2 + (gen.showCharts ? 2 : 0) + (gen.showDiagrams ? 2 : 0)))
    : [];

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          <Link to="/home" className="flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Logo showWord={false} />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md bg-transparent px-2 py-1 text-sm outline-none focus:bg-white/5"
          />
          <StatusPill ready={gen.isReady} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ to: "/present/$id", params: { id } })}
            disabled={!gen.isReady}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition hover:border-white/25 disabled:opacity-40"
          >
            <Play className="h-3 w-3" /> Open Viewer
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Conversation */}
        <aside className="flex w-[360px] shrink-0 flex-col border-r border-border">
          <div className="flex-1 overflow-y-auto px-4 py-5" ref={conversationRef}>
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={m.ts}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "ai" ? (
                    <div className="max-w-[85%] text-sm text-foreground/90">
                      <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                        <Sparkles className="h-2.5 w-2.5 text-electric" /> Orivox
                      </div>
                      <div>{m.text}</div>
                      {i === messages.length - 1 && gen.isReady && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {followUps.map((f) => (
                            <button
                              key={f}
                              onClick={() => send(f)}
                              className="rounded-full border border-border bg-white/[0.02] px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-white/20 hover:text-foreground"
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="max-w-[85%] rounded-2xl bg-white/[0.06] px-3.5 py-2 text-sm text-foreground">
                      {m.text}
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

        {/* CENTER: Canvas */}
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
                    <div className="text-lg text-foreground/80">Your deck will grow here.</div>
                    <div className="mt-1 text-sm">Start a conversation on the left.</div>
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
                    <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Sources</div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {research.map((r, i) => (
                        <motion.div
                          key={r.title}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.12 }}
                          className="glass rounded-xl p-3"
                        >
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{r.source} · {r.year}</div>
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
                    <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Outline</div>
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
                          <div className="w-6 font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</div>
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
                    <motion.div key={visibleSlides[activeSlide]?.id} layoutId={`slide-${visibleSlides[activeSlide]?.id}`}>
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
                        <span className="mr-1.5 text-foreground/70">Notes:</span> {visibleSlides[activeSlide]?.notes}
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
                            <div className="flex h-full animate-pulse items-center justify-center bg-white/[0.02]">
                              <Circle className="h-3 w-3 text-white/20" />
                            </div>
                          )}
                          <div className="absolute left-1 top-1 rounded bg-black/40 px-1 font-mono text-[8px] text-white/70">{i + 1}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT: Morphing panel */}
        <aside className="w-[340px] shrink-0 border-l border-border">
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
                {rightMode === "thinking" && <AIThinking steps={gen.steps} status={gen.stepStatus} />}
                {rightMode === "assistant" && <AIAssistant />}
                {rightMode === "selected" && selectedEl && (
                  <ElementSelectedPanel element={selectedEl} onDeselect={() => setSelectedEl(null)} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatusPill({ ready }: { ready: boolean }) {
  return (
    <div className={`ml-2 flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[10px] ${ready ? "text-emerald-400" : "text-electric"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ready ? "bg-emerald-400" : "bg-electric animate-pulse"}`} />
      {ready ? "Ready" : "Generating"}
    </div>
  );
}

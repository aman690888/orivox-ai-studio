import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
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
  Cloud,
  CloudLightning,
  CloudOff,
  RefreshCw,
  Layout,
  MousePointer2,
  Type,
  Image as ImageIcon,
  MessageSquare
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { AIThinking } from "@/components/workspace/AIThinking";
import { AIAssistant, ElementSelectedPanel } from "@/components/workspace/RightPanels";
import { SlideCanvas } from "@/components/workspace/SlideCanvas";
import { useGenerationTimeline } from "@/hooks/useGenerationTimeline";
import { Slide } from "@/lib/mock";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPresentation,
  createPresentation,
  updatePresentation,
} from "@/lib/database/presentations";
import { getSlides, saveSlides } from "@/lib/database/slides";
import { usePresentationSync } from "@/hooks/usePresentationSync";
import { generateFullPresentation } from "@/lib/ai";

const searchSchema = z.object({ prompt: z.string().optional() });

export const Route = createFileRoute("/workspace/$id")({
  head: () => ({ meta: [{ title: "Workspace — Orivox" }] }),
  validateSearch: searchSchema,
  component: Workspace,
});

type Message = { id: number; role: "user" | "ai"; text: string; ts: number; stream?: boolean };

function SaveStatusIndicator({
  status,
  isOnline,
  onRetry,
}: {
  status: "idle" | "saving" | "saved" | "failed";
  isOnline: boolean;
  onRetry: () => void;
}) {
  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
        <CloudOff className="h-3.5 w-3.5" />
        <span>Offline</span>
      </div>
    );
  }

  if (status === "saving") {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/5">
        <RefreshCw className="h-3 w-3 animate-spin text-electric" />
        <span>Saving</span>
      </div>
    );
  }

  if (status === "saved") {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md border border-emerald-400/20">
        <Cloud className="h-3.5 w-3.5" />
        <span>Saved</span>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 text-[11px] font-medium text-rose-400 bg-rose-400/15 px-2.5 py-1 rounded-md border border-rose-400/30 transition hover:bg-rose-400/25"
        title="Click to retry saving"
      >
        <CloudLightning className="h-3.5 w-3.5 animate-bounce" />
        <span>Failed (Retry)</span>
      </button>
    );
  }

  return null;
}

function StatusPill({ ready, generating }: { ready: boolean; generating: boolean }) {
  if (generating) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-electric/10 border border-electric/30 px-2.5 py-1">
         <div className="h-1.5 w-1.5 rounded-full bg-electric animate-pulse" />
         <span className="text-[10px] font-bold uppercase tracking-widest text-electric">Generating</span>
      </div>
    );
  }
  return null;
}

function formatTs(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function StreamText({ text }: { text: string }) {
  return <span>{text}</span>;
}


function Workspace() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { id } = Route.useParams();
  const { prompt } = Route.useSearch();

  const seededPrompt = prompt || "";

  // Real-time queries
  const {
    data: dbPresentation,
    isLoading: isPresLoading,
    error: presError,
  } = useQuery({
    queryKey: ["presentation", id],
    queryFn: () => getPresentation(id),
    enabled: id !== "new" && !!user?.id,
  });

  const { data: dbSlides, isLoading: isSlidesLoading } = useQuery({
    queryKey: ["slides", id],
    queryFn: () => getSlides(id),
    enabled: id !== "new" && !!user?.id,
  });

  const [slides, setSlides] = useState<Slide[]>([]);
  const [title, setTitle] = useState("New presentation");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const generationStarted = useRef(false);
  const creationStarted = useRef(false);
  const [effectivePrompt, setEffectivePrompt] = useState(seededPrompt);

  const { sync, retry, status: saveStatus, isOnline } = usePresentationSync(id);

  const renderSlidesList = slides;

  useEffect(() => {
    if (dbSlides) {
      setSlides(dbSlides);
    }
  }, [dbSlides]);

  useEffect(() => {
    if (dbPresentation) {
      setTitle(dbPresentation.title);
      if (!seededPrompt) {
        try {
          const meta = JSON.parse(dbPresentation.description ?? "");
          if (typeof meta?.prompt === "string" && meta.prompt) {
            setEffectivePrompt(meta.prompt);
          }
        } catch {}
      }
    }
  }, [dbPresentation, seededPrompt]);

  useEffect(() => {
    if (isSlidesLoading || !dbPresentation || !effectivePrompt || id === "new" || !user?.id) return;
    
    const hasExistingSlides = dbSlides && dbSlides.length > 0;
    const isCompleted = dbPresentation.status === "completed";
    
    if (isCompleted || hasExistingSlides) return;
    if (generationStarted.current) return;

    generationStarted.current = true;

    const startGeneration = async () => {
      setIsGenerating(true);
      setGenerationError(null);

      try {
        const result = await generateFullPresentation(effectivePrompt, {
          config: { provider: "gemini" },
        });

        const savedSlides = await saveSlides(id, result.slides);

        const updates: any = { status: "completed" };
        if (result.title) {
          updates.title = result.title;
          setTitle(result.title);
        }
        await updatePresentation(id, updates);

        setSlides(savedSlides);

        queryClient.invalidateQueries({ queryKey: ["slides", id] });
        queryClient.invalidateQueries({ queryKey: ["presentation", id] });

      } catch (err) {
        setGenerationError(
          err instanceof Error ? err.message : "Generation failed. Please retry."
        );
      } finally {
        setIsGenerating(false);
      }
    };

    startGeneration();
  }, [id, effectivePrompt, user?.id, dbPresentation, dbSlides, isSlidesLoading, queryClient]);

  useEffect(() => {
    const initNew = async () => {
      if (id === "new" && user?.id && !creationStarted.current) {
        creationStarted.current = true;
        try {
          const presentationTitle = seededPrompt
            ? seededPrompt.length > 50
              ? seededPrompt.slice(0, 50) + "..."
              : seededPrompt
            : "Untitled Presentation";

          const descriptionMeta = JSON.stringify({ prompt: seededPrompt || null });

          const newPres = await createPresentation(
            user.id,
            presentationTitle,
            "Research",
            "electric",
            descriptionMeta,
          );

          navigate({
            to: "/workspace/$id",
            params: { id: newPres.id },
            search: { prompt },
          });
        } catch (err) {}
      }
    };
    initNew();
  }, [id, user, seededPrompt, prompt, navigate]);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [user, loading, navigate]);

  const nextIdRef = useRef(1);
  const conversationRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const messagesSeeded = useRef(false);
  useEffect(() => {
    if (isPresLoading || isSlidesLoading || !dbPresentation || !effectivePrompt || messagesSeeded.current) return;
    messagesSeeded.current = true;
    
    const isExisting = dbPresentation.status === "completed" || (dbSlides && dbSlides.length > 0);
    
    const uId = nextIdRef.current++;
    const aiId = nextIdRef.current++;
    
    if (isExisting) {
      setMessages([
        { id: uId, role: "user", text: effectivePrompt, ts: Date.now() },
        { id: aiId, role: "ai", text: "Presentation loaded.", ts: Date.now() + 1 },
      ]);
    } else {
      setMessages([
        { id: uId, role: "user", text: effectivePrompt, ts: Date.now() },
        {
          id: aiId,
          role: "ai",
          text: "Got it. Researching the topic and drafting an outline now.",
          ts: Date.now() + 1,
          stream: true,
        },
      ]);
    }
  }, [effectivePrompt, isPresLoading, isSlidesLoading, dbPresentation, dbSlides]);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);

  const [selectedEl, setSelectedEl] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [composer, setComposer] = useState("");
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);

  const isExistingPresentation = dbPresentation?.status === "completed" || (dbSlides && dbSlides.length > 0);
  
  const active = effectivePrompt.length > 0 && !isExistingPresentation;
  const generationCompleted = (active && !isGenerating && generationStarted.current) || false;
  const gen = useGenerationTimeline(active && isGenerating, generationCompleted || !!isExistingPresentation);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (id !== "new") {
      sync({ title: newTitle, slides: renderSlidesList });
    }
  };

  const handleSlideChange = (updatedFields: Partial<Slide>) => {
    const updatedSlides = renderSlidesList.map((s, index) =>
      index === activeSlide ? { ...s, ...updatedFields } : s,
    );
    setSlides(updatedSlides);
    if (id !== "new") {
      sync({ title, slides: updatedSlides });
    }
  };

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

  const generatedCount = useMemo(() => {
    if (gen.isReady) return renderSlidesList.length;
    if (!gen.showSlides) return 0;
    return Math.min(
      renderSlidesList.length,
      2 + (gen.showCharts ? 2 : 0) + (gen.showDiagrams ? 2 : 0),
    );
  }, [gen.isReady, gen.showSlides, gen.showCharts, gen.showDiagrams, renderSlidesList]);

  const visibleSlides = renderSlidesList.slice(0, generatedCount);

  if (loading || isPresLoading || isSlidesLoading || id === "new") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-electric border-t-transparent shadow-[0_0_15px_var(--electric)]" />
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Setting up workspace...</span>
        </div>
      </div>
    );
  }

  if (presError || !dbPresentation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <h1 className="text-xl font-bold text-foreground">Presentation not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The presentation you are trying to access doesn't exist or you don't have access.
        </p>
        <Link
          to="/home"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90 shadow-lg"
        >
          Return Home
        </Link>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#E5E5E5] dark:bg-[#0E0E10]">
      {/* Studio Top Toolbar */}
      <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl px-4 z-20">
        <div className="flex items-center gap-6">
          <Link
            to="/home"
            className="flex items-center justify-center h-8 w-8 rounded-lg text-black/50 hover:text-black dark:text-white/50 hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          
          <div className="flex items-center gap-3">
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="rounded-md bg-transparent px-2 py-1 text-sm font-semibold text-black dark:text-white outline-none hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/5 transition-colors max-w-[200px] sm:max-w-[300px]"
            />
            {id !== "new" && (
              <SaveStatusIndicator status={saveStatus} isOnline={isOnline} onRetry={retry} />
            )}
          </div>
        </div>

        {/* Central Tools */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-lg p-1 border border-black/5 dark:border-white/5">
           <button className="p-1.5 rounded-md hover:bg-white dark:hover:bg-black text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white shadow-sm transition-all">
             <MousePointer2 className="w-4 h-4" />
           </button>
           <button className="p-1.5 rounded-md hover:bg-white dark:hover:bg-black text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all">
             <Layout className="w-4 h-4" />
           </button>
           <button className="p-1.5 rounded-md hover:bg-white dark:hover:bg-black text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all">
             <Type className="w-4 h-4" />
           </button>
           <button className="p-1.5 rounded-md hover:bg-white dark:hover:bg-black text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all">
             <ImageIcon className="w-4 h-4" />
           </button>
        </div>

        <div className="flex items-center gap-3">
          <StatusPill ready={gen.isReady} generating={active && !gen.isReady} />
          <button 
             onClick={() => setIsChatOpen(!isChatOpen)}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isChatOpen ? 'bg-electric/10 text-electric border border-electric/20' : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10'}`}
          >
             <MessageSquare className="w-3.5 h-3.5" /> AI Chat
          </button>
          <motion.button
            whileHover={{ scale: gen.isReady ? 1.02 : 1 }}
            onClick={() => navigate({ to: "/present/$id", params: { id } })}
            disabled={!gen.isReady}
            className="flex items-center gap-1.5 rounded-lg bg-black dark:bg-white px-4 py-1.5 text-xs font-semibold text-white dark:text-black transition hover:opacity-90 disabled:opacity-40 shadow-md"
          >
            <Play className="h-3 w-3" /> Present
          </motion.button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Floating Chat Panel */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute left-4 top-4 bottom-4 w-[280px] z-10 flex flex-col rounded-2xl bg-white/90 dark:bg-[#151515]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-4 py-5" ref={conversationRef}>
                {active && (
                  <div className="mb-4 overflow-hidden rounded-xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
                    <button
                      onClick={() => setTimelineOpen((o) => !o)}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60">
                        <Sparkles className="h-3.5 w-3.5 text-electric" /> Timeline
                      </div>
                      {timelineOpen ? (
                        <ChevronUp className="h-3.5 w-3.5 text-black/40 dark:text-white/40" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-black/40 dark:text-white/40" />
                      )}
                    </button>
                    <AnimatePresence initial={false}>
                      {timelineOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1.5 px-3 pb-3">
                            {gen.steps.map((s, i) => {
                              const st = gen.stepStatus(i);
                              return (
                                <div key={s} className="flex items-center gap-2 text-[11px] font-medium">
                                  <span className="flex h-4 w-4 items-center justify-center">
                                    {st === "done" && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                                    {st === "active" && (
                                      <span className="h-2 w-2 animate-pulse rounded-full bg-electric" />
                                    )}
                                    {st === "pending" && (
                                      <span className="h-1.5 w-1.5 rounded-full bg-black/20 dark:bg-white/20" />
                                    )}
                                  </span>
                                  <span
                                    className={
                                      st === "pending"
                                        ? "text-black/40 dark:text-white/40"
                                        : st === "active"
                                          ? "text-black dark:text-white"
                                          : "text-black/40 dark:text-white/40 line-through decoration-black/20 dark:decoration-white/20"
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
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8, x: m.role === "user" ? 6 : -6 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {m.role === "ai" ? (
                        <div className="max-w-[90%]">
                          <div className="mb-1.5 flex items-center gap-1.5">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-electric to-violet shadow-sm">
                              <Sparkles className="h-2.5 w-2.5 text-white" />
                            </div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50">
                              Orivox
                            </div>
                            <div className="text-[9px] text-black/40 dark:text-white/40">{formatTs(m.ts)}</div>
                          </div>
                          <div className="text-[13px] leading-relaxed text-black/80 dark:text-white/80">
                            {m.stream ? <StreamText text={m.text} /> : m.text}
                          </div>
                        </div>
                      ) : (
                        <div className="max-w-[90%]">
                          <div className="rounded-2xl rounded-tr-sm bg-black dark:bg-white px-3 py-2 text-[13px] text-white dark:text-black shadow-sm">
                            {m.text}
                          </div>
                          <div className="mt-1 text-right text-[9px] text-black/40 dark:text-white/40">
                            {formatTs(m.ts)}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {messages.length === 0 && (
                  <div className="mt-20 text-center text-sm text-black/50 dark:text-white/50">
                    <Sparkles className="mx-auto mb-3 h-5 w-5 text-electric opacity-50" />
                    Describe a presentation to begin.
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-black/5 dark:border-white/10 bg-white dark:bg-black/20">
                <div className="flex items-end gap-2 rounded-xl bg-black/5 dark:bg-white/5 p-1.5 border border-black/5 dark:border-white/5 focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors">
                  <textarea
                    value={composer}
                    onChange={(e) => setComposer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(composer);
                      }
                    }}
                    placeholder="Ask Orivox..."
                    rows={1}
                    className="max-h-24 min-h-[28px] flex-1 resize-none bg-transparent px-2 py-1 text-xs outline-none placeholder:text-black/40 dark:placeholder:text-white/40 text-black dark:text-white"
                  />
                  <button
                    onClick={() => send(composer)}
                    disabled={!composer.trim()}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-electric text-white transition disabled:opacity-30 disabled:grayscale"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Canvas Area */}
        <main
          className="flex-1 h-full overflow-y-auto w-full relative"
          onClick={() => setSelectedEl(null)}
        >
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

          <div className="relative min-h-full flex flex-col items-center justify-start py-12 px-8">
            <div className="w-full max-w-5xl">
              {messages.length === 0 && (
                <div className="flex h-[60vh] items-center justify-center text-center">
                  <div className="bg-white/50 dark:bg-black/50 backdrop-blur-xl p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-xl">
                    <Sparkles className="mx-auto mb-4 h-8 w-8 text-electric" />
                    <div className="text-xl font-bold text-black dark:text-white">Start creating</div>
                    <div className="mt-2 text-sm text-black/60 dark:text-white/60 max-w-xs">Your presentation canvas is ready. Use the AI chat to generate your first draft.</div>
                  </div>
                </div>
              )}

              {generationError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-600 dark:text-rose-400 shadow-sm"
                >
                  Failed: {generationError}
                </motion.div>
              )}

              <AnimatePresence>
                {gen.showOutline && !gen.showSlides && (
                  <motion.div
                    key="outline"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-8 bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-3xl border border-black/5 dark:border-white/5 p-6 shadow-xl"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-widest text-black/50 dark:text-white/50">
                        Proposed Outline
                      </div>
                      <button className="rounded-lg bg-electric/10 px-3 py-1.5 text-[11px] font-bold text-electric transition hover:bg-electric/20">
                        Approve
                      </button>
                    </div>
                    <div className="space-y-3">
                      {renderSlidesList.map((s, i) => (
                        <motion.div
                          key={s.id}
                          layoutId={`slide-${s.id}`}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-center gap-4 rounded-xl border border-black/5 dark:border-white/5 bg-white dark:bg-white/[0.02] px-4 py-3.5 shadow-sm"
                        >
                          <div className="w-8 font-mono text-xs font-bold text-black/30 dark:text-white/30">
                            {String(i + 1).padStart(2, "0")}
                          </div>
                          <div className="text-sm font-semibold text-black dark:text-white">{s.title}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {gen.showSlides && visibleSlides.length > 0 && (
                <div className="flex flex-col items-center w-full">
                  {!gen.isReady && (
                    <div className="mb-4 flex w-full max-w-4xl items-center justify-between text-[11px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50">
                      <span>Rendering canvas</span>
                      <span className="font-mono bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                        {generatedCount} / {renderSlidesList.length}
                      </span>
                    </div>
                  )}
                  
                  <div className="w-full max-w-4xl relative group">
                    <motion.div
                      key={visibleSlides[activeSlide]?.id}
                      layoutId={`slide-${visibleSlides[activeSlide]?.id}`}
                      className="shadow-2xl rounded-xl overflow-hidden border border-black/10 dark:border-white/10 ring-4 ring-black/5 dark:ring-white/5 bg-white"
                    >
                      <SlideCanvas
                        slide={visibleSlides[activeSlide]}
                        onSelect={setSelectedEl}
                        selected={selectedEl}
                        onSlideChange={handleSlideChange}
                      />
                    </motion.div>
                  </div>

                  {/* Modern Filmstrip */}
                  <div className="mt-12 w-full max-w-5xl bg-white/50 dark:bg-black/30 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-xl">
                    <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2 px-2 snap-x">
                      {renderSlidesList.map((s, i) => {
                        const shown = i < visibleSlides.length;
                        return (
                          <motion.button
                            key={s.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (shown) setActiveSlide(i);
                            }}
                            className={`relative aspect-video w-40 shrink-0 snap-center overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                              i === activeSlide && shown ? "border-electric scale-105 shadow-[0_0_15px_rgba(var(--electric-rgb),0.3)]" : "border-transparent hover:border-black/20 dark:hover:border-white/20"
                            } ${shown ? "opacity-100 bg-white dark:bg-white/5" : "opacity-40 bg-black/5 dark:bg-white/5"}`}
                          >
                            {shown ? (
                              <div className="flex h-full items-center justify-center p-3">
                                <div className="line-clamp-3 text-[10px] font-medium text-black/70 dark:text-white/70 leading-relaxed text-center">{s.title}</div>
                              </div>
                            ) : (
                              <div className="relative flex h-full items-center justify-center">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent" />
                                <Circle className="h-4 w-4 text-black/20 dark:text-white/20" />
                              </div>
                            )}
                            <div className={`absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold ${i === activeSlide ? 'bg-electric text-white' : 'bg-black/10 dark:bg-black/50 text-black/70 dark:text-white/70'}`}>
                              {i + 1}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

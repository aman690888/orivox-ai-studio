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
  ChevronDown,
  ChevronUp,
  Cloud,
  CloudLightning,
  CloudOff,
  RefreshCw,
  MessageSquare,
  X,
  Loader2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  History,
  Type,
  Bold,
  Italic,
  AlignLeft,
  Trash,
} from "lucide-react";
import { AIThinking } from "@/components/workspace/AIThinking";
import { AIAssistant, ElementSelectedPanel } from "@/components/workspace/RightPanels";
import { SlideCanvas } from "@/components/workspace/SlideCanvas";
import { useGenerationTimeline } from "@/hooks/useGenerationTimeline";
import { useEditorHistory } from "@/hooks/useEditorHistory";
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

const R = {
  tag: "4px 22px 6px 18px / 22px 6px 18px 4px",
  card: "6px 38px 6px 42px / 38px 6px 42px 6px",
  md: "8px 42px 12px 38px / 42px 12px 38px 8px",
  input: "4px 18px 4px 16px / 18px 4px 16px 4px",
};

// ─── Save Status ──────────────────────────────────────────────────────────────
function SaveStatusIndicator({
  status,
  isOnline,
  onRetry,
}: {
  status: "idle" | "saving" | "saved" | "failed";
  isOnline: boolean;
  onRetry: () => void;
}) {
  const base =
    "flex items-center gap-1.5 text-xs px-2.5 py-1 border-[2px] border-[#2d2d2d] font-bold";

  if (!isOnline)
    return (
      <div
        className={base}
        style={{ borderRadius: R.tag, background: "#fff9c4", fontFamily: "Kalam, cursive" }}
      >
        <CloudOff className="h-3.5 w-3.5" /> Offline
      </div>
    );
  if (status === "saving")
    return (
      <div
        className={base}
        style={{ borderRadius: R.tag, background: "#fdfbf7", fontFamily: "Kalam, cursive" }}
      >
        <RefreshCw className="h-3 w-3 animate-spin text-[#2d5da1]" /> Saving...
      </div>
    );
  if (status === "saved")
    return (
      <div
        className={base}
        style={{ borderRadius: R.tag, background: "#e5e0d8", fontFamily: "Kalam, cursive" }}
      >
        <Cloud className="h-3.5 w-3.5 text-[#2d5da1]" /> Saved ✓
      </div>
    );
  if (status === "failed")
    return (
      <button
        onClick={onRetry}
        className={`${base} cursor-pointer`}
        style={{
          borderRadius: R.tag,
          background: "#fff9c4",
          color: "#ff4d4d",
          fontFamily: "Kalam, cursive",
        }}
      >
        <CloudLightning className="h-3.5 w-3.5 animate-bounce" /> Failed — Retry
      </button>
    );
  return null;
}

function formatTs(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

// ─── Workspace ────────────────────────────────────────────────────────────────
function Workspace() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { id } = Route.useParams();
  const { prompt } = Route.useSearch();
  const seededPrompt = prompt || "";

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

  const {
    state: slides,
    pushState: setSlidesHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorHistory(dbSlides || []);

  const setSlides = useCallback((newSlides: Slide[] | ((prev: Slide[]) => Slide[])) => {
    setSlidesHistory((prev) => {
      const result = typeof newSlides === "function" ? newSlides(prev) : newSlides;
      return result;
    });
  }, [setSlidesHistory]);
  
  const [title, setTitle] = useState("New presentation");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(id === "new");
  const generationStarted = useRef(false);
  const creationStarted = useRef(false);
  const [effectivePrompt, setEffectivePrompt] = useState(seededPrompt);

  const { sync, retry, status: saveStatus, isOnline } = usePresentationSync(id);
  const renderSlidesList = slides;

  useEffect(() => {
    if (presError) {
      const msg = presError.message.toLowerCase();
      if (msg.includes("not found") || msg.includes("row not found") || msg.includes("406")) {
        navigate({ to: "/forbidden" }); // or 404 depending on error. We use forbidden to be safe for RLS.
      } else {
        // generic error, maybe throw to error boundary
        throw presError;
      }
    }
  }, [presError, navigate]);

  useEffect(() => {
    if (dbSlides) setSlides(dbSlides);
  }, [dbSlides]);

  useEffect(() => {
    if (dbPresentation) {
      setTitle(dbPresentation.title);
      if (!seededPrompt) {
        try {
          const meta = JSON.parse(dbPresentation.description ?? "");
          if (typeof meta?.prompt === "string" && meta.prompt) setEffectivePrompt(meta.prompt);
        } catch {}
      }
    }
  }, [dbPresentation, seededPrompt]);

  useEffect(() => {
    if (isSlidesLoading || !dbPresentation || !effectivePrompt || id === "new" || !user?.id) return;
    const hasExistingSlides = dbSlides && dbSlides.length > 0;
    const isCompleted = dbPresentation.status === "completed";
    if (isCompleted || hasExistingSlides || generationStarted.current) return;
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
        setGenerationError(err instanceof Error ? err.message : "Generation failed. Please retry.");
      } finally {
        setIsGenerating(false);
      }
    };
    startGeneration();
  }, [id, effectivePrompt, user?.id, dbPresentation, dbSlides, isSlidesLoading, queryClient]);

  useEffect(() => {
    const initNew = async () => {
      if (id !== "new" || !user?.id || creationStarted.current) return;
      creationStarted.current = true;
      setIsCreating(true);
      setInitError(null);
      try {
        const presentationTitle = seededPrompt
          ? seededPrompt.length > 50
            ? seededPrompt.slice(0, 50) + "..."
            : seededPrompt
          : "Untitled Presentation";
        const newPres = await createPresentation(
          user.id,
          presentationTitle,
          "Research",
          "electric",
          JSON.stringify({ prompt: seededPrompt || null }),
        );
        navigate({ to: "/workspace/$id", params: { id: newPres.id }, search: { prompt } });
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Could not create presentation. Check your connection and try again.";
        console.error("createPresentation failed:", err);
        setInitError(msg);
        setIsCreating(false);
        creationStarted.current = false; // allow retry
      }
    };
    initNew();
  }, [id, user, seededPrompt, prompt, navigate]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const nextIdRef = useRef(1);
  const conversationRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesSeeded = useRef(false);

  useEffect(() => {
    if (
      isPresLoading ||
      isSlidesLoading ||
      !dbPresentation ||
      !effectivePrompt ||
      messagesSeeded.current
    )
      return;
    messagesSeeded.current = true;
    const isExisting = dbPresentation.status === "completed" || (dbSlides && dbSlides.length > 0);
    const uId = nextIdRef.current++;
    const aiId = nextIdRef.current++;
    if (isExisting) {
      setMessages([
        { id: uId, role: "user", text: effectivePrompt, ts: Date.now() },
        {
          id: aiId,
          role: "ai",
          text: "Presentation loaded. Ask me to edit anything! ✏️",
          ts: Date.now() + 1,
        },
      ]);
    } else {
      setMessages([
        { id: uId, role: "user", text: effectivePrompt, ts: Date.now() },
        {
          id: aiId,
          role: "ai",
          text: "Got it! Researching the topic and drafting an outline now... ✨",
          ts: Date.now() + 1,
          stream: true,
        },
      ]);
    }
  }, [effectivePrompt, isPresLoading, isSlidesLoading, dbPresentation, dbSlides]);

  useEffect(() => {
    if (conversationRef.current)
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
  }, [messages]);

  const [selectedEl, setSelectedEl] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [composer, setComposer] = useState("");
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }
      
      // Slide navigation
      if (e.key === "ArrowRight" && !e.shiftKey && !e.metaKey && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        setActiveSlide(prev => Math.min(slides.length - 1, prev + 1));
      }
      if (e.key === "ArrowLeft" && !e.shiftKey && !e.metaKey && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        setActiveSlide(prev => Math.max(0, prev - 1));
      }

      // Deselect on Escape
      if (e.key === "Escape") {
        setSelectedEl(null);
        setContextMenu(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, slides.length]);

  const isExistingPresentation =
    dbPresentation?.status === "completed" || (dbSlides && dbSlides.length > 0);
  const active = effectivePrompt.length > 0 && !isExistingPresentation;
  const generationCompleted = (active && !isGenerating && generationStarted.current) || false;
  const gen = useGenerationTimeline(
    active && isGenerating,
    generationCompleted || !!isExistingPresentation,
  );

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (id !== "new") sync({ title: newTitle, slides: renderSlidesList });
  };

  const handleSlideChange = (updatedFields: Partial<Slide>) => {
    const updatedSlides = renderSlidesList.map((s, index) =>
      index === activeSlide ? { ...s, ...updatedFields } : s,
    );
    setSlides(updatedSlides);
    if (id !== "new") sync({ title, slides: updatedSlides });
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
          text: "On it — updating the deck now. ✏️",
          ts: Date.now(),
          stream: true,
        },
      ]);
    }, 600);
  };

  const generatedCount = useMemo(() => {
    if (gen.isReady) return renderSlidesList.length;
    if (!gen.showSlides) return 0;
    return Math.min(
      renderSlidesList.length,
      2 + (gen.showCharts ? 2 : 0) + (gen.showDiagrams ? 2 : 0),
    );
  }, [gen.isReady, gen.showSlides, gen.showCharts, gen.showDiagrams, renderSlidesList]);

  const visibleSlides = renderSlidesList.slice(0, generatedCount);

  // ── Init error state (createPresentation failed) ──
  if (initError) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
        style={{
          background: "#fdfbf7",
          backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div
          className="p-10 bg-white border-[3px] border-[#2d2d2d] shadow-[6px_6px_0px_0px_#ff4d4d] flex flex-col items-center gap-5 max-w-md"
          style={{ borderRadius: R.card }}
        >
          <div className="text-5xl">😬</div>
          <h1
            className="text-2xl font-bold text-[#2d2d2d]"
            style={{ fontFamily: "Kalam, cursive" }}
          >
            Couldn't create presentation
          </h1>
          <p className="text-sm text-[#6b6460]" style={{ fontFamily: "Patrick Hand, cursive" }}>
            {initError}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setInitError(null);
                creationStarted.current = false;
                setIsCreating(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-[#ff4d4d] text-white border-[2.5px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
              style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
            >
              Retry
            </button>
            <Link
              to="/home"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-[#2d2d2d] text-white border-[2.5px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] hover:bg-[#e5e0d8] hover:text-[#2d2d2d] hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
              style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
            >
              <ArrowLeft size={14} strokeWidth={2.5} /> Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading state (initial load OR creating a new presentation) ──
  if (loading || isPresLoading || isSlidesLoading || isCreating) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          background: "#fdfbf7",
          backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div
          className="flex flex-col items-center gap-4 p-10 bg-white border-[3px] border-[#2d2d2d] shadow-[6px_6px_0px_0px_#ff4d4d]"
          style={{ borderRadius: R.card }}
        >
          <div
            className="w-16 h-16 bg-[#fff9c4] border-[2px] border-[#2d2d2d] flex items-center justify-center text-3xl animate-bounce shadow-[3px_3px_0px_0px_#2d2d2d]"
            style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
          >
            ✏️
          </div>
          <p className="text-lg font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
            Setting up workspace...
          </p>
          <p className="text-sm text-[#6b6460]" style={{ fontFamily: "Patrick Hand, cursive" }}>
            Creating your presentation in Supabase...
          </p>
        </div>
      </div>
    );
  }

  // ── Presentation not found ──
  if (presError || !dbPresentation) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
        style={{
          background: "#fdfbf7",
          backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div
          className="p-10 bg-white border-[3px] border-[#2d2d2d] shadow-[6px_6px_0px_0px_#ff4d4d] flex flex-col items-center gap-5"
          style={{ borderRadius: R.card }}
        >
          <div className="text-5xl">😬</div>
          <h1
            className="text-2xl font-bold text-[#2d2d2d]"
            style={{ fontFamily: "Kalam, cursive" }}
          >
            Presentation not found
          </h1>
          <p
            className="text-base text-[#6b6460] max-w-sm"
            style={{ fontFamily: "Patrick Hand, cursive" }}
          >
            This deck doesn't exist or you don't have access.
          </p>
          <Link
            to="/home"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-[#2d2d2d] text-white border-[2.5px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#ff4d4d] hover:bg-[#ff4d4d] hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          >
            <ArrowLeft size={14} strokeWidth={2.5} /> Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className="flex h-screen w-full flex-col overflow-hidden"
      style={{
        background: "#fdfbf7",
        backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        fontFamily: "Patrick Hand, cursive",
        color: "#2d2d2d",
      }}
    >
      {/* ── Top Toolbar ── */}
      <header className="flex h-[60px] shrink-0 items-center justify-between bg-[#fdfbf7] border-b-[3px] border-dashed border-[#2d2d2d] px-4 z-20">
        {/* Left: back + title */}
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="flex items-center justify-center h-9 w-9 border-[2.5px] border-[#2d2d2d] bg-white text-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-[#e5e0d8] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
            style={{ borderRadius: R.tag }}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          </Link>
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-bold text-[#2d2d2d] max-w-[180px] sm:max-w-[280px] hover:bg-[#e5e0d8] focus:bg-[#e5e0d8] px-2 py-1 transition-colors"
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          />
          {id !== "new" && (
            <SaveStatusIndicator status={saveStatus} isOnline={isOnline} onRetry={retry} />
          )}
        </div>

        {/* Right: generating pill + chat toggle + present */}
        <div className="flex items-center gap-2">
          {active && !gen.isReady && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#fff9c4] border-[2px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d] animate-wiggle"
              style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
            >
              <span className="w-2 h-2 rounded-full bg-[#ff4d4d] animate-pulse" />
              Generating...
            </div>
          )}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-bold border-[2.5px] border-[#2d2d2d] transition-all duration-100 ${
              isChatOpen
                ? "bg-[#2d2d2d] text-white shadow-[2px_2px_0px_0px_#ff4d4d]"
                : "bg-white text-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-[#e5e0d8] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px]"
            }`}
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          >
            <MessageSquare className="w-3.5 h-3.5" strokeWidth={2.5} />
            AI Chat
          </button>
          <button
            onClick={() => navigate({ to: "/present/$id", params: { id } })}
            disabled={!gen.isReady}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold bg-[#ff4d4d] text-white border-[2.5px] border-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-[3px_3px_0px_0px_#2d2d2d] disabled:hover:translate-x-0 disabled:hover:translate-y-0 transition-all duration-100"
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          >
            <Play className="h-3.5 w-3.5" strokeWidth={2.5} /> Present ▶
          </button>
        </div>
      </header>

      {/* Draft Recovery Mock Banner */}
      <AnimatePresence>
        {isExistingPresentation && !showHistoryPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#fff9c4] border-b-[2px] border-dashed border-[#2d2d2d] px-4 py-1.5 flex items-center justify-center gap-4 z-10 relative"
            style={{ fontFamily: "Patrick Hand, cursive" }}
          >
            <span className="text-xs text-[#2d2d2d]">Draft recovered from local storage (12:43 PM)</span>
            <button className="text-xs font-bold text-[#2d5da1] hover:underline">Restore</button>
            <button className="text-xs text-[#6b6460] hover:text-[#ff4d4d]">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ── Chat Panel (floating left drawer) ── */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.aside
              initial={{ x: -310, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -310, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="absolute left-0 top-0 bottom-0 w-[300px] z-10 flex flex-col bg-[#fdfbf7] border-r-[3px] border-dashed border-[#2d2d2d]"
            >
              {/* Chat header */}
              <div className="flex items-center justify-between px-4 py-3 border-b-[2px] border-dashed border-[#2d2d2d]">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 bg-[#fff9c4] border-[2px] border-[#2d2d2d] flex items-center justify-center text-xs"
                    style={{ borderRadius: "50%" }}
                  >
                    ✨
                  </div>
                  <span
                    className="text-sm font-bold text-[#2d2d2d]"
                    style={{ fontFamily: "Kalam, cursive" }}
                  >
                    AI Chat
                  </span>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-[#6b6460] hover:text-[#ff4d4d] transition-colors"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              {/* Timeline (generation steps) */}
              {active && (
                <div className="border-b-[2px] border-dashed border-[#2d2d2d] bg-white">
                  <button
                    onClick={() => setTimelineOpen((o) => !o)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-[#e5e0d8] transition-colors"
                  >
                    <div
                      className="flex items-center gap-2 text-xs font-bold text-[#6b6460]"
                      style={{ fontFamily: "Kalam, cursive" }}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#2d5da1]" strokeWidth={2.5} /> AI
                      Timeline
                    </div>
                    {timelineOpen ? (
                      <ChevronUp className="h-3.5 w-3.5 text-[#6b6460]" strokeWidth={2.5} />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-[#6b6460]" strokeWidth={2.5} />
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
                        <div className="space-y-2 px-4 pb-3">
                          {gen.steps.map((s, i) => {
                            const st = gen.stepStatus(i);
                            return (
                              <div key={s} className="flex items-center gap-2 text-xs">
                                <span className="flex h-4 w-4 items-center justify-center shrink-0">
                                  {st === "done" && (
                                    <Check
                                      className="h-3.5 w-3.5 text-[#2d8a5b]"
                                      strokeWidth={2.5}
                                    />
                                  )}
                                  {st === "active" && (
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff4d4d]" />
                                  )}
                                  {st === "pending" && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#2d2d2d]/20" />
                                  )}
                                </span>
                                <span
                                  className={
                                    st === "pending"
                                      ? "text-[#2d2d2d]/40"
                                      : st === "active"
                                        ? "text-[#2d2d2d] font-bold"
                                        : "text-[#2d2d2d]/40 line-through"
                                  }
                                  style={{ fontFamily: "Patrick Hand, cursive" }}
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

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4" ref={conversationRef}>
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {m.role === "ai" ? (
                        <div className="max-w-[90%] flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-5 h-5 bg-[#fff9c4] border-[2px] border-[#2d2d2d] flex items-center justify-center text-[10px]"
                              style={{ borderRadius: "50%" }}
                            >
                              ✨
                            </div>
                            <span
                              className="text-[10px] text-[#6b6460]"
                              style={{ fontFamily: "Patrick Hand, cursive" }}
                            >
                              Orivox · {formatTs(m.ts)}
                            </span>
                          </div>
                          <div
                            className="text-sm leading-relaxed text-[#2d2d2d] bg-white border-[2px] border-[#2d2d2d] px-3 py-2 shadow-[2px_2px_0px_0px_#2d2d2d]"
                            style={{
                              borderRadius: "4px 18px 18px 18px",
                              fontFamily: "Patrick Hand, cursive",
                            }}
                          >
                            {m.text}
                          </div>
                        </div>
                      ) : (
                        <div className="max-w-[90%] flex flex-col gap-1 items-end">
                          <div
                            className="text-sm leading-relaxed text-white bg-[#2d2d2d] px-3 py-2 shadow-[2px_2px_0px_0px_#ff4d4d]"
                            style={{
                              borderRadius: "18px 4px 18px 18px",
                              fontFamily: "Patrick Hand, cursive",
                            }}
                          >
                            {m.text}
                          </div>
                          <span className="text-[10px] text-[#6b6460]">{formatTs(m.ts)}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {messages.length === 0 && (
                  <div className="mt-12 text-center flex flex-col items-center gap-2">
                    <span className="text-3xl animate-wiggle">✏️</span>
                    <p
                      className="text-sm text-[#6b6460]"
                      style={{ fontFamily: "Patrick Hand, cursive" }}
                    >
                      Describe a presentation to begin.
                    </p>
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="p-3 border-t-[2px] border-dashed border-[#2d2d2d]">
                <div
                  className="flex items-end gap-2 bg-white border-[2px] border-[#2d2d2d] p-1.5 focus-within:border-[#2d5da1] focus-within:ring-2 focus-within:ring-[#2d5da1]/20 transition-all"
                  style={{ borderRadius: R.input }}
                >
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
                    className="max-h-24 min-h-[28px] flex-1 resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder-[#2d2d2d]/40 text-[#2d2d2d]"
                    style={{ fontFamily: "Patrick Hand, cursive" }}
                  />
                  <button
                    onClick={() => send(composer)}
                    disabled={!composer.trim()}
                    className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#ff4d4d] text-white border-[2px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-100"
                    style={{ borderRadius: R.tag }}
                  >
                    <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Canvas Area ── */}
        <main
          className="flex-1 h-full overflow-y-auto relative"
          style={{
            marginLeft: isChatOpen ? "300px" : "0",
            transition: "margin-left 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          onClick={() => setSelectedEl(null)}
        >
          {/* Error banner */}
          {generationError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-4 max-w-3xl px-6"
            >
              <div
                className="flex items-center gap-3 px-4 py-3 bg-[#fff9c4] border-[2px] border-[#ff4d4d] text-[#ff4d4d] text-sm shadow-[3px_3px_0px_0px_#ff4d4d]"
                style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
              >
                ⚠️ Failed: {generationError}
              </div>
            </motion.div>
          )}

          <div className="relative min-h-full flex flex-col items-center justify-start py-10 px-6 md:px-10">
            <div className="w-full max-w-4xl">
              {/* Empty state */}
              {messages.length === 0 && (
                <div className="flex h-[60vh] items-center justify-center">
                  <div
                    className="flex flex-col items-center gap-5 p-10 bg-white border-[3px] border-dashed border-[#2d2d2d] text-center"
                    style={{ borderRadius: R.card }}
                  >
                    <div
                      className="w-16 h-16 bg-[#fff9c4] border-[2px] border-[#2d2d2d] flex items-center justify-center text-3xl animate-wiggle shadow-[3px_3px_0px_0px_#2d2d2d]"
                      style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
                    >
                      ✏️
                    </div>
                    <h2
                      className="text-xl font-bold text-[#2d2d2d]"
                      style={{ fontFamily: "Kalam, cursive" }}
                    >
                      Canvas ready!
                    </h2>
                    <p
                      className="text-sm text-[#6b6460] max-w-xs"
                      style={{ fontFamily: "Patrick Hand, cursive" }}
                    >
                      Use the AI Chat panel to describe your presentation and it'll appear right
                      here.
                    </p>
                  </div>
                </div>
              )}

              {/* Outline preview */}
              <AnimatePresence>
                {gen.showOutline && !gen.showSlides && (
                  <motion.div
                    key="outline"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-8 bg-white border-[3px] border-[#2d2d2d] p-6 shadow-[6px_6px_0px_0px_#2d2d2d]"
                    style={{ borderRadius: R.card }}
                  >
                    {/* Tape */}
                    <div
                      className="absolute -top-3 left-8 w-10 h-4 bg-gray-300/60 border border-dashed border-gray-400/50"
                      style={{ borderRadius: "2px", transform: "rotate(-1deg)" }}
                    />
                    <div className="mb-5 flex items-center justify-between">
                      <div
                        className="text-sm font-bold text-[#6b6460]"
                        style={{ fontFamily: "Kalam, cursive" }}
                      >
                        📋 Proposed Outline
                      </div>
                      <button
                        className="px-3 py-1.5 text-xs font-bold bg-[#2d2d2d] text-white border-[2px] border-[#2d2d2d] shadow-[3px_3px_0px_0px_#ff4d4d] hover:bg-[#ff4d4d] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                        style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
                      >
                        Approve ✓
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {renderSlidesList.map((s, i) => (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-center gap-4 border-b-[2px] border-dashed border-[#2d2d2d]/30 py-3 last:border-0"
                        >
                          <div
                            className="w-7 h-7 bg-[#fff9c4] border-[2px] border-[#2d2d2d] flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
                          >
                            {i + 1}
                          </div>
                          <div
                            className="text-sm text-[#2d2d2d]"
                            style={{ fontFamily: "Patrick Hand, cursive" }}
                          >
                            {s.title}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Slide Canvas */}
              {gen.showSlides && visibleSlides.length > 0 && (
                <div className="flex flex-col items-center w-full gap-6">
                  {/* Progress indicator during generation */}
                  {!gen.isReady && (
                    <div
                      className="flex items-center gap-3 self-stretch px-4 py-2.5 bg-[#fff9c4] border-[2px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d]"
                      style={{ borderRadius: R.tag }}
                    >
                      <Loader2
                        size={14}
                        className="animate-spin text-[#ff4d4d] shrink-0"
                        strokeWidth={2.5}
                      />
                      <span
                        className="text-xs font-bold text-[#2d2d2d]"
                        style={{ fontFamily: "Kalam, cursive" }}
                      >
                        Rendering slides...
                      </span>
                      <span
                        className="ml-auto text-xs font-bold text-[#6b6460] bg-white border-[2px] border-dashed border-[#2d2d2d] px-2 py-0.5"
                        style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
                      >
                        {generatedCount} / {renderSlidesList.length}
                      </span>
                    </div>
                  )}

                  {/* Active slide (fixed aspect ratio 16:9, no overflow) */}
                  <div className="w-full relative group flex flex-col gap-3">
                    
                    {/* Editor Controls Toolbar */}
                    <div className="flex items-center justify-between bg-white border-[2.5px] border-[#2d2d2d] px-3 py-2 shadow-[3px_3px_0px_0px_#2d2d2d]" style={{ borderRadius: R.tag }}>
                      <div className="flex items-center gap-1">
                        <button onClick={undo} disabled={!canUndo} className="p-1.5 hover:bg-[#e5e0d8] disabled:opacity-30 rounded transition-colors" title="Undo (Ctrl+Z)">
                          <Undo2 size={16} strokeWidth={2.5} className="text-[#2d2d2d]" />
                        </button>
                        <button onClick={redo} disabled={!canRedo} className="p-1.5 hover:bg-[#e5e0d8] disabled:opacity-30 rounded transition-colors" title="Redo (Ctrl+Shift+Z)">
                          <Redo2 size={16} strokeWidth={2.5} className="text-[#2d2d2d]" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 border-l-[2px] border-dashed border-[#2d2d2d]/30 pl-3">
                        <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))} className="p-1.5 hover:bg-[#e5e0d8] rounded transition-colors">
                          <ZoomOut size={16} strokeWidth={2.5} className="text-[#2d2d2d]" />
                        </button>
                        <span className="text-xs font-bold w-12 text-center" style={{ fontFamily: "Patrick Hand, cursive" }}>{Math.round(zoomLevel * 100)}%</span>
                        <button onClick={() => setZoomLevel(z => Math.min(2, z + 0.1))} className="p-1.5 hover:bg-[#e5e0d8] rounded transition-colors">
                          <ZoomIn size={16} strokeWidth={2.5} className="text-[#2d2d2d]" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 border-l-[2px] border-dashed border-[#2d2d2d]/30 pl-3 ml-auto">
                        <button onClick={() => setShowHistoryPanel(!showHistoryPanel)} className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold transition-all ${showHistoryPanel ? "bg-[#2d2d2d] text-white" : "hover:bg-[#e5e0d8] text-[#2d2d2d]"}`} style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}>
                          <History size={14} strokeWidth={2.5} /> History
                        </button>
                      </div>
                    </div>

                    <div className="relative w-full transition-transform duration-200 origin-top" style={{ transform: `scale(${zoomLevel})` }}>
                      {/* Tilted shadow behind */}
                      <div
                        className="absolute inset-0 bg-[#e5e0d8] border-[2px] border-[#2d2d2d]"
                        style={{
                          borderRadius: R.card,
                          transform: "rotate(1deg) translate(5px, 5px)",
                        }}
                      />
                      <motion.div
                        key={visibleSlides[activeSlide]?.id}
                        layoutId={`slide-${visibleSlides[activeSlide]?.id}`}
                        className="relative w-full bg-white border-[3px] border-[#2d2d2d] shadow-[8px_8px_0px_0px_#2d2d2d] overflow-hidden"
                        style={{ borderRadius: R.card, aspectRatio: "16/9" }}
                      >
                        <div className="absolute inset-0">
                          <SlideCanvas
                            slide={visibleSlides[activeSlide]}
                            onSelect={(id) => {
                              setSelectedEl(id);
                              // Mock position for context menu
                              setContextMenu({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 200 });
                            }}
                            selected={selectedEl}
                            onSlideChange={handleSlideChange}
                          />
                        </div>
                      </motion.div>
                      {/* Tape decoration */}
                      <div
                        className="absolute -top-4 left-1/2 w-12 h-5 bg-gray-300/60 border border-dashed border-gray-400/50"
                        style={{ borderRadius: "2px", transform: "translateX(-50%) rotate(-1.5deg)" }}
                      />
                    </div>

                    {/* Floating Context Menu */}
                    <AnimatePresence>
                      {selectedEl && contextMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute z-50 flex items-center gap-1 bg-white border-[2.5px] border-[#2d2d2d] p-1.5 shadow-[4px_4px_0px_0px_#2d2d2d]"
                          style={{
                            top: "10%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            borderRadius: R.tag,
                          }}
                        >
                          <div className="flex items-center gap-1 border-r-[2px] border-dashed border-[#2d2d2d]/30 pr-1 mr-1">
                            <button className="p-1.5 hover:bg-[#fff9c4] rounded transition-colors text-[#2d2d2d]"><Type size={14} strokeWidth={2.5} /></button>
                            <button className="p-1.5 hover:bg-[#fff9c4] rounded transition-colors text-[#2d2d2d]"><Bold size={14} strokeWidth={2.5} /></button>
                            <button className="p-1.5 hover:bg-[#fff9c4] rounded transition-colors text-[#2d2d2d]"><Italic size={14} strokeWidth={2.5} /></button>
                          </div>
                          <button className="p-1.5 hover:bg-[#fff9c4] rounded transition-colors text-[#2d2d2d]"><AlignLeft size={14} strokeWidth={2.5} /></button>
                          <button className="p-1.5 hover:bg-[#ff4d4d]/10 hover:text-[#ff4d4d] rounded transition-colors ml-1 text-[#6b6460]">
                            <Trash size={14} strokeWidth={2.5} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Slide filmstrip thumbnails */}
                  <div
                    className="w-full bg-white border-[3px] border-[#2d2d2d] p-4 shadow-[4px_4px_0px_0px_#2d2d2d]"
                    style={{ borderRadius: R.md }}
                  >
                    <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1 px-1 snap-x">
                      {renderSlidesList.map((s, i) => {
                        const shown = i < visibleSlides.length;
                        const isActive = i === activeSlide && shown;
                        return (
                          <button
                            key={s.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (shown) setActiveSlide(i);
                            }}
                            className={`relative aspect-video w-36 shrink-0 snap-center border-[2.5px] transition-all duration-100 ${
                              isActive
                                ? "border-[#ff4d4d] shadow-[3px_3px_0px_0px_#ff4d4d] -translate-y-1 bg-white"
                                : shown
                                  ? "border-[#2d2d2d] bg-white hover:border-[#ff4d4d] hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_#2d2d2d]"
                                  : "border-dashed border-[#2d2d2d]/40 bg-[#fdfbf7] opacity-50"
                            }`}
                            style={{ borderRadius: "4px 16px 4px 16px / 16px 4px 16px 4px" }}
                          >
                            {shown ? (
                              /* Real scaled slide preview — 960px canvas scaled to fit 144px wide thumbnail */
                              <div
                                className="absolute inset-0 overflow-hidden pointer-events-none bg-white"
                                style={{ borderRadius: "inherit" }}
                              >
                                <div
                                  style={{
                                    width: "960px",
                                    height: "540px",
                                    transform: "scale(0.15)",
                                    transformOrigin: "top left",
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                  }}
                                >
                                  <SlideCanvas slide={s} onSelect={() => {}} selected={null} />
                                </div>
                              </div>
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Circle className="h-4 w-4 text-[#2d2d2d]/20" strokeWidth={2} />
                              </div>
                            )}
                            {/* Slide number badge */}
                            <div
                              className={`absolute left-1.5 top-1.5 px-1.5 py-0.5 text-[9px] font-bold ${
                                isActive
                                  ? "bg-[#ff4d4d] text-white border-[#ff4d4d]"
                                  : "bg-[#2d2d2d]/10 text-[#2d2d2d]/60"
                              }`}
                              style={{ borderRadius: "3px", fontFamily: "Kalam, cursive" }}
                            >
                              {i + 1}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ── Right Panel (Version History) ── */}
        <AnimatePresence>
          {showHistoryPanel && (
            <motion.aside
              initial={{ x: 310, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 310, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-[300px] z-10 flex flex-col bg-[#fdfbf7] border-l-[3px] border-dashed border-[#2d2d2d]"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b-[2px] border-dashed border-[#2d2d2d]">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 bg-[#fff9c4] border-[2px] border-[#2d2d2d] flex items-center justify-center text-xs"
                    style={{ borderRadius: "50%" }}
                  >
                    🕰️
                  </div>
                  <span
                    className="text-sm font-bold text-[#2d2d2d]"
                    style={{ fontFamily: "Kalam, cursive" }}
                  >
                    Version History
                  </span>
                </div>
                <button
                  onClick={() => setShowHistoryPanel(false)}
                  className="text-[#6b6460] hover:text-[#ff4d4d] transition-colors"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-bold text-[#6b6460]" style={{ fontFamily: "Kalam, cursive" }}>Today</div>
                  <button className="flex flex-col text-left p-3 border-[2.5px] border-[#2d2d2d] bg-white shadow-[3px_3px_0px_0px_#2d2d2d] transition-all hover:bg-[#fff9c4] group" style={{ borderRadius: R.tag }}>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-bold text-[#2d2d2d]" style={{ fontFamily: "Patrick Hand, cursive" }}>Current Version</span>
                      <span className="text-[10px] text-[#6b6460]">Just now</span>
                    </div>
                  </button>
                  <button className="flex flex-col text-left p-3 border-[2.5px] border-dashed border-[#2d2d2d]/30 bg-transparent hover:border-solid hover:border-[#2d2d2d] hover:bg-white transition-all group" style={{ borderRadius: R.tag }}>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-bold text-[#6b6460] group-hover:text-[#2d2d2d]" style={{ fontFamily: "Patrick Hand, cursive" }}>AI Auto-save</span>
                      <span className="text-[10px] text-[#6b6460]">12:43 PM</span>
                    </div>
                  </button>
                  <button className="flex flex-col text-left p-3 border-[2.5px] border-dashed border-[#2d2d2d]/30 bg-transparent hover:border-solid hover:border-[#2d2d2d] hover:bg-white transition-all group" style={{ borderRadius: R.tag }}>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-bold text-[#6b6460] group-hover:text-[#2d2d2d]" style={{ fontFamily: "Patrick Hand, cursive" }}>Initial Generation</span>
                      <span className="text-[10px] text-[#6b6460]">11:20 AM</span>
                    </div>
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

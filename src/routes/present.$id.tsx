import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Maximize2, Minimize2 } from "lucide-react";
import { SlideCanvas } from "@/components/workspace/SlideCanvas";
import { AIAssistant, ElementSelectedPanel } from "@/components/workspace/RightPanels";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { getPresentation } from "@/lib/database/presentations";
import { getSlides } from "@/lib/database/slides";

export const Route = createFileRoute("/present/$id")({
  head: () => ({ meta: [{ title: "Viewer — Orivox" }] }),
  component: Viewer,
});

const R = {
  tag: "4px 22px 6px 18px / 22px 6px 18px 4px",
  card: "6px 38px 6px 42px / 38px 6px 42px 6px",
  md: "8px 42px 12px 38px / 42px 12px 38px 8px",
};

function Viewer() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = Route.useParams();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { reset: false } });
  }, [user, loading, navigate]);

  const { data: dbPresentation, isLoading: isPresLoading } = useQuery({
    queryKey: ["presentation", id],
    queryFn: () => getPresentation(id),
    enabled: !!user?.id,
  });

  const { data: dbSlides = [], isLoading: isSlidesLoading } = useQuery({
    queryKey: ["slides", id],
    queryFn: () => getSlides(id),
    enabled: !!user?.id,
  });

  const [active, setActive] = useState(0);
  const [selectedEl, setSelectedEl] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const slide = dbSlides[active] || null;
  const total = dbSlides.length;

  const prev = useCallback(() => setActive((a) => Math.max(0, a - 1)), []);
  const next = useCallback(() => setActive((a) => Math.min(total - 1, a + 1)), [total]);

  // keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "f" || e.key === "F") setFullscreen((f) => !f);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  // ── Loading ──
  if (loading || isPresLoading || isSlidesLoading) {
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
            📽️
          </div>
          <p className="text-lg font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
            Loading presentation...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // ── Not Found ──
  if (!dbPresentation) {
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

  // ── Fullscreen Mode ──
  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col bg-[#1a1a1a]"
        onClick={() => setSelectedEl(null)}
      >
        {/* Fullscreen slide */}
        <div className="flex-1 flex items-center justify-center p-6 relative">
          <div className="w-full max-w-5xl" style={{ aspectRatio: "16/9" }}>
            {slide && <SlideCanvas slide={slide} onSelect={setSelectedEl} selected={selectedEl} />}
          </div>
          {/* Exit button */}
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          >
            <Minimize2 size={12} strokeWidth={2.5} /> Exit (Esc)
          </button>
        </div>
        {/* Fullscreen nav */}
        <div className="flex items-center justify-center gap-4 py-3 bg-black/30 border-t border-white/10">
          <button
            onClick={prev}
            disabled={active === 0}
            className="flex items-center justify-center w-9 h-9 text-white border border-white/20 hover:bg-white/10 disabled:opacity-30 transition-all"
            style={{ borderRadius: R.tag }}
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
          <span className="text-white text-sm font-bold" style={{ fontFamily: "Kalam, cursive" }}>
            {active + 1} / {total}
          </span>
          <button
            onClick={next}
            disabled={active === total - 1}
            className="flex items-center justify-center w-9 h-9 text-white border border-white/20 hover:bg-white/10 disabled:opacity-30 transition-all"
            style={{ borderRadius: R.tag }}
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

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
      {/* ── Top Bar ── */}
      <header className="flex h-[60px] shrink-0 items-center justify-between bg-[#fdfbf7] border-b-[3px] border-dashed border-[#2d2d2d] px-4 z-20">
        <div className="flex items-center gap-3">
          <Link
            to="/workspace/$id"
            params={{ id }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold border-[2px] border-[#2d2d2d] bg-white text-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-[#e5e0d8] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          >
            <ArrowLeft size={14} strokeWidth={2.5} /> Workspace
          </Link>
          <div className="h-4 w-[2px] bg-dashed bg-[#2d2d2d]/20" />
          <h1
            className="text-sm font-bold text-[#2d2d2d] truncate max-w-[240px]"
            style={{ fontFamily: "Kalam, cursive" }}
          >
            {dbPresentation.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {total > 0 && (
            <div
              className="px-3 py-1 text-xs font-bold bg-[#fff9c4] border-[2px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d]"
              style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
            >
              {active + 1} / {total}
            </div>
          )}
          <button
            onClick={() => setFullscreen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold bg-white border-[2px] border-[#2d2d2d] text-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-[#e5e0d8] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          >
            <Maximize2 size={13} strokeWidth={2.5} /> Present
          </button>
          <button
            onClick={() => navigate({ to: "/export/$id", params: { id } })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold bg-[#ff4d4d] text-white border-[2px] border-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          >
            <Download size={13} strokeWidth={2.5} /> Export
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: slide thumbnails ── */}
        <aside className="w-[200px] shrink-0 overflow-y-auto border-r-[3px] border-dashed border-[#2d2d2d] p-3 bg-[#fdfbf7] flex flex-col gap-2">
          {dbSlides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setActive(i);
                setSelectedEl(null);
              }}
              className={`group relative w-full text-left border-[2.5px] overflow-hidden transition-all duration-100 ${
                active === i
                  ? "border-[#ff4d4d] shadow-[3px_3px_0px_0px_#ff4d4d] bg-white"
                  : "border-[#2d2d2d] bg-white shadow-[2px_2px_0px_0px_#2d2d2d] hover:border-[#ff4d4d] hover:-translate-y-0.5"
              }`}
              style={{ borderRadius: "4px 16px 4px 16px / 16px 4px 16px 4px" }}
            >
              {/* Real scaled-down slide preview */}
              {/* Outer: clips to 16:9, inner: renders at 960px then scales down */}
              <div
                className="w-full overflow-hidden bg-white pointer-events-none"
                style={{ aspectRatio: "16/9", position: "relative" }}
              >
                <div
                  style={{
                    width: "960px",
                    height: "540px",
                    transform: "scale(0.178)",
                    transformOrigin: "top left",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                >
                  <SlideCanvas slide={s} onSelect={() => {}} selected={null} />
                </div>
              </div>
              {/* Title row */}
              <div className="px-2.5 py-2 border-t-[2px] border-dashed border-[#2d2d2d]/30">
                <div className="flex items-start gap-1.5">
                  <span
                    className={`shrink-0 text-[9px] font-bold px-1 py-0.5 ${active === i ? "bg-[#ff4d4d] text-white" : "bg-[#2d2d2d]/10 text-[#2d2d2d]/60"}`}
                    style={{ borderRadius: "3px", fontFamily: "Kalam, cursive" }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="text-[10px] leading-snug text-[#2d2d2d] line-clamp-2"
                    style={{ fontFamily: "Patrick Hand, cursive" }}
                  >
                    {s.title}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </aside>

        {/* ── Center: main slide canvas ── */}
        <main
          className="flex flex-1 flex-col overflow-hidden bg-[#f0ece6]"
          onClick={() => setSelectedEl(null)}
        >
          <div className="flex-1 overflow-y-auto flex items-start justify-center p-8">
            <div className="w-full max-w-4xl">
              {slide ? (
                <div className="relative">
                  {/* Tilted shadow behind */}
                  <div
                    className="absolute inset-0 bg-[#e5e0d8] border-[2px] border-[#2d2d2d]"
                    style={{ borderRadius: R.card, transform: "rotate(1deg) translate(5px, 5px)" }}
                  />
                  {/* Tape */}
                  <div
                    className="absolute -top-4 left-1/2 w-12 h-5 bg-gray-300/60 border border-dashed border-gray-400/50 z-10"
                    style={{ borderRadius: "2px", transform: "translateX(-50%) rotate(-1.5deg)" }}
                  />
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="relative w-full bg-white border-[3px] border-[#2d2d2d] shadow-[8px_8px_0px_0px_#2d2d2d] overflow-hidden"
                    style={{ borderRadius: R.card, aspectRatio: "16/9" }}
                  >
                    <div className="absolute inset-0">
                      <SlideCanvas slide={slide} onSelect={setSelectedEl} selected={selectedEl} />
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-20 text-center bg-white border-[3px] border-dashed border-[#2d2d2d]"
                  style={{ borderRadius: R.md, aspectRatio: "16/9" }}
                >
                  <div className="text-4xl mb-3">📭</div>
                  <p
                    className="text-[#6b6460] text-sm"
                    style={{ fontFamily: "Patrick Hand, cursive" }}
                  >
                    No slides found in this presentation.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Nav bar ── */}
          <div className="flex items-center justify-center gap-3 border-t-[3px] border-dashed border-[#2d2d2d] py-3 bg-[#fdfbf7]">
            <button
              onClick={prev}
              disabled={active === 0}
              className="flex items-center justify-center w-10 h-10 border-[2.5px] border-[#2d2d2d] bg-white text-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-[3px_3px_0px_0px_#2d2d2d] disabled:hover:translate-x-0 disabled:hover:translate-y-0 transition-all duration-100"
              style={{ borderRadius: R.tag }}
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>

            {/* Dot indicators */}
            <div className="flex items-center gap-1.5">
              {dbSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`transition-all duration-100 border-[1.5px] border-[#2d2d2d] ${
                    i === active ? "w-6 h-3 bg-[#ff4d4d]" : "w-3 h-3 bg-white hover:bg-[#e5e0d8]"
                  }`}
                  style={{ borderRadius: "2px" }}
                />
              ))}
            </div>

            <button
              onClick={next}
              disabled={active === total - 1}
              className="flex items-center justify-center w-10 h-10 border-[2.5px] border-[#2d2d2d] bg-white text-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-[3px_3px_0px_0px_#2d2d2d] disabled:hover:translate-x-0 disabled:hover:translate-y-0 transition-all duration-100"
              style={{ borderRadius: R.tag }}
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>

            <div
              className="absolute right-4 flex items-center gap-1.5 text-xs text-[#6b6460]"
              style={{ fontFamily: "Patrick Hand, cursive" }}
            >
              ← → or Space
            </div>
          </div>
        </main>

        {/* ── Right: AI Panel ── */}
        <aside className="w-[300px] shrink-0 border-l-[3px] border-dashed border-[#2d2d2d] bg-[#fdfbf7]">
          <div className="flex h-full flex-col p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedEl ? "selected" : "assistant"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex h-full flex-col"
              >
                {selectedEl ? (
                  <ElementSelectedPanel
                    element={selectedEl}
                    onDeselect={() => setSelectedEl(null)}
                  />
                ) : (
                  <AIAssistant />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </div>
  );
}

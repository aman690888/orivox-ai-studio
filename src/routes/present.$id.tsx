import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SlideCanvas } from "@/components/workspace/SlideCanvas";
import { AIAssistant, ElementSelectedPanel } from "@/components/workspace/RightPanels";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { getPresentation } from "@/lib/database/presentations";
import { getSlides } from "@/lib/database/slides";
import { Slide } from "@/lib/mock";

export const Route = createFileRoute("/present/$id")({
  head: () => ({ meta: [{ title: "Viewer — Orivox" }] }),
  component: Viewer,
});

function Viewer() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = Route.useParams();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
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

  const slide = dbSlides[active] || null;

  if (loading || isPresLoading || isSlidesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-electric border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!dbPresentation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <h1 className="text-xl font-semibold text-foreground">Presentation not found</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          The presentation you are trying to access doesn't exist or you don't have access.
        </p>
        <Link
          to="/home"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
        >
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          <Link
            to="/workspace/$id"
            params={{ id }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Workspace
          </Link>
          <div className="mx-2 h-4 w-px bg-border" />
          <Logo showWord={false} />
          <div className="text-sm font-medium">{dbPresentation.title}</div>
        </div>
        <div className="flex items-center gap-2">
          {dbSlides.length > 0 && (
            <div className="font-mono text-xs text-muted-foreground">
              {active + 1} / {dbSlides.length}
            </div>
          )}
          <button
            onClick={() => navigate({ to: "/export/$id", params: { id } })}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition hover:border-white/25"
          >
            <Download className="h-3 w-3" /> Export
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: thumbnails */}
        <aside className="w-56 shrink-0 overflow-y-auto border-r border-border p-3">
          <div className="space-y-2">
            {dbSlides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  setActive(i);
                  setSelectedEl(null);
                }}
                className={`group relative block w-full overflow-hidden rounded-lg border text-left transition ${
                  active === i
                    ? "border-electric/60 bg-electric/5"
                    : "border-border hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2 p-2">
                  <div className="w-4 font-mono text-[10px] text-muted-foreground">{i + 1}</div>
                  <div className="line-clamp-2 flex-1 text-[11px]">{s.title}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Center: canvas */}
        <main
          className="flex flex-1 flex-col overflow-hidden bg-[oklch(0.14_0.008_270)]"
          onClick={() => setSelectedEl(null)}
        >
          <div className="flex-1 overflow-y-auto p-10">
            <div className="mx-auto max-w-4xl">
              {slide ? (
                <SlideCanvas slide={slide} onSelect={setSelectedEl} selected={selectedEl} />
              ) : (
                <div className="text-center text-muted-foreground py-20">
                  No slides found in this presentation.
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 border-t border-border py-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActive((a) => Math.max(0, a - 1));
              }}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActive((a) => Math.min(dbSlides.length - 1, a + 1));
              }}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </main>

        {/* Right: morphing panel */}
        <aside className="w-[340px] shrink-0 border-l border-border">
          <div className="flex h-full flex-col p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedEl ? "selected" : "assistant"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
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

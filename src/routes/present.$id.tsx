import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SlideCanvas } from "@/components/workspace/SlideCanvas";
import { AIAssistant, ElementSelectedPanel } from "@/components/workspace/RightPanels";
import { demoSlides } from "@/lib/mock";

export const Route = createFileRoute("/present/$id")({
  head: () => ({ meta: [{ title: "Viewer — Orivox" }] }),
  component: Viewer,
});

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

function Viewer() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [user, loading, navigate]);

  const { id } = Route.useParams();
  const [active, setActive] = useState(0);
  const [selectedEl, setSelectedEl] = useState<string | null>(null);

  const slide = demoSlides[active];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-electric border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
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
          <div className="text-sm font-medium">AI in Healthcare</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="font-mono text-xs text-muted-foreground">
            {active + 1} / {demoSlides.length}
          </div>
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
            {demoSlides.map((s, i) => (
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
              <SlideCanvas slide={slide} onSelect={setSelectedEl} selected={selectedEl} />
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
                setActive((a) => Math.min(demoSlides.length - 1, a + 1));
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

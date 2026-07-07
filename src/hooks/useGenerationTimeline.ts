import { useEffect, useRef, useState } from "react";
import { thinkingSteps } from "@/lib/mock";

export type GenPhase =
  | "idle"
  | "understanding"
  | "researching"
  | "outlining"
  | "designing"
  | "charting"
  | "diagramming"
  | "noting"
  | "reviewing"
  | "ready";

const order: GenPhase[] = [
  "understanding", "researching", "outlining", "designing",
  "charting", "diagramming", "noting", "reviewing", "ready",
];

// Map generation phases to step indexes in thinkingSteps
// thinkingSteps: [Understanding, Researching, Finding sources, Planning outline,
//   Choosing layouts, Designing slides, Creating charts, Creating diagrams, Writing speaker notes, Final review]
const phaseToStepIndex: Record<GenPhase, number> = {
  idle: -1,
  understanding: 0,
  researching: 2, // includes "finding sources"
  outlining: 3,
  designing: 5, // includes "choosing layouts" (4) → we'll auto-mark 4 done
  charting: 6,
  diagramming: 7,
  noting: 8,
  reviewing: 9,
  ready: 10,
};

export function useGenerationTimeline(active: boolean) {
  const [phase, setPhase] = useState<GenPhase>("idle");
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;

    const timings: [GenPhase, number][] = [
      ["understanding", 400],
      ["researching", 1400],
      ["outlining", 1600],
      ["designing", 1600],
      ["charting", 1200],
      ["diagramming", 1200],
      ["noting", 1000],
      ["reviewing", 900],
      ["ready", 700],
    ];

    let cumulative = 0;
    const timers: number[] = [];
    for (const [p, wait] of timings) {
      cumulative += wait;
      timers.push(window.setTimeout(() => setPhase(p), cumulative));
    }
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const currentIndex = phaseToStepIndex[phase];
  const isReady = phase === "ready";

  const stepStatus = (i: number): "pending" | "active" | "done" => {
    if (isReady) return "done";
    if (i < currentIndex) return "done";
    if (i === currentIndex) return "active";
    return "pending";
  };

  // Content flags for the canvas
  const orderIndex = order.indexOf(phase);
  const showResearch = orderIndex >= order.indexOf("researching");
  const showOutline = orderIndex >= order.indexOf("outlining");
  const showSlides = orderIndex >= order.indexOf("designing");
  const showCharts = orderIndex >= order.indexOf("charting");
  const showDiagrams = orderIndex >= order.indexOf("diagramming");
  const showNotes = orderIndex >= order.indexOf("noting");

  return { phase, isReady, stepStatus, steps: thinkingSteps, showResearch, showOutline, showSlides, showCharts, showDiagrams, showNotes };
}

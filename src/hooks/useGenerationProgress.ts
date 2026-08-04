import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useGenerationTimeline, PHASE_DURATIONS, GenPhase } from "./useGenerationTimeline";
import { thinkingSteps } from "@/lib/mock";

type Status = "idle" | "queued" | "generating" | "success" | "error" | "cancelled" | "timeout";

export function useGenerationProgress(active: boolean, isSuccess: boolean, error?: string | null) {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [networkError, setNetworkError] = useState(!navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const genTimeline = useGenerationTimeline(active && status === "generating", isSuccess);

  useEffect(() => {
    const handleOnline = () => setNetworkError(false);
    const handleOffline = () => setNetworkError(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("orivox_prompts");
      if (stored) {
        setPromptHistory(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const savePromptToHistory = useCallback((prompt: string) => {
    setPromptHistory((prev) => {
      const filtered = prev.filter((p) => p !== prompt);
      const updated = [prompt, ...filtered].slice(0, 5);
      localStorage.setItem("orivox_prompts", JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    if (isSuccess) {
      setStatus("success");
    } else if (error) {
      setStatus("error");
    } else if (active && status === "idle") {
      setStatus("generating");
      setElapsedMs(0);
    }
  }, [active, isSuccess, error, status]);

  useEffect(() => {
    if (status !== "generating") return;

    const interval = setInterval(() => {
      setElapsedMs((prev) => {
        const next = prev + 1000;
        if (next >= 120000) {
          setStatus("timeout");
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  const cancel = useCallback(() => {
    setStatus("cancelled");
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const phase: GenPhase = genTimeline.phase;

  const phasePct = useMemo(() => {
    if (phase === "idle" || phase === "ready") return 100;
    const phaseStart = genTimeline.actualStartTimes[phase] || Date.now();
    const phaseDuration = PHASE_DURATIONS[phase] || 1000;
    const passed = Math.max(0, Date.now() - phaseStart);
    return Math.min(100, Math.floor((passed / phaseDuration) * 100));
  }, [phase, genTimeline.actualStartTimes]);

  const estimatedMs = useMemo(() => {
    let total = 0;
    let remaining = 0;
    let found = false;
    for (const [p, dur] of Object.entries(PHASE_DURATIONS)) {
      if (p === "idle" || p === "ready") continue;
      total += dur;
      if (p === phase) {
        found = true;
        const phaseStart = genTimeline.actualStartTimes[phase as GenPhase] || Date.now();
        const passed = Math.max(0, Date.now() - phaseStart);
        remaining += Math.max(0, dur - passed);
      } else if (found) {
        remaining += dur;
      }
    }
    return remaining;
  }, [phase, genTimeline.actualStartTimes]);

  const chartPct = phase === "charting" ? phasePct : genTimeline.showCharts ? 100 : 0;
  const diagramPct = phase === "diagramming" ? phasePct : genTimeline.showDiagrams ? 100 : 0;
  const imagePct = phase === "designing" ? phasePct : genTimeline.showSlides ? 100 : 0;

  const timeline = useMemo(() => {
    return thinkingSteps.map((step, i) => {
      return {
        step,
        status: genTimeline.stepStatus(i),
      };
    });
  }, [genTimeline]);

  return {
    status,
    setStatus, // Allow external override for retry
    phase,
    phasePct,
    elapsedMs,
    estimatedMs,
    chartPct,
    imagePct,
    diagramPct,
    canCancel: status === "generating" || status === "queued",
    cancel,
    retryCount,
    setRetryCount,
    networkError,
    timeline,
    promptHistory,
    savePromptToHistory,
    abortRef,
  };
}

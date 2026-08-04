import { useState, useCallback, useEffect } from "react";
import type { Slide } from "@/lib/mock";

export function useEditorHistory(initialState: Slide[]) {
  const [history, setHistory] = useState<Slide[][]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sync initial state if it arrives later
  useEffect(() => {
    if (history.length === 1 && history[0].length === 0 && initialState.length > 0) {
      setHistory([initialState]);
      setCurrentIndex(0);
    }
  }, [initialState, history]);

  const pushState = useCallback((newState: Slide[]) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, newState];
    });
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setCurrentIndex((prev) => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  return {
    state: history[currentIndex] || initialState,
    pushState,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
  };
}

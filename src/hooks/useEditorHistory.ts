import { useState, useCallback, useEffect } from "react";
import type { Slide } from "@/lib/mock";

interface HistoryState {
  history: Slide[][];
  currentIndex: number;
}

export function useEditorHistory(initialState: Slide[]) {
  const [{ history, currentIndex }, setState] = useState<HistoryState>({
    history: [initialState],
    currentIndex: 0,
  });

  // Sync initial state if it arrives later
  useEffect(() => {
    setState((prev) => {
      if (prev.history.length === 1 && prev.history[0].length === 0 && initialState.length > 0) {
        return { history: [initialState], currentIndex: 0 };
      }
      return prev;
    });
  }, [initialState]);

  const pushState = useCallback((newState: Slide[] | ((prev: Slide[]) => Slide[])) => {
    setState((prev) => {
      const currentSlides = prev.history[prev.currentIndex];
      const resolvedState = typeof newState === "function" ? newState(currentSlides) : newState;
      const newHistory = prev.history.slice(0, prev.currentIndex + 1);
      return {
        history: [...newHistory, resolvedState],
        currentIndex: prev.currentIndex + 1,
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
    }));
  }, []);

  const redo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.min(prev.history.length - 1, prev.currentIndex + 1),
    }));
  }, []);

  return {
    state: history[currentIndex] || initialState,
    pushState,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
  };
}

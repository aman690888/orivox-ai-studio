import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "failed";

interface UseAutosaveOptions<T> {
  saveFn: (data: T) => Promise<void>;
  delay?: number;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useAutosave<T>({ saveFn, delay = 800, onSuccess, onError }: UseAutosaveOptions<T>) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [isOnline, setIsOnline] = useState(true);

  const pendingDataRef = useRef<T | null>(null);
  const activeDataRef = useRef<T | null>(null);
  const isSavingRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const executeSave = useCallback(async () => {
    if (pendingDataRef.current === null) {
      isSavingRef.current = false;
      return;
    }

    if (!navigator.onLine) {
      setStatus("failed");
      isSavingRef.current = false;
      return;
    }

    isSavingRef.current = true;
    setStatus("saving");

    const dataToSave = pendingDataRef.current;
    activeDataRef.current = dataToSave;
    // Clear pending since we are processing it
    pendingDataRef.current = null;

    try {
      await saveFn(dataToSave);

      // If new edits accumulated while we were saving, trigger next save immediately
      if (pendingDataRef.current !== null) {
        executeSave();
      } else {
        isSavingRef.current = false;
        setStatus("saved");
        onSuccess?.();
      }
    } catch (err) {
      console.error("Autosave execution error:", err);
      // Restore failed data as pending so retry can use it
      pendingDataRef.current = dataToSave;
      isSavingRef.current = false;
      setStatus("failed");
      onError?.(err);
    }
  }, [saveFn, onSuccess, onError]);

  const triggerSave = useCallback(
    (data: T) => {
      pendingDataRef.current = data;
      setStatus("saving");

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        if (!isSavingRef.current) {
          executeSave();
        }
      }, delay);
    },
    [executeSave, delay],
  );

  const retry = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    executeSave();
  }, [executeSave]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    triggerSave,
    retry,
    status,
    isOnline,
  };
}

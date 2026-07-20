import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { PresentationIR } from '../types/presentation-ir.types';
import { createServerFn } from '@tanstack/react-start';

export const savePresentationIR = createServerFn({ method: 'POST' })
  .validator((data: PresentationIR) => data)
  .handler(async ({ data }) => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(process.cwd(), 'output', 'presentation-ir.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  });

interface EditorContextValue {
  ir: PresentationIR;
  updateComponentData: (slideId: string, componentId: string, newData: any) => void;
  updateAsset: (assetId: string, newUrl: string) => void;
  undo: () => void;
  redo: () => void;
  save: () => Promise<void>;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isEditable: boolean;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export const useEditor = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
};

export const EditorProvider: React.FC<{ initialIr: PresentationIR; children: React.ReactNode }> = ({ initialIr, children }) => {
  const [ir, setIr] = useState<PresentationIR>(initialIr);
  const [history, setHistory] = useState<PresentationIR[]>([]);
  const [future, setFuture] = useState<PresentationIR[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Track changes to debounce autosave
  const lastSavedIr = useRef<PresentationIR>(initialIr);
  const isDirty = useRef(false);

  const pushState = useCallback((newIr: PresentationIR) => {
    setIr(prevIr => {
      setHistory(prev => [...prev, prevIr].slice(-50));
      setFuture([]);
      return newIr;
    });
    isDirty.current = true;
  }, []);

  const updateComponentData = useCallback((slideId: string, componentId: string, newData: any) => {
    const newIr = JSON.parse(JSON.stringify(ir)) as PresentationIR;
    const slide = newIr.slides[slideId];
    if (slide && slide.components_data[componentId]) {
      const compData = slide.components_data[componentId].data;
      
      // Merge newData with deep path support
      Object.entries(newData).forEach(([key, value]) => {
        const parts = key.replace(/\[(\w+)\]/g, '.$1').split('.');
        let current = compData;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) current[parts[i]] = {};
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
      });
      
      pushState(newIr);
    }
  }, [ir, pushState]);

  const updateAsset = useCallback((assetId: string, newUrl: string) => {
    if (!ir.assets || !ir.assets[assetId]) return;
    const newIr = JSON.parse(JSON.stringify(ir)) as PresentationIR;
    if (newIr.assets) {
      newIr.assets[assetId].url = newUrl;
      pushState(newIr);
    }
  }, [ir, pushState]);

  const undo = useCallback(() => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      setFuture(prev => [ir, ...prev]);
      setHistory(newHistory);
      setIr(previous);
    }
  }, [history, ir]);

  const redo = useCallback(() => {
    if (future.length > 0) {
      const next = future[0];
      const newFuture = future.slice(1);
      setHistory(prev => [...prev, ir]);
      setFuture(newFuture);
      setIr(next);
    }
  }, [future, ir]);

  const save = useCallback(async () => {
    if (!isDirty.current) return;
    setIsSaving(true);
    try {
      await savePresentationIR({ data: ir });
      lastSavedIr.current = ir;
      isDirty.current = false;
    } catch (e) {
      console.error("Failed to save", e);
    } finally {
      setIsSaving(false);
    }
  }, [ir]);

  // Auto-save debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      save();
    }, 2000);
    return () => clearTimeout(timer);
  }, [ir, save]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, save]);

  return (
    <EditorContext.Provider value={{
      ir,
      updateComponentData,
      updateAsset,
      undo,
      redo,
      save,
      isSaving,
      canUndo: history.length > 0,
      canRedo: future.length > 0,
      isEditable: true,
    }}>
      {children}
    </EditorContext.Provider>
  );
};

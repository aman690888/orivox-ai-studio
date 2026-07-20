import React, { useState, useEffect } from "react";

import { SlideRenderer } from "./SlideRenderer";
import { useEditor } from "./EditorContext";

export const SlideCanvas: React.FC = () => {
  const { ir: presentation } = useEditor();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slides = presentation.slide_order.map(id => presentation.slides[id]).filter(Boolean);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      if (e.key === "ArrowRight" || e.key === " ") {
        setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  if (slides.length === 0) {
    return <div className="flex items-center justify-center h-full">No slides available</div>;
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="flex flex-col h-screen w-full bg-gray-900 text-white overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 shrink-0">
        <div className="font-semibold text-lg">{presentation.metadata.title}</div>
        <div className="text-sm text-gray-400">
          Slide {currentSlideIndex + 1} of {slides.length}
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 p-8 flex items-center justify-center overflow-auto">
        <div 
          className="relative w-full max-w-6xl shadow-2xl transition-transform duration-500 ease-in-out" 
          style={{ aspectRatio: "16/9" }}
        >
          {currentSlide && (
            <SlideRenderer 
              key={currentSlide.id}
              slide={currentSlide} 
              componentsData={currentSlide.components_data}
              theme={presentation.theme}
              assets={presentation.assets || {}}
            />
          )}
        </div>
      </main>

      {/* Controls */}
      <footer className="h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-center gap-6 shrink-0">
        <button 
          className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50"
          onClick={() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))}
          disabled={currentSlideIndex === 0}
        >
          ← Prev
        </button>
        <span className="text-sm">{currentSlideIndex + 1} / {slides.length}</span>
        <button 
          className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50"
          onClick={() => setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1))}
          disabled={currentSlideIndex === slides.length - 1}
        >
          Next →
        </button>
      </footer>
    </div>
  );
};

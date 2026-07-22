import { useEffect, useRef } from "react";

export function useFitText(options = { minFontSize: 16, maxFontSize: 120 }) {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    const fit = () => {
      // Don't resize if we are editing
      if (el.querySelector('input, textarea') || el.isContentEditable) return;

      let min = options.minFontSize;
      let max = options.maxFontSize;
      let best = min;
      
      // Save original styles
      const originalWidth = el.style.width;
      const originalHeight = el.style.height;
      const originalMaxHeight = el.style.maxHeight;
      
      el.style.width = '100%';
      // Temporarily give parent bounds for measuring if it's auto-sizing
      const parentWidth = parent.clientWidth;
      const parentHeight = parent.clientHeight || window.innerHeight; // fallback

      while (min <= max) {
        const mid = Math.floor((min + max) / 2);
        el.style.fontSize = `${mid}px`;
        
        if (el.scrollWidth <= parentWidth && el.scrollHeight <= parentHeight) {
          best = mid;
          min = mid + 1;
        } else {
          max = mid - 1;
        }
      }
      
      el.style.fontSize = `${best}px`;
      
      // Restore
      el.style.width = originalWidth;
      el.style.height = originalHeight;
      el.style.maxHeight = originalMaxHeight;
    };

    const observer = new ResizeObserver(() => requestAnimationFrame(fit));
    observer.observe(parent);
    
    const mutationObserver = new MutationObserver(() => requestAnimationFrame(fit));
    mutationObserver.observe(el, { characterData: true, childList: true, subtree: true });

    fit();

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [options.minFontSize, options.maxFontSize]);

  return ref;
}

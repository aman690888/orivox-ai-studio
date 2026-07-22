import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const Diagram: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      flowchart: { curve: 'basis' },
      themeVariables: { padding: 20 as any }
    });
    
    if (containerRef.current) {
      const mermaidString = data.mermaid_string || "graph TD;\n  Start --> Execution;";
      // generate a unique id for the mermaid container to avoid conflicts
      const id = `mermaid-${componentId || Math.random().toString(36).substring(7)}`;
      mermaid.render(id, mermaidString).then((result) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = result.svg;
        }
      }).catch(e => console.error(e));
    }
  }, [data.mermaid_string, componentId]);

  return (
    <div className="w-full rounded-3xl border p-[clamp(1.5rem,3cqw,2rem)] flex flex-col items-center justify-center my-4 shadow-2xl backdrop-blur-xl" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(24, 24, 27, 0.6)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)" }}>
      <div className="text-[clamp(2rem,4cqw,2.5rem)] mb-3">🔄</div>
      <h4 className="font-mono text-[clamp(0.7rem,1.2cqw,0.875rem)] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 shadow-inner border border-indigo-500/30" style={{ backgroundColor: theme?.colors?.badgeBg || "rgba(99, 102, 241, 0.15)", color: theme?.colors?.primary || "#818cf8" }}>Diagram: {data.variant || "Workflow"}</h4>
      <div ref={containerRef} className="w-full overflow-auto flex justify-center p-4">
        <pre className="text-[clamp(0.75rem,1.5cqw,0.875rem)] font-mono p-6 rounded-2xl text-left overflow-auto w-full max-h-64 whitespace-pre-wrap border border-white/10 shadow-inner text-emerald-400" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>{data.mermaid_string || "graph TD;\n  Start --> Execution;"}</pre>
      </div>
    </div>
  );
};

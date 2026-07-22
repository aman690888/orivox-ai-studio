import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const Timeline: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className="flex flex-col space-y-[clamp(1rem,2cqw,1.5rem)] w-full relative my-6 pl-[clamp(1rem,2cqw,1.5rem)]">
    <div className="absolute left-[clamp(1.5rem,3cqw,2rem)] top-4 bottom-4 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 opacity-50 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
    {(data.events || data.nodes || []).map((event: any, i: number) => (
      <div key={i} className="relative pl-[clamp(2.5rem,5cqw,3rem)] p-[clamp(1.25rem,2.5cqw,1.5rem)] rounded-3xl border shadow-xl backdrop-blur-md" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.03)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.08)" }}>
        <div className="absolute left-[-0.25rem] top-[2rem] w-4 h-4 rounded-full border-4 shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ backgroundColor: "#ffffff", borderColor: theme?.colors?.primary || "#6366f1" }} />
        <div className="text-[clamp(0.75rem,1.2cqw,0.875rem)] font-black uppercase tracking-widest mb-2" style={{ color: theme?.colors?.primary || "#818cf8" }}>{event.date || event.year || `Phase ${i + 1}`}</div>
        <div className="font-bold text-[clamp(1.25rem,2cqw,1.5rem)] mb-2 text-white">{event.title}</div>
        <p className="text-[clamp(0.875rem,1.5cqw,1rem)] opacity-80 leading-relaxed text-zinc-300">{event.description || event.content}</p>
      </div>
    ))}
  </div>

);

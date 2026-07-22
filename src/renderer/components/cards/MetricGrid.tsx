import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const MetricGrid: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className="grid grid-cols-2 @[40rem]:grid-cols-4 gap-[clamp(1rem,2cqw,1.5rem)] w-full my-4">
    {(data.metrics || []).map((m: any, i: number) => (
      <div key={i} className="p-[clamp(1.25rem,2.5cqw,1.5rem)] rounded-3xl border text-center shadow-xl backdrop-blur-md bg-white/[0.02] hover:bg-white/[0.05] transition-colors" style={{ borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)" }}>
        <div className="text-[clamp(2rem,4cqw,3rem)] font-black mb-2 drop-shadow-md" style={{ color: theme?.colors?.primary || "#818cf8" }}>{m.value}</div>
        <div className="text-[clamp(0.7rem,1.2cqw,0.875rem)] font-bold uppercase tracking-widest opacity-70 text-zinc-300">{m.label}</div>
      </div>
    ))}
  </div>

);

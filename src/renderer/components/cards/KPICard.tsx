import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const KPICard: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className="p-[clamp(1.5rem,3cqw,2rem)] rounded-3xl border shadow-2xl flex flex-col justify-center my-4 backdrop-blur-xl relative overflow-hidden" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(24, 24, 27, 0.7)", borderColor: theme?.colors?.cardBorder || "rgba(39, 39, 42, 0.5)", borderLeft: `6px solid ${theme?.colors?.primary || "#6366f1"}` }}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
    <span className="text-[clamp(0.75rem,1.25cqw,0.875rem)] font-bold uppercase tracking-widest opacity-70 mb-2 relative z-10">{data.label}</span>
    <span className="text-[clamp(3rem,6cqw,5rem)] font-black tracking-tighter my-1 drop-shadow-md relative z-10" style={{ color: theme?.colors?.primary || "#818cf8" }}>{data.value}</span>
    {data.trend && <span className="text-[clamp(0.875rem,1.5cqw,1rem)] font-bold text-emerald-400 mt-2 relative z-10 flex items-center gap-1"><span className="text-xl">↑</span> {data.trend}</span>}
  </div>

);

import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const IconCard: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className="p-[clamp(1.5rem,3cqw,2rem)] rounded-3xl border flex flex-col items-center text-center shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.03)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)" }}>
    <div className="text-[clamp(2.5rem,5cqw,4rem)] mb-4 p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner">{data.icon_name || data.icon || "🔹"}</div>
    <h3 className="font-bold text-[clamp(1.25rem,2cqw,1.5rem)] mb-2 text-white">{data.title}</h3>
    <p className="text-[clamp(0.875rem,1.5cqw,1rem)] opacity-80 leading-relaxed max-w-sm">{data.content || data.description}</p>
  </div>

);

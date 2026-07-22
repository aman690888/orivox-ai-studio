import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const TeamCard: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className="p-[clamp(1.5rem,3cqw,2rem)] rounded-3xl border flex flex-col items-center text-center shadow-2xl my-4 backdrop-blur-xl group hover:border-white/20 transition-colors" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.02)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.08)" }}>
    <div className="w-[clamp(5rem,10cqw,7rem)] h-[clamp(5rem,10cqw,7rem)] rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-[clamp(2rem,4cqw,3rem)] font-bold mb-4 border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">{data.name?.charAt(0) || "👤"}</div>
    <h3 className="font-bold text-[clamp(1.25rem,2cqw,1.5rem)] text-white">{data.name}</h3>
    <p className="text-[clamp(0.75rem,1.25cqw,0.875rem)] font-black uppercase tracking-widest opacity-90 mb-3 mt-1" style={{ color: theme?.colors?.primary || "#818cf8" }}>{data.role}</p>
    {data.bio && <p className="text-[clamp(0.875rem,1.5cqw,1rem)] opacity-70 leading-relaxed max-w-xs">{data.bio}</p>}
  </div>

);

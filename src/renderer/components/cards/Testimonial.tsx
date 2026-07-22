import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const Testimonial: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className="p-[clamp(1.5rem,3cqw,2.5rem)] rounded-3xl border shadow-2xl flex flex-col justify-between my-4 backdrop-blur-lg relative overflow-hidden" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.03)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.08)" }}>
    <div className="absolute top-4 right-4 text-[clamp(4rem,8cqw,6rem)] text-white/5 font-serif leading-none rotate-12 pointer-events-none">"</div>
    <div className="text-yellow-400 mb-4 text-[clamp(1.25rem,2cqw,1.5rem)] drop-shadow-[0_0_5px_rgba(250,204,21,0.5)] tracking-widest">★★★★★</div>
    <p className="italic text-[clamp(1.125rem,2cqw,1.5rem)] mb-6 opacity-95 leading-relaxed text-zinc-200 relative z-10">"{data.quote || data.text}"</p>
    <div className="flex items-center gap-4 relative z-10 mt-auto">
      <div className="w-[clamp(2.5rem,4cqw,3rem)] h-[clamp(2.5rem,4cqw,3rem)] rounded-full bg-white/10 border border-white/20"></div>
      <div>
        <div className="font-bold text-[clamp(1rem,1.5cqw,1.125rem)] text-white">{data.author}</div>
        {data.role && <div className="text-[clamp(0.75rem,1.25cqw,0.875rem)] opacity-70 text-indigo-300 font-medium">{data.role}</div>}
      </div>
    </div>
  </div>

);

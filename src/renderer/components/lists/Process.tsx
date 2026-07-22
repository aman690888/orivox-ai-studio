import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const Process: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className="grid grid-cols-1 @[40rem]:grid-cols-4 gap-[clamp(1rem,2cqw,1.5rem)] w-full my-6">
    {(data.steps || []).map((step: any, i: number) => (
      <div key={i} className="p-[clamp(1.5rem,3cqw,2rem)] rounded-3xl border flex flex-col items-center text-center relative shadow-xl backdrop-blur-md hover:-translate-y-2 transition-transform" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.02)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.08)" }}>
        <div className="w-[clamp(2.5rem,5cqw,3rem)] h-[clamp(2.5rem,5cqw,3rem)] rounded-2xl flex items-center justify-center font-black text-white mb-4 text-[clamp(1.25rem,2.5cqw,1.5rem)] shadow-lg border border-white/20 rotate-3" style={{ backgroundColor: theme?.colors?.primary || "#6366f1", backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)' }}>{i + 1}</div>
        <h4 className="font-bold text-[clamp(1.125rem,2cqw,1.25rem)] mb-2 text-white">{step.title}</h4>
        <p className="text-[clamp(0.875rem,1.5cqw,1rem)] opacity-80 leading-relaxed text-zinc-300">{step.description || step.content}</p>
      </div>
    ))}
  </div>

);

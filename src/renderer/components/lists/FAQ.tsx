import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const FAQ: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className="space-y-[clamp(0.75rem,1.5cqw,1rem)] w-full my-6">
    {(data.items || []).map((item: any, i: number) => (
      <div key={i} className="p-[clamp(1.25rem,2.5cqw,1.5rem)] rounded-3xl border shadow-lg backdrop-blur-md hover:bg-white/5 transition-colors cursor-pointer" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.02)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.08)" }}>
        <h4 className="font-bold text-[clamp(1.125rem,2cqw,1.25rem)] mb-2 flex justify-between items-center text-white">{item.question} <span className="text-indigo-400">+</span></h4>
        <p className="text-[clamp(0.875rem,1.5cqw,1rem)] opacity-80 leading-relaxed text-zinc-300 pr-8">{item.answer}</p>
      </div>
    ))}
  </div>

);

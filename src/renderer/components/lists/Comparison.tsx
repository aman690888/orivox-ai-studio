import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const Comparison: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className="grid grid-cols-1 @[40rem]:grid-cols-2 gap-[clamp(1.5rem,3cqw,2rem)] w-full my-6">
    <div className="p-[clamp(1.5rem,3cqw,2.5rem)] rounded-3xl border shadow-2xl backdrop-blur-lg relative overflow-hidden" style={{ backgroundColor: "rgba(239, 68, 68, 0.05)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
      <div className="absolute top-0 right-0 p-4 text-6xl opacity-5">✕</div>
      <h3 className="font-black text-[clamp(1.5rem,3cqw,2rem)] mb-6 text-red-400 border-b border-red-500/20 pb-4 tracking-tight">{data.left_title || data.left_column?.title || "Before"}</h3>
      <ul className="space-y-[clamp(0.75rem,1.5cqw,1rem)] relative z-10">
        {(data.left_items || data.left_column?.items || []).map((item: string, i: number) => (
          <li key={i} className="flex gap-3 text-[clamp(1rem,1.8cqw,1.125rem)] text-zinc-300 items-start"><span className="text-red-400 font-bold bg-red-400/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">✕</span> <span className="leading-relaxed">{item}</span></li>
        ))}
      </ul>
    </div>
    <div className="p-[clamp(1.5rem,3cqw,2.5rem)] rounded-3xl border shadow-2xl backdrop-blur-lg relative overflow-hidden" style={{ backgroundColor: "rgba(16, 185, 129, 0.05)", borderColor: "rgba(16, 185, 129, 0.2)" }}>
      <div className="absolute top-0 right-0 p-4 text-6xl opacity-5">✓</div>
      <h3 className="font-black text-[clamp(1.5rem,3cqw,2rem)] mb-6 text-emerald-400 border-b border-emerald-500/20 pb-4 tracking-tight">{data.right_title || data.right_column?.title || "After"}</h3>
      <ul className="space-y-[clamp(0.75rem,1.5cqw,1rem)] relative z-10">
        {(data.right_items || data.right_column?.items || []).map((item: string, i: number) => (
          <li key={i} className="flex gap-3 text-[clamp(1rem,1.8cqw,1.125rem)] text-zinc-200 items-start"><span className="text-emerald-400 font-bold bg-emerald-400/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">✓</span> <span className="leading-relaxed">{item}</span></li>
        ))}
      </ul>
    </div>
  </div>

);

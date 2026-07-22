import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const PricingCard: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className={`p-[clamp(2rem,4cqw,3rem)] rounded-[2.5rem] border flex flex-col justify-between shadow-2xl my-4 backdrop-blur-xl transition-transform hover:-translate-y-2 ${data.highlighted || data.is_popular ? "ring-2 scale-[1.02]" : ""}`} style={{ backgroundColor: theme?.colors?.cardBg || "rgba(24, 24, 27, 0.8)", borderColor: theme?.colors?.cardBorder || "rgba(39, 39, 42, 0.5)", boxShadow: data.highlighted ? "0 25px 50px -12px rgba(99, 102, 241, 0.3)" : undefined }}>
    <div>
      {data.highlighted && (<div className="text-[clamp(0.75rem,1.25cqw,0.875rem)] font-black uppercase tracking-widest mb-3 text-indigo-400 bg-indigo-500/10 inline-block px-3 py-1 rounded-full border border-indigo-500/20">Most Popular</div>)}
      <h3 className="text-[clamp(1.5rem,3cqw,2rem)] font-bold text-white">{data.tier || data.tier_name}</h3>
      <div className="text-[clamp(2.5rem,5cqw,4rem)] font-black my-6 tracking-tight flex items-baseline gap-2">{data.price} <span className="text-[clamp(1rem,1.5cqw,1.25rem)] font-medium opacity-50">/mo</span></div>
      <ul className="space-y-4 text-[clamp(0.875rem,1.5cqw,1rem)] opacity-90 mb-8">
        {(data.features || []).map((f: string, i: number) => (
          <li key={i} className="flex gap-3 items-start"><span className="text-emerald-400 font-bold bg-emerald-400/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">✓</span> <span className="leading-snug">{f}</span></li>
        ))}
      </ul>
    </div>
    <button className="w-full py-[clamp(1rem,2cqw,1.25rem)] rounded-2xl font-bold text-[clamp(1rem,1.5cqw,1.125rem)] transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] shadow-lg" style={{ backgroundColor: theme?.colors?.primary || "#6366f1", color: "#ffffff" }}>{data.button_text || "Choose Plan"}</button>
  </div>

);

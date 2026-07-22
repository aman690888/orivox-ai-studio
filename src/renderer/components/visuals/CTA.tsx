import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const CTA: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className="w-full p-[clamp(2.5rem,6cqw,4rem)] rounded-[3rem] text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 my-8 relative overflow-hidden group" style={{ background: theme?.colors?.accentGradient || "linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)", color: "#ffffff" }}>
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
    <div className="relative z-10">
      <h2 className="text-[clamp(2.5rem,6cqw,3.5rem)] font-black mb-4 tracking-tight drop-shadow-md">{data.title || "Take Action Today"}</h2>
      <p className="text-[clamp(1.125rem,2cqw,1.5rem)] opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">{data.description || data.subtitle || ""}</p>
      <button className="px-[clamp(2rem,4cqw,3rem)] py-[clamp(1rem,2cqw,1.25rem)] rounded-full font-black text-[clamp(1.125rem,2cqw,1.25rem)] bg-white text-gray-900 shadow-2xl transition-transform hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] border border-white/50">{data.button_text || data.label || "Get Started"}</button>
    </div>
  </div>

);

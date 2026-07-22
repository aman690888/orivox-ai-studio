import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const Image: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div 
    className="w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 my-4 bg-white/5 backdrop-blur-sm relative group"
    style={{
      WebkitMaskImage: data.gradientMask ? `linear-gradient(${data.gradientMaskDirection || 'to bottom'}, black 40%, transparent 100%)` : undefined,
      maskImage: data.gradientMask ? `linear-gradient(${data.gradientMaskDirection || 'to bottom'}, black 40%, transparent 100%)` : undefined,
    }}
  >
    <img src={(data.asset_id && assets?.[data.asset_id]?.url) || data.url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"} alt={data.alt_text || "Presentation graphic"} className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105" />
    {data.caption && <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-md p-3"><p className="text-[clamp(0.75rem,1.25cqw,1rem)] text-center opacity-90 italic text-white">{data.caption}</p></div>}
  </div>

);

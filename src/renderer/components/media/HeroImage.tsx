import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const HeroImage: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className="w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/15 my-4 relative group">
    <img src={(data.asset_id && assets?.[data.asset_id]?.url) || data.url || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80"} alt={data.alt_text || "Hero visual"} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/90 via-[#09090b]/40 to-transparent pointer-events-none" />
  </div>

);

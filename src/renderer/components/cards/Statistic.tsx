import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const Statistic: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className="flex items-center gap-[clamp(1.5rem,3cqw,2.5rem)] my-4 p-[clamp(1.5rem,3cqw,2rem)] rounded-3xl border shadow-xl backdrop-blur-md transition-transform hover:scale-[1.02]" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.03)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)" }}>
    <div className="text-[clamp(4rem,8cqw,6rem)] font-black tracking-tighter drop-shadow-lg" style={{ color: theme?.colors?.accent || theme?.colors?.primary || "#ec4899" }}>{data.value}</div>
    <div className="text-[clamp(1.125rem,2cqw,1.5rem)] leading-snug font-semibold opacity-90 max-w-sm text-zinc-200">{data.label}</div>
  </div>

);

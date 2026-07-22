import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const SectionDivider: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  <div className="w-full py-[clamp(2rem,8cqw,6rem)] flex flex-col items-center justify-center text-center h-full"><div className="w-20 h-2 mb-8 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ background: theme?.colors?.accentGradient || theme?.colors?.primary || "#6366f1" }} /><h1 className="text-[clamp(2.5rem,6cqw,5rem)] font-black mb-4 tracking-tight drop-shadow-md" style={{ color: theme?.colors?.textPrimary || "#ffffff" }}>{data.title}</h1>{data.subtitle && <p className="text-[clamp(1.25rem,2.5cqw,2rem)] opacity-80 max-w-3xl">{data.subtitle}</p>}</div>
);

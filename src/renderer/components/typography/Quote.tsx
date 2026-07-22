import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const Quote: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  <blockquote className="p-[clamp(1.5rem,3cqw,3rem)] rounded-3xl border-l-4 my-6 shadow-2xl relative overflow-hidden backdrop-blur-xl" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.03)", borderColor: theme?.colors?.primary || "#6366f1", borderTop: `1px solid ${theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)"}`, borderRight: `1px solid ${theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)"}`, borderBottom: `1px solid ${theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)"}` }}><p className="text-[clamp(1.25rem,2.5cqw,2rem)] font-serif italic leading-relaxed mb-4 text-white/90">" <EditableText slideId={slideId} componentId={componentId} field="content" value={data.content || data.text || ""} /> "</p>{(data.author || data.role) && (<footer className="text-[clamp(0.875rem,1.5cqw,1rem)] font-bold tracking-wider uppercase opacity-90" style={{ color: theme?.colors?.primary || "#818cf8" }}>— <EditableText slideId={slideId} componentId={componentId} field="author" value={data.author || ""} />{data.role && <span> ({data.role})</span>}</footer>)}</blockquote>
);

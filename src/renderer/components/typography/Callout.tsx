import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const Callout: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  <div className="p-[clamp(1.25rem,2.5cqw,2rem)] rounded-2xl border flex items-start gap-4 my-4 shadow-xl backdrop-blur-md" style={{ backgroundColor: theme?.colors?.badgeBg || "rgba(99, 102, 241, 0.1)", borderColor: theme?.colors?.primary || "#6366f1", color: theme?.colors?.textPrimary || "#ffffff" }}><span className="text-[clamp(1.5rem,3cqw,2rem)]">💡</span><div className="flex-1">{data.title && (<strong className="block text-[clamp(1.125rem,2cqw,1.5rem)] font-bold mb-1"><EditableText slideId={slideId} componentId={componentId} field="title" value={data.title} /></strong>)}<p className="text-[clamp(0.875rem,1.5cqw,1.125rem)] leading-relaxed opacity-90"><EditableText slideId={slideId} componentId={componentId} field={data.content ? "content" : "callout"} value={data.content || data.callout || data.text || ""} multiline /></p></div></div>
);

import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const Subtitle: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  <h2 className="text-[clamp(1.25rem,2.5cqw,2rem)] font-medium opacity-90 leading-snug mb-4" style={{ fontFamily: theme?.typography?.bodyFont || theme?.typography?.body || "sans-serif", color: theme?.colors?.textSecondary || theme?.colors?.secondary || "#cbd5e1", textAlign: data.alignment || "left" }}><EditableText slideId={slideId} componentId={componentId} field="content" value={data.content} /></h2>
);

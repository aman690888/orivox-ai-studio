import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const Paragraph: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  <p className="text-[clamp(1rem,1.5cqw,1.25rem)] leading-relaxed max-w-4xl opacity-90 mb-4" style={{ fontFamily: theme?.typography?.bodyFont || theme?.typography?.body || "sans-serif", color: theme?.colors?.textSecondary || "#cbd5e1" }}><EditableText slideId={slideId} componentId={componentId} field="content" value={data.content} multiline /></p>
);

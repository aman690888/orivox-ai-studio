import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const Icon: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  <div className="inline-flex items-center justify-center p-[clamp(0.75rem,2cqw,1.5rem)] rounded-3xl border shadow-xl backdrop-blur-lg" style={{ backgroundColor: theme?.colors?.badgeBg || "rgba(99, 102, 241, 0.15)", borderColor: theme?.colors?.primary || "#6366f1" }}><span className="text-[clamp(2rem,4cqw,3rem)]">{data.icon_name || "⚡"}</span></div>
);

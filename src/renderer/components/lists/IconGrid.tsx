import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const IconGrid: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className="grid grid-cols-2 @[40rem]:grid-cols-4 gap-[clamp(1rem,2cqw,1.5rem)] w-full my-4">
    {(data.items || []).map((item: any, i: number) => (
      <div key={i} className="flex flex-col items-center p-[clamp(1.25rem,2.5cqw,1.5rem)] rounded-3xl border text-center shadow-lg backdrop-blur-md hover:bg-white/5 transition-colors" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.02)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.08)" }}>
        <span className="text-[clamp(2rem,4cqw,2.5rem)] mb-3 drop-shadow-md">{item.icon_name || item.icon || "✨"}</span>
        <span className="font-semibold text-[clamp(0.875rem,1.5cqw,1.125rem)] text-zinc-200">{item.label || item.title}</span>
      </div>
    ))}
  </div>

);

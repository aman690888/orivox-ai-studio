import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const BulletList: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <ul className="space-y-[clamp(0.75rem,1.5cqw,1rem)] my-4 w-full">
    {(data.items || []).map((item: string, i: number) => (
      <li key={i} className="flex items-start gap-[clamp(0.75rem,1.5cqw,1.25rem)] p-[clamp(0.75rem,1.5cqw,1.25rem)] rounded-2xl transition-all backdrop-blur-sm shadow-md hover:translate-x-2" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.03)", border: `1px solid ${theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.05)"}` }}>
        <span className="w-[clamp(0.5rem,1cqw,0.75rem)] h-[clamp(0.5rem,1cqw,0.75rem)] rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]" style={{ backgroundColor: theme?.colors?.primary || "#6366f1" }} />
        <span className="text-[clamp(1rem,1.8cqw,1.25rem)] font-medium leading-relaxed flex-1 text-zinc-200">
          <EditableText slideId={slideId} componentId={componentId} field={`items[${i}]`} value={item} />
        </span>
      </li>
    ))}
  </ul>

);

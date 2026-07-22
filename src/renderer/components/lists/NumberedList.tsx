import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const NumberedList: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <ol className="space-y-[clamp(0.75rem,1.5cqw,1rem)] my-4 w-full">
    {(data.items || []).map((item: string, i: number) => (
      <li key={i} className="flex items-center gap-[clamp(1rem,2cqw,1.5rem)] p-[clamp(0.75rem,1.5cqw,1.25rem)] rounded-2xl backdrop-blur-sm shadow-md transition-all hover:bg-white/5" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.03)", border: `1px solid ${theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.05)"}` }}>
        <span className="w-[clamp(2rem,4cqw,2.5rem)] h-[clamp(2rem,4cqw,2.5rem)] rounded-xl flex items-center justify-center font-black text-[clamp(0.875rem,1.5cqw,1.125rem)] shrink-0 shadow-lg border border-white/20" style={{ backgroundColor: theme?.colors?.primary || "#6366f1", color: "#ffffff", backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)' }}>{i + 1}</span>
        <span className="text-[clamp(1rem,1.8cqw,1.25rem)] font-medium flex-1 text-zinc-200">
          <EditableText slideId={slideId} componentId={componentId} field={`items[${i}]`} value={item} />
        </span>
      </li>
    ))}
  </ol>

);

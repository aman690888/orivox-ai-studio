import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const Chart: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className="w-full p-[clamp(1.5rem,3cqw,2rem)] rounded-3xl border shadow-2xl flex flex-col items-center justify-center my-4 backdrop-blur-xl" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(24, 24, 27, 0.6)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)" }}>
    <div className="text-center mb-6">
      <span className="text-[clamp(2rem,4cqw,3rem)] mb-2 block drop-shadow-md">📊</span>
      <span className="font-black text-[clamp(1.25rem,2cqw,1.5rem)] tracking-tight text-white">{data.title || `${data.variant?.toUpperCase() || "DATA"} CHART`}</span>
    </div>
    <div className="w-full overflow-x-auto">
      <table className="text-[clamp(0.75rem,1.5cqw,0.875rem)] border-collapse w-full min-w-max rounded-2xl overflow-hidden bg-black/20">
        <thead>
          <tr style={{ backgroundColor: theme?.colors?.badgeBg || "rgba(99, 102, 241, 0.2)" }}>
            <th className="p-[clamp(0.75rem,1.5cqw,1rem)] border-b border-white/10 text-left font-bold text-indigo-200">Metric</th>
            {(data.datasets || []).map((ds: any, i: number) => (
              <th key={i} className="p-[clamp(0.75rem,1.5cqw,1rem)] border-b border-white/10 text-right font-bold text-indigo-200"><EditableText slideId={slideId} componentId={componentId} field={`datasets[${i}].label`} value={ds.label || `Series ${i + 1}`} /></th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {(data.labels || []).map((label: string, rowIdx: number) => (
            <tr key={rowIdx} className="hover:bg-white/[0.05] transition-colors">
              <td className="p-[clamp(0.75rem,1.5cqw,1rem)] font-medium text-zinc-300"><EditableText slideId={slideId} componentId={componentId} field={`labels[${rowIdx}]`} value={label} /></td>
              {(data.datasets || []).map((ds: any, colIdx: number) => (
                <td key={colIdx} className="p-[clamp(0.75rem,1.5cqw,1rem)] text-right font-bold text-white"><EditableText slideId={slideId} componentId={componentId} field={`datasets[${colIdx}].values[${rowIdx}]`} value={String(ds.values?.[rowIdx] ?? 0)} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

);

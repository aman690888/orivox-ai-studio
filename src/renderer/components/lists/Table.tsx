import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const Table: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className="overflow-hidden rounded-3xl border w-full shadow-2xl my-4 backdrop-blur-lg" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(24, 24, 27, 0.4)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)" }}>
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-[clamp(0.875rem,1.5cqw,1rem)]">
        <thead>
          <tr style={{ backgroundColor: theme?.colors?.badgeBg || "rgba(99, 102, 241, 0.15)" }}>
            {(data.headers || []).map((h: string, i: number) => (
              <th key={i} className="p-[clamp(1rem,2cqw,1.25rem)] font-black border-b border-white/10 uppercase tracking-widest text-[clamp(0.7rem,1.2cqw,0.875rem)] text-indigo-200">
                <EditableText slideId={slideId} componentId={componentId} field={`headers[${i}]`} value={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {(data.rows || []).map((row: string[], i: number) => (
            <tr key={i} className="hover:bg-white/[0.03] transition-colors">
              {row.map((cell: string, j: number) => (
                <td key={j} className="p-[clamp(1rem,2cqw,1.25rem)] font-medium text-zinc-300">
                  <EditableText slideId={slideId} componentId={componentId} field={`rows[${i}][${j}]`} value={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

);

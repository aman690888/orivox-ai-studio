import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const Flowchart: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className="w-full p-[clamp(1.5rem,3cqw,2.5rem)] rounded-3xl border text-center shadow-2xl my-4 backdrop-blur-xl" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(24, 24, 27, 0.6)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)" }}>
    <h4 className="font-black text-[clamp(1.25rem,2cqw,1.5rem)] mb-4 text-white tracking-tight">🔀 Decision & Process Flowchart</h4>
    <pre className="text-[clamp(0.75rem,1.5cqw,0.875rem)] font-mono p-6 rounded-2xl text-left overflow-auto w-full max-h-64 whitespace-pre-wrap border border-white/10 shadow-inner text-blue-400" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>{data.mermaid_string || `graph LR;
 A[Input] --> B{Valid?};
 B -- Yes --> C[Process];`}</pre>
  </div>

);

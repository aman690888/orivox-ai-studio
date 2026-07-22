import React from "react";
import { EditableText } from '../../EditableText';
import { BaseComponentProps } from '../../RendererRegistry';


export const CodeBlock: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  
  <div className="w-full my-4 rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-[#0d1117] relative group">
    <div className="flex items-center px-4 py-3 bg-[#161b22] border-b border-white/10">
      <div className="flex gap-2 mr-4">
        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
      </div>
      <div className="text-[clamp(0.7rem,1cqw,0.875rem)] font-mono text-zinc-400">snippet.js</div>
    </div>
    <pre className="w-full p-[clamp(1.25rem,2.5cqw,1.5rem)] text-emerald-400 font-mono text-[clamp(0.875rem,1.5cqw,1rem)] overflow-auto">
      <code>{data.code || "// Core Logic Output"}</code>
    </pre>
  </div>

);

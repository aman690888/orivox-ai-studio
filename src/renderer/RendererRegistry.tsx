import React from "react";
import type { ComponentType } from "../types/presentation-ir.types";
import { AssetRenderer } from "./AssetRenderer";
import { EditableText } from "./EditableText";

export interface BaseComponentProps<T = any> {
  data: T;
  theme?: any;
  styleOverrides?: Record<string, string | number>;
  assets?: Record<string, any>;
  slideId: string;
  componentId: string;
}

export const RendererRegistry: Record<ComponentType, React.FC<BaseComponentProps>> = {
  Title: ({ data, theme, slideId, componentId }) => (
    <h1
      className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-2"
      style={{
        fontFamily: theme?.typography?.headingFont || theme?.typography?.heading || "sans-serif",
        color: theme?.colors?.textPrimary || theme?.colors?.primary || "#ffffff",
        textAlign: data.alignment || "left",
      }}
    >
      <EditableText slideId={slideId} componentId={componentId} field="content" value={data.content} />
    </h1>
  ),

  Subtitle: ({ data, theme, slideId, componentId }) => (
    <h2
      className="text-xl md:text-2xl font-medium opacity-90 leading-snug mb-4"
      style={{
        fontFamily: theme?.typography?.bodyFont || theme?.typography?.body || "sans-serif",
        color: theme?.colors?.textSecondary || theme?.colors?.secondary || "#cbd5e1",
        textAlign: data.alignment || "left",
      }}
    >
      <EditableText slideId={slideId} componentId={componentId} field="content" value={data.content} />
    </h2>
  ),

  Paragraph: ({ data, theme, slideId, componentId }) => (
    <p
      className="text-base md:text-lg leading-relaxed max-w-3xl opacity-90 mb-4"
      style={{
        fontFamily: theme?.typography?.bodyFont || theme?.typography?.body || "sans-serif",
        color: theme?.colors?.textSecondary || "#cbd5e1",
      }}
    >
      <EditableText slideId={slideId} componentId={componentId} field="content" value={data.content} multiline />
    </p>
  ),

  BulletList: ({ data, theme, slideId, componentId }) => (
    <ul className="space-y-3 my-4 w-full">
      {(data.items || []).map((item: string, i: number) => (
        <li
          key={i}
          className="flex items-start gap-3 p-3 rounded-xl transition-all"
          style={{
            backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.05)",
            border: `1px solid ${theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)"}`,
          }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full mt-2 shrink-0"
            style={{ backgroundColor: theme?.colors?.primary || "#6366f1" }}
          />
          <span className="text-base font-medium leading-normal flex-1">
            <EditableText slideId={slideId} componentId={componentId} field={`items[${i}]`} value={item} />
          </span>
        </li>
      ))}
    </ul>
  ),

  NumberedList: ({ data, theme, slideId, componentId }) => (
    <ol className="space-y-3 my-4 w-full">
      {(data.items || []).map((item: string, i: number) => (
        <li
          key={i}
          className="flex items-center gap-4 p-3 rounded-xl"
          style={{
            backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.05)",
            border: `1px solid ${theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)"}`,
          }}
        >
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
            style={{
              backgroundColor: theme?.colors?.primary || "#6366f1",
              color: "#ffffff",
            }}
          >
            {i + 1}
          </span>
          <span className="text-base font-medium flex-1">
            <EditableText slideId={slideId} componentId={componentId} field={`items[${i}]`} value={item} />
          </span>
        </li>
      ))}
    </ol>
  ),

  Quote: ({ data, theme, slideId, componentId }) => (
    <blockquote
      className="p-6 md:p-8 rounded-2xl border-l-4 my-6 shadow-xl relative overflow-hidden"
      style={{
        backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.05)",
        borderColor: theme?.colors?.primary || "#6366f1",
        borderTop: `1px solid ${theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)"}`,
        borderRight: `1px solid ${theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)"}`,
        borderBottom: `1px solid ${theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)"}`,
      }}
    >
      <p className="text-xl md:text-2xl font-serif italic leading-relaxed mb-4">
        "<EditableText slideId={slideId} componentId={componentId} field="content" value={data.content || data.text || ""} />"
      </p>
      {(data.author || data.role) && (
        <footer className="text-sm font-semibold tracking-wide uppercase opacity-80" style={{ color: theme?.colors?.primary || "#818cf8" }}>
          — <EditableText slideId={slideId} componentId={componentId} field="author" value={data.author || ""} />
          {data.role && <span> ({data.role})</span>}
        </footer>
      )}
    </blockquote>
  ),

  Callout: ({ data, theme, slideId, componentId }) => (
    <div
      className="p-5 rounded-2xl border flex items-start gap-4 my-4"
      style={{
        backgroundColor: theme?.colors?.badgeBg || "rgba(99, 102, 241, 0.15)",
        borderColor: theme?.colors?.primary || "#6366f1",
        color: theme?.colors?.textPrimary || "#ffffff",
      }}
    >
      <span className="text-2xl">💡</span>
      <div className="flex-1">
        {data.title && (
          <strong className="block text-lg font-bold mb-1">
            <EditableText slideId={slideId} componentId={componentId} field="title" value={data.title} />
          </strong>
        )}
        <p className="text-sm md:text-base leading-relaxed opacity-90">
          <EditableText slideId={slideId} componentId={componentId} field={data.content ? "content" : "callout"} value={data.content || data.callout || data.text || ""} multiline />
        </p>
      </div>
    </div>
  ),

  Image: ({ data, assets }) => {
    const imageUrl = (data.asset_id && assets?.[data.asset_id]?.url) || data.url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";
    return (
      <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-white/10 my-4">
        <img src={imageUrl} alt={data.alt_text || "Presentation graphic"} className="w-full h-48 md:h-64 object-cover" />
        {data.caption && <p className="text-xs text-center p-2 opacity-70 italic">{data.caption}</p>}
      </div>
    );
  },

  HeroImage: ({ data, assets }) => {
    const imageUrl = (data.asset_id && assets?.[data.asset_id]?.url) || data.url || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80";
    return (
      <div className="w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl border border-white/15 my-4 relative">
        <img src={imageUrl} alt={data.alt_text || "Hero visual"} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
    );
  },

  Icon: ({ data, theme }) => (
    <div
      className="inline-flex items-center justify-center p-3 rounded-2xl border"
      style={{
        backgroundColor: theme?.colors?.badgeBg || "rgba(99, 102, 241, 0.2)",
        borderColor: theme?.colors?.primary || "#6366f1",
      }}
    >
      <span className="text-3xl">{data.icon_name || "⚡"}</span>
    </div>
  ),

  IconCard: ({ data, theme }) => (
    <div
      className="p-6 rounded-2xl border flex flex-col items-center text-center shadow-md transition-all hover:scale-[1.02]"
      style={{
        backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.05)",
        borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="text-4xl mb-3">{data.icon_name || data.icon || "🔹"}</div>
      <h3 className="font-bold text-lg mb-2">{data.title}</h3>
      <p className="text-sm opacity-80 leading-normal">{data.content || data.description}</p>
    </div>
  ),

  FeatureCard: ({ data, theme }) => (
    <div
      className="p-6 rounded-2xl border shadow-lg flex flex-col justify-between transition-all"
      style={{
        backgroundColor: theme?.colors?.cardBg || "#18181b",
        borderColor: theme?.colors?.cardBorder || "#27272a",
        borderTop: `4px solid ${theme?.colors?.accent || theme?.colors?.primary || "#6366f1"}`,
      }}
    >
      <div>
        <h3 className="text-xl font-bold mb-2">{data.title}</h3>
        <p className="text-sm opacity-80 leading-relaxed">{data.description}</p>
      </div>
    </div>
  ),

  IconGrid: ({ data, theme }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full my-4">
      {(data.items || []).map((item: any, i: number) => (
        <div
          key={i}
          className="flex flex-col items-center p-4 rounded-xl border text-center"
          style={{
            backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.05)",
            borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)",
          }}
        >
          <span className="text-3xl mb-2">{item.icon_name || item.icon || "✨"}</span>
          <span className="font-medium text-sm">{item.label || item.title}</span>
        </div>
      ))}
    </div>
  ),

  Timeline: ({ data, theme }) => (
    <div className="flex flex-col space-y-4 w-full relative my-4 pl-4">
      <div
        className="absolute left-6 top-2 bottom-2 w-1 rounded-full"
        style={{ backgroundColor: theme?.colors?.primary || "#6366f1" }}
      />
      {(data.events || data.nodes || []).map((event: any, i: number) => (
        <div
          key={i}
          className="relative pl-8 p-4 rounded-xl border"
          style={{
            backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.05)",
            borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            className="absolute left-0 top-6 w-4 h-4 rounded-full transform -translate-x-1/2 border-2"
            style={{ backgroundColor: theme?.colors?.primary || "#6366f1", borderColor: "#ffffff" }}
          />
          <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: theme?.colors?.primary || "#818cf8" }}>
            {event.date || event.year || `Phase ${i + 1}`}
          </div>
          <div className="font-bold text-lg mb-1">{event.title}</div>
          <p className="text-sm opacity-80 leading-normal">{event.description || event.content}</p>
        </div>
      ))}
    </div>
  ),

  Process: ({ data, theme }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full my-4">
      {(data.steps || []).map((step: any, i: number) => (
        <div
          key={i}
          className="p-5 rounded-2xl border flex flex-col items-center text-center relative"
          style={{
            backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.05)",
            borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mb-3 text-base shadow-md"
            style={{ backgroundColor: theme?.colors?.primary || "#6366f1" }}
          >
            {i + 1}
          </div>
          <h4 className="font-bold text-base mb-1">{step.title}</h4>
          <p className="text-xs opacity-80 leading-relaxed">{step.description || step.content}</p>
        </div>
      ))}
    </div>
  ),

  Comparison: ({ data, theme }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full my-4">
      <div
        className="p-6 rounded-2xl border shadow-lg"
        style={{
          backgroundColor: "rgba(239, 68, 68, 0.08)",
          borderColor: "rgba(239, 68, 68, 0.3)",
        }}
      >
        <h3 className="font-bold text-xl mb-4 text-red-400 border-b border-red-500/20 pb-2">
          {data.left_title || data.left_column?.title || "Before"}
        </h3>
        <ul className="space-y-2">
          {(data.left_items || data.left_column?.items || []).map((item: string, i: number) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-red-400">✕</span> <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div
        className="p-6 rounded-2xl border shadow-lg"
        style={{
          backgroundColor: "rgba(16, 185, 129, 0.08)",
          borderColor: "rgba(16, 185, 129, 0.3)",
        }}
      >
        <h3 className="font-bold text-xl mb-4 text-emerald-400 border-b border-emerald-500/20 pb-2">
          {data.right_title || data.right_column?.title || "After"}
        </h3>
        <ul className="space-y-2">
          {(data.right_items || data.right_column?.items || []).map((item: string, i: number) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-emerald-400">✓</span> <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  ),

  Table: ({ data, theme, slideId, componentId }) => (
    <div
      className="overflow-hidden rounded-2xl border w-full shadow-lg my-4"
      style={{
        backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.05)",
        borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)",
      }}
    >
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr style={{ backgroundColor: theme?.colors?.badgeBg || "rgba(99, 102, 241, 0.2)" }}>
            {(data.headers || []).map((h: string, i: number) => (
              <th key={i} className="p-3.5 font-bold border-b border-white/10 uppercase tracking-wider text-xs">
                <EditableText slideId={slideId} componentId={componentId} field={`headers[${i}]`} value={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(data.rows || []).map((row: string[], i: number) => (
            <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5">
              {row.map((cell: string, j: number) => (
                <td key={j} className="p-3.5 opacity-90">
                  <EditableText slideId={slideId} componentId={componentId} field={`rows[${i}][${j}]`} value={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),

  KPICard: ({ data, theme }) => (
    <div
      className="p-6 rounded-2xl border shadow-xl flex flex-col justify-center my-4"
      style={{
        backgroundColor: theme?.colors?.cardBg || "#18181b",
        borderColor: theme?.colors?.cardBorder || "#27272a",
        borderLeft: `4px solid ${theme?.colors?.primary || "#6366f1"}`,
      }}
    >
      <span className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{data.label}</span>
      <span className="text-5xl font-black tracking-tight my-1" style={{ color: theme?.colors?.primary || "#818cf8" }}>
        {data.value}
      </span>
      {data.trend && <span className="text-xs font-semibold text-emerald-400 mt-1">{data.trend}</span>}
    </div>
  ),

  Statistic: ({ data, theme }) => (
    <div className="flex items-center gap-6 my-4 p-6 rounded-2xl border" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.05)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)" }}>
      <div className="text-6xl font-black tracking-tight" style={{ color: theme?.colors?.accent || theme?.colors?.primary || "#ec4899" }}>
        {data.value}
      </div>
      <div className="text-lg leading-snug font-medium opacity-90 max-w-xs">{data.label}</div>
    </div>
  ),

  MetricGrid: ({ data, theme }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full my-4">
      {(data.metrics || []).map((m: any, i: number) => (
        <div
          key={i}
          className="p-5 rounded-2xl border text-center shadow-md"
          style={{
            backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.05)",
            borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="text-3xl font-black mb-1" style={{ color: theme?.colors?.primary || "#818cf8" }}>
            {m.value}
          </div>
          <div className="text-xs font-bold uppercase tracking-wider opacity-70">{m.label}</div>
        </div>
      ))}
    </div>
  ),

  Chart: ({ data, theme, slideId, componentId }) => (
    <div
      className="w-full p-6 rounded-2xl border shadow-xl flex flex-col items-center justify-center my-4"
      style={{
        backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.05)",
        borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="text-center mb-4">
        <span className="text-3xl mb-1 block">📊</span>
        <span className="font-bold text-lg">{data.title || `${data.variant?.toUpperCase() || "DATA"} CHART`}</span>
      </div>
      <table className="text-xs border-collapse w-full max-w-lg rounded-xl overflow-hidden">
        <thead>
          <tr style={{ backgroundColor: theme?.colors?.badgeBg || "rgba(99, 102, 241, 0.2)" }}>
            <th className="p-2 border border-white/10">Metric</th>
            {(data.datasets || []).map((ds: any, i: number) => (
              <th key={i} className="p-2 border border-white/10">
                <EditableText slideId={slideId} componentId={componentId} field={`datasets[${i}].label`} value={ds.label || `Series ${i + 1}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(data.labels || []).map((label: string, rowIdx: number) => (
            <tr key={rowIdx} className="hover:bg-white/5">
              <td className="p-2 border border-white/10 font-medium">
                <EditableText slideId={slideId} componentId={componentId} field={`labels[${rowIdx}]`} value={label} />
              </td>
              {(data.datasets || []).map((ds: any, colIdx: number) => (
                <td key={colIdx} className="p-2 border border-white/10 text-center font-bold" style={{ color: theme?.colors?.primary || "#818cf8" }}>
                  <EditableText slideId={slideId} componentId={componentId} field={`datasets[${colIdx}].values[${rowIdx}]`} value={String(ds.values?.[rowIdx] ?? 0)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),

  Diagram: ({ data, theme }) => (
    <div
      className="w-full rounded-2xl border p-6 flex flex-col items-center justify-center my-4 shadow-xl"
      style={{
        backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.05)",
        borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="text-2xl mb-2">🔄</div>
      <h4 className="font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3" style={{ backgroundColor: theme?.colors?.badgeBg || "rgba(99, 102, 241, 0.2)", color: theme?.colors?.primary || "#818cf8" }}>
        Diagram: {data.variant || "Workflow"}
      </h4>
      <pre className="text-xs font-mono p-4 rounded-xl text-left overflow-auto w-full max-h-48 whitespace-pre-wrap border border-white/10" style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
        {data.mermaid_string || "graph TD;\n  Start --> Execution;"}
      </pre>
    </div>
  ),

  Flowchart: ({ data, theme }) => (
    <div
      className="w-full p-6 rounded-2xl border text-center shadow-lg my-4"
      style={{
        backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.05)",
        borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)",
      }}
    >
      <h4 className="font-bold text-lg mb-3">🔀 Decision & Process Flowchart</h4>
      <pre className="text-xs font-mono p-4 rounded-xl text-left overflow-auto w-full max-h-48 whitespace-pre-wrap border border-white/10" style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
        {data.mermaid_string || "graph LR;\n A[Input] --> B{Valid?};\n B -- Yes --> C[Process];"}
      </pre>
    </div>
  ),

  MindMap: ({ data, theme }) => (
    <div
      className="w-full p-6 rounded-2xl border text-center shadow-lg my-4"
      style={{
        backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.05)",
        borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)",
      }}
    >
      <h4 className="font-bold text-lg mb-3">🧠 MindMap & Hierarchy</h4>
      <pre className="text-xs font-mono p-4 rounded-xl text-left overflow-auto w-full max-h-48 whitespace-pre-wrap border border-white/10" style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
        {data.mermaid_string || "graph TD;\n Core --> SubTopic1;\n Core --> SubTopic2;"}
      </pre>
    </div>
  ),

  CodeBlock: ({ data }) => (
    <pre className="w-full p-5 bg-black/80 text-emerald-400 rounded-2xl border border-white/10 font-mono text-sm shadow-inner overflow-auto my-4">
      <code>{data.code || "// Core Logic Output"}</code>
    </pre>
  ),

  Video: ({ data, assets }) => (
    <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/15 my-4 relative bg-black">
      {data.asset_id && assets?.[data.asset_id] ? (
        <AssetRenderer asset={assets[data.asset_id]} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black/40">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <span className="text-2xl text-white">▶</span>
          </div>
        </div>
      )}
    </div>
  ),

  CTA: ({ data, theme }) => (
    <div
      className="w-full p-8 md:p-12 rounded-3xl text-center shadow-2xl border my-6 relative overflow-hidden"
      style={{
        background: theme?.colors?.accentGradient || "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
        color: "#ffffff",
      }}
    >
      <h2 className="text-3xl md:text-4xl font-black mb-3">{data.title || "Take Action Today"}</h2>
      <p className="text-base md:text-lg opacity-90 mb-6 max-w-xl mx-auto">{data.description || data.subtitle || ""}</p>
      <button className="px-8 py-4 rounded-full font-bold text-lg bg-white text-gray-900 shadow-xl transition-transform hover:scale-105">
        {data.button_text || data.label || "Get Started"}
      </button>
    </div>
  ),

  Testimonial: ({ data, theme }) => (
    <div
      className="p-6 rounded-2xl border shadow-xl flex flex-col justify-between my-4"
      style={{
        backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.05)",
        borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="text-yellow-400 mb-3 text-lg">★★★★★</div>
      <p className="italic text-base md:text-lg mb-4 opacity-90">"{data.quote || data.text}"</p>
      <div className="flex items-center gap-3">
        <div className="font-bold text-sm">{data.author}</div>
        {data.role && <div className="text-xs opacity-70">({data.role})</div>}
      </div>
    </div>
  ),

  TeamCard: ({ data, theme }) => (
    <div
      className="p-6 rounded-2xl border flex flex-col items-center text-center shadow-lg my-4"
      style={{
        backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.05)",
        borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold mb-3 border border-white/20">
        {data.name?.charAt(0) || "👤"}
      </div>
      <h3 className="font-bold text-lg">{data.name}</h3>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-2" style={{ color: theme?.colors?.primary || "#818cf8" }}>
        {data.role}
      </p>
      {data.bio && <p className="text-xs opacity-80 leading-normal">{data.bio}</p>}
    </div>
  ),

  PricingCard: ({ data, theme }) => (
    <div
      className={`p-8 rounded-3xl border flex flex-col justify-between shadow-2xl my-4 ${data.highlighted || data.is_popular ? "ring-2" : ""}`}
      style={{
        backgroundColor: theme?.colors?.cardBg || "#18181b",
        borderColor: theme?.colors?.cardBorder || "#27272a",
        boxShadow: data.highlighted ? "0 20px 25px -5px rgba(99, 102, 241, 0.3)" : undefined,
      }}
    >
      <div>
        {data.highlighted && (
          <div className="text-xs font-bold uppercase tracking-wider mb-2 text-indigo-400">Most Popular</div>
        )}
        <h3 className="text-2xl font-bold">{data.tier || data.tier_name}</h3>
        <div className="text-4xl font-black my-4">{data.price}</div>
        <ul className="space-y-2 text-sm opacity-90 mb-6">
          {(data.features || []).map((f: string, i: number) => (
            <li key={i} className="flex gap-2"><span>✓</span> <span>{f}</span></li>
          ))}
        </ul>
      </div>
      <button className="w-full py-3.5 rounded-xl font-bold text-base transition-opacity hover:opacity-90" style={{ backgroundColor: theme?.colors?.primary || "#6366f1", color: "#ffffff" }}>
        {data.button_text || "Choose Plan"}
      </button>
    </div>
  ),

  FAQ: ({ data, theme }) => (
    <div className="space-y-3 w-full my-4">
      {(data.items || []).map((item: any, i: number) => (
        <div
          key={i}
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.05)",
            borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)",
          }}
        >
          <h4 className="font-bold text-base mb-1">{item.question}</h4>
          <p className="text-sm opacity-80 leading-normal">{item.answer}</p>
        </div>
      ))}
    </div>
  ),

  Footer: ({ data }) => (
    <div className="mt-auto w-full pt-4 border-t border-white/10 text-xs opacity-50 flex justify-between">
      <span>{data.content || data.text || "Generated by Orivox V3"}</span>
      <span>{data.show_slide_number ? "Page" : ""}</span>
    </div>
  ),

  SectionDivider: ({ data, theme }) => (
    <div className="w-full py-16 flex flex-col items-center justify-center text-center h-full">
      <div className="w-16 h-1.5 mb-6 rounded-full" style={{ background: theme?.colors?.accentGradient || theme?.colors?.primary || "#6366f1" }} />
      <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight" style={{ color: theme?.colors?.textPrimary || "#ffffff" }}>
        {data.title}
      </h1>
      {data.subtitle && <p className="text-xl md:text-2xl opacity-80 max-w-2xl">{data.subtitle}</p>}
    </div>
  ),
};

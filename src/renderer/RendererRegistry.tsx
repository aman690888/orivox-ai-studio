import React from "react";
import type { ComponentIR, ComponentType } from "../types/presentation-ir.types";

// Base interface for all component renderers
export interface BaseComponentProps<T = any> {
  data: T;
  theme?: any;
  styleOverrides?: Record<string, string | number>;
  assets?: Record<string, any>;
  slideId: string;
  componentId: string;
}

import { AssetRenderer } from "./AssetRenderer";
import { EditableText } from "./EditableText";

export const RendererRegistry: Record<ComponentType, React.FC<BaseComponentProps>> = {
  Title: ({ data, theme, slideId, componentId }) => (
    <h1 
      className="text-4xl font-bold tracking-tight" 
      style={{ 
        fontFamily: theme?.typography?.heading || "sans-serif",
        color: theme?.colors?.primary || "inherit",
        textAlign: data.alignment || "left"
      }}
    >
      <EditableText slideId={slideId} componentId={componentId} field="content" value={data.content} />
    </h1>
  ),
  Subtitle: ({ data, theme, slideId, componentId }) => (
    <h2 
      className="text-2xl font-medium opacity-80"
      style={{ 
        fontFamily: theme?.typography?.heading || "sans-serif",
        textAlign: data.alignment || "left"
      }}
    >
      <EditableText slideId={slideId} componentId={componentId} field="content" value={data.content} />
    </h2>
  ),
  Paragraph: ({ data, theme, slideId, componentId }) => (
    <p 
      className="text-lg leading-relaxed max-w-prose"
      style={{ 
        fontFamily: theme?.typography?.body || "sans-serif",
      }}
    >
      <EditableText slideId={slideId} componentId={componentId} field="content" value={data.content} multiline />
    </p>
  ),
  BulletList: ({ data, theme, slideId, componentId }) => (
    <ul className="list-disc list-outside ml-6 space-y-2 text-lg">
      {(data.items || []).map((item: string, i: number) => (
        <li key={i} style={{ fontFamily: theme?.typography?.body || "sans-serif" }}>
          {/* Note: In a real app we'd need array mutation hooks, but for MVP we can edit raw string if we mapped it, 
              but since it's an array of strings, we'll need an EditableArray. 
              Let's build a quick inline string editor for the array items. */}
          <EditableText 
            slideId={slideId} 
            componentId={componentId} 
            field={`items[${i}]`} // We'll need a generic deep-update in updateComponentData for this to work
            value={item} 
          />
        </li>
      ))}
    </ul>
  ),
  NumberedList: ({ data, theme, slideId, componentId }) => (
    <ol className="list-decimal list-outside ml-6 space-y-2 text-lg">
      {(data.items || []).map((item: string, i: number) => (
        <li key={i} style={{ fontFamily: theme?.typography?.body || "sans-serif" }}>
          <EditableText slideId={slideId} componentId={componentId} field={`items[${i}]`} value={item} />
        </li>
      ))}
    </ol>
  ),
  Quote: ({ data, theme, slideId, componentId }) => (
    <blockquote className="border-l-4 pl-4 italic text-xl my-4 opacity-90" style={{ borderColor: theme?.colors?.accent || "currentColor" }}>
      "<EditableText slideId={slideId} componentId={componentId} field="content" value={data.content} />"
      {data.author && <footer className="text-sm mt-2 font-semibold">— <EditableText slideId={slideId} componentId={componentId} field="author" value={data.author} /></footer>}
    </blockquote>
  ),
  Callout: ({ data, theme, slideId, componentId }) => (
    <div className="p-4 rounded-md border" style={{ backgroundColor: `${theme?.colors?.primary}15`, borderColor: theme?.colors?.primary }}>
      {data.title && <strong><EditableText slideId={slideId} componentId={componentId} field="title" value={data.title} /></strong>}
      <p><EditableText slideId={slideId} componentId={componentId} field={data.content ? 'content' : 'callout'} value={data.content || data.callout || ''} multiline /></p>
    </div>
  ),
  Image: ({ data, assets }) => {
    if (data.asset_id && assets?.[data.asset_id]) {
      return (
        <div className="rounded-xl overflow-hidden shadow-sm">
          <AssetRenderer asset={assets[data.asset_id]} className="w-full h-auto object-cover" />
          {data.caption && <p className="text-sm text-center mt-2 opacity-70">{data.caption}</p>}
        </div>
      );
    }
    return (
      <div className="rounded-xl overflow-hidden shadow-sm">
        <img src={data.url || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"} alt={data.alt_text || "Image"} className="w-full h-auto object-cover" />
        {data.caption && <p className="text-sm text-center mt-2 opacity-70">{data.caption}</p>}
      </div>
    );
  },
  HeroImage: ({ data, assets }) => {
    if (data.asset_id && assets?.[data.asset_id]) {
      return (
        <div className="w-full h-64 rounded-2xl overflow-hidden shadow-lg mb-6">
          <AssetRenderer asset={assets[data.asset_id]} className="w-full h-full object-cover" />
        </div>
      );
    }
    return (
      <div className="w-full h-64 rounded-2xl overflow-hidden shadow-lg mb-6">
        <img src={data.url || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200"} alt={data.alt_text || "Hero"} className="w-full h-full object-cover" />
      </div>
    );
  },
  Icon: ({ data, theme }) => (
    <div className="inline-flex items-center justify-center p-2 rounded-full" style={{ backgroundColor: `${theme?.colors?.primary}20`, color: theme?.colors?.primary }}>
      <span className="text-2xl">{data.icon_name || "⭐"}</span>
    </div>
  ),
  IconCard: ({ data, theme }) => (
    <div className="p-6 rounded-xl border bg-white shadow-sm flex flex-col items-center text-center">
      <div className="mb-4 text-4xl" style={{ color: theme?.colors?.primary }}>{data.icon_name || "🔹"}</div>
      <h3 className="font-bold text-lg mb-2">{data.title}</h3>
      <p className="text-sm opacity-80">{data.content}</p>
    </div>
  ),
  FeatureCard: ({ data, theme }) => (
    <div className="flex flex-col p-6 rounded-2xl bg-white shadow-md border-t-4" style={{ borderColor: theme?.colors?.accent || "#333" }}>
      <h3 className="text-xl font-bold mb-2">{data.title}</h3>
      <p className="opacity-80">{data.description}</p>
    </div>
  ),
  IconGrid: ({ data, theme }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
      {(data.items || []).map((item: any, i: number) => (
        <div key={i} className="flex flex-col items-center p-4 border rounded-lg">
          <span className="text-3xl mb-2" style={{ color: theme?.colors?.primary }}>{item.icon_name || "✨"}</span>
          <span className="font-medium text-sm">{item.label}</span>
        </div>
      ))}
    </div>
  ),
  Timeline: ({ data, theme }) => (
    <div className="flex flex-col space-y-4 w-full relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ backgroundColor: theme?.colors?.primary || "#ccc" }} />
      {(data.events || []).map((event: any, i: number) => (
        <div key={i} className="relative pl-10">
          <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full transform -translate-x-1/2" style={{ backgroundColor: theme?.colors?.accent || "#000" }} />
          <div className="font-bold">{event.date}</div>
          <div className="font-semibold text-lg">{event.title}</div>
          <p className="text-sm opacity-80">{event.description}</p>
        </div>
      ))}
    </div>
  ),
  Process: ({ data, theme }) => (
    <div className="flex flex-col md:flex-row gap-4 w-full justify-between items-start">
      {(data.steps || []).map((step: any, i: number) => (
        <div key={i} className="flex-1 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xl mb-3" style={{ backgroundColor: theme?.colors?.primary || "#333" }}>
            {i + 1}
          </div>
          <h4 className="font-bold">{step.title}</h4>
          <p className="text-sm opacity-80">{step.description}</p>
        </div>
      ))}
    </div>
  ),
  Comparison: ({ data, theme }) => (
    <div className="grid grid-cols-2 gap-8 w-full">
      <div className="p-6 rounded-xl border bg-red-50 text-red-900 border-red-200">
        <h3 className="font-bold text-xl mb-4 border-b border-red-200 pb-2">{data.left_title || "Before"}</h3>
        <ul className="space-y-2">
          {(data.left_items || []).map((item: string, i: number) => <li key={i} className="flex gap-2"><span>❌</span> <span>{item}</span></li>)}
        </ul>
      </div>
      <div className="p-6 rounded-xl border bg-green-50 text-green-900 border-green-200">
        <h3 className="font-bold text-xl mb-4 border-b border-green-200 pb-2">{data.right_title || "After"}</h3>
        <ul className="space-y-2">
          {(data.right_items || []).map((item: string, i: number) => <li key={i} className="flex gap-2"><span>✅</span> <span>{item}</span></li>)}
        </ul>
      </div>
    </div>
  ),
  Table: ({ data, theme, slideId, componentId }) => (
    <div className="overflow-hidden rounded-xl border w-full shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr style={{ backgroundColor: `${theme?.colors?.primary}15` }}>
            {(data.headers || []).map((h: string, i: number) => (
              <th key={i} className="p-3 font-semibold border-b">
                <EditableText slideId={slideId} componentId={componentId} field={`headers[${i}]`} value={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(data.rows || []).map((row: string[], i: number) => (
            <tr key={i} className="border-b last:border-0 hover:bg-black/5">
              {row.map((cell: string, j: number) => (
                <td key={j} className="p-3">
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
    <div className="p-6 rounded-2xl bg-white shadow-md flex flex-col justify-center border-l-4" style={{ borderColor: theme?.colors?.primary || "#333" }}>
      <span className="text-sm font-semibold opacity-70 uppercase tracking-wider mb-1">{data.label}</span>
      <span className="text-4xl font-black" style={{ color: theme?.colors?.primary }}>{data.value}</span>
      {data.trend && (
        <span className={`text-sm mt-2 ${data.trend.includes("+") ? "text-green-600" : "text-red-600"}`}>
          {data.trend}
        </span>
      )}
    </div>
  ),
  Statistic: ({ data, theme }) => (
    <div className="flex items-center gap-4">
      <div className="text-5xl font-black" style={{ color: theme?.colors?.accent || "#e11d48" }}>{data.value}</div>
      <div className="text-lg leading-tight font-medium opacity-80 max-w-[200px]">{data.label}</div>
    </div>
  ),
  MetricGrid: ({ data, theme }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {(data.metrics || []).map((m: any, i: number) => (
        <div key={i} className="p-4 bg-gray-50 rounded-xl text-center border">
          <div className="text-3xl font-bold mb-1" style={{ color: theme?.colors?.primary }}>{m.value}</div>
          <div className="text-xs uppercase font-semibold opacity-70">{m.label}</div>
        </div>
      ))}
    </div>
  ),
  Chart: ({ data, theme, slideId, componentId }) => {
    // If it's editable, show a mini data grid for the dataset
    return (
      <div className="w-full h-64 bg-gray-50 border rounded-xl flex flex-col items-center justify-center p-4 overflow-auto">
        <div className="text-center mb-4">
          <span className="text-3xl mb-1 block">📊</span>
          <span className="font-semibold text-gray-700">{data.variant?.toUpperCase()} Chart Data</span>
        </div>
        <table className="text-sm bg-white border border-collapse w-full max-w-lg">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100">Label</th>
              {(data.datasets || []).map((ds: any, i: number) => (
                <th key={i} className="border p-2 bg-gray-100">
                  <EditableText slideId={slideId} componentId={componentId} field={`datasets[${i}].label`} value={ds.label || `Dataset ${i+1}`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data.labels || []).map((label: string, rowIdx: number) => (
              <tr key={rowIdx}>
                <td className="border p-2 font-medium">
                  <EditableText slideId={slideId} componentId={componentId} field={`labels[${rowIdx}]`} value={label} />
                </td>
                {(data.datasets || []).map((ds: any, colIdx: number) => (
                  <td key={colIdx} className="border p-2 text-center text-blue-600">
                    <EditableText slideId={slideId} componentId={componentId} field={`datasets[${colIdx}].values[${rowIdx}]`} value={String(ds.values?.[rowIdx] ?? 0)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
  Diagram: ({ data, theme }) => (
    <div className="w-full bg-white border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center">
      <div className="text-2xl mb-2">🔄</div>
      <h4 className="font-mono text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">Diagram: {data.variant}</h4>
      <pre className="mt-4 text-xs bg-gray-50 p-4 rounded text-left overflow-auto w-full max-h-40 whitespace-pre-wrap">
        {data.mermaid_string || "graph TD;\n  A-->B;"}
      </pre>
    </div>
  ),
  Flowchart: ({ data, theme }) => (
    <div className="w-full p-6 bg-slate-50 border rounded-xl flex justify-center items-center">
       <span className="font-semibold opacity-70">Flowchart Placeholder</span>
    </div>
  ),
  MindMap: ({ data }) => (
    <div className="w-full p-6 bg-slate-50 border rounded-xl flex justify-center items-center">
       <span className="font-semibold opacity-70">MindMap Placeholder</span>
    </div>
  ),
  CodeBlock: ({ data }) => (
    <pre className="w-full p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto font-mono text-sm shadow-inner">
      <code>{data.code}</code>
    </pre>
  ),
  Video: ({ data, assets }) => {
    if (data.asset_id && assets?.[data.asset_id]) {
      return (
        <div className="w-full aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-lg">
          <AssetRenderer asset={assets[data.asset_id]} className="w-full h-full object-cover" />
        </div>
      );
    }
    return (
      <div className="w-full aspect-video bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg pl-1">
            <span className="text-2xl">▶</span>
          </div>
        </div>
        {data.url && <img src={data.thumbnail_url || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"} className="w-full h-full object-cover opacity-80" alt="Video thumbnail" />}
      </div>
    );
  },
  CTA: ({ data, theme }) => (
    <div className="w-full p-8 rounded-2xl text-center" style={{ backgroundColor: theme?.colors?.primary || "#000", color: "#fff" }}>
      <h2 className="text-3xl font-bold mb-4">{data.title}</h2>
      <p className="mb-6 opacity-90">{data.description}</p>
      <button className="px-8 py-3 rounded-full font-bold text-lg bg-white transition-transform hover:scale-105" style={{ color: theme?.colors?.primary || "#000" }}>
        {data.button_text}
      </button>
    </div>
  ),
  Testimonial: ({ data }) => (
    <div className="flex flex-col w-full p-6 rounded-xl bg-white shadow-sm border">
      <div className="flex text-yellow-400 mb-4 text-xl">{"★".repeat(5)}</div>
      <p className="italic text-lg mb-6">"{data.quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
          {data.avatar_url && <img src={data.avatar_url} alt={data.author} />}
        </div>
        <div>
          <div className="font-bold">{data.author}</div>
          <div className="text-sm opacity-70">{data.role}</div>
        </div>
      </div>
    </div>
  ),
  TeamCard: ({ data }) => (
    <div className="flex flex-col items-center w-full p-6 text-center border rounded-xl bg-white">
      <img src={data.avatar_url || "https://i.pravatar.cc/150"} alt={data.name} className="w-24 h-24 rounded-full mb-4 object-cover" />
      <h3 className="font-bold text-lg">{data.name}</h3>
      <p className="text-sm text-gray-500 mb-3">{data.role}</p>
      <p className="text-sm opacity-80">{data.bio}</p>
    </div>
  ),
  PricingCard: ({ data, theme }) => (
    <div className={`p-8 rounded-2xl border flex flex-col w-full bg-white ${data.is_popular ? 'shadow-xl ring-2' : 'shadow-sm'}`} style={data.is_popular ? { '--tw-ring-color': theme?.colors?.primary } as React.CSSProperties : {}}>
      {data.is_popular && <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme?.colors?.primary }}>Most Popular</div>}
      <h3 className="text-2xl font-bold">{data.tier_name}</h3>
      <div className="text-4xl font-black my-4">{data.price} <span className="text-lg opacity-60 font-normal">/mo</span></div>
      <p className="opacity-80 mb-6">{data.description}</p>
      <ul className="space-y-3 mb-8 flex-1">
        {(data.features || []).map((f: string, i: number) => (
          <li key={i} className="flex gap-2 text-sm"><span style={{ color: theme?.colors?.primary }}>✓</span> {f}</li>
        ))}
      </ul>
      <button className="w-full py-3 rounded-lg font-bold transition-opacity hover:opacity-90" style={{ backgroundColor: data.is_popular ? theme?.colors?.primary : "#f3f4f6", color: data.is_popular ? "#fff" : "#000" }}>
        {data.button_text || "Get Started"}
      </button>
    </div>
  ),
  FAQ: ({ data }) => (
    <div className="w-full space-y-4">
      {(data.items || []).map((item: any, i: number) => (
        <div key={i} className="p-4 border rounded-lg bg-white shadow-sm">
          <h4 className="font-bold text-lg mb-2">{item.question}</h4>
          <p className="opacity-80 text-sm">{item.answer}</p>
        </div>
      ))}
    </div>
  ),
  Footer: ({ data }) => (
    <div className="mt-auto w-full pt-8 pb-4 border-t text-center text-sm opacity-60 flex justify-between">
      <span>{data.text || "Generated by Orivox AI"}</span>
      <span>{data.page_number}</span>
    </div>
  ),
  SectionDivider: ({ data, theme }) => (
    <div className="w-full py-12 flex flex-col items-center justify-center text-center h-full">
      <div className="w-16 h-1 mb-6 rounded-full" style={{ backgroundColor: theme?.colors?.accent || theme?.colors?.primary }} />
      <h1 className="text-5xl font-black mb-4 tracking-tight" style={{ color: theme?.colors?.primary }}>{data.title}</h1>
      {data.subtitle && <p className="text-2xl opacity-70 max-w-2xl">{data.subtitle}</p>}
    </div>
  )
};

import fs from 'fs';
import path from 'path';

const componentsDir = 'D:/projects/orivox-ai-studio/src/renderer/components';
const folders = ['typography', 'media', 'cards', 'lists', 'visuals'];

folders.forEach(f => fs.mkdirSync(path.join(componentsDir, f), { recursive: true }));

const write = (folder, name, content) => {
  fs.writeFileSync(path.join(componentsDir, folder, `${name}.tsx`), content);
};

const baseTemplate = (name, renderCode, imports = '') => `import React from "react";
import { EditableText } from "../EditableText";
import { BaseComponentProps } from "../RendererRegistry";
${imports}

export const ${name}: React.FC<BaseComponentProps> = ({ data, theme, slideId, componentId, assets }) => (
  ${renderCode}
);
`;

// Typography
write('typography', 'Title', baseTemplate('Title', `<h1 className="text-[clamp(2.5rem,5cqw,4.5rem)] font-black tracking-tight leading-tight mb-2" style={{ fontFamily: theme?.typography?.headingFont || theme?.typography?.heading || "sans-serif", color: theme?.colors?.textPrimary || theme?.colors?.primary || "#ffffff", textAlign: data.alignment || "left" }}><EditableText slideId={slideId} componentId={componentId} field="content" value={data.content} /></h1>`));

write('typography', 'Subtitle', baseTemplate('Subtitle', `<h2 className="text-[clamp(1.25rem,2.5cqw,2rem)] font-medium opacity-90 leading-snug mb-4" style={{ fontFamily: theme?.typography?.bodyFont || theme?.typography?.body || "sans-serif", color: theme?.colors?.textSecondary || theme?.colors?.secondary || "#cbd5e1", textAlign: data.alignment || "left" }}><EditableText slideId={slideId} componentId={componentId} field="content" value={data.content} /></h2>`));

write('typography', 'Paragraph', baseTemplate('Paragraph', `<p className="text-[clamp(1rem,1.5cqw,1.25rem)] leading-relaxed max-w-4xl opacity-90 mb-4" style={{ fontFamily: theme?.typography?.bodyFont || theme?.typography?.body || "sans-serif", color: theme?.colors?.textSecondary || "#cbd5e1" }}><EditableText slideId={slideId} componentId={componentId} field="content" value={data.content} multiline /></p>`));

write('typography', 'Quote', baseTemplate('Quote', `<blockquote className="p-[clamp(1.5rem,3cqw,3rem)] rounded-3xl border-l-4 my-6 shadow-2xl relative overflow-hidden backdrop-blur-xl" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.03)", borderColor: theme?.colors?.primary || "#6366f1", borderTop: \`1px solid \${theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)"}\`, borderRight: \`1px solid \${theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)"}\`, borderBottom: \`1px solid \${theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)"}\` }}><p className="text-[clamp(1.25rem,2.5cqw,2rem)] font-serif italic leading-relaxed mb-4 text-white/90">" <EditableText slideId={slideId} componentId={componentId} field="content" value={data.content || data.text || ""} /> "</p>{(data.author || data.role) && (<footer className="text-[clamp(0.875rem,1.5cqw,1rem)] font-bold tracking-wider uppercase opacity-90" style={{ color: theme?.colors?.primary || "#818cf8" }}>— <EditableText slideId={slideId} componentId={componentId} field="author" value={data.author || ""} />{data.role && <span> ({data.role})</span>}</footer>)}</blockquote>`));

write('typography', 'Callout', baseTemplate('Callout', `<div className="p-[clamp(1.25rem,2.5cqw,2rem)] rounded-2xl border flex items-start gap-4 my-4 shadow-xl backdrop-blur-md" style={{ backgroundColor: theme?.colors?.badgeBg || "rgba(99, 102, 241, 0.1)", borderColor: theme?.colors?.primary || "#6366f1", color: theme?.colors?.textPrimary || "#ffffff" }}><span className="text-[clamp(1.5rem,3cqw,2rem)]">💡</span><div className="flex-1">{data.title && (<strong className="block text-[clamp(1.125rem,2cqw,1.5rem)] font-bold mb-1"><EditableText slideId={slideId} componentId={componentId} field="title" value={data.title} /></strong>)}<p className="text-[clamp(0.875rem,1.5cqw,1.125rem)] leading-relaxed opacity-90"><EditableText slideId={slideId} componentId={componentId} field={data.content ? "content" : "callout"} value={data.content || data.callout || data.text || ""} multiline /></p></div></div>`));

write('typography', 'SectionDivider', baseTemplate('SectionDivider', `<div className="w-full py-[clamp(2rem,8cqw,6rem)] flex flex-col items-center justify-center text-center h-full"><div className="w-20 h-2 mb-8 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ background: theme?.colors?.accentGradient || theme?.colors?.primary || "#6366f1" }} /><h1 className="text-[clamp(2.5rem,6cqw,5rem)] font-black mb-4 tracking-tight drop-shadow-md" style={{ color: theme?.colors?.textPrimary || "#ffffff" }}>{data.title}</h1>{data.subtitle && <p className="text-[clamp(1.25rem,2.5cqw,2rem)] opacity-80 max-w-3xl">{data.subtitle}</p>}</div>`));

write('typography', 'Footer', baseTemplate('Footer', `<div className="mt-auto w-full pt-4 border-t border-white/10 text-[clamp(0.7rem,1cqw,0.875rem)] opacity-50 flex justify-between"><span>{data.content || data.text || "Generated by Orivox V3"}</span><span>{data.show_slide_number ? "Page" : ""}</span></div>`));

// Media
write('media', 'Image', baseTemplate('Image', `
  <div className="w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 my-4 bg-white/5 backdrop-blur-sm relative group">
    <img src={(data.asset_id && assets?.[data.asset_id]?.url) || data.url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"} alt={data.alt_text || "Presentation graphic"} className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105" />
    {data.caption && <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-md p-3"><p className="text-[clamp(0.75rem,1.25cqw,1rem)] text-center opacity-90 italic text-white">{data.caption}</p></div>}
  </div>
`));

write('media', 'HeroImage', baseTemplate('HeroImage', `
  <div className="w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/15 my-4 relative group">
    <img src={(data.asset_id && assets?.[data.asset_id]?.url) || data.url || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80"} alt={data.alt_text || "Hero visual"} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/90 via-[#09090b]/40 to-transparent pointer-events-none" />
  </div>
`));

write('media', 'Icon', baseTemplate('Icon', `<div className="inline-flex items-center justify-center p-[clamp(0.75rem,2cqw,1.5rem)] rounded-3xl border shadow-xl backdrop-blur-lg" style={{ backgroundColor: theme?.colors?.badgeBg || "rgba(99, 102, 241, 0.15)", borderColor: theme?.colors?.primary || "#6366f1" }}><span className="text-[clamp(2rem,4cqw,3rem)]">{data.icon_name || "⚡"}</span></div>`));

write('media', 'Video', `import React from "react";
import { AssetRenderer } from "../../AssetRenderer";
import { BaseComponentProps } from "../../RendererRegistry";

export const Video: React.FC<BaseComponentProps> = ({ data, assets }) => (
  <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/15 my-4 relative bg-black/50 backdrop-blur-md group cursor-pointer">
    {data.asset_id && assets?.[data.asset_id] ? (
      <AssetRenderer asset={assets[data.asset_id]} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
        <div className="w-[clamp(4rem,8cqw,6rem)] h-[clamp(4rem,8cqw,6rem)] rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform">
          <span className="text-[clamp(1.5rem,3cqw,2.5rem)] text-white ml-2">▶</span>
        </div>
      </div>
    )}
  </div>
);`);

// Cards
write('cards', 'IconCard', baseTemplate('IconCard', `
  <div className="p-[clamp(1.5rem,3cqw,2rem)] rounded-3xl border flex flex-col items-center text-center shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.03)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)" }}>
    <div className="text-[clamp(2.5rem,5cqw,4rem)] mb-4 p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner">{data.icon_name || data.icon || "🔹"}</div>
    <h3 className="font-bold text-[clamp(1.25rem,2cqw,1.5rem)] mb-2 text-white">{data.title}</h3>
    <p className="text-[clamp(0.875rem,1.5cqw,1rem)] opacity-80 leading-relaxed max-w-sm">{data.content || data.description}</p>
  </div>
`));

write('cards', 'FeatureCard', baseTemplate('FeatureCard', `
  <div className="p-[clamp(1.5rem,3cqw,2rem)] rounded-3xl border shadow-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-lg relative overflow-hidden" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(24, 24, 27, 0.6)", borderColor: theme?.colors?.cardBorder || "rgba(39, 39, 42, 0.8)", borderTop: \`4px solid \${theme?.colors?.accent || theme?.colors?.primary || "#6366f1"}\` }}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-16 -mt-16 blur-2xl pointer-events-none" style={{ backgroundColor: theme?.colors?.primary || "#6366f1", opacity: 0.1 }}></div>
    <div className="relative z-10">
      <h3 className="text-[clamp(1.25rem,2.2cqw,1.75rem)] font-bold mb-3 text-white drop-shadow-sm">{data.title}</h3>
      <p className="text-[clamp(0.875rem,1.5cqw,1.125rem)] opacity-80 leading-relaxed text-zinc-300">{data.description}</p>
    </div>
  </div>
`));

write('cards', 'KPICard', baseTemplate('KPICard', `
  <div className="p-[clamp(1.5rem,3cqw,2rem)] rounded-3xl border shadow-2xl flex flex-col justify-center my-4 backdrop-blur-xl relative overflow-hidden" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(24, 24, 27, 0.7)", borderColor: theme?.colors?.cardBorder || "rgba(39, 39, 42, 0.5)", borderLeft: \`6px solid \${theme?.colors?.primary || "#6366f1"}\` }}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
    <span className="text-[clamp(0.75rem,1.25cqw,0.875rem)] font-bold uppercase tracking-widest opacity-70 mb-2 relative z-10">{data.label}</span>
    <span className="text-[clamp(3rem,6cqw,5rem)] font-black tracking-tighter my-1 drop-shadow-md relative z-10" style={{ color: theme?.colors?.primary || "#818cf8" }}>{data.value}</span>
    {data.trend && <span className="text-[clamp(0.875rem,1.5cqw,1rem)] font-bold text-emerald-400 mt-2 relative z-10 flex items-center gap-1"><span className="text-xl">↑</span> {data.trend}</span>}
  </div>
`));

write('cards', 'TeamCard', baseTemplate('TeamCard', `
  <div className="p-[clamp(1.5rem,3cqw,2rem)] rounded-3xl border flex flex-col items-center text-center shadow-2xl my-4 backdrop-blur-xl group hover:border-white/20 transition-colors" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.02)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.08)" }}>
    <div className="w-[clamp(5rem,10cqw,7rem)] h-[clamp(5rem,10cqw,7rem)] rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-[clamp(2rem,4cqw,3rem)] font-bold mb-4 border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">{data.name?.charAt(0) || "👤"}</div>
    <h3 className="font-bold text-[clamp(1.25rem,2cqw,1.5rem)] text-white">{data.name}</h3>
    <p className="text-[clamp(0.75rem,1.25cqw,0.875rem)] font-black uppercase tracking-widest opacity-90 mb-3 mt-1" style={{ color: theme?.colors?.primary || "#818cf8" }}>{data.role}</p>
    {data.bio && <p className="text-[clamp(0.875rem,1.5cqw,1rem)] opacity-70 leading-relaxed max-w-xs">{data.bio}</p>}
  </div>
`));

write('cards', 'PricingCard', baseTemplate('PricingCard', `
  <div className={\`p-[clamp(2rem,4cqw,3rem)] rounded-[2.5rem] border flex flex-col justify-between shadow-2xl my-4 backdrop-blur-xl transition-transform hover:-translate-y-2 \${data.highlighted || data.is_popular ? "ring-2 scale-[1.02]" : ""}\`} style={{ backgroundColor: theme?.colors?.cardBg || "rgba(24, 24, 27, 0.8)", borderColor: theme?.colors?.cardBorder || "rgba(39, 39, 42, 0.5)", ringColor: theme?.colors?.primary, boxShadow: data.highlighted ? "0 25px 50px -12px rgba(99, 102, 241, 0.3)" : undefined }}>
    <div>
      {data.highlighted && (<div className="text-[clamp(0.75rem,1.25cqw,0.875rem)] font-black uppercase tracking-widest mb-3 text-indigo-400 bg-indigo-500/10 inline-block px-3 py-1 rounded-full border border-indigo-500/20">Most Popular</div>)}
      <h3 className="text-[clamp(1.5rem,3cqw,2rem)] font-bold text-white">{data.tier || data.tier_name}</h3>
      <div className="text-[clamp(2.5rem,5cqw,4rem)] font-black my-6 tracking-tight flex items-baseline gap-2">{data.price} <span className="text-[clamp(1rem,1.5cqw,1.25rem)] font-medium opacity-50">/mo</span></div>
      <ul className="space-y-4 text-[clamp(0.875rem,1.5cqw,1rem)] opacity-90 mb-8">
        {(data.features || []).map((f: string, i: number) => (
          <li key={i} className="flex gap-3 items-start"><span className="text-emerald-400 font-bold bg-emerald-400/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">✓</span> <span className="leading-snug">{f}</span></li>
        ))}
      </ul>
    </div>
    <button className="w-full py-[clamp(1rem,2cqw,1.25rem)] rounded-2xl font-bold text-[clamp(1rem,1.5cqw,1.125rem)] transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] shadow-lg" style={{ backgroundColor: theme?.colors?.primary || "#6366f1", color: "#ffffff" }}>{data.button_text || "Choose Plan"}</button>
  </div>
`));

write('cards', 'Testimonial', baseTemplate('Testimonial', `
  <div className="p-[clamp(1.5rem,3cqw,2.5rem)] rounded-3xl border shadow-2xl flex flex-col justify-between my-4 backdrop-blur-lg relative overflow-hidden" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.03)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.08)" }}>
    <div className="absolute top-4 right-4 text-[clamp(4rem,8cqw,6rem)] text-white/5 font-serif leading-none rotate-12 pointer-events-none">"</div>
    <div className="text-yellow-400 mb-4 text-[clamp(1.25rem,2cqw,1.5rem)] drop-shadow-[0_0_5px_rgba(250,204,21,0.5)] tracking-widest">★★★★★</div>
    <p className="italic text-[clamp(1.125rem,2cqw,1.5rem)] mb-6 opacity-95 leading-relaxed text-zinc-200 relative z-10">"{data.quote || data.text}"</p>
    <div className="flex items-center gap-4 relative z-10 mt-auto">
      <div className="w-[clamp(2.5rem,4cqw,3rem)] h-[clamp(2.5rem,4cqw,3rem)] rounded-full bg-white/10 border border-white/20"></div>
      <div>
        <div className="font-bold text-[clamp(1rem,1.5cqw,1.125rem)] text-white">{data.author}</div>
        {data.role && <div className="text-[clamp(0.75rem,1.25cqw,0.875rem)] opacity-70 text-indigo-300 font-medium">{data.role}</div>}
      </div>
    </div>
  </div>
`));

write('cards', 'Statistic', baseTemplate('Statistic', `
  <div className="flex items-center gap-[clamp(1.5rem,3cqw,2.5rem)] my-4 p-[clamp(1.5rem,3cqw,2rem)] rounded-3xl border shadow-xl backdrop-blur-md transition-transform hover:scale-[1.02]" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.03)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)" }}>
    <div className="text-[clamp(4rem,8cqw,6rem)] font-black tracking-tighter drop-shadow-lg" style={{ color: theme?.colors?.accent || theme?.colors?.primary || "#ec4899" }}>{data.value}</div>
    <div className="text-[clamp(1.125rem,2cqw,1.5rem)] leading-snug font-semibold opacity-90 max-w-sm text-zinc-200">{data.label}</div>
  </div>
`));

write('cards', 'MetricGrid', baseTemplate('MetricGrid', `
  <div className="grid grid-cols-2 @[40rem]:grid-cols-4 gap-[clamp(1rem,2cqw,1.5rem)] w-full my-4">
    {(data.metrics || []).map((m: any, i: number) => (
      <div key={i} className="p-[clamp(1.25rem,2.5cqw,1.5rem)] rounded-3xl border text-center shadow-xl backdrop-blur-md bg-white/[0.02] hover:bg-white/[0.05] transition-colors" style={{ borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)" }}>
        <div className="text-[clamp(2rem,4cqw,3rem)] font-black mb-2 drop-shadow-md" style={{ color: theme?.colors?.primary || "#818cf8" }}>{m.value}</div>
        <div className="text-[clamp(0.7rem,1.2cqw,0.875rem)] font-bold uppercase tracking-widest opacity-70 text-zinc-300">{m.label}</div>
      </div>
    ))}
  </div>
`));

// Lists
write('lists', 'BulletList', baseTemplate('BulletList', `
  <ul className="space-y-[clamp(0.75rem,1.5cqw,1rem)] my-4 w-full">
    {(data.items || []).map((item: string, i: number) => (
      <li key={i} className="flex items-start gap-[clamp(0.75rem,1.5cqw,1.25rem)] p-[clamp(0.75rem,1.5cqw,1.25rem)] rounded-2xl transition-all backdrop-blur-sm shadow-md hover:translate-x-2" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.03)", border: \`1px solid \${theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.05)"}\` }}>
        <span className="w-[clamp(0.5rem,1cqw,0.75rem)] h-[clamp(0.5rem,1cqw,0.75rem)] rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]" style={{ backgroundColor: theme?.colors?.primary || "#6366f1" }} />
        <span className="text-[clamp(1rem,1.8cqw,1.25rem)] font-medium leading-relaxed flex-1 text-zinc-200">
          <EditableText slideId={slideId} componentId={componentId} field={\`items[\${i}]\`} value={item} />
        </span>
      </li>
    ))}
  </ul>
`));

write('lists', 'NumberedList', baseTemplate('NumberedList', `
  <ol className="space-y-[clamp(0.75rem,1.5cqw,1rem)] my-4 w-full">
    {(data.items || []).map((item: string, i: number) => (
      <li key={i} className="flex items-center gap-[clamp(1rem,2cqw,1.5rem)] p-[clamp(0.75rem,1.5cqw,1.25rem)] rounded-2xl backdrop-blur-sm shadow-md transition-all hover:bg-white/5" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.03)", border: \`1px solid \${theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.05)"}\` }}>
        <span className="w-[clamp(2rem,4cqw,2.5rem)] h-[clamp(2rem,4cqw,2.5rem)] rounded-xl flex items-center justify-center font-black text-[clamp(0.875rem,1.5cqw,1.125rem)] shrink-0 shadow-lg border border-white/20" style={{ backgroundColor: theme?.colors?.primary || "#6366f1", color: "#ffffff", backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)' }}>{i + 1}</span>
        <span className="text-[clamp(1rem,1.8cqw,1.25rem)] font-medium flex-1 text-zinc-200">
          <EditableText slideId={slideId} componentId={componentId} field={\`items[\${i}]\`} value={item} />
        </span>
      </li>
    ))}
  </ol>
`));

write('lists', 'Table', baseTemplate('Table', `
  <div className="overflow-hidden rounded-3xl border w-full shadow-2xl my-4 backdrop-blur-lg" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(24, 24, 27, 0.4)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)" }}>
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-[clamp(0.875rem,1.5cqw,1rem)]">
        <thead>
          <tr style={{ backgroundColor: theme?.colors?.badgeBg || "rgba(99, 102, 241, 0.15)" }}>
            {(data.headers || []).map((h: string, i: number) => (
              <th key={i} className="p-[clamp(1rem,2cqw,1.25rem)] font-black border-b border-white/10 uppercase tracking-widest text-[clamp(0.7rem,1.2cqw,0.875rem)] text-indigo-200">
                <EditableText slideId={slideId} componentId={componentId} field={\`headers[\${i}]\`} value={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {(data.rows || []).map((row: string[], i: number) => (
            <tr key={i} className="hover:bg-white/[0.03] transition-colors">
              {row.map((cell: string, j: number) => (
                <td key={j} className="p-[clamp(1rem,2cqw,1.25rem)] font-medium text-zinc-300">
                  <EditableText slideId={slideId} componentId={componentId} field={\`rows[\${i}][\${j}]\`} value={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
`));

write('lists', 'IconGrid', baseTemplate('IconGrid', `
  <div className="grid grid-cols-2 @[40rem]:grid-cols-4 gap-[clamp(1rem,2cqw,1.5rem)] w-full my-4">
    {(data.items || []).map((item: any, i: number) => (
      <div key={i} className="flex flex-col items-center p-[clamp(1.25rem,2.5cqw,1.5rem)] rounded-3xl border text-center shadow-lg backdrop-blur-md hover:bg-white/5 transition-colors" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.02)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.08)" }}>
        <span className="text-[clamp(2rem,4cqw,2.5rem)] mb-3 drop-shadow-md">{item.icon_name || item.icon || "✨"}</span>
        <span className="font-semibold text-[clamp(0.875rem,1.5cqw,1.125rem)] text-zinc-200">{item.label || item.title}</span>
      </div>
    ))}
  </div>
`));

write('lists', 'Timeline', baseTemplate('Timeline', `
  <div className="flex flex-col space-y-[clamp(1rem,2cqw,1.5rem)] w-full relative my-6 pl-[clamp(1rem,2cqw,1.5rem)]">
    <div className="absolute left-[clamp(1.5rem,3cqw,2rem)] top-4 bottom-4 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 opacity-50 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
    {(data.events || data.nodes || []).map((event: any, i: number) => (
      <div key={i} className="relative pl-[clamp(2.5rem,5cqw,3rem)] p-[clamp(1.25rem,2.5cqw,1.5rem)] rounded-3xl border shadow-xl backdrop-blur-md" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.03)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.08)" }}>
        <div className="absolute left-[-0.25rem] top-[2rem] w-4 h-4 rounded-full border-4 shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ backgroundColor: "#ffffff", borderColor: theme?.colors?.primary || "#6366f1" }} />
        <div className="text-[clamp(0.75rem,1.2cqw,0.875rem)] font-black uppercase tracking-widest mb-2" style={{ color: theme?.colors?.primary || "#818cf8" }}>{event.date || event.year || \`Phase \${i + 1}\`}</div>
        <div className="font-bold text-[clamp(1.25rem,2cqw,1.5rem)] mb-2 text-white">{event.title}</div>
        <p className="text-[clamp(0.875rem,1.5cqw,1rem)] opacity-80 leading-relaxed text-zinc-300">{event.description || event.content}</p>
      </div>
    ))}
  </div>
`));

write('lists', 'Process', baseTemplate('Process', `
  <div className="grid grid-cols-1 @[40rem]:grid-cols-4 gap-[clamp(1rem,2cqw,1.5rem)] w-full my-6">
    {(data.steps || []).map((step: any, i: number) => (
      <div key={i} className="p-[clamp(1.5rem,3cqw,2rem)] rounded-3xl border flex flex-col items-center text-center relative shadow-xl backdrop-blur-md hover:-translate-y-2 transition-transform" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.02)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.08)" }}>
        <div className="w-[clamp(2.5rem,5cqw,3rem)] h-[clamp(2.5rem,5cqw,3rem)] rounded-2xl flex items-center justify-center font-black text-white mb-4 text-[clamp(1.25rem,2.5cqw,1.5rem)] shadow-lg border border-white/20 rotate-3" style={{ backgroundColor: theme?.colors?.primary || "#6366f1", backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)' }}>{i + 1}</div>
        <h4 className="font-bold text-[clamp(1.125rem,2cqw,1.25rem)] mb-2 text-white">{step.title}</h4>
        <p className="text-[clamp(0.875rem,1.5cqw,1rem)] opacity-80 leading-relaxed text-zinc-300">{step.description || step.content}</p>
      </div>
    ))}
  </div>
`));

write('lists', 'Comparison', baseTemplate('Comparison', `
  <div className="grid grid-cols-1 @[40rem]:grid-cols-2 gap-[clamp(1.5rem,3cqw,2rem)] w-full my-6">
    <div className="p-[clamp(1.5rem,3cqw,2.5rem)] rounded-3xl border shadow-2xl backdrop-blur-lg relative overflow-hidden" style={{ backgroundColor: "rgba(239, 68, 68, 0.05)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
      <div className="absolute top-0 right-0 p-4 text-6xl opacity-5">✕</div>
      <h3 className="font-black text-[clamp(1.5rem,3cqw,2rem)] mb-6 text-red-400 border-b border-red-500/20 pb-4 tracking-tight">{data.left_title || data.left_column?.title || "Before"}</h3>
      <ul className="space-y-[clamp(0.75rem,1.5cqw,1rem)] relative z-10">
        {(data.left_items || data.left_column?.items || []).map((item: string, i: number) => (
          <li key={i} className="flex gap-3 text-[clamp(1rem,1.8cqw,1.125rem)] text-zinc-300 items-start"><span className="text-red-400 font-bold bg-red-400/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">✕</span> <span className="leading-relaxed">{item}</span></li>
        ))}
      </ul>
    </div>
    <div className="p-[clamp(1.5rem,3cqw,2.5rem)] rounded-3xl border shadow-2xl backdrop-blur-lg relative overflow-hidden" style={{ backgroundColor: "rgba(16, 185, 129, 0.05)", borderColor: "rgba(16, 185, 129, 0.2)" }}>
      <div className="absolute top-0 right-0 p-4 text-6xl opacity-5">✓</div>
      <h3 className="font-black text-[clamp(1.5rem,3cqw,2rem)] mb-6 text-emerald-400 border-b border-emerald-500/20 pb-4 tracking-tight">{data.right_title || data.right_column?.title || "After"}</h3>
      <ul className="space-y-[clamp(0.75rem,1.5cqw,1rem)] relative z-10">
        {(data.right_items || data.right_column?.items || []).map((item: string, i: number) => (
          <li key={i} className="flex gap-3 text-[clamp(1rem,1.8cqw,1.125rem)] text-zinc-200 items-start"><span className="text-emerald-400 font-bold bg-emerald-400/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">✓</span> <span className="leading-relaxed">{item}</span></li>
        ))}
      </ul>
    </div>
  </div>
`));

write('lists', 'FAQ', baseTemplate('FAQ', `
  <div className="space-y-[clamp(0.75rem,1.5cqw,1rem)] w-full my-6">
    {(data.items || []).map((item: any, i: number) => (
      <div key={i} className="p-[clamp(1.25rem,2.5cqw,1.5rem)] rounded-3xl border shadow-lg backdrop-blur-md hover:bg-white/5 transition-colors cursor-pointer" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(255, 255, 255, 0.02)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.08)" }}>
        <h4 className="font-bold text-[clamp(1.125rem,2cqw,1.25rem)] mb-2 flex justify-between items-center text-white">{item.question} <span className="text-indigo-400">+</span></h4>
        <p className="text-[clamp(0.875rem,1.5cqw,1rem)] opacity-80 leading-relaxed text-zinc-300 pr-8">{item.answer}</p>
      </div>
    ))}
  </div>
`));

// Visuals (CTA, Chart, Diagram, Flowchart, MindMap, CodeBlock)
write('visuals', 'CTA', baseTemplate('CTA', `
  <div className="w-full p-[clamp(2.5rem,6cqw,4rem)] rounded-[3rem] text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 my-8 relative overflow-hidden group" style={{ background: theme?.colors?.accentGradient || "linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)", color: "#ffffff" }}>
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
    <div className="relative z-10">
      <h2 className="text-[clamp(2.5rem,6cqw,3.5rem)] font-black mb-4 tracking-tight drop-shadow-md">{data.title || "Take Action Today"}</h2>
      <p className="text-[clamp(1.125rem,2cqw,1.5rem)] opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">{data.description || data.subtitle || ""}</p>
      <button className="px-[clamp(2rem,4cqw,3rem)] py-[clamp(1rem,2cqw,1.25rem)] rounded-full font-black text-[clamp(1.125rem,2cqw,1.25rem)] bg-white text-gray-900 shadow-2xl transition-transform hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] border border-white/50">{data.button_text || data.label || "Get Started"}</button>
    </div>
  </div>
`));

write('visuals', 'Chart', baseTemplate('Chart', `
  <div className="w-full p-[clamp(1.5rem,3cqw,2rem)] rounded-3xl border shadow-2xl flex flex-col items-center justify-center my-4 backdrop-blur-xl" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(24, 24, 27, 0.6)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)" }}>
    <div className="text-center mb-6">
      <span className="text-[clamp(2rem,4cqw,3rem)] mb-2 block drop-shadow-md">📊</span>
      <span className="font-black text-[clamp(1.25rem,2cqw,1.5rem)] tracking-tight text-white">{data.title || \`\${data.variant?.toUpperCase() || "DATA"} CHART\`}</span>
    </div>
    <div className="w-full overflow-x-auto">
      <table className="text-[clamp(0.75rem,1.5cqw,0.875rem)] border-collapse w-full min-w-max rounded-2xl overflow-hidden bg-black/20">
        <thead>
          <tr style={{ backgroundColor: theme?.colors?.badgeBg || "rgba(99, 102, 241, 0.2)" }}>
            <th className="p-[clamp(0.75rem,1.5cqw,1rem)] border-b border-white/10 text-left font-bold text-indigo-200">Metric</th>
            {(data.datasets || []).map((ds: any, i: number) => (
              <th key={i} className="p-[clamp(0.75rem,1.5cqw,1rem)] border-b border-white/10 text-right font-bold text-indigo-200"><EditableText slideId={slideId} componentId={componentId} field={\`datasets[\${i}].label\`} value={ds.label || \`Series \${i + 1}\`} /></th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {(data.labels || []).map((label: string, rowIdx: number) => (
            <tr key={rowIdx} className="hover:bg-white/[0.05] transition-colors">
              <td className="p-[clamp(0.75rem,1.5cqw,1rem)] font-medium text-zinc-300"><EditableText slideId={slideId} componentId={componentId} field={\`labels[\${rowIdx}]\`} value={label} /></td>
              {(data.datasets || []).map((ds: any, colIdx: number) => (
                <td key={colIdx} className="p-[clamp(0.75rem,1.5cqw,1rem)] text-right font-bold text-white"><EditableText slideId={slideId} componentId={componentId} field={\`datasets[\${colIdx}].values[\${rowIdx}]\`} value={String(ds.values?.[rowIdx] ?? 0)} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
`));

write('visuals', 'Diagram', baseTemplate('Diagram', `
  <div className="w-full rounded-3xl border p-[clamp(1.5rem,3cqw,2rem)] flex flex-col items-center justify-center my-4 shadow-2xl backdrop-blur-xl" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(24, 24, 27, 0.6)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)" }}>
    <div className="text-[clamp(2rem,4cqw,2.5rem)] mb-3">🔄</div>
    <h4 className="font-mono text-[clamp(0.7rem,1.2cqw,0.875rem)] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 shadow-inner border border-indigo-500/30" style={{ backgroundColor: theme?.colors?.badgeBg || "rgba(99, 102, 241, 0.15)", color: theme?.colors?.primary || "#818cf8" }}>Diagram: {data.variant || "Workflow"}</h4>
    <pre className="text-[clamp(0.75rem,1.5cqw,0.875rem)] font-mono p-6 rounded-2xl text-left overflow-auto w-full max-h-64 whitespace-pre-wrap border border-white/10 shadow-inner text-emerald-400" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>{data.mermaid_string || "graph TD;\n  Start --> Execution;"}</pre>
  </div>
`));

write('visuals', 'Flowchart', baseTemplate('Flowchart', `
  <div className="w-full p-[clamp(1.5rem,3cqw,2.5rem)] rounded-3xl border text-center shadow-2xl my-4 backdrop-blur-xl" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(24, 24, 27, 0.6)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)" }}>
    <h4 className="font-black text-[clamp(1.25rem,2cqw,1.5rem)] mb-4 text-white tracking-tight">🔀 Decision & Process Flowchart</h4>
    <pre className="text-[clamp(0.75rem,1.5cqw,0.875rem)] font-mono p-6 rounded-2xl text-left overflow-auto w-full max-h-64 whitespace-pre-wrap border border-white/10 shadow-inner text-blue-400" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>{data.mermaid_string || "graph LR;\n A[Input] --> B{Valid?};\n B -- Yes --> C[Process];"}</pre>
  </div>
`));

write('visuals', 'MindMap', baseTemplate('MindMap', `
  <div className="w-full p-[clamp(1.5rem,3cqw,2.5rem)] rounded-3xl border text-center shadow-2xl my-4 backdrop-blur-xl" style={{ backgroundColor: theme?.colors?.cardBg || "rgba(24, 24, 27, 0.6)", borderColor: theme?.colors?.cardBorder || "rgba(255, 255, 255, 0.1)" }}>
    <h4 className="font-black text-[clamp(1.25rem,2cqw,1.5rem)] mb-4 text-white tracking-tight">🧠 MindMap & Hierarchy</h4>
    <pre className="text-[clamp(0.75rem,1.5cqw,0.875rem)] font-mono p-6 rounded-2xl text-left overflow-auto w-full max-h-64 whitespace-pre-wrap border border-white/10 shadow-inner text-purple-400" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>{data.mermaid_string || "graph TD;\n Core --> SubTopic1;\n Core --> SubTopic2;"}</pre>
  </div>
`));

write('visuals', 'CodeBlock', baseTemplate('CodeBlock', `
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
`));

// Create an index file to export all
const indexContent = folders.map(f => {
  const files = fs.readdirSync(path.join(componentsDir, f)).filter(file => file.endsWith('.tsx'));
  return files.map(file => `export * from "./${f}/${file.replace('.tsx', '')}";`).join('\n');
}).join('\n\n');

fs.writeFileSync(path.join(componentsDir, 'index.ts'), indexContent);

console.log('Successfully generated modular components with container queries and glassmorphism.');

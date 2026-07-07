import { motion } from "motion/react";
import type { Slide } from "@/lib/mock";
import { BarChart3, GitBranch, Quote } from "lucide-react";

export function SlideCanvas({
  slide,
  onSelect,
  selected,
}: {
  slide: Slide;
  onSelect: (el: string) => void;
  selected?: string | null;
}) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#141419] to-[#0f0f14] p-10 shadow-2xl ring-1 ring-white/10">
      {slide.kind === "cover" && (
        <div className="flex h-full flex-col justify-end">
          <Selectable id="title" onSelect={onSelect} selected={selected}>
            <div className="text-5xl font-semibold tracking-tight text-white/95">{slide.title}</div>
          </Selectable>
          {slide.bullets && (
            <Selectable id="subtitle" onSelect={onSelect} selected={selected}>
              <div className="mt-3 text-lg text-white/60">{slide.bullets[0]}</div>
            </Selectable>
          )}
        </div>
      )}
      {slide.kind === "content" && (
        <div className="flex h-full flex-col">
          <Selectable id="title" onSelect={onSelect} selected={selected}>
            <div className="text-3xl font-medium tracking-tight text-white/95">{slide.title}</div>
          </Selectable>
          <div className="mt-8 space-y-3 text-lg text-white/80">
            {slide.bullets?.map((b, i) => (
              <Selectable key={i} id={`bullet-${i}`} onSelect={onSelect} selected={selected}>
                <div className="flex items-start gap-3">
                  <div className="mt-2.5 h-1 w-1 rounded-full bg-electric" />
                  <div>{b}</div>
                </div>
              </Selectable>
            ))}
          </div>
        </div>
      )}
      {slide.kind === "chart" && (
        <div className="flex h-full flex-col">
          <Selectable id="title" onSelect={onSelect} selected={selected}>
            <div className="text-2xl font-medium tracking-tight text-white/95">{slide.title}</div>
          </Selectable>
          <Selectable id="chart" onSelect={onSelect} selected={selected}>
            <div className="mt-6 flex-1">
              <MockChart />
            </div>
          </Selectable>
        </div>
      )}
      {slide.kind === "diagram" && (
        <div className="flex h-full flex-col">
          <Selectable id="title" onSelect={onSelect} selected={selected}>
            <div className="text-2xl font-medium tracking-tight text-white/95">{slide.title}</div>
          </Selectable>
          <Selectable id="diagram" onSelect={onSelect} selected={selected}>
            <div className="mt-6 flex-1">
              <MockDiagram />
            </div>
          </Selectable>
        </div>
      )}
      {slide.kind === "quote" && (
        <div className="flex h-full items-center justify-center">
          <Selectable id="quote" onSelect={onSelect} selected={selected}>
            <div className="flex items-start gap-3 text-center">
              <Quote className="mt-2 h-6 w-6 text-electric" />
              <div className="text-3xl font-medium leading-snug text-white/95">{slide.title}</div>
            </div>
          </Selectable>
        </div>
      )}
      {slide.kind === "closing" && (
        <div className="flex h-full flex-col justify-center">
          <Selectable id="title" onSelect={onSelect} selected={selected}>
            <div className="text-4xl font-semibold tracking-tight text-white/95">{slide.title}</div>
          </Selectable>
          <div className="mt-6 space-y-2 text-white/70">
            {slide.bullets?.map((b, i) => (
              <Selectable key={i} id={`bullet-${i}`} onSelect={onSelect} selected={selected}>
                <div>· {b}</div>
              </Selectable>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Selectable({
  id,
  onSelect,
  selected,
  children,
}: {
  id: string;
  onSelect: (el: string) => void;
  selected?: string | null;
  children: React.ReactNode;
}) {
  const isSelected = selected === id;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      className={`relative -mx-2 rounded-lg px-2 py-1 transition ${
        isSelected
          ? "bg-electric/10 outline outline-1 outline-electric/60"
          : "cursor-pointer hover:bg-white/[0.03]"
      }`}
    >
      {children}
    </div>
  );
}

function MockChart() {
  const bars = [40, 55, 48, 65, 72, 78, 88];
  return (
    <div className="flex h-full items-end gap-3 px-2">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: i * 0.08, type: "spring", stiffness: 120, damping: 18 }}
          className="flex-1 rounded-t-md bg-gradient-to-t from-electric/40 to-electric"
          style={{ minHeight: 4 }}
        />
      ))}
    </div>
  );
}

function MockDiagram() {
  const nodes = [
    { x: 10, y: 40, label: "Sensors" },
    { x: 35, y: 20, label: "Model" },
    { x: 60, y: 40, label: "Clinician" },
    { x: 85, y: 40, label: "Intervention" },
  ];
  return (
    <svg viewBox="0 0 100 60" className="h-full w-full">
      {nodes.slice(0, -1).map((n, i) => {
        const next = nodes[i + 1];
        return (
          <motion.line
            key={i}
            x1={n.x + 6} y1={n.y + 3} x2={next.x - 1} y2={next.y + 3}
            stroke="currentColor" strokeWidth="0.3" className="text-electric/60"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.1 + i * 0.15 }}
          />
        );
      })}
      {nodes.map((n, i) => (
        <motion.g key={i} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1, type: "spring" }}>
          <rect x={n.x - 6} y={n.y - 3} width="14" height="7" rx="1.5" className="fill-white/5 stroke-white/20" strokeWidth="0.2" />
          <text x={n.x + 1} y={n.y + 1.5} textAnchor="middle" className="fill-white/80" style={{ fontSize: 2.5 }}>{n.label}</text>
        </motion.g>
      ))}
    </svg>
  );
}

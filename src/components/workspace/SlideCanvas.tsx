import { motion } from "motion/react";
import type { Slide } from "@/lib/mock";
import { Quote } from "lucide-react";
import { useState, useEffect } from "react";

function EditableText({
  value,
  onChange,
  className,
  isTextArea = false,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  isTextArea?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => {
    setVal(value);
  }, [value]);

  const handleBlur = () => {
    setEditing(false);
    if (val !== value) {
      onChange(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === "Escape") {
      setVal(value);
      setEditing(false);
    }
  };

  if (editing) {
    if (isTextArea) {
      return (
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className={`w-full bg-white/5 border border-white/10 rounded px-2 py-1 outline-none text-white focus:border-electric/50 ${className}`}
        />
      );
    }
    return (
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className={`w-full bg-white/5 border border-white/10 rounded px-2 py-1 outline-none text-white focus:border-electric/50 ${className}`}
      />
    );
  }

  return (
    <div
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      className={`cursor-text hover:bg-white/5 rounded px-2 py-1 min-h-[1.5em] transition ${className}`}
      title="Double-click to edit text"
    >
      {value || <span className="opacity-40 italic">Empty</span>}
    </div>
  );
}

export function SlideCanvas({
  slide,
  onSelect,
  selected,
  onSlideChange,
}: {
  slide: Slide;
  onSelect: (el: string) => void;
  selected?: string | null;
  onSlideChange?: (updates: Partial<Slide>) => void;
}) {
  const handleTitleChange = (newTitle: string) => {
    onSlideChange?.({ title: newTitle });
  };

  const handleBulletChange = (index: number, newBullet: string) => {
    const updatedBullets = [...(slide.bullets || [])];
    updatedBullets[index] = newBullet;
    onSlideChange?.({ bullets: updatedBullets });
  };

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#141419] to-[#0f0f14] p-10 shadow-2xl ring-1 ring-white/10">
      {slide.kind === "cover" && (
        <div className="flex h-full flex-col justify-end">
          <Selectable id="title" onSelect={onSelect} selected={selected}>
            <EditableText
              value={slide.title}
              onChange={handleTitleChange}
              className="text-5xl font-semibold tracking-tight text-white/95"
            />
          </Selectable>
          {slide.bullets && slide.bullets.length > 0 && (
            <Selectable id="subtitle" onSelect={onSelect} selected={selected}>
              <EditableText
                value={slide.bullets[0]}
                onChange={(val) => handleBulletChange(0, val)}
                className="mt-3 text-lg text-white/60"
              />
            </Selectable>
          )}
        </div>
      )}
      {slide.kind === "content" && (
        <div className="flex h-full flex-col">
          <Selectable id="title" onSelect={onSelect} selected={selected}>
            <EditableText
              value={slide.title}
              onChange={handleTitleChange}
              className="text-3xl font-medium tracking-tight text-white/95"
            />
          </Selectable>
          <div className="mt-8 space-y-3 text-lg text-white/80">
            {slide.bullets?.map((b, i) => (
              <Selectable key={i} id={`bullet-${i}`} onSelect={onSelect} selected={selected}>
                <div className="flex items-start gap-3">
                  <div className="mt-2.5 h-1 w-1 rounded-full bg-electric shrink-0" />
                  <EditableText
                    value={b}
                    onChange={(val) => handleBulletChange(i, val)}
                    className="flex-1 text-lg text-white/80"
                  />
                </div>
              </Selectable>
            ))}
          </div>
        </div>
      )}
      {slide.kind === "chart" && (
        <div className="flex h-full flex-col">
          <Selectable id="title" onSelect={onSelect} selected={selected}>
            <EditableText
              value={slide.title}
              onChange={handleTitleChange}
              className="text-2xl font-medium tracking-tight text-white/95"
            />
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
            <EditableText
              value={slide.title}
              onChange={handleTitleChange}
              className="text-2xl font-medium tracking-tight text-white/95"
            />
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
              <Quote className="mt-2 h-6 w-6 text-electric shrink-0" />
              <EditableText
                value={slide.title}
                onChange={handleTitleChange}
                className="text-3xl font-medium leading-snug text-white/95"
              />
            </div>
          </Selectable>
        </div>
      )}
      {slide.kind === "closing" && (
        <div className="flex h-full flex-col justify-center">
          <Selectable id="title" onSelect={onSelect} selected={selected}>
            <EditableText
              value={slide.title}
              onChange={handleTitleChange}
              className="text-4xl font-semibold tracking-tight text-white/95"
            />
          </Selectable>
          <div className="mt-6 space-y-2 text-white/70">
            {slide.bullets?.map((b, i) => (
              <Selectable key={i} id={`bullet-${i}`} onSelect={onSelect} selected={selected}>
                <div className="flex items-center gap-1.5">
                  <span className="text-white/40 shrink-0">·</span>
                  <EditableText
                    value={b}
                    onChange={(val) => handleBulletChange(i, val)}
                    className="flex-1 text-white/70"
                  />
                </div>
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
            x1={n.x + 6}
            y1={n.y + 3}
            x2={next.x - 1}
            y2={next.y + 3}
            stroke="currentColor"
            strokeWidth="0.3"
            className="text-electric/60"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.1 + i * 0.15 }}
          />
        );
      })}
      {nodes.map((n, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1, type: "spring" }}
        >
          <rect
            x={n.x - 6}
            y={n.y - 3}
            width="14"
            height="7"
            rx="1.5"
            className="fill-white/5 stroke-white/20"
            strokeWidth="0.2"
          />
          <text
            x={n.x + 1}
            y={n.y + 1.5}
            textAnchor="middle"
            className="fill-white/80"
            style={{ fontSize: 2.5 }}
          >
            {n.label}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

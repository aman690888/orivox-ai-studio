import { Sparkles, Wand2, Zap, Palette, Type as TypeIcon, Layout, Repeat, Scissors, ArrowUp, X } from "lucide-react";
import { quickActions } from "@/lib/mock";
import { motion } from "motion/react";
import { useState } from "react";

const R = {
  tag: "4px 22px 6px 18px / 22px 6px 18px 4px",
  card: "6px 38px 6px 42px / 38px 6px 42px 6px",
  input: "4px 18px 4px 16px / 18px 4px 16px 4px",
};

const recentActions = [
  "Added a data slide on funding",
  "Shortened intro to 2 lines",
  "Regenerated cover slide",
];

export function AIAssistant() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b-[2px] border-dashed border-[#2d2d2d]/30">
        <div
          className="w-7 h-7 bg-[#fff9c4] border-[2px] border-[#2d2d2d] flex items-center justify-center text-sm shadow-[2px_2px_0px_0px_#2d2d2d]"
          style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
        >
          ✨
        </div>
        <div>
          <div className="text-xs font-bold text-[#6b6460] uppercase tracking-widest" style={{ fontFamily: "Patrick Hand, cursive" }}>
            AI Assistant
          </div>
          <div className="text-sm font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
            Refine anything
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b6460] mb-2" style={{ fontFamily: "Patrick Hand, cursive" }}>
          Quick Actions
        </div>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.slice(0, 4).map((q, i) => (
            <motion.button
              key={q}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="text-xs px-3 py-2 text-left bg-white border-[2px] border-[#2d2d2d] text-[#2d2d2d] font-bold shadow-[2px_2px_0px_0px_#2d2d2d] hover:bg-[#fff9c4] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-100"
              style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
            >
              {q}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Actions */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b6460] mb-2" style={{ fontFamily: "Patrick Hand, cursive" }}>
          Recent Actions
        </div>
        <div className="flex flex-col gap-1.5">
          {recentActions.map((r) => (
            <div
              key={r}
              className="flex items-start gap-2 px-3 py-2 bg-white border-[2px] border-dashed border-[#2d2d2d]/30 text-xs text-[#6b6460]"
              style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
            >
              <Sparkles className="h-3 w-3 mt-0.5 shrink-0 text-[#2d5da1]" strokeWidth={2.5} />
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestion */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b6460] mb-2" style={{ fontFamily: "Patrick Hand, cursive" }}>
          Suggestion
        </div>
        <motion.button
          whileHover={{ y: -1 }}
          className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-left bg-[#fff9c4] border-[2px] border-[#2d2d2d] text-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d] hover:bg-[#e5e0d8] transition-all"
          style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
        >
          <Wand2 className="h-3.5 w-3.5 text-[#2d5da1] shrink-0" strokeWidth={2.5} />
          Add a slide on regulatory trends
        </motion.button>
      </div>

      {/* AI Input */}
      <div className="mt-auto">
        <div
          className="flex items-end gap-2 bg-white border-[2px] border-[#2d2d2d] p-1.5 focus-within:border-[#2d5da1] focus-within:ring-2 focus-within:ring-[#2d5da1]/20 transition-all shadow-[3px_3px_0px_0px_#2d2d2d]"
          style={{ borderRadius: R.input }}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI to change anything..."
            rows={2}
            className="max-h-24 flex-1 resize-none bg-transparent px-2 py-1 text-xs outline-none placeholder-[#2d2d2d]/40 text-[#2d2d2d]"
            style={{ fontFamily: "Patrick Hand, cursive" }}
          />
          <button
            disabled={!prompt.trim()}
            onClick={() => setPrompt("")}
            className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#ff4d4d] text-white border-[2px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-100"
            style={{ borderRadius: R.tag }}
          >
            <ArrowUp size={13} strokeWidth={2.5} />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-[#6b6460]" style={{ fontFamily: "Patrick Hand, cursive" }}>
          Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}

export function ElementSelectedPanel({
  element,
  onDeselect,
}: {
  element: string;
  onDeselect: () => void;
}) {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b-[2px] border-dashed border-[#2d2d2d]/30">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 bg-[#fff9c4] border-[2px] border-[#2d2d2d] flex items-center justify-center text-sm shadow-[2px_2px_0px_0px_#2d2d2d]"
            style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
          >
            🎯
          </div>
          <div>
            <div className="text-xs text-[#ff4d4d] font-bold uppercase tracking-widest" style={{ fontFamily: "Patrick Hand, cursive" }}>
              Selected
            </div>
            <div className="text-sm font-bold text-[#2d2d2d] capitalize" style={{ fontFamily: "Kalam, cursive" }}>
              {element}
            </div>
          </div>
        </div>
        <button
          onClick={onDeselect}
          className="flex items-center gap-1 px-2 py-1 text-xs text-[#6b6460] hover:text-[#ff4d4d] border-[1.5px] border-dashed border-[#2d2d2d]/40 hover:border-[#ff4d4d] transition-all"
          style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
        >
          <X size={10} strokeWidth={2.5} /> Deselect
        </button>
      </div>

      {/* Prompt for element */}
      <div
        className="flex items-end gap-2 bg-white border-[2px] border-[#2d2d2d] p-1.5 focus-within:border-[#2d5da1] focus-within:ring-2 focus-within:ring-[#2d5da1]/20 transition-all shadow-[2px_2px_0px_0px_#2d2d2d]"
        style={{ borderRadius: R.input }}
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Describe a change to this ${element}...`}
          rows={2}
          className="max-h-20 flex-1 resize-none bg-transparent px-2 py-1 text-xs outline-none placeholder-[#2d2d2d]/40 text-[#2d2d2d]"
          style={{ fontFamily: "Patrick Hand, cursive" }}
        />
        <button
          disabled={!prompt.trim()}
          className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#ff4d4d] text-white border-[2px] border-[#2d2d2d] shadow-[2px_2px_0px_0px_#2d2d2d] disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ borderRadius: R.tag }}
        >
          <ArrowUp size={13} strokeWidth={2.5} />
        </button>
      </div>

      {/* Quick style actions */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b6460] mb-2" style={{ fontFamily: "Patrick Hand, cursive" }}>
          Quick Actions
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Modern", icon: Zap },
            { label: "Minimal", icon: Layout },
            { label: "Professional", icon: Sparkles },
            { label: "Replace", icon: Repeat },
            { label: "Simplify", icon: Scissors },
            { label: "Restyle", icon: Palette },
          ].map((a) => (
            <button
              key={a.label}
              className="flex items-center gap-1.5 px-3 py-2 text-xs bg-white border-[2px] border-[#2d2d2d] text-[#2d2d2d] font-bold shadow-[2px_2px_0px_0px_#2d2d2d] hover:bg-[#fff9c4] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-100"
              style={{ borderRadius: R.tag, fontFamily: "Patrick Hand, cursive" }}
            >
              <a.icon className="h-3 w-3 text-[#2d5da1] shrink-0" strokeWidth={2.5} />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual controls */}
      <div className="mt-auto border-t-[2px] border-dashed border-[#2d2d2d]/30 pt-4 flex flex-col gap-2.5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b6460]" style={{ fontFamily: "Patrick Hand, cursive" }}>
          Manual Controls
        </div>
        {[
          { icon: Layout, label: "Size", value: "Medium" },
          { icon: Palette, label: "Color", value: <div className="w-5 h-4 bg-[#ff4d4d] border-[1.5px] border-[#2d2d2d]" style={{ borderRadius: "3px" }} /> },
          { icon: TypeIcon, label: "Font", value: "Kalam" },
          { icon: Layout, label: "Align", value: "Center" },
          { icon: Sparkles, label: "Animation", value: "Fade" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-[#6b6460]" style={{ fontFamily: "Patrick Hand, cursive" }}>
              <Icon className="h-3 w-3" strokeWidth={2.5} /> {label}
            </span>
            <span className="font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

import {
  Sparkles,
  Wand2,
  Zap,
  Palette,
  Type as TypeIcon,
  Layout,
  Repeat,
  Scissors,
} from "lucide-react";
import { PromptBox } from "@/components/prompt/PromptBox";
import { quickActions } from "@/lib/mock";
import { motion } from "motion/react";

export function AIAssistant() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">AI Assistant</div>
        <div className="mt-1 text-sm font-medium">Refine anything</div>
      </div>

      <div className="mb-5">
        <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          Quick actions
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {quickActions.map((q) => (
            <button
              key={q}
              className="rounded-lg border border-border bg-white/[0.02] px-2.5 py-2 text-left text-xs transition hover:border-white/20 hover:bg-white/5"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          Recent actions
        </div>
        <div className="space-y-1.5">
          {["Added a data slide on funding", "Shortened intro to 2 lines", "Regenerated cover"].map(
            (r) => (
              <div
                key={r}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-muted-foreground"
              >
                <Sparkles className="h-3 w-3 text-electric" />
                {r}
              </div>
            ),
          )}
        </div>
      </div>

      <div className="mb-3">
        <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          Suggestions
        </div>
        <motion.button className="flex w-full items-center gap-2 rounded-lg border border-border bg-white/[0.02] px-2.5 py-2 text-left text-xs transition hover:border-white/20">
          <Wand2 className="h-3 w-3 text-violet" />
          Add a slide on regulatory trends
        </motion.button>
      </div>

      <div className="mt-auto">
        <PromptBox size="md" placeholder="Ask AI to change anything..." />
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
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-electric">Element selected</div>
          <div className="mt-1 text-sm font-medium capitalize">{element}</div>
        </div>
        <button
          onClick={onDeselect}
          className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-white/5"
        >
          Deselect
        </button>
      </div>

      <div className="mb-4">
        <PromptBox size="md" placeholder={`Describe a change to this ${element}...`} />
      </div>

      <div className="mb-5">
        <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          Quick actions
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: "Modern", icon: Zap },
            { label: "Minimal", icon: Layout },
            { label: "Professional", icon: Sparkles },
            { label: "Replace", icon: Repeat },
            { label: "Simplify", icon: Scissors },
          ].map((a) => (
            <button
              key={a.label}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-white/[0.02] px-2.5 py-2 text-left text-xs transition hover:border-white/20 hover:bg-white/5"
            >
              <a.icon className="h-3 w-3 text-electric" /> {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto space-y-3 border-t border-border pt-4">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Manual controls
        </div>
        <ManualRow icon={Layout} label="Size" value="Medium" />
        <ManualRow
          icon={Palette}
          label="Color"
          value={<div className="h-4 w-6 rounded bg-electric" />}
        />
        <ManualRow icon={TypeIcon} label="Font" value="Geist" />
        <ManualRow icon={Layout} label="Align" value="Center" />
        <ManualRow icon={Sparkles} label="Animation" value="Fade" />
      </div>
    </div>
  );
}

function ManualRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

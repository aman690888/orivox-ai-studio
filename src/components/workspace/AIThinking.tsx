import { motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  steps: readonly string[];
  status: (i: number) => "pending" | "active" | "done";
};

export function AIThinking({ steps, status }: Props) {
  const total = steps.length;
  const doneCount = steps.filter((_, i) => status(i) === "done").length;
  const pct = Math.round((doneCount / total) * 100);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">AI Thinking</div>
          <div className="mt-1 text-sm font-medium">Building your presentation</div>
        </div>
        <div className="relative h-10 w-10">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="14"
              strokeWidth="2.5"
              className="stroke-white/10"
              fill="none"
            />
            <motion.circle
              cx="18"
              cy="18"
              r="14"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              className="stroke-electric"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: pct / 100 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              style={{ pathLength: pct / 100 }}
              pathLength={1}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px]">
            {pct}%
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto pr-1">
        {steps.map((s, i) => {
          const st = status(i);
          return (
            <motion.div
              key={s}
              layout
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition",
                st === "active" && "bg-white/[0.04]",
              )}
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                {st === "done" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-electric/20"
                  >
                    <Check className="h-3 w-3 text-electric" />
                  </motion.div>
                )}
                {st === "active" && <Loader2 className="h-3.5 w-3.5 animate-spin text-electric" />}
                {st === "pending" && <div className="h-1.5 w-1.5 rounded-full bg-white/15" />}
              </div>
              <span
                className={cn(
                  st === "done" && "text-foreground",
                  st === "active" && "text-foreground",
                  st === "pending" && "text-muted-foreground",
                )}
              >
                {s}
              </span>
              {st === "active" && (
                <motion.div className="ml-auto h-1 w-10 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full w-1/3 bg-electric"
                    animate={{ x: ["-100%", "300%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

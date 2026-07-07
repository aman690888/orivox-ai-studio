import { ArrowUp, Sparkles, Paperclip } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  onSubmit?: (v: string) => void;
  size?: "lg" | "md";
  autoFocus?: boolean;
  className?: string;
};

export function PromptBox({
  placeholder = "Describe a presentation...",
  value,
  onChange,
  onSubmit,
  size = "lg",
  autoFocus,
  className,
}: Props) {
  const [internal, setInternal] = useState("");
  const v = value ?? internal;
  const set = (s: string) => (onChange ? onChange(s) : setInternal(s));

  const submit = () => {
    if (!v.trim()) return;
    onSubmit?.(v.trim());
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <motion.div
      layout
      className={cn(
        "glass group relative w-full rounded-2xl transition-shadow",
        "focus-within:glow-electric",
        size === "lg" ? "p-4" : "p-3",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Sparkles className={cn("mt-1 shrink-0 text-electric", size === "lg" ? "h-5 w-5" : "h-4 w-4")} />
        <textarea
          autoFocus={autoFocus}
          value={v}
          onChange={(e) => set(e.target.value)}
          onKeyDown={onKey}
          placeholder={placeholder}
          rows={size === "lg" ? 2 : 1}
          className={cn(
            "min-h-0 flex-1 resize-none bg-transparent leading-relaxed text-foreground outline-none placeholder:text-muted-foreground",
            size === "lg" ? "text-lg" : "text-sm"
          )}
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <button className="rounded-md p-1.5 transition hover:bg-white/5" aria-label="Attach">
            <Paperclip className="h-3.5 w-3.5" />
          </button>
          <span className="ml-1 hidden sm:inline">Shift + Enter for newline</span>
        </div>
        <button
          onClick={submit}
          disabled={!v.trim()}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
            v.trim()
              ? "bg-foreground text-background hover:scale-105"
              : "bg-muted text-muted-foreground"
          )}
          aria-label="Generate"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

import { cn } from "@/lib/utils";

export function Logo({ className, showWord = true }: { className?: string; showWord?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-6 w-6">
        <div className="absolute inset-0 rounded-md bg-gradient-to-br from-electric to-violet" />
        <div className="absolute inset-[3px] rounded-[5px] bg-background/70 backdrop-blur" />
        <div className="absolute inset-[6px] rounded-[3px] bg-gradient-to-br from-electric to-violet opacity-90" />
      </div>
      {showWord && <span className="text-[15px] font-semibold tracking-tight">Orivox</span>}
    </div>
  );
}

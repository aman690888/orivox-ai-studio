import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse border-[2px] border-dashed border-[#2d2d2d]/20 bg-[#2d2d2d]/5",
        className,
      )}
      style={{ borderRadius: "4px 18px 4px 16px / 18px 4px 16px 4px" }}
      {...props}
    />
  );
}

export { Skeleton };

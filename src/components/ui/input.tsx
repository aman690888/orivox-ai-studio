import * as React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <motion.input
        type={type}
        whileFocus={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "flex h-9 w-full rounded-md border border-input/50 bg-background/50 backdrop-blur-md px-3 py-1 text-base shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring/50 focus-visible:shadow-[inset_0_1px_2px_rgba(0,0,0,0.1),0_0_15px_color-mix(in_oklab,var(--color-ring)_30%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref as any}
        {...props as any}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

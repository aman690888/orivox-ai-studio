import * as React from "react";
import { motion } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/90 backdrop-blur-md text-primary-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:bg-primary hover:shadow-[0_0_10px_color-mix(in_oklab,var(--color-primary)_50%,transparent)]",
        secondary:
          "border-transparent bg-secondary/80 backdrop-blur-md text-secondary-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-secondary hover:shadow-[0_0_10px_color-mix(in_oklab,var(--color-secondary)_50%,transparent)]",
        destructive:
          "border-transparent bg-destructive/90 backdrop-blur-md text-destructive-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:bg-destructive hover:shadow-[0_0_10px_color-mix(in_oklab,var(--color-destructive)_50%,transparent)]",
        outline: "text-foreground border-border/50 bg-background/30 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(badgeVariants({ variant }), className)}
      {...props as any}
    />
  );
}

export { Badge, badgeVariants };

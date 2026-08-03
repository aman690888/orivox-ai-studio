import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { motion } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-primary/90 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_15px_color-mix(in_oklab,var(--color-primary)_40%,transparent)]",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-[0_0_15px_color-mix(in_oklab,var(--color-destructive)_40%,transparent)]",
        outline:
          "border border-input bg-background/40 backdrop-blur-md shadow-sm hover:bg-accent/80 hover:text-accent-foreground hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_15px_color-mix(in_oklab,var(--color-accent)_30%,transparent)]",
        secondary: "bg-secondary/60 backdrop-blur-md text-secondary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-secondary/80 hover:shadow-[0_0_15px_color-mix(in_oklab,var(--color-secondary)_40%,transparent)]",
        ghost: "hover:bg-accent/50 backdrop-blur-sm hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      );
    }
    
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref as any}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...props as any}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

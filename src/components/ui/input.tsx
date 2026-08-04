import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-none border-0 border-b-2 border-black bg-transparent px-0 py-2 text-base transition-none file:border-0 file:bg-transparent file:text-sm file:font-bold file:uppercase file:text-black placeholder:text-black/50 focus-visible:outline-none focus-visible:border-black focus-visible:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-medium",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

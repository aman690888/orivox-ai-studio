export const animation = {
  durations: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
    verySlow: "1000ms",
  },
  easings: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    linear: "linear",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
  springs: {
    // Framer Motion spring presets
    stiff: { type: "spring", stiffness: 300, damping: 20 },
    gentle: { type: "spring", stiffness: 120, damping: 14 },
    bouncy: { type: "spring", stiffness: 400, damping: 10 },
    slow: { type: "spring", stiffness: 50, damping: 15 },
  }
} as const;

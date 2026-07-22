import { useMemo } from 'react';
import { spacing } from "./spacing";
import { typography } from "./typography";
import { geometry } from "./geometry";
import { elevation } from "./elevation";
import { animation } from "./animation";
import { colors } from "./colors";
import { components } from "./components";

export const designSystem = {
  spacing,
  typography,
  geometry,
  elevation,
  animation,
  colors,
  components,
};

export * from "./spacing";
export * from "./typography";
export * from "./geometry";
export * from "./elevation";
export * from "./animation";
export * from "./colors";
export * from "./components";

// React Hook for accessing tokens inside components if needed (although CSS vars are preferred)
export function useDesignSystem() {
  return useMemo(() => designSystem, []);
}

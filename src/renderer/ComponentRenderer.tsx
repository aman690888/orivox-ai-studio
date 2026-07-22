import React from "react";
import type { ComponentIR, AssetIR } from "../types/presentation-ir.types";
import { RendererRegistry } from "./RendererRegistry";
import { motion } from "motion/react";

export const ComponentRenderer: React.FC<{ component: ComponentIR; slideId: string; theme: any; assets: Record<string, AssetIR> }> = React.memo(({ component, slideId, theme, assets }) => {
  const ComponentImpl = RendererRegistry[component.type];

  if (!ComponentImpl) {
    console.warn(`[ComponentRenderer] Missing implementation for type: ${component.type}`);
    return (
      <div className="p-4 border border-red-500 border-dashed rounded bg-red-50 text-red-500 text-sm">
        Missing Component: {component.type}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={component.style_overrides as React.CSSProperties} 
      className="flex-1 w-full flex flex-col justify-center relative group"
    >
      <ComponentImpl data={component.data} theme={theme} styleOverrides={component.style_overrides} assets={assets} slideId={slideId} componentId={component.id} />
    </motion.div>
  );
});

ComponentRenderer.displayName = "ComponentRenderer";

import React from "react";
import type { AssetIR } from "../types/presentation-ir.types";
import { ComponentRenderer } from "./ComponentRenderer";

export const SlideRenderer: React.FC<{
  slide: any;
  componentsData: Record<string, any>;
  theme: any;
  assets: Record<string, AssetIR>;
}> = React.memo(({ slide, componentsData, theme, assets }) => {
  const bgStyle = theme?.colors?.background || "#0d0f17";
  const textColor = theme?.colors?.textPrimary || theme?.colors?.text || "#ffffff";
  const fontFamily = theme?.typography?.bodyFont || theme?.typography?.body || "sans-serif";
  const borderRadius = theme?.borderRadius || "1rem";

  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden shadow-2xl transition-all duration-300"
      style={{
        background: bgStyle,
        color: textColor,
        fontFamily,
        borderRadius,
        aspectRatio: "16/9",
      }}
    >
      {/* Background Image / Overlay */}
      {slide.background_asset_id && (
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url('${assets?.[slide.background_asset_id]?.url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80"}')`,
            }}
          />
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full h-full p-8 md:p-12 flex flex-col justify-between gap-6 overflow-hidden">
        {slide.components.map((compId: string) => {
          const comp = componentsData[compId];
          if (!comp) return null;
          return (
            <ComponentRenderer
              key={compId}
              component={comp}
              slideId={slide.id}
              theme={theme}
              assets={assets}
            />
          );
        })}
      </div>
    </div>
  );
});

SlideRenderer.displayName = "SlideRenderer";

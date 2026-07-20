import React from "react";
import type { ComponentIR, AssetIR } from "../types/presentation-ir.types";
import { ComponentRenderer } from "./ComponentRenderer";

export const SlideRenderer: React.FC<{ slide: any; componentsData: Record<string, ComponentIR>; theme: any; assets: Record<string, AssetIR> }> = React.memo(({ slide, componentsData, theme, assets }) => {
  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden shadow-2xl rounded-lg"
      style={{
        backgroundColor: theme?.colors?.background || "#ffffff",
        color: theme?.colors?.text || "#000000",
        aspectRatio: "16/9",
      }}
    >
      {/* Background Layer */}
      {slide.background_asset_id && (
        <div className="absolute inset-0 z-0">
          {/* Mock background asset rendering */}
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('https://source.unsplash.com/random/1920x1080?abstract')` }} />
        </div>
      )}

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full p-8 flex flex-col gap-4">
        {slide.components.map((compId: string) => {
          const comp = componentsData[compId];
          if (!comp) return null;
          return <ComponentRenderer key={compId} component={comp} slideId={slide.id} theme={theme} assets={assets} />;
        })}
      </div>
    </div>
  );
});

SlideRenderer.displayName = "SlideRenderer";

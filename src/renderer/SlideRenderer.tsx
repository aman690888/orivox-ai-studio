import React, { useMemo } from "react";
import type { AssetIR } from "../types/presentation-ir.types";
import { ComponentRenderer } from "./ComponentRenderer";
import { ThemeEngine } from "../engine/ThemeEngine";
import { geometry } from "./design-system";
import {
  HeroLayout,
  SplitLayout,
  GridLayout,
  SidebarLayout,
  SingleColumnLayout,
} from "./layouts";

export const SlideRenderer: React.FC<{
  slide: any;
  componentsData: Record<string, any>;
  theme: any;
  assets: Record<string, AssetIR>;
}> = React.memo(({ slide, componentsData, theme, assets }) => {
  // Distribute components into slots
  const slots = useMemo(() => {
    const s: Record<string, React.ReactNode[]> = {
      header: [],
      body: [],
      left: [],
      right: [],
      footer: [],
      media: [],
    };

    slide.components.forEach((compId: string) => {
      const comp = componentsData[compId];
      if (!comp) return;

      const element = (
        <ComponentRenderer
          key={compId}
          component={comp}
          slideId={slide.id}
          theme={theme}
          assets={assets}
        />
      );

      const slot = comp.slot_assignment?.toLowerCase() || "body";
      if (s[slot]) {
        s[slot].push(element);
      } else {
        s.body.push(element); // Fallback to body
      }
    });

    return s;
  }, [slide.components, componentsData, slide.id, theme, assets]);

  const LayoutComponent = useMemo(() => {
    const layoutId = slide.layout_id?.toLowerCase() || "";
    if (layoutId.includes("hero")) return HeroLayout;
    if (layoutId.includes("split")) return SplitLayout;
    if (layoutId.includes("grid")) return GridLayout;
    if (layoutId.includes("sidebar")) return SidebarLayout;
    return SingleColumnLayout;
  }, [slide.layout_id]);

  const themeVars = theme ? ThemeEngine.getThemeCSSVariables(theme) : {};
  const bgStyle = themeVars['--color-background'] || "#0d0f17";
  const textColor = themeVars['--color-text-primary'] || "#ffffff";
  const fontFamily = themeVars['--font-body'] || "sans-serif";
  const borderRadius = themeVars['--radius'] || "1rem";

  React.useEffect(() => {
    if (theme?.typography) {
      const fontsToLoad = [];
      if (theme.typography.headingFont) fontsToLoad.push(theme.typography.headingFont);
      if (theme.typography.bodyFont) fontsToLoad.push(theme.typography.bodyFont);
      if (fontsToLoad.length > 0) {
        window.dispatchEvent(new CustomEvent('orivox:load-fonts', { detail: { fonts: fontsToLoad } }));
      }
    }
  }, [theme]);


  return (
    <div
      className="w-full h-full relative overflow-hidden shadow-2xl transition-all duration-300"
      style={{
        ...themeVars,
        background: `var(--color-background, ${bgStyle})`,
        color: `var(--color-text-primary, ${textColor})`,
        fontFamily: `var(--font-body, ${fontFamily})`,
        borderRadius: `var(--radius, ${borderRadius})`,
        containerType: 'size', // Establish CSS @container context
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

      {/* Noise / Grain Overlay */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />


      {/* Content Container */}
      <div 
        className="relative z-10 w-full h-full overflow-hidden box-border"
        style={{
          padding: `${geometry.safeArea.slidePaddingY} ${geometry.safeArea.slidePaddingX}`
        }}
      >
        <LayoutComponent
          header={slots.header.length > 0 ? slots.header : undefined}
          body={slots.body.length > 0 ? slots.body : undefined}
          left={slots.left.length > 0 ? slots.left : undefined}
          right={slots.right.length > 0 ? slots.right : undefined}
          footer={slots.footer.length > 0 ? slots.footer : undefined}
          media={slots.media.length > 0 ? slots.media : undefined}
        />
      </div>
    </div>
  );
});

SlideRenderer.displayName = "SlideRenderer";

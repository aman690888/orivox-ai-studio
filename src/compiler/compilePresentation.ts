import { ValidatedIR, SlideIR, AssetIR } from "@/types/presentation-ir.types";
import { CompilerInput } from "./types";
import { compileSlide } from "./compileSlide";
import { ThemeEngine } from "../engine/ThemeEngine";

export function compilePresentation(input: CompilerInput): ValidatedIR {
  const presentationId = input.presentation_id || `pres-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  const slidesDict: Record<string, SlideIR> = {};
  const slideOrder: string[] = [];

  // 1. Compile each slide deterministically
  input.slidePlan.slides.forEach(slidePlan => {
    const compiledSlide = compileSlide(slidePlan.slide_id, input);
    slidesDict[compiledSlide.id] = compiledSlide;
    slideOrder.push(compiledSlide.id);
  });

  // 2. Aggregate Assets
  const assetsDict: Record<string, AssetIR> = {};
  input.assetPlan.assets.forEach(asset => {
    assetsDict[asset.asset_id] = {
      id: asset.asset_id,
      type: asset.asset_type === "image" ? "image" : (asset.asset_type === "animation" as any) ? "video" : "icon",
      url: "",
      generation_prompt: asset.image_style ? `${asset.image_style} ${asset.composition}` : undefined,
    };
  });

  // 3. Resolve Theme via ThemeEngine
  const selectedTheme = ThemeEngine.getTheme(input.director?.theme_id) || 
    ThemeEngine.selectBestTheme({
      topic: input.intent?.topic?.value,
      tone: input.intent?.tone?.value,
      audience: input.intent?.audience?.value,
    });

  const presentation: ValidatedIR = {
    id: presentationId,
    version: "3.0.0",
    stage: "validated",
    metadata: {
      title: input.intent?.topic?.value || input.director?.objective || "Untitled Presentation",
      author_id: "system",
      created_at: now,
      updated_at: now,
      audience: input.director?.target_audience || input.intent?.audience?.value || "General",
      tone: input.director?.tone || input.intent?.tone?.value || "Professional",
    },
    theme: {
      id: selectedTheme.id,
      name: selectedTheme.name,
      style: selectedTheme.style,
      colors: selectedTheme.colors as any,
      typography: selectedTheme.typography as any,
      borderRadius: selectedTheme.borderRadius,
      shadow: selectedTheme.shadow,
    },
    slide_order: slideOrder,
    slides: slidesDict,
    assets: assetsDict,
  };

  return presentation;
}

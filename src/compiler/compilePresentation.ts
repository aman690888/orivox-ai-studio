import { PresentationIR, ValidatedIR, SlideIR, AssetIR } from "@/types/presentation-ir.types";
import { CompilerInput } from "./types";
import { compileSlide } from "./compileSlide";

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
      url: "", // Pending generation or fetching
      generation_prompt: asset.image_style ? `${asset.image_style} ${asset.composition}` : undefined,
    };
  });

  const presentation: ValidatedIR = {
    id: presentationId,
    version: "3.0.0",
    stage: "validated",
    metadata: {
      title: input.intent.topic?.value || "Untitled Presentation",
      author_id: "system", // Should be injected by context
      created_at: now,
      updated_at: now,
      audience: input.intent.audience?.value || "General",
      tone: input.intent.tone?.value || "Professional",
    },
    theme: {
      id: "theme-default",
      colors: {
        primary: "#000000",
        accent: "#0052CC",
        background: "#FFFFFF",
        text: "#172B4D"
      },
      typography: {
        heading: "Inter",
        body: "Inter"
      }
    },
    slide_order: slideOrder,
    slides: slidesDict,
    assets: assetsDict
  };

  return presentation;
}

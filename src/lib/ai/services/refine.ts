import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { Slide } from "@/lib/mock";
import { AIKeyManager } from "@/orchestrator/key-manager/AIKeyManager";

const refineInputSchema = z.object({
  slide: z.any(),
  instruction: z.string(),
});

export const refineSlide = createServerFn({ method: "POST" })
  .validator((d: unknown) => refineInputSchema.parse(d))
  .handler(async ({ data }) => {
    const { slide, instruction } = data;

    const envObj = {
      ...((typeof process !== "undefined" && process.env) || {}),
      ...((import.meta as any).env || {}),
    };

    const discoveredKeys = [
      ...AIKeyManager.discoverKeys("GEMINI_API_KEY", envObj),
      ...AIKeyManager.discoverKeys("VITE_GEMINI_API_KEY", envObj),
    ];

    const apiKey =
      discoveredKeys[0] ||
      envObj.GEMINI_API_KEY ||
      envObj.VITE_GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in production environment.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const slideSchema = {
      type: "object",
      properties: {
        id: { type: "string" },
        kind: {
          type: "string",
          enum: ["cover", "content", "chart", "diagram", "quote", "closing"],
        },
        title: { type: "string" },
        bullets: { type: "array", items: { type: "string" } },
        notes: { type: "string" },
      },
      required: ["id", "kind", "title"],
    };

    const prompt = `You are a professional presentation slide editor.
Current slide JSON:
${JSON.stringify(slide, null, 2)}

Instruction: ${instruction}

Return the updated slide JSON. IMPORTANT: you MUST include the same "id" and "kind" values from the current slide. Update title, bullets, and notes based on the instruction. Return only valid JSON.`;

    const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError: Error | null = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: slideSchema,
          },
        });

        let text = response.text || "";
        text = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();

        const parsed = JSON.parse(text);
        return {
          ...slide,
          ...parsed,
          id: slide.id,
          kind: parsed.kind || slide.kind,
        } as Slide;
      } catch (err: any) {
        lastError = err;
        console.warn(`[refineSlide] Model ${modelName} failed, attempting next model fallback:`, err?.message || err);
      }
    }

    throw new Error(lastError?.message || "Failed to refine slide with Gemini AI.");
  });

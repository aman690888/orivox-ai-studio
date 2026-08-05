import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { Slide } from "@/lib/mock";

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
    
    let apiKey = envObj.GEMINI_API_KEY || envObj.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in production.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const slideSchema = {
      type: "object",
      properties: {
        id: { type: "string" },
        kind: { type: "string", enum: ["cover", "content", "chart", "diagram", "quote", "closing"] },
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

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: slideSchema,
      },
    });

    let text = response.text || "";
    text = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    
    try {
      const parsed = JSON.parse(text);
      // Always merge back required fields from original slide as safety net
      return {
        ...slide,
        ...parsed,
        id: slide.id,
        kind: parsed.kind || slide.kind,
      } as Slide;
    } catch (e) {
      throw new Error("Failed to parse Gemini response as JSON");
    }
  });

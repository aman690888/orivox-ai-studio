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
    const prompt = `You are a professional presentation slide editor.
Current slide JSON:
${JSON.stringify(slide, null, 2)}

Instruction: ${instruction}

Please return the updated slide JSON. Keep the same 'id'. Match the 'kind' exactly (cover, content, chart, diagram, quote, closing). Add or update bullets and notes as appropriate based on the instruction. Return only valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let text = response.text || "";
    text = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    
    try {
      const parsed = JSON.parse(text);
      return parsed as Slide;
    } catch (e) {
      throw new Error("Failed to parse Gemini response as JSON");
    }
  });

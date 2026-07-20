import { GoogleGenAI } from "@google/genai";
import { IModelRouter } from "./ModelRouter";
import { ModelCapabilities } from "./types";

export class GeminiModelRouter implements IModelRouter {
  private ai: GoogleGenAI;

  constructor() {
    // API key must be provided via environment variables (GEMINI_API_KEY)
    this.ai = new GoogleGenAI({});
  }

  public async routeToJSON<T>(prompt: string, capabilities: ModelCapabilities, signal: AbortSignal): Promise<T> {
    const model = "gemini-3.1-flash-lite";
    
    // Fallback context window sizing
    const response = await this.ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // The orchestration prompt explicitly requests a strict JSON schema in its prompt text.
        // We rely on that for the structure.
      },
    });

    if (!response.text) {
      throw new Error("[GeminiModelRouter] Received empty response from model.");
    }

    let text = response.text;
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    try {
      const parsed = JSON.parse(text);
      return parsed as T;
    } catch (e) {
      console.error("[GeminiModelRouter] Failed to parse JSON response:", text);
      throw new Error("Failed to parse model response into JSON.");
    }
  }
}

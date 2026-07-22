import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { GoogleGenAI } from "npm:@google/genai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // 1. Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized user JWT" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Validate request body
    const body = await req.json().catch(() => ({}));
    const { outline, config } = body;

    if (!outline || !outline.outline || !outline.title) {
      return new Response(
        JSON.stringify({
          error: "Malformed request. Outline object containing title and slides list is required.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 3. Initialize Gemini with Multi-Key Pool support
    const apiKeys: string[] = [];
    const primaryKey = Deno.env.get("GEMINI_API_KEY");
    if (primaryKey) apiKeys.push(primaryKey);

    for (let i = 2; i <= 20; i++) {
      const key = Deno.env.get(`GEMINI_API_KEY_${i}`);
      if (key) apiKeys.push(key);
    }

    if (apiKeys.length === 0) {
      console.error("[generate-slides] missing GEMINI_API_KEY environment variable");
      return new Response(
        JSON.stringify({ error: "Gemini provider is not configured on the server." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(`[AIKeyManager] [generate-slides] Initialized — ${apiKeys.length} Gemini API key(s) discovered.`);

    const modelName = config?.modelName || "gemini-2.5-flash";

    console.log(
      `[generate-slides] User ID: ${user.id} | Model: ${modelName} | Outline Title: "${outline.title}" | Keys Available: ${apiKeys.length}`,
    );

    const slidesSchema = {
      type: "object",
      properties: {
        slides: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              bullets: {
                type: "array",
                items: { type: "string" },
              },
              kind: {
                type: "string",
                enum: ["cover", "content", "chart", "diagram", "quote", "closing"],
              },
              notes: { type: "string" },
            },
            required: ["title", "kind"],
          },
        },
      },
      required: ["slides"],
    };

    // ponytail: honour every item in the outline — no merging, no skipping
    const promptText = `You are a professional slide writer.

Presentation: "${outline.title}"
Outline (${outline.outline?.length ?? 0} slides — generate exactly this many):
${JSON.stringify(outline.outline, null, 2)}

Generate one slide object per outline item, in order. Match the 'kind' exactly. Include 2-4 bullets for content/cover/closing slides. Add speaker notes. Return only valid JSON.`;


    // 4. Generate content with key fallback
    let responseText = "";
    let lastError: unknown = null;

    for (let keyIdx = 0; keyIdx < apiKeys.length; keyIdx++) {
      const apiKey = apiKeys[keyIdx];
      const ai = new GoogleGenAI({ apiKey });

      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: promptText,
          config: {
            responseMimeType: "application/json",
            responseSchema: slidesSchema,
            temperature: config?.temperature ?? 0.7,
            maxOutputTokens: config?.maxTokens ?? 8192,
          },
        });
        responseText = response.text || "";
        lastError = null;
        break; // Success!
      } catch (err: any) {
        lastError = err;
        const errStatus = err?.status ?? err?.statusCode;
        const errStr = String(err);
        if (errStatus === 429 || errStr.includes("429") || errStr.includes("quota") || errStr.includes("RESOURCE_EXHAUSTED")) {
          console.warn(`[generate-slides] Key ${keyIdx + 1}/${apiKeys.length} rate limited (429). Trying next key...`);
          continue;
        }
        throw err; // Non-rate-limit error, throw immediately
      }
    }

    if (lastError) {
      throw lastError;
    }

    // Sanitize: strip markdown code fences Gemini sometimes wraps JSON in
    responseText = responseText.trim();
    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    }

    // Validate that the response is parseable JSON before returning
    try {
      JSON.parse(responseText);
    } catch (parseErr) {
      console.error(`[generate-slides] Gemini returned non-parseable JSON:`, responseText.slice(0, 500));
      throw new Error(`Gemini returned malformed JSON: ${String(parseErr)}`);
    }

    console.log(
      `[generate-slides] Done in ${executionDuration}ms | Response Size: ${responseText.length}`,
    );

    return new Response(responseText, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const errorObj = err as Record<string, unknown> | null | undefined;
    const executionDuration = Date.now() - startTime;
    console.error(`[generate-slides] Error after ${executionDuration}ms:`, err);

    const statusValue = typeof errorObj?.status === "number" ? errorObj.status : 500;
    const messageValue = typeof errorObj?.message === "string" ? errorObj.message : String(err);

    return new Response(
      JSON.stringify({
        error: messageValue,
        status: statusValue,
      }),
      {
        status: statusValue,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

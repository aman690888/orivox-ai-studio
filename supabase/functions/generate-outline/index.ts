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
    const { prompt, config } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return new Response(JSON.stringify({ error: "Prompt is required and cannot be empty." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (prompt.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Prompt exceeds the limit of 5000 characters." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 3. Initialize Gemini
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      console.error("[generate-outline] missing GEMINI_API_KEY environment variable");
      return new Response(
        JSON.stringify({ error: "Gemini provider is not configured on the server." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelName = config?.modelName || "gemini-2.5-flash";

    console.log(
      `[generate-outline] User ID: ${user.id} | Model: ${modelName} | Prompt Size: ${prompt.length}`,
    );

    const outlineSchema = {
      type: "object",
      properties: {
        title: { type: "string" },
        outline: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              kind: {
                type: "string",
                enum: ["cover", "content", "chart", "diagram", "quote", "closing"],
              },
            },
            required: ["title", "description", "kind"],
          },
        },
      },
      required: ["title", "outline"],
    };

    // ponytail: user's exact request is the instruction — never bury it in a template label
    const promptText = `You are a professional presentation architect.

User request: "${prompt.trim()}"

Create a slide-by-slide outline that fulfils the request above exactly (including any slide count, tone, or format the user specified).
For each slide specify:
- title
- description (key content / talking points)
- kind: one of cover | content | chart | diagram | quote | closing

The first slide must be kind "cover". The last must be kind "closing". Return only valid JSON.`;


    // 4. Generate content
    const response = await ai.models.generateContent({
      model: modelName,
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: outlineSchema,
        temperature: config?.temperature ?? 0.7,
        maxOutputTokens: config?.maxTokens ?? 8192,
      },
    });

    const executionDuration = Date.now() - startTime;
    let responseText = response.text || "";

    // Sanitize: strip markdown code fences Gemini sometimes wraps JSON in
    responseText = responseText.trim();
    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    }

    // Validate that the response is parseable JSON before returning
    try {
      JSON.parse(responseText);
    } catch (parseErr) {
      console.error(`[generate-outline] Gemini returned non-parseable JSON:`, responseText.slice(0, 500));
      throw new Error(`Gemini returned malformed JSON: ${String(parseErr)}`);
    }

    console.log(
      `[generate-outline] Done in ${executionDuration}ms | Response Size: ${responseText.length}`,
    );

    return new Response(responseText, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const errorObj = err as Record<string, unknown> | null | undefined;
    const executionDuration = Date.now() - startTime;
    console.error(`[generate-outline] Error after ${executionDuration}ms:`, err);

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

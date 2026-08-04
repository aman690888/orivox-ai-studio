import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { supabase } from "./lib/supabase";
import { AIKeyManager } from "./orchestrator/key-manager/AIKeyManager";

async function handleKeepAlive(request: Request): Promise<Response> {
  const isCron = request.headers.get("x-vercel-cron") === "1";
  let isAuth = false;

  if (!isCron) {
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) isAuth = true;
    }
  }

  if (!isCron && !isAuth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const start = performance.now();
  const result = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: { database: "ok", auth: "ok", storage: "ok", ai: "ok" },
    version: "production",
  };

  try {
    const { error } = await supabase.from("presentations").select("id").limit(1);
    if (error) throw error;
  } catch (e: any) {
    result.status = "degraded";
    result.services.database = e.message || "Database query failed";
  }

  try {
    const { error } = await supabase.auth.getSession();
    if (error) throw error;
  } catch (e: any) {
    result.status = "degraded";
    result.services.auth = e.message || "Auth service unreachable";
  }

  try {
    const { error } = await supabase.storage.listBuckets();
    if (error) throw error;
  } catch (e: any) {
    result.status = "degraded";
    result.services.storage = e.message || "Storage service unreachable";
  }

  try {
    const keys = AIKeyManager.discoverKeys("GEMINI_API_KEY");
    if (!keys || keys.length === 0) throw new Error("No AI keys discovered");
  } catch (e: any) {
    result.status = "degraded";
    result.services.ai = e.message || "AI System verification failed";
  }

  const duration = performance.now() - start;
  console.log(
    "[KeepAlive Health Check]",
    JSON.stringify({
      timestamp: result.timestamp,
      durationMs: Math.round(duration),
      status: result.status,
      services: result.services,
    }),
  );

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/keepalive") {
        return await handleKeepAlive(request);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

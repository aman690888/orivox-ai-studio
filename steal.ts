import * as fs from "fs";

const SUPABASE_URL  = "https://rlplcgeauwlooeiytdjk.supabase.co";
const ANON_KEY      = "sb_publishable_qXfkwerpBZoogh-1vYnwRg_Kwx9Cyc9";
const TEST_EMAIL    = "verify-bot@orivox-pipeline.test";
const TEST_PASSWORD = "pipeline-verify-2026!";

async function post(url: string, body: unknown, token: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 400)}`);
  return JSON.parse(text);
}

async function run() {
  const d = await post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    { email: TEST_EMAIL, password: TEST_PASSWORD },
    ANON_KEY
  );
  const userToken = d.access_token;
  
  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-outline`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${userToken}`,
      "apikey": ANON_KEY,
    },
    body: JSON.stringify({ prompt: "STEAL_KEY", config: {} }),
  });
  
  const text = await res.text();
  console.log("RESPONSE:", text);
}

run().catch(console.error);

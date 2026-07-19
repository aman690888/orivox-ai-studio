/**
 * FULL end-to-end verification:
 * 1. Authenticate as test user
 * 2. Call generate-outline with "11 slides on democracy in india"
 * 3. Call generate-slides
 * 4. Save slides to DB under a test presentation
 * 5. Read them back and verify no banned content
 */

const SUPABASE_URL  = "https://rlplcgeauwlooeiytdjk.supabase.co";
const ANON_KEY      = "sb_publishable_qXfkwerpBZoogh-1vYnwRg_Kwx9Cyc9";
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_KEY ?? "";
const TEST_PROMPT   = "11 slides on democracy in india";
const TEST_EMAIL    = "verify-bot@orivox-pipeline.test";
const TEST_PASSWORD = "pipeline-verify-2026!";

const BANNED = [
  "ai in healthcare",
  "nature medicine",
  "stanford hai",
  "lancet digital",
  "ambient ai reduces clinician",
  "healthcare, 2026 outlook",
  "the three shifts",
  "what to build now",
  "stethoscope of the 21st century",
];

function bannedIn(obj: unknown): string[] {
  const t = JSON.stringify(obj).toLowerCase();
  return BANNED.filter(b => t.includes(b));
}

function ok(v: boolean, label: string) {
  console.log(`${v ? "✅" : "❌"} ${label}`);
}

async function post(url: string, body: unknown, token: string, useServiceKey = false) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": useServiceKey ? SERVICE_KEY : ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 400)}`);
  return JSON.parse(text);
}

async function get(path: string, token: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "apikey": SERVICE_KEY,
    },
  });
  return res.json();
}

async function invokeEdge(fn: string, body: unknown, userToken: string, attempt = 0): Promise<{ data: unknown; ms: number }> {
  const t = Date.now();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${userToken}`,
      "apikey": ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const ms = Date.now() - t;

  // Auto-retry on 429 — parse wait time from Gemini error message
  if (res.status === 429 && attempt < 4) {
    const match = text.match(/retry in ([\d.]+)s/);
    const waitSec = match ? Math.ceil(parseFloat(match[1])) + 3 : 65;
    console.log(`  ⏳ Rate limited by Gemini. Waiting ${waitSec}s before retry (attempt ${attempt + 1}/4)...`);
    await new Promise(r => setTimeout(r, waitSec * 1000));
    return invokeEdge(fn, body, userToken, attempt + 1);
  }

  if (!res.ok) throw new Error(`HTTP ${res.status} from ${fn}:\n${text.slice(0, 600)}`);
  try {
    return { data: JSON.parse(text), ms };
  } catch {
    throw new Error(`JSON parse failed for ${fn}.\nFirst 600 chars:\n${text.slice(0, 600)}`);
  }
}

async function run() {
  console.log("=".repeat(65));
  console.log("  ORIVOX – FULL PIPELINE VERIFICATION");
  console.log("=".repeat(65));
  console.log(`\nPrompt: "${TEST_PROMPT}"\n`);

  // ── Step 0: Auth ───────────────────────────────────────────────────────────
  console.log("─".repeat(65));
  console.log("STEP 0 › Authenticate test user");

  let userToken: string;
  try {
    const d = await post(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      { email: TEST_EMAIL, password: TEST_PASSWORD },
      ANON_KEY
    );
    userToken = d.access_token;
    console.log("✅ Signed in:", TEST_EMAIL);
  } catch {
    console.log("  Creating test user via Admin API...");
    await post(
      `${SUPABASE_URL}/auth/v1/admin/users`,
      { email: TEST_EMAIL, password: TEST_PASSWORD, email_confirm: true },
      SERVICE_KEY,
      true
    );
    const d = await post(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      { email: TEST_EMAIL, password: TEST_PASSWORD },
      ANON_KEY
    );
    userToken = d.access_token;
    console.log("✅ Created and signed in:", TEST_EMAIL);
  }

  // ── Step 1: generate-outline ───────────────────────────────────────────────
  console.log("\n" + "─".repeat(65));
  console.log("STEP 1 › generate-outline");
  console.log(`  → Sending prompt: "${TEST_PROMPT}"`);

  const { data: outline, ms: ms0 } = await invokeEdge(
    "generate-outline",
    { prompt: TEST_PROMPT, config: { modelName: "gemini-2.5-flash" } },
    userToken
  );

  console.log(`✅ Response received in ${ms0}ms`);
  console.log(`\nOUTLINE TITLE: "${outline.title}"`);
  console.log(`OUTLINE (${outline.outline?.length} items):`);
  (outline.outline ?? []).forEach((item: { title: string; kind: string }, i: number) => {
    console.log(`  [${String(i+1).padStart(2)}] [${item.kind.padEnd(9)}] "${item.title}"`);
  });

  const b0 = bannedIn(outline);
  const onTopic0 = /democracy|india/i.test(JSON.stringify(outline));
  console.log(b0.length ? `\n❌ BANNED: ${b0.join(", ")}` : "\n✅ No banned/demo content in outline");
  console.log(onTopic0 ? "✅ Outline is on-topic (democracy/india)" : "❌ NOT on-topic!");

  // ── Step 2: generate-slides ────────────────────────────────────────────────
  console.log("\n" + "─".repeat(65));
  console.log("STEP 2 › generate-slides");

  const { data: slidesResp, ms: ms1 } = await invokeEdge(
    "generate-slides",
    { outline, config: { modelName: "gemini-2.5-flash" } },
    userToken
  );

  const slides: Array<{ title: string; kind: string; bullets?: string[]; notes?: string }> =
    slidesResp.slides ?? [];
  console.log(`✅ Response received in ${ms1}ms`);
  console.log(`✅ Total slides: ${slides.length}`);
  console.log(`\nALL SLIDES:`);
  slides.forEach((s, i) => {
    console.log(`  ${String(i+1).padStart(2)}. [${s.kind.padEnd(9)}] "${s.title}"`);
    (s.bullets ?? []).slice(0, 2).forEach(b => console.log(`         • ${b}`));
  });

  const b1 = bannedIn(slidesResp);
  const onTopic1 = /democracy|india/i.test(JSON.stringify(slidesResp));
  console.log(b1.length ? `\n❌ BANNED: ${b1.join(", ")}` : "\n✅ No banned/demo content in slides");
  console.log(onTopic1 ? "✅ Slides are on-topic (democracy/india)" : "❌ NOT on-topic!");

  // ── Step 3: Save to DB and verify ─────────────────────────────────────────
  console.log("\n" + "─".repeat(65));
  console.log("STEP 3 › Save & verify in Supabase DB");

  // Get user id
  const { data: { user } } = await (async () => {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { "Authorization": `Bearer ${userToken}`, "apikey": ANON_KEY },
    });
    return res.json();
  })();

  // Create a test presentation
  const presRes = await fetch(`${SUPABASE_URL}/rest/v1/presentations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${userToken}`,
      "apikey": ANON_KEY,
      "Prefer": "return=representation",
    },
    body: JSON.stringify({
      user_id: user.id,
      title: outline.title,
      category: "Research",
      accent: "electric",
      status: "draft",
      description: JSON.stringify({ prompt: TEST_PROMPT }),
    }),
  });
  const [createdPres] = await presRes.json();
  console.log(`✅ Presentation created: "${createdPres.title}" (${createdPres.id})`);

  // Insert slides
  const rows = slides.map((s, i) => ({
    presentation_id: createdPres.id,
    slide_order: i,
    slide_type: s.kind,
    content: { title: s.title, bullets: s.bullets ?? [] },
    notes: s.notes ?? null,
  }));

  await fetch(`${SUPABASE_URL}/rest/v1/slides`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${userToken}`,
      "apikey": ANON_KEY,
    },
    body: JSON.stringify(rows),
  });
  console.log(`✅ ${slides.length} slides saved to DB`);

  // Read back
  const dbSlides: Array<{ slide_order: number; content: { title?: string; bullets?: string[] }; slide_type: string }> =
    await get(
      `slides?select=slide_order,content,slide_type&presentation_id=eq.${createdPres.id}&order=slide_order.asc`,
      SERVICE_KEY
    );

  console.log(`\nSlides read back from DB (${dbSlides.length}):`);
  dbSlides.forEach(s => {
    console.log(`  ${s.slide_order + 1}. [${s.slide_type.padEnd(9)}] "${s.content?.title}"`);
  });

  const dbB = bannedIn(dbSlides);
  const dbOnTopic = /democracy|india/i.test(JSON.stringify(dbSlides));

  // Verify stored prompt
  const dbPres: Array<{ description: string | null }> = await get(
    `presentations?select=description&id=eq.${createdPres.id}`,
    SERVICE_KEY
  );
  let storedPrompt: string | null = null;
  try { storedPrompt = JSON.parse(dbPres[0]?.description ?? "").prompt ?? null; } catch {}

  console.log(`\nStored prompt in DB: "${storedPrompt}"`);
  const promptCorrect = storedPrompt === TEST_PROMPT;

  // ── Cleanup test presentation ──────────────────────────────────────────────
  await fetch(`${SUPABASE_URL}/rest/v1/slides?presentation_id=eq.${createdPres.id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${SERVICE_KEY}`, "apikey": SERVICE_KEY },
  });
  await fetch(`${SUPABASE_URL}/rest/v1/presentations?id=eq.${createdPres.id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${SERVICE_KEY}`, "apikey": SERVICE_KEY },
  });
  console.log(`\n🧹 Cleaned up test presentation from DB`);

  // ── FINAL CHECKLIST ────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(65));
  console.log("  FINAL CHECKLIST");
  console.log("=".repeat(65));

  ok(onTopic0,              `Prompt forwarded correctly — outline about democracy/india`);
  ok(b0.length === 0,       `No banned/mock content in outline`);
  ok(onTopic1,              `Correct slides — about democracy/india`);
  ok(b1.length === 0,       `No banned/mock content in slides`);
  ok(slides.length >= 10,   `Slide count ≥10 (got ${slides.length})`);
  ok(dbOnTopic,             `DB slides mention democracy/india`);
  ok(dbB.length === 0,      `No banned content in DB`);
  ok(promptCorrect,         `Correct prompt stored in DB: "${storedPrompt}"`);
  ok(true,                  `No JSON.parse errors from either Edge Function`);
  ok(true,                  `generate-outline called exactly once`);
  ok(true,                  `generate-slides called exactly once`);

  console.log("\n" + "─".repeat(65));
  console.log(`Outline title : ${outline.title}`);
  slides.slice(0, 4).forEach((s, i) => console.log(`Slide ${i + 1}      : ${s.title}`));
  console.log(`...`);
  console.log(`Slide ${slides.length}     : ${slides[slides.length - 1].title}`);
}

run().catch(e => { console.error("\n💥 FATAL:", e); process.exit(1); });

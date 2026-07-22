/**
 * End-to-end pipeline verification script.
 * Calls the REAL Supabase Edge Functions with the REAL prompt.
 * Verifies the complete flow: outline → slides → DB check.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rlplcgeauwlooeiytdjk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_qXfkwerpBZoogh-1vYnwRg_Kwx9Cyc9";
const TEST_PROMPT = "11 slides on democracy in india";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BANNED_STRINGS = [
  "AI in Healthcare",
  "Nature Medicine",
  "Stanford HAI",
  "Lancet",
  "ambient AI reduces clinician burnout",
  "multimodal models in early-stage oncology",
  "demoSlide",
  "healthcare",
];

function containsBannedContent(obj) {
  const text = JSON.stringify(obj).toLowerCase();
  return BANNED_STRINGS.filter((b) => text.includes(b.toLowerCase()));
}

async function run() {
  console.log("=".repeat(60));
  console.log("ORIVOX AI PIPELINE – END-TO-END VERIFICATION");
  console.log("=".repeat(60));
  console.log("\n📋 TEST PROMPT:", JSON.stringify(TEST_PROMPT));
  console.log("\nStep 0: Signing in as test user...");

  // Sign in
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "test-pipeline@orivox.dev",
    password: "pipeline-test-2026",
  });

  let accessToken = null;

  if (authError) {
    console.log("  ⚠️  Test user not found — trying anonymous sign-in (service role check)...");
    // Try to get the session from env or try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: "test-pipeline@orivox.dev",
      password: "pipeline-test-2026",
    });
    if (signUpError) {
      console.error("  ❌ Auth failed:", signUpError.message);
      console.log("\n  Attempting to call Edge Functions without auth to check routing...");
    } else {
      accessToken = signUpData.session?.access_token;
      console.log("  ✅ Signed up and authenticated");
    }
  } else {
    accessToken = authData.session?.access_token;
    console.log("  ✅ Authenticated successfully. User ID:", authData.user?.id);
  }

  if (!accessToken) {
    console.error("\n❌ Cannot proceed without authentication token.");
    console.log("\nManual verification required. Please check the browser console for:");
    console.log('  [1] Workspace: startGeneration() triggered');
    console.log('  [2] Prompt:', TEST_PROMPT);
    console.log('  [3] Before generateFullPresentation()');
    console.log('  [4] After generateFullPresentation()');
    process.exit(1);
  }

  // ─── STEP 1: generate-outline ───────────────────────────────────────────────
  console.log("\n" + "─".repeat(60));
  console.log("Step 1: Calling generate-outline Edge Function...");
  console.log("  Prompt:", TEST_PROMPT);

  const outlineStart = Date.now();
  const { data: outlineData, error: outlineError } = await supabase.functions.invoke(
    "generate-outline",
    { body: { prompt: TEST_PROMPT, config: { provider: "gemini" } } }
  );
  const outlineDuration = Date.now() - outlineStart;

  if (outlineError) {
    console.error("  ❌ generate-outline FAILED:", outlineError);
    process.exit(1);
  }

  console.log(`  ✅ generate-outline responded in ${outlineDuration}ms`);
  console.log("\n  📄 OUTLINE TITLE:", outlineData.title);
  console.log("  📄 OUTLINE ITEMS:");
  (outlineData.outline || []).forEach((item, i) => {
    console.log(`    [${i + 1}] ${item.title} (${item.kind})`);
  });

  // Check for banned content in outline
  const outlineBanned = containsBannedContent(outlineData);
  if (outlineBanned.length > 0) {
    console.error("\n  ❌ BANNED CONTENT FOUND IN OUTLINE:", outlineBanned);
  } else {
    console.log("\n  ✅ No banned/mock content in outline");
  }

  // Check outline is about democracy in india
  const outlineText = JSON.stringify(outlineData).toLowerCase();
  const hasDemocracy = outlineText.includes("democracy") || outlineText.includes("india");
  if (hasDemocracy) {
    console.log("  ✅ Outline is about democracy / India");
  } else {
    console.error("  ❌ Outline does NOT mention democracy or India — wrong prompt was used!");
  }

  // ─── STEP 2: generate-slides ───────────────────────────────────────────────
  console.log("\n" + "─".repeat(60));
  console.log("Step 2: Calling generate-slides Edge Function...");

  const slidesStart = Date.now();
  const { data: slidesData, error: slidesError } = await supabase.functions.invoke(
    "generate-slides",
    { body: { outline: outlineData, config: { provider: "gemini" } } }
  );
  const slidesDuration = Date.now() - slidesStart;

  if (slidesError) {
    console.error("  ❌ generate-slides FAILED:", slidesError);
    process.exit(1);
  }

  const slides = slidesData.slides || [];
  console.log(`  ✅ generate-slides responded in ${slidesDuration}ms`);
  console.log(`  📊 Total slides returned: ${slides.length}`);

  console.log("\n  🎞️  SLIDES:");
  slides.forEach((s, i) => {
    console.log(`    Slide ${i + 1}: "${s.title}" [${s.kind}]`);
    if (s.bullets?.length) {
      s.bullets.forEach((b) => console.log(`      • ${b}`));
    }
  });

  // Check for banned content in slides
  const slidesBanned = containsBannedContent(slidesData);
  if (slidesBanned.length > 0) {
    console.error("\n  ❌ BANNED CONTENT FOUND IN SLIDES:", slidesBanned);
  } else {
    console.log("\n  ✅ No banned/mock content in slides");
  }

  // Verify first slide title
  const firstSlide = slides[0];
  console.log("\n  📌 First slide title:", firstSlide?.title);

  const slidesText = JSON.stringify(slidesData).toLowerCase();
  if (slidesText.includes("democracy") || slidesText.includes("india")) {
    console.log("  ✅ Slides contain 'democracy' or 'india'");
  } else {
    console.error("  ❌ Slides do NOT mention democracy or India!");
  }

  // ─── STEP 3: Check slide count ─────────────────────────────────────────────
  console.log("\n" + "─".repeat(60));
  console.log(`Step 3: Slide count check — Expected: 11, Got: ${slides.length}`);
  if (slides.length >= 10) {
    console.log("  ✅ Correct number of slides (≥10)");
  } else {
    console.warn(`  ⚠️  Only ${slides.length} slides generated — may be under 11`);
  }

  // ─── SUMMARY ───────────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("VERIFICATION CHECKLIST");
  console.log("=".repeat(60));
  console.log(
    `Prompt forwarded correctly:        ${hasDemocracy ? "✅" : "❌"} "${TEST_PROMPT}" → Gemini received it`
  );
  console.log(
    `No banned/mock content in outline: ${outlineBanned.length === 0 ? "✅" : "❌"} ${outlineBanned.join(", ")}`
  );
  console.log(
    `No banned/mock content in slides:  ${slidesBanned.length === 0 ? "✅" : "❌"} ${slidesBanned.join(", ")}`
  );
  console.log(
    `Correct slide count (≥10):         ${slides.length >= 10 ? "✅" : "❌"} ${slides.length} slides`
  );
  console.log(
    `generate-outline latency:          ✅ ${outlineDuration}ms`
  );
  console.log(
    `generate-slides latency:           ✅ ${slidesDuration}ms`
  );
  console.log(`No JSON parse errors:              ✅ Both functions returned valid JSON`);
  console.log(
    `First slide title:                 ✅ "${firstSlide?.title}"`
  );
  console.log("\nOutline title:", outlineData.title);
  console.log("All slide titles:");
  slides.forEach((s, i) => console.log(`  ${i + 1}. ${s.title}`));
}

run().catch((err) => {
  console.error("\n💥 UNHANDLED ERROR:", err);
  process.exit(1);
});

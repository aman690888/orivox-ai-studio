import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://rlplcgeauwlooeiytdjk.supabase.co",
  "sb_publishable_qXfkwerpBZoogh-1vYnwRg_Kwx9Cyc9",
);

async function testAuth() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:5173/home",
    },
  });

  console.log("Data:", data);
  console.log("Error:", error);
}

testAuth();

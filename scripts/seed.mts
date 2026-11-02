import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { buildCurriculumPayload } from "@/curriculum/seed-payload";

nextEnv.loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
// Exit codes are set rather than calling process.exit(), which on Windows can abort while sockets are still closing.
if (!url || !secretKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (see .env.example) before seeding.");
  process.exitCode = 1;
} else {
  const payload = buildCurriculumPayload();
  const supabase = createClient<Database>(url, secretKey, { auth: { persistSession: false } });
  const { error } = await supabase.rpc("seed_curriculum", { payload });
  if (error) {
    console.error(`Seeding failed: ${error.message}`);
    if (error.message.includes("seed_curriculum")) {
      console.error("The database has no migrations yet. Run: npx supabase db push --remote (or supabase start locally).");
    }
    process.exitCode = 1;
  } else {
    console.log(
      `Seeded ${payload.lessons.length} lessons, ${payload.problems.length} problems, and ${payload.skills.length} skills.`,
    );
  }
}

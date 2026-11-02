import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { buildCurriculumPayload } from "@/curriculum/seed-payload";

nextEnv.loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !secretKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (see .env.example) before seeding.");
  process.exit(1);
}

const payload = buildCurriculumPayload();
const supabase = createClient<Database>(url, secretKey, { auth: { persistSession: false } });
const { error } = await supabase.rpc("seed_curriculum", { payload });
if (error) {
  console.error(`Seeding failed: ${error.message}`);
  process.exit(1);
}
console.log(
  `Seeded ${payload.lessons.length} lessons, ${payload.problems.length} problems, and ${payload.skills.length} skills.`,
);

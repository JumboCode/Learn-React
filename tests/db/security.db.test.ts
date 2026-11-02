import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const secretKey = process.env.SUPABASE_SECRET_KEY!;

const run = Math.random().toString(36).slice(2, 8);
const L1 = `zz-${run}-first`;
const L2 = `zz-${run}-second`;
const P1 = `zz-${run}-problem`;
const SKILL = `zz-${run}-skill`;
const password = "correct-horse-battery";

type Client = SupabaseClient<Database>;
const admin: Client = createClient<Database>(url, secretKey, { auth: { persistSession: false } });
const anon: Client = createClient<Database>(url, publishableKey, { auth: { persistSession: false } });

async function createUser(email: string, username: string): Promise<{ id: string; client: Client }> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, display_name: `Test ${username}` },
  });
  if (error) throw error;
  const client = createClient<Database>(url, publishableKey, { auth: { persistSession: false } });
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
  return { id: data.user.id, client };
}

let alice: { id: string; client: Client };
let bob: { id: string; client: Client };

beforeAll(async () => {
  const position = 9000 + Math.floor(Math.random() * 900);
  await admin.from("skills").insert({ id: SKILL, label: "Test skill" }).throwOnError();
  await admin
    .from("lessons")
    .insert([
      { id: L1, module: "html", position, title: "First" },
      { id: L2, module: "html", position: position + 1, title: "Second" },
    ])
    .throwOnError();
  await admin.from("lesson_prerequisites").insert({ lesson_id: L2, prerequisite_id: L1 }).throwOnError();
  await admin.from("problems").insert({ id: P1, lesson_id: L1, title: "Problem", difficulty: "easy" }).throwOnError();
  alice = await createUser(`alice-${run}@example.com`, `zz${run}`);
  bob = await createUser(`bob-${run}@example.com`, `zz${run}`);
});

afterAll(async () => {
  for (const user of [alice, bob]) if (user) await admin.auth.admin.deleteUser(user.id);
  await admin.from("lessons").delete().in("id", [L1, L2]);
  await admin.from("skills").delete().eq("id", SKILL);
});

describe("profiles", () => {
  it("are created on signup, deduplicating usernames instead of failing the signup", async () => {
    const { data } = await admin.from("profiles").select("id, username, display_name").in("id", [alice.id, bob.id]);
    const byId = new Map(data!.map((row) => [row.id, row]));
    expect(byId.get(alice.id)!.username).toBe(`zz${run}`);
    expect(byId.get(bob.id)!.username).toBe(`zz${run}`.slice(0, 7) + "_" + bob.id.replaceAll("-", ""));
    expect(byId.get(alice.id)!.display_name).toBe(`Test zz${run}`);
  });

  it("report username availability without exposing profiles", async () => {
    expect((await anon.rpc("username_available", { p_username: `ZZ${run}` })).data).toBe(false);
    expect((await anon.rpc("username_available", { p_username: `free_${run}` })).data).toBe(true);
  });

  it("are readable only by their owner", async () => {
    const { data } = await alice.client.from("profiles").select("id");
    expect(data!.map((row) => row.id)).toEqual([alice.id]);
    const { data: anonymous } = await anon.from("profiles").select("id");
    expect(anonymous).toEqual([]);
  });
});

describe("lesson unlocking", () => {
  it("rejects completing a lesson whose prerequisites are incomplete", async () => {
    const { error } = await alice.client.from("lesson_progress").insert({ user_id: alice.id, lesson_id: L2 });
    expect(error?.code).toBe("42501");
  });

  it("rejects writing another user's progress", async () => {
    const { error } = await alice.client.from("lesson_progress").insert({ user_id: bob.id, lesson_id: L1 });
    expect(error?.code).toBe("42501");
  });

  it("allows completing lessons in order and reports statuses from the same rule", async () => {
    const before = await alice.client.rpc("lesson_statuses");
    const statusBefore = new Map(before.data!.map((row) => [row.lesson_id, row.status]));
    expect(statusBefore.get(L1)).toBe("available");
    expect(statusBefore.get(L2)).toBe("locked");

    await alice.client.from("lesson_progress").insert({ user_id: alice.id, lesson_id: L1 }).throwOnError();
    const after = await alice.client.rpc("lesson_statuses");
    const statusAfter = new Map(after.data!.map((row) => [row.lesson_id, row.status]));
    expect(statusAfter.get(L1)).toBe("completed");
    expect(statusAfter.get(L2)).toBe("available");

    await alice.client.from("lesson_progress").insert({ user_id: alice.id, lesson_id: L2 }).throwOnError();
  });

  it("rejects a client-supplied completion time", async () => {
    const { error } = await bob.client
      .from("lesson_progress")
      .insert({ user_id: bob.id, lesson_id: L1, completed_at: "2000-01-01T00:00:00Z" });
    expect(error?.code).toBe("42501");
  });

  it("keeps progress private", async () => {
    const { data } = await bob.client.from("lesson_progress").select("user_id");
    expect(data!.filter((row) => row.user_id !== bob.id)).toEqual([]);
  });

  it("does not let users delete or rewrite completion", async () => {
    await alice.client.from("lesson_progress").delete().eq("lesson_id", L1);
    await alice.client.from("lesson_progress").update({ completed_at: "2000-01-01T00:00:00Z" }).eq("lesson_id", L1);
    const { data } = await admin
      .from("lesson_progress")
      .select("completed_at")
      .eq("user_id", alice.id)
      .eq("lesson_id", L1)
      .single();
    expect(data!.completed_at.startsWith("2000")).toBe(false);
  });
});

describe("submissions", () => {
  const files = { "/App.js": "export default () => null" };

  it("cannot be written by users, so a client cannot report its own pass", async () => {
    const { error } = await alice.client.from("submissions").insert({
      user_id: alice.id,
      problem_id: P1,
      files,
      results: [],
      passed_count: 1,
      total_count: 1,
    });
    expect(error?.code).toBe("42501");
    const progress = await alice.client.from("problem_progress").select("*");
    expect(progress.data).toEqual([]);
  });

  it("derive problem progress, recording the first full pass only once", async () => {
    for (const passed of [1, 3, 2, 3]) {
      await admin
        .from("submissions")
        .insert({ user_id: alice.id, problem_id: P1, files, results: [], passed_count: passed, total_count: 3 })
        .throwOnError();
    }
    const { data } = await alice.client.from("problem_progress").select("*").single();
    expect(data).toMatchObject({ attempts: 4, attempts_to_solve: 2, best_fraction: 1 });
    const submissions = await alice.client.from("submissions").select("created_at, passed").order("id");
    expect(submissions.data!.map((row) => row.passed)).toEqual([false, true, false, true]);
    expect(data!.solved_at).toBe(submissions.data![1].created_at);
  });

  it("are private to their author", async () => {
    const { data } = await bob.client.from("submissions").select("id");
    expect(data).toEqual([]);
  });

  it("reject inconsistent counts", async () => {
    const { error } = await admin
      .from("submissions")
      .insert({ user_id: alice.id, problem_id: P1, files, results: [], passed_count: 4, total_count: 3 });
    expect(error?.code).toBe("23514");
  });
});

describe("curriculum", () => {
  it("is readable anonymously but only seedable with the secret key", async () => {
    const { data } = await anon.from("lessons").select("id").in("id", [L1, L2]);
    expect(data).toHaveLength(2);
    const { error } = await alice.client.rpc("seed_curriculum", { payload: {} });
    expect(error?.code).toBe("42501");
    const { error: anonError } = await anon.from("lessons").insert({ id: "zz-x", module: "html", position: 1, title: "x" });
    expect(anonError?.code).toBe("42501");
  });
});

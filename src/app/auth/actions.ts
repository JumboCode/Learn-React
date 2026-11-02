"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginPath, safeNextPath } from "@/lib/redirect";
import { normalizeUsername, USERNAME_HINT } from "@/lib/username";

export type AuthFormState = { error?: string; notice?: string };

async function requestOrigin(): Promise<string> {
  // Next.js rejects Server Action requests whose Origin does not match the host, so this value is the site itself.
  const origin = (await headers()).get("origin");
  if (!origin) throw new Error("Missing Origin header on a Server Action request.");
  return origin;
}

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function signIn(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: field(formData, "email"),
    password: formData.get("password")?.toString() ?? "",
  });
  if (error) return { error: error.message };
  redirect(safeNextPath(formData.get("next")));
}

export async function signUp(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const username = normalizeUsername(field(formData, "username"));
  const displayName = field(formData, "displayName");
  const password = formData.get("password")?.toString() ?? "";
  if (!username) return { error: `Usernames are ${USERNAME_HINT}` };
  if (!displayName) return { error: "Please enter a display name." };
  if (password.length < 8) return { error: "Passwords need at least 8 characters." };

  const next = safeNextPath(formData.get("next"));
  const supabase = await createClient();
  const { data: available } = await supabase.rpc("username_available", { p_username: username });
  if (available === false) return { error: `The username "${username}" is taken. Please choose another.` };

  const { data, error } = await supabase.auth.signUp({
    email: field(formData, "email"),
    password,
    options: {
      data: { username, display_name: displayName },
      emailRedirectTo: `${await requestOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { error: error.message };
  if (!data.session) return { notice: "Check your email for a confirmation link to finish signing up." };
  redirect(next);
}

export async function signInWithGitHub(formData: FormData): Promise<void> {
  const next = safeNextPath(formData.get("next"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${await requestOrigin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect(loginPath(next, error?.message ?? "GitHub sign-in failed."));
  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

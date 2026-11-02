import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserId } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/redirect";
import { AuthForms } from "./auth-forms";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  if (await getUserId()) redirect(next);
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome to Learn React</h1>
      <p className="mt-1 text-muted">Sign in to save your progress, solve problems, and track your skills.</p>
      {error && (
        <p role="alert" className="mt-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <AuthForms next={next} />
    </div>
  );
}

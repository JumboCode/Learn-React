import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loginPath, safeNextPath } from "@/lib/redirect";

// Both GitHub OAuth and email confirmation links land here with a PKCE code to exchange for a session.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));
    return NextResponse.redirect(new URL(loginPath(next, error.message), request.url));
  }

  const description = searchParams.get("error_description") ?? "The sign-in link is invalid or has expired.";
  return NextResponse.redirect(new URL(loginPath(next, description), request.url));
}

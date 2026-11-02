import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { loginPath } from "@/lib/redirect";

const PROTECTED = [/^\/problems(\/|$)/, /^\/profile(\/|$)/, /^\/lessons\/[^/]+\/complete$/];

export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (userId || !PROTECTED.some((pattern) => pattern.test(pathname))) {
    return response;
  }

  // A completion POST redirects back to the lesson it came from, not to the POST-only endpoint.
  const next = pathname.endsWith("/complete") ? pathname.slice(0, -"/complete".length) : pathname + search;
  const redirect = NextResponse.redirect(new URL(loginPath(next), request.url), 303);
  for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = response.headers.get(header);
    if (value) redirect.headers.set(header, value);
  }
  return redirect;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

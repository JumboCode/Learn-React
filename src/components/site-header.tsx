import Link from "next/link";
import { createClient, getUserId } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

const NAV = [
  { href: "/", label: "Curriculum" },
  { href: "/problems", label: "Problems" },
  { href: "/resources", label: "Resources" },
];

export async function SiteHeader() {
  const userId = await getUserId();
  let displayName: string | null = null;
  if (userId) {
    const supabase = await createClient();
    const { data } = await supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle();
    displayName = data?.display_name ?? null;
  }

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span aria-hidden className="grid size-7 place-items-center rounded-md bg-accent text-sm text-white">
            {"</>"}
          </span>
          Learn React
        </Link>
        <nav aria-label="Main" className="flex gap-4 text-sm text-muted">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          {userId ? (
            <>
              <Link href="/profile" className="font-medium hover:text-accent">
                {displayName ?? "Profile"}
              </Link>
              <form action={signOut}>
                <button className="rounded-md border border-line px-3 py-1.5 text-muted hover:text-ink">Sign out</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="rounded-md bg-accent px-3 py-1.5 font-medium text-white hover:opacity-90">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

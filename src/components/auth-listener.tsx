"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Server-rendered pages show whoever was signed in when they rendered. When another tab signs in or out, re-render
 * so this tab never offers actions to a session that no longer exists. Supabase also re-emits SIGNED_IN on tab
 * focus, so only a change of user identity triggers a refresh.
 */
export function AuthListener() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let currentUserId: string | null | undefined;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const userId = session?.user.id ?? null;
      if (event !== "INITIAL_SESSION" && currentUserId !== undefined && userId !== currentUserId) router.refresh();
      currentUserId = userId;
    });
    return () => data.subscription.unsubscribe();
  }, [router]);

  return null;
}

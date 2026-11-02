"use client";

import { useActionState, useState } from "react";
import { signIn, signInWithGitHub, signUp, type AuthFormState } from "@/app/auth/actions";
import { USERNAME_HINT, USERNAME_PATTERN } from "@/lib/username";

const input =
  "mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

export function AuthForms({ next }: { next: string }) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [signInState, signInAction, signingIn] = useActionState<AuthFormState, FormData>(signIn, {});
  const [signUpState, signUpAction, signingUp] = useActionState<AuthFormState, FormData>(signUp, {});
  const state = mode === "sign-in" ? signInState : signUpState;
  const pending = mode === "sign-in" ? signingIn : signingUp;

  return (
    <div className="mt-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
      <form action={signInWithGitHub}>
        <input type="hidden" name="next" value={next} />
        <button className="flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 font-medium text-canvas hover:opacity-90">
          <svg aria-hidden viewBox="0 0 16 16" className="size-4 fill-current">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Continue with GitHub
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
        <span className="h-px flex-1 bg-line" />
        or use email
        <span className="h-px flex-1 bg-line" />
      </div>

      <div role="tablist" aria-label="Account" className="mb-4 grid grid-cols-2 rounded-md bg-canvas p-1 text-sm">
        {(["sign-in", "sign-up"] as const).map((value) => (
          <button
            key={value}
            role="tab"
            type="button"
            aria-selected={mode === value}
            onClick={() => setMode(value)}
            className={`rounded px-3 py-1.5 ${mode === value ? "bg-surface font-medium shadow-sm" : "text-muted"}`}
          >
            {value === "sign-in" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form action={mode === "sign-in" ? signInAction : signUpAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        {mode === "sign-up" && (
          <>
            <label className="block text-sm font-medium">
              Username
              <input
                name="username"
                required
                pattern={USERNAME_PATTERN}
                title={USERNAME_HINT}
                aria-describedby="username-hint"
                autoComplete="username"
                className={input}
              />
              <span id="username-hint" className="mt-1 block text-xs font-normal text-muted">
                {USERNAME_HINT}
              </span>
            </label>
            <label className="block text-sm font-medium">
              Display name
              <input name="displayName" required maxLength={80} autoComplete="name" className={input} />
            </label>
          </>
        )}
        <label className="block text-sm font-medium">
          Email
          <input name="email" type="email" required autoComplete="email" className={input} />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={mode === "sign-up" ? 8 : undefined}
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            className={input}
          />
        </label>
        {state.error && (
          <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        )}
        {state.notice && (
          <p role="status" className="rounded-md bg-success-soft px-3 py-2 text-sm text-success">
            {state.notice}
          </p>
        )}
        <button
          disabled={pending}
          className="w-full rounded-md bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Working…" : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}

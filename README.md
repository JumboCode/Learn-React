# Learn React

A learning platform that teaches React to beginner CS students, starting from the HTML, CSS, and JavaScript React is
built on.

- **Curriculum timeline:** 51 short lessons in four modules (HTML 8, CSS 8, JavaScript 14, React 21), each with live,
  editable Sandpack examples. Lessons unlock in order.
- **Problems:** 68 LeetCode-style exercises (at least one per lesson), each with a prompt, starter code, a Sandpack
  editor and preview, and hidden tests that run on the server. Every submission is saved, and a problem is marked
  solved on its first full pass.
- **Profile:** lessons and problems by module and difficulty, a per-skill score chart labelled Strong or Needs
  improvement, recommendations drawn from weak skills, and recent activity.
- **Leaderboard:** every signed-in learner ranked by points for solved problems (easy 1, medium 2, hard 3).
- **Resources:** curated links for HTML, CSS, JavaScript, React, and tooling.

Built with Next.js 16 (App Router, Server Components), TypeScript, Tailwind CSS 4, Supabase (Auth, Postgres, Row Level
Security) via `@supabase/ssr`, MDX, and Sandpack.

## How it works

### Grading runs on the server

Problem tests are written like Vitest + React Testing Library tests, but they run on the server, not inside Sandpack.
Tests that run in the browser cannot be hidden (they ship to the client), and their pass/fail result is whatever the
client reports, so anyone could record a pass from the browser console. Instead:

1. **Run tests** sends only the problem's editable files to a Server Action.
2. The server overlays them on the repository's starter files and runs the hidden tests in a fresh
   [QuickJS](https://github.com/justjake/quickjs-emscripten) WebAssembly sandbox containing a DOM
   ([linkedom](https://github.com/WebReflection/linkedom), with spec-correct event dispatch and form behavior added),
   React 19, and a test kit with the Testing Library API (`render`, `screen`, `fireEvent`, `userEvent`, `waitFor`,
   jest-dom matchers, a CSS cascade for `toHaveStyle`, mocked `fetch`, virtual timers).
3. Student code cannot reach Node, the network, environment variables, or the file system. Runs are limited to 256 MB
   and 10 seconds, at most two run at once per server instance, and built-ins and DOM prototypes are frozen before
   student code runs so a submission cannot patch the assertions.
4. The server records the submission with the secret key. Users have no insert permission on `submissions`, so a pass
   can only come from the grader.

Sandpack still runs the student's code in the browser for the live preview and console.

### The database enforces the rules

The browser holds a Supabase key that can call the database directly, so every rule lives in Postgres, not only in
app code:

- **Row Level Security** on every table: users read only their own profile, progress, and submissions.
- **Lesson unlocking** is one SQL function, `lesson_unlocked()`. The insert policy on `lesson_progress` uses it, and so
  does `lesson_statuses()`, which drives the timeline, so the page and the database cannot disagree. Users can supply
  only the lesson id; the completion time is always the database clock.
- **Problem progress** (`problem_progress`) is maintained by a trigger on `submissions`, so attempts, best score, and
  first-solve time always match the submissions they summarize.
- **Profiles** are created by a trigger on signup. A taken username is rejected at signup with a clear message, and a
  GitHub username that collides is made unique instead of failing the login.

### Content lives in the repository

- `src/curriculum/lessons.ts` is the typed lesson index (id, module, order, title, summary, skills, prerequisites). Each
  entry imports its MDX file, so a missing lesson file is a build error. Order and prerequisites are derived from
  position, so the index cannot contain gaps or contradictory prerequisites.
- `src/curriculum/problems/*.ts` index the problems; their sources live in `content/problems/<id>/`. See
  [content/problems/README.md](content/problems/README.md) for the format and the full test API.
- `npm run db:seed` sends the whole index to `seed_curriculum()`, which applies it in one transaction.
- `npm run generate` (run automatically before `dev`, `build`, `test`, and `typecheck`) bundles the grader sandbox and
  the problem sources into `src/generated/`. That folder is never committed and never sent to the browser.

## Project structure

```
content/lessons/<module>/<id>.mdx       lesson text with live examples (```jsx-live, ```html-live, ```js-live)
content/problems/<id>/                  prompt.mdx, starter/, solution/, tests.jsx
src/app/                                pages, the lesson-completion route, auth, the grading Server Action
src/curriculum/                         typed indexes, progress queries, skill scoring, resources
src/grader/                             server-side grading host (run.ts) and sandbox runtime (sandbox/)
src/lib/supabase/                       server, browser, admin, and proxy clients; generated database types
src/proxy.ts                            session refresh and route protection (Next.js 16's name for middleware)
supabase/migrations/                    schema, RLS policies, triggers, and functions
scripts/                                seed.mts and generate.mts
tests/                                  unit tests, content tests (every lesson and problem), database tests
```

## Setup

### Prerequisites

- Node.js 20.9 or newer
- A [Supabase](https://supabase.com) account (or Docker and the [Supabase CLI](https://supabase.com/docs/guides/cli)
  for a local database)
- Optional: a GitHub account, for GitHub sign-in

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Create the Supabase project

**Hosted (recommended for deployment):**

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. In **Project Settings → API Keys**, copy the project URL, the **publishable** key, and a **secret** key into
   `.env.local` (the legacy `anon` and `service_role` keys also work in the same variables):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   SUPABASE_SECRET_KEY=sb_secret_...
   ```

   The secret key bypasses Row Level Security. Never prefix it with `NEXT_PUBLIC_` or expose it to the browser.
3. In **Authentication → URL Configuration**, set **Site URL** to your app's URL and add
   `http://localhost:3000/auth/callback` and `https://<your-domain>/auth/callback` to **Redirect URLs**.

**Local:** `supabase start` runs everything in Docker (this project uses ports 55420–55429, so it can run alongside
another local Supabase project). It prints the URL and keys to put in `.env.local`. Migrations apply automatically.

### 3. Apply the migrations

For a hosted project:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push --remote
```

### 4. Seed the curriculum

```bash
npm run db:seed
```

This upserts every skill, lesson, prerequisite, and problem from the typed index and removes rows that are no longer
in it. Re-run it whenever lessons or problems change. It is idempotent.

### 5. Enable GitHub sign-in (optional)

1. Create an OAuth app at **GitHub → Settings → Developer settings → OAuth Apps**.
   - Hosted Supabase: set the callback URL to `https://<project-ref>.supabase.co/auth/v1/callback`, then enter the
     client ID and secret in **Authentication → Sign In / Providers → GitHub**.
   - Local Supabase: set the callback URL to `http://127.0.0.1:55421/auth/v1/callback`, add the client ID and secret to
     `.env.local` as `SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID` and `SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET`, and restart
     with `supabase stop && supabase start`.

Email sign-up works without this. On hosted projects, email confirmation is on by default; confirmation links land on
`/auth/callback`.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Lesson examples and the problem editor load Sandpack's bundler
from `codesandbox.io`, so they need an internet connection.

## Testing

```bash
npm test              # grader, skill scoring, every lesson, and every problem (solution passes, starter fails)
npm run test:db       # RLS, triggers, and unlock rules against the database in .env.local (creates test users)
npm run typecheck
npm run lint
```

Run `test:db` against a local or development database, not production: it creates and deletes test users and lessons.

## Deploying to Vercel

1. Push the repository to GitHub and import it at [vercel.com/new](https://vercel.com/new). Vercel detects Next.js;
   no `vercel.json` is needed. `npm run build` generates the grader bundle before building.
2. In **Settings → Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   and `SUPABASE_SECRET_KEY` for Production (and Preview, pointed at a separate Supabase project if you want to keep
   preview data apart).
3. Deploy, then add `https://<your-domain>/auth/callback` to Supabase's Redirect URLs and set the Site URL to your
   domain. For preview deployments, add `https://*-<your-team>.vercel.app/auth/callback`.
4. Run `npm run db:seed` with the production variables whenever content changes, and `npx supabase db push --remote` whenever a
   migration is added.

The grading route declares `maxDuration = 60` so grading is never cut off by a shorter platform default.

## Adding content

- **Lesson:** add `content/lessons/<module>/<id>.mdx` and an entry in `src/curriculum/lessons.ts` at its place in the
  sequence. Use `jsx-live` (must `export default function App`), `html-live`, or `js-live` fences for live examples.
  `npm test` checks that it compiles and every live example parses.
- **Problem:** follow [content/problems/README.md](content/problems/README.md). `npm test` checks that the reference
  solution passes, the starter fails, and every lesson has at least one problem.
- Then run `npm run db:seed`.

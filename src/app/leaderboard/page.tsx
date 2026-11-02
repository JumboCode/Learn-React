import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient, getUserId } from "@/lib/supabase/server";
import { loginPath } from "@/lib/redirect";

export const metadata: Metadata = { title: "Leaderboard" };

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default async function LeaderboardPage() {
  if (!(await getUserId())) redirect(loginPath("/leaderboard"));
  const supabase = await createClient();
  const { data: rows, error } = await supabase.rpc("leaderboard");
  if (error) throw error;
  const me = rows.find((row) => row.is_me);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Leaderboard</h1>
      <p className="mt-2 text-muted">
        Points for every solved problem: 1 for easy, 2 for medium, 3 for hard. Ties share a rank; whoever reached the
        score first is listed first.
      </p>
      {me && (
        <p className="mt-4 rounded-lg bg-accent-soft px-4 py-3 text-sm">
          You are <strong>#{me.rank}</strong> of {rows.length} with <strong>{me.points}</strong>{" "}
          {me.points === 1 ? "point" : "points"}.
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Learners ranked by points</caption>
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="w-16 px-4 py-3">
                Rank
              </th>
              <th scope="col" className="px-4 py-3">
                Learner
              </th>
              <th scope="col" className="px-3 py-3 text-right">
                Easy
              </th>
              <th scope="col" className="px-3 py-3 text-right">
                Medium
              </th>
              <th scope="col" className="px-3 py-3 text-right">
                Hard
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.username} className={row.is_me ? "bg-accent-soft" : undefined}>
                <td className="px-4 py-3 font-semibold tabular-nums">
                  {MEDALS[row.rank] && row.points > 0 ? (
                    <span>
                      <span aria-hidden>{MEDALS[row.rank]} </span>
                      <span className="sr-only">Rank </span>
                      {row.rank}
                    </span>
                  ) : (
                    row.rank
                  )}
                </td>
                <th scope="row" className="px-4 py-3 font-normal">
                  <span className="flex items-center gap-3">
                    {row.avatar_url ? (
                      <Image
                        src={row.avatar_url}
                        alt=""
                        width={28}
                        height={28}
                        unoptimized
                        className="size-7 rounded-full border border-line"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="grid size-7 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
                      >
                        {row.display_name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <span>
                      <span className="font-medium text-ink">{row.display_name}</span>
                      {row.is_me && <span className="ml-2 text-xs font-medium text-accent">(you)</span>}
                      <span className="block text-xs text-muted">@{row.username}</span>
                    </span>
                  </span>
                </th>
                <td className="px-3 py-3 text-right tabular-nums text-muted">{row.easy}</td>
                <td className="px-3 py-3 text-right tabular-nums text-muted">{row.medium}</td>
                <td className="px-3 py-3 text-right tabular-nums text-muted">{row.hard}</td>
                <td className="px-4 py-3 text-right text-base font-semibold tabular-nums">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

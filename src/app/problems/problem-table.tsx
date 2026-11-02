"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MODULES, MODULE_STYLES, type ModuleId } from "@/curriculum/modules";
import { DIFFICULTIES, type Difficulty } from "@/curriculum/problems/types";
import { SKILLS, type SkillId } from "@/curriculum/skills";
import { DifficultyBadge } from "@/components/difficulty-badge";
import type { ProblemStatus } from "@/curriculum/progress";

export type ProblemRow = {
  id: string;
  title: string;
  module: ModuleId;
  lessonTitle: string;
  difficulty: Difficulty;
  skills: readonly SkillId[];
  order: number;
  status: ProblemStatus;
};

const SORTS = {
  curriculum: { label: "Curriculum order", compare: (a: ProblemRow, b: ProblemRow) => a.order - b.order },
  title: { label: "Title", compare: (a: ProblemRow, b: ProblemRow) => a.title.localeCompare(b.title) },
  difficulty: {
    label: "Difficulty",
    compare: (a: ProblemRow, b: ProblemRow) =>
      DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty) || a.order - b.order,
  },
  status: {
    label: "Unsolved first",
    compare: (a: ProblemRow, b: ProblemRow) =>
      STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.order - b.order,
  },
} as const;

const STATUS_RANK: Record<ProblemStatus, number> = { attempted: 0, new: 1, solved: 2 };
const STATUS_LABEL: Record<ProblemStatus, string> = { solved: "Solved", attempted: "Attempted", new: "Not started" };

const select = "rounded-md border border-line bg-surface px-2 py-1.5 text-sm";

export function ProblemTable({ rows }: { rows: ProblemRow[] }) {
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState<ModuleId | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [skill, setSkill] = useState<SkillId | "all">("all");
  const [status, setStatus] = useState<ProblemStatus | "all">("all");
  const [sort, setSort] = useState<keyof typeof SORTS>("curriculum");

  const skillsInUse = useMemo(() => new Set(rows.flatMap((row) => row.skills)), [rows]);
  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return rows
      .filter(
        (row) =>
          (moduleFilter === "all" || row.module === moduleFilter) &&
          (difficulty === "all" || row.difficulty === difficulty) &&
          (skill === "all" || row.skills.includes(skill)) &&
          (status === "all" || row.status === status) &&
          (!text || row.title.toLowerCase().includes(text) || row.lessonTitle.toLowerCase().includes(text)),
      )
      .sort(SORTS[sort].compare);
  }, [rows, query, moduleFilter, difficulty, skill, status, sort]);

  return (
    <>
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Search
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title or lesson"
            className={`${select} w-48`}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Module
          <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value as ModuleId | "all")} className={select}>
            <option value="all">All modules</option>
            {MODULES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Difficulty
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty | "all")}
            className={select}
          >
            <option value="all">Any difficulty</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d} className="capitalize">
                {d[0].toUpperCase() + d.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Skill
          <select value={skill} onChange={(e) => setSkill(e.target.value as SkillId | "all")} className={select}>
            <option value="all">Any skill</option>
            {(Object.keys(SKILLS) as SkillId[])
              .filter((id) => skillsInUse.has(id))
              .map((id) => (
                <option key={id} value={id}>
                  {SKILLS[id]}
                </option>
              ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProblemStatus | "all")}
            className={select}
          >
            <option value="all">Any status</option>
            {(Object.keys(STATUS_LABEL) as ProblemStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} className={select}>
            {(Object.keys(SORTS) as (keyof typeof SORTS)[]).map((key) => (
              <option key={key} value={key}>
                {SORTS[key].label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Problems, {visible.length} shown</caption>
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                Problem
              </th>
              <th scope="col" className="px-4 py-3">
                Module
              </th>
              <th scope="col" className="px-4 py-3">
                Difficulty
              </th>
              <th scope="col" className="px-4 py-3">
                Skills
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((row) => (
              <tr key={row.id} className="hover:bg-canvas">
                <td className="px-4 py-3">
                  <StatusMark status={row.status} />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/problems/${row.id}`} className="font-medium hover:text-accent">
                    {row.title}
                  </Link>
                  <p className="text-xs text-muted">{row.lessonTitle}</p>
                </td>
                <td className={`px-4 py-3 font-medium ${MODULE_STYLES[row.module].text}`}>
                  {MODULES.find((m) => m.id === row.module)!.title}
                </td>
                <td className="px-4 py-3">
                  <DifficultyBadge difficulty={row.difficulty} />
                </td>
                <td className="px-4 py-3 text-xs text-muted">{row.skills.map((id) => SKILLS[id]).join(", ")}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No problems match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StatusMark({ status }: { status: ProblemStatus }) {
  const style = { solved: "text-success", attempted: "text-amber-600", new: "text-muted" }[status];
  const icon = { solved: "✓", attempted: "◐", new: "○" }[status];
  return (
    <span className={`font-medium ${style}`}>
      <span aria-hidden>{icon} </span>
      <span className="text-xs">{STATUS_LABEL[status]}</span>
    </span>
  );
}

"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { islandLayout, SAND_WIDTH, SHALLOWS_WIDTH, type IslandLayout, type Point, type Prop } from "@/curriculum/island-layout";
import type { ModuleId } from "@/curriculum/modules";
import type { LessonStatus } from "@/curriculum/progress";

export type IslandLesson = {
  id: string;
  order: number;
  title: string;
  summary: string;
  skills: string[];
  status: LessonStatus;
};

type Theme = {
  grass: string;
  grassLight: string;
  cliff: string;
  trees: string[];
  prop: "hut" | "garden" | "rocks" | "crystal";
};

const THEMES: Record<ModuleId, Theme> = {
  html: { grass: "#86c96a", grassLight: "#9fd884", cliff: "#9c7a52", trees: ["#4c9640", "#5aa94a", "#3e8536"], prop: "hut" },
  css: { grass: "#8ccf98", grassLight: "#a6dcae", cliff: "#8f7b5c", trees: ["#3c9473", "#4aa883", "#2f7f60"], prop: "garden" },
  javascript: { grass: "#c4cc72", grassLight: "#d4da8b", cliff: "#a07a4a", trees: ["#7f9c36", "#93ad43", "#6a852b"], prop: "rocks" },
  react: { grass: "#7fcfa4", grassLight: "#98dcb8", cliff: "#7f7a66", trees: ["#33907f", "#3fa892", "#2a7768"], prop: "crystal" },
};

const SAND = "#f1dba3";
const PATH_EDGE = "#c9a56a";
const PATH_FILL = "#ead09a";

const SEEDS: Record<ModuleId, number> = { html: 11, css: 23, javascript: 37, react: 53 };

function shape(ctx: CanvasRenderingContext2D, layout: IslandLayout, offset: number, dy = 0) {
  ctx.beginPath();
  for (let i = 0; i <= 180; i++) {
    const angle = (i / 180) * Math.PI * 2;
    const r = layout.radiusAt(angle) + offset;
    const x = layout.center.x + r * Math.cos(angle);
    const y = layout.center.y + r * Math.sin(angle) + dy;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawProp(ctx: CanvasRenderingContext2D, kind: Theme["prop"], { x, y, size }: Prop) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
  ctx.beginPath();
  ctx.ellipse(4, size * 0.45, size * 0.75, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  if (kind === "hut") {
    ctx.fillStyle = "#ecd2ad";
    ctx.fillRect(-size * 0.5, -size * 0.1, size, size * 0.55);
    ctx.fillStyle = "#c4553c";
    ctx.beginPath();
    ctx.moveTo(-size * 0.65, -size * 0.05);
    ctx.lineTo(0, -size * 0.6);
    ctx.lineTo(size * 0.65, -size * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#7a4b2c";
    ctx.fillRect(-size * 0.12, size * 0.12, size * 0.24, size * 0.33);
  } else if (kind === "garden") {
    ctx.fillStyle = "#a8714c";
    ctx.fillRect(-size * 0.7, -size * 0.45, size * 1.4, size * 0.9);
    const flowers = ["#f47ab0", "#f6d04d", "#b48cf2"];
    for (let row = 0; row < 3; row++) {
      ctx.fillStyle = flowers[row];
      for (let col = 0; col < 5; col++) {
        ctx.beginPath();
        ctx.arc(-size * 0.5 + col * size * 0.25, -size * 0.25 + row * size * 0.25, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (kind === "rocks") {
    for (const [dx, dy, r, color] of [
      [-size * 0.3, size * 0.05, size * 0.38, "#9b958b"],
      [size * 0.25, size * 0.1, size * 0.3, "#8a847a"],
      [0, -size * 0.2, size * 0.32, "#aaa49a"],
    ] as const) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(dx, dy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.beginPath();
      ctx.arc(dx - r * 0.3, dy - r * 0.3, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    for (const [dx, h, w, tilt] of [
      [-size * 0.3, size * 0.8, size * 0.28, -0.25],
      [0, size * 1.1, size * 0.34, 0],
      [size * 0.3, size * 0.7, size * 0.26, 0.3],
    ] as const) {
      ctx.save();
      ctx.translate(dx, size * 0.35);
      ctx.rotate(tilt);
      ctx.fillStyle = "#52c7dc";
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.lineTo(-w / 2, -h * 0.7);
      ctx.lineTo(0, -h);
      ctx.lineTo(w / 2, -h * 0.7);
      ctx.lineTo(w / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#a6ecf6";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -h);
      ctx.lineTo(w / 2, -h * 0.7);
      ctx.lineTo(w / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

function drawPath(ctx: CanvasRenderingContext2D, path: Point[], width: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  path.forEach((point, i) => (i === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)));
  ctx.stroke();
}

/** Paints the scenery once per size change; nothing animates, so the page stays cheap to scroll. */
function paint(ctx: CanvasRenderingContext2D, layout: IslandLayout, theme: Theme) {
  ctx.clearRect(0, 0, layout.width, layout.height);

  shape(ctx, layout, SHALLOWS_WIDTH);
  ctx.fillStyle = "rgba(110, 196, 232, 0.35)";
  ctx.fill();
  shape(ctx, layout, SHALLOWS_WIDTH * 0.45);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = 3;
  ctx.stroke();

  shape(ctx, layout, 0, 16);
  ctx.fillStyle = theme.cliff;
  ctx.fill();
  shape(ctx, layout, 0);
  ctx.fillStyle = SAND;
  ctx.fill();
  shape(ctx, layout, -SAND_WIDTH);
  ctx.fillStyle = theme.grass;
  ctx.fill();

  ctx.save();
  shape(ctx, layout, -SAND_WIDTH);
  ctx.clip();
  ctx.fillStyle = theme.grassLight;
  for (const tree of layout.trees.filter((_, i) => i % 5 === 0)) {
    ctx.beginPath();
    ctx.ellipse(tree.x + 30, tree.y - 20, 60, 34, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  drawPath(ctx, layout.path, 32, PATH_EDGE);
  drawPath(ctx, layout.path, 24, PATH_FILL);

  for (const marker of layout.markers) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.beginPath();
    ctx.ellipse(marker.x + 3, marker.y + 6, 25, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#cfc8bb";
    ctx.beginPath();
    ctx.ellipse(marker.x, marker.y + 2, 26, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const prop of layout.props) drawProp(ctx, theme.prop, prop);

  for (const [i, tree] of layout.trees.entries()) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.beginPath();
    ctx.ellipse(tree.x + tree.r * 0.35, tree.y + tree.r * 0.55, tree.r * 0.95, tree.r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = theme.trees[i % theme.trees.length];
    ctx.beginPath();
    ctx.arc(tree.x, tree.y, tree.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
    ctx.beginPath();
    ctx.arc(tree.x - tree.r * 0.32, tree.y - tree.r * 0.35, tree.r * 0.42, 0, Math.PI * 2);
    ctx.fill();
  }
}

const STATUS_TEXT: Record<LessonStatus, string> = { completed: "Completed", available: "Up next", locked: "Locked" };

function Badge({ lesson }: { lesson: IslandLesson }) {
  // Sized by the island (a container), not the screen, so markers never crowd a narrow island.
  const base =
    "relative grid size-7 place-items-center rounded-full border-2 border-white text-xs font-bold shadow-md @md:size-10 @md:border-[3px] @md:text-sm";
  if (lesson.status === "completed") {
    return (
      <span className={`${base} bg-success text-white`}>
        <svg aria-hidden viewBox="0 0 20 20" className="size-4 fill-current @md:size-5">
          <path d="M7.6 13.2 4.4 10l-1.2 1.2 4.4 4.4 9.2-9.2-1.2-1.2z" />
        </svg>
      </span>
    );
  }
  if (lesson.status === "available") {
    return (
      <span className={`${base} bg-accent text-white`}>
        <span aria-hidden className="absolute inset-0 rounded-full bg-accent motion-safe:animate-ping" />
        <span className="relative">{lesson.order}</span>
      </span>
    );
  }
  return (
    <span className={`${base} bg-stone-400 text-white`}>
      <svg aria-hidden viewBox="0 0 20 20" className="size-3 fill-current @md:size-4">
        <path d="M6 8V6a4 4 0 1 1 8 0v2h1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zm2 0h4V6a2 2 0 1 0-4 0z" />
      </svg>
    </span>
  );
}

function LessonCard({ lesson, placement }: { lesson: IslandLesson; placement: string }) {
  return (
    <span
      role="tooltip"
      className={`pointer-events-none absolute z-20 hidden w-60 rounded-lg border border-line bg-surface p-3 text-left shadow-lg group-hover:block group-focus-visible:block ${placement}`}
    >
      <span className="block text-xs font-medium uppercase tracking-wide text-muted">
        Lesson {lesson.order} · {STATUS_TEXT[lesson.status]}
      </span>
      <span className="mt-1 block font-semibold text-ink">{lesson.title}</span>
      <span className="mt-1 block text-sm text-muted">{lesson.summary}</span>
      <span className="mt-2 block text-xs text-muted">{lesson.skills.join(" · ")}</span>
      {lesson.status === "locked" && (
        <span className="mt-2 block text-xs text-muted">Complete the lesson before it to unlock this one.</span>
      )}
    </span>
  );
}

/**
 * One module drawn as an island. The canvas is scenery only (hidden from assistive technology); every lesson is a real
 * link positioned over its spot on the path, so keyboards, screen readers, and middle-click work as on any page.
 */
export function IslandMap({ moduleId, title, lessons }: { moduleId: ModuleId; title: string; lessons: IslandLesson[] }) {
  const layout = useMemo(() => islandLayout(SEEDS[moduleId], lessons.length), [moduleId, lessons.length]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const ratio = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round((width * layout.height * ratio) / layout.width);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const scale = (width * ratio) / layout.width;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      paint(ctx, layout, THEMES[moduleId]);
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [layout, moduleId]);

  return (
    <div className="@container relative w-full" style={{ aspectRatio: `${layout.width} / ${layout.height}` }}>
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
      <ol aria-label={`${title} lessons`} className="absolute inset-0">
        {lessons.map((lesson, index) => {
          const { x, y } = layout.markers[index];
          const left = (x / layout.width) * 100;
          const top = (y / layout.height) * 100;
          const placement = `${top < 25 ? "top-full mt-2" : "bottom-full mb-2"} ${
            left < 30 ? "left-0" : left > 70 ? "right-0" : "left-1/2 -translate-x-1/2"
          }`;
          const label = `Lesson ${lesson.order}: ${lesson.title} (${STATUS_TEXT[lesson.status]})`;
          return (
            <li
              key={lesson.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              {lesson.status === "locked" ? (
                <span tabIndex={0} aria-label={label} className="group relative block rounded-full outline-none focus-visible:ring-4 focus-visible:ring-accent/50">
                  <Badge lesson={lesson} />
                  <LessonCard lesson={lesson} placement={placement} />
                </span>
              ) : (
                <Link
                  href={`/lessons/${lesson.id}`}
                  aria-label={label}
                  className="group relative block rounded-full outline-none transition-transform hover:scale-110 focus-visible:ring-4 focus-visible:ring-accent/50"
                >
                  <Badge lesson={lesson} />
                  <LessonCard lesson={lesson} placement={placement} />
                </Link>
              )}
              {lesson.status === "available" && (
                <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap @max-md:hidden rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-ink shadow">
                  {lesson.title}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

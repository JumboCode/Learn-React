/**
 * Geometry for one curriculum island, in a coordinate space 1000 units wide. The canvas paints from it and the lesson
 * links are positioned from it, so the art and the links can never drift apart. Seeded, so an island never changes.
 */

export type Point = { x: number; y: number };
export type Tree = Point & { r: number };
export type Prop = Point & { size: number };

export type IslandLayout = {
  width: number;
  height: number;
  center: Point;
  /** Radius of the island's edge (sand) in the direction `angle`, in layout units. */
  radiusAt: (angle: number) => number;
  /** Lesson markers, in lesson order. */
  markers: Point[];
  /** Points along the walking path, from the landing beach through every marker to the far shore. */
  path: Point[];
  trees: Tree[];
  props: Prop[];
};

export const ISLAND_WIDTH = 1000;
export const SAND_WIDTH = 26;
export const SHALLOWS_WIDTH = 24;

const PER_ROW = 4;
const ROW_GAP = 150;
const SHAPE_POWER = 4;
const NOISE = 0.08;

/** mulberry32: a small, fast, seeded PRNG. */
export function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function catmullRom(points: Point[], samplesPerSegment: number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    for (let s = 0; s < samplesPerSegment; s++) {
      const t = s / samplesPerSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

export function distanceToPolyline(point: Point, line: Point[]): number {
  let best = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i];
    const b = line[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / length));
    best = Math.min(best, Math.hypot(point.x - a.x - t * dx, point.y - a.y - t * dy));
  }
  return best;
}

export function islandLayout(seed: number, lessonCount: number): IslandLayout {
  const rand = random(seed);
  const rows = Math.max(1, Math.ceil(lessonCount / PER_ROW));

  // A squircle hugs the rectangle of markers more tightly than an ellipse; 2^(1/4) scales its corner onto the
  // rectangle's corner, and the extra factor covers the coastline noise.
  const reach = Math.pow(2, 1 / SHAPE_POWER) / (1 - NOISE) + 0.06;
  // The widest coastline, plus beach and shallows, must stay inside the canvas with a little air.
  const halfWidth = Math.floor((ISLAND_WIDTH / 2 - 12 - SAND_WIDTH - SHALLOWS_WIDTH) / (1 + NOISE) / reach);
  const halfHeight = ((rows - 1) * ROW_GAP) / 2 + 40;
  const a = halfWidth * reach;
  const b = halfHeight * reach + 40;
  const height = Math.round(2 * (b * (1 + NOISE) + SAND_WIDTH + SHALLOWS_WIDTH) + 60);
  const center = { x: ISLAND_WIDTH / 2, y: height / 2 };

  const phases = Array.from({ length: 4 }, () => rand() * Math.PI * 2);
  const radiusAt = (angle: number) => {
    const c = Math.abs(Math.cos(angle)) / a;
    const s = Math.abs(Math.sin(angle)) / b;
    const base = Math.pow(Math.pow(c, SHAPE_POWER) + Math.pow(s, SHAPE_POWER), -1 / SHAPE_POWER);
    const wobble =
      0.5 * Math.sin(3 * angle + phases[0]) + 0.3 * Math.sin(5 * angle + phases[1]) + 0.2 * Math.sin(7 * angle + phases[2]);
    return base * (1 + NOISE * wobble) + SAND_WIDTH;
  };

  const top = center.y - halfHeight;
  const markers: Point[] = [];
  for (let i = 0; i < lessonCount; i++) {
    const row = Math.floor(i / PER_ROW);
    const inRow = i % PER_ROW;
    const countInRow = Math.min(PER_ROW, lessonCount - row * PER_ROW);
    const spread = countInRow === 1 ? 0.5 : inRow / (PER_ROW - 1);
    const column = row % 2 === 0 ? spread : 1 - spread;
    markers.push({
      x: center.x - halfWidth + column * 2 * halfWidth + (rand() - 0.5) * 50,
      y: top + row * ROW_GAP + (rand() - 0.5) * 40,
    });
  }

  const landing = { x: markers[0].x - 70, y: center.y - radiusAt(-Math.PI / 2) + SAND_WIDTH / 2 };
  const last = markers[markers.length - 1];
  const departure = { x: last.x + (last.x < center.x ? -40 : 40), y: center.y + radiusAt(Math.PI / 2) - SAND_WIDTH / 2 };
  const path = catmullRom([landing, ...markers, departure], 14);

  const inland = (point: Point, margin: number) => {
    const angle = Math.atan2(point.y - center.y, point.x - center.x);
    return Math.hypot(point.x - center.x, point.y - center.y) < radiusAt(angle) - SAND_WIDTH - margin;
  };
  const clear = (point: Point, gap: number) =>
    distanceToPolyline(point, path) > gap && markers.every((m) => Math.hypot(m.x - point.x, m.y - point.y) > gap + 14);

  const props: Prop[] = [];
  for (let attempt = 0; attempt < 400 && props.length < 3 + rows; attempt++) {
    const point = { x: center.x + (rand() - 0.5) * 2 * a, y: center.y + (rand() - 0.5) * 2 * b };
    const size = 34 + rand() * 14;
    if (inland(point, size) && clear(point, size + 26) && props.every((p) => Math.hypot(p.x - point.x, p.y - point.y) > 120)) {
      props.push({ ...point, size });
    }
  }

  const trees: Tree[] = [];
  const target = Math.round((a * b) / 1500);
  for (let attempt = 0; attempt < target * 12 && trees.length < target; attempt++) {
    const point = { x: center.x + (rand() - 0.5) * 2 * a, y: center.y + (rand() - 0.5) * 2 * b };
    const r = 13 + rand() * 9;
    if (
      inland(point, r * 0.6) &&
      clear(point, r + 18) &&
      props.every((p) => Math.hypot(p.x - point.x, p.y - point.y) > p.size + r) &&
      trees.every((t) => Math.hypot(t.x - point.x, t.y - point.y) > (t.r + r) * 0.75)
    ) {
      trees.push({ ...point, r });
    }
  }
  trees.sort((p, q) => p.y - q.y);

  return { width: ISLAND_WIDTH, height, center, radiusAt, markers, path, trees, props };
}

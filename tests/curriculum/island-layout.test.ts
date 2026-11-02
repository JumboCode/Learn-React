import { describe, expect, it } from "vitest";
import { distanceToPolyline, islandLayout, SAND_WIDTH, SHALLOWS_WIDTH } from "@/curriculum/island-layout";

const onLand = (layout: ReturnType<typeof islandLayout>, x: number, y: number, margin: number) => {
  const angle = Math.atan2(y - layout.center.y, x - layout.center.x);
  return Math.hypot(x - layout.center.x, y - layout.center.y) < layout.radiusAt(angle) - SAND_WIDTH - margin;
};

describe.each([
  [1, 8],
  [2, 8],
  [3, 14],
  [4, 21],
])("island %i with %i lessons", (seed, count) => {
  const layout = islandLayout(seed, count);

  it("is deterministic", () => {
    const again = islandLayout(seed, count);
    expect(again.markers).toEqual(layout.markers);
    expect(again.trees).toEqual(layout.trees);
  });

  it("places one marker per lesson, each on grass with room for its badge", () => {
    expect(layout.markers).toHaveLength(count);
    for (const marker of layout.markers) expect(onLand(layout, marker.x, marker.y, 20)).toBe(true);
  });

  it("keeps the whole island, including its shallows, inside the canvas", () => {
    for (let i = 0; i < 360; i++) {
      const angle = (i / 360) * Math.PI * 2;
      const r = layout.radiusAt(angle) + SHALLOWS_WIDTH;
      const x = layout.center.x + r * Math.cos(angle);
      const y = layout.center.y + r * Math.sin(angle);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(layout.width);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(layout.height);
    }
  });

  it("never covers the path or a marker with a tree", () => {
    expect(layout.trees.length).toBeGreaterThan(20);
    for (const tree of layout.trees) {
      expect(distanceToPolyline(tree, layout.path)).toBeGreaterThan(tree.r);
      for (const marker of layout.markers) expect(Math.hypot(marker.x - tree.x, marker.y - tree.y)).toBeGreaterThan(tree.r + 18);
    }
  });

  it("runs the path through every marker in order", () => {
    let from = 0;
    for (const marker of layout.markers) {
      const index = layout.path.findIndex((point, i) => i >= from && point.x === marker.x && point.y === marker.y);
      expect(index).toBeGreaterThanOrEqual(from);
      from = index;
    }
  });
});

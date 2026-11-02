import { describe, expect, it } from "vitest";
import { normalizeUsername } from "@/lib/username";

describe("normalizeUsername", () => {
  it("accepts letters, numbers, and underscores, and stores them lowercase", () => {
    expect(normalizeUsername("Will_G2")).toBe("will_g2");
    expect(normalizeUsername("  ada  ")).toBe("ada");
  });

  it("rejects names that are too short, too long, or contain other characters", () => {
    expect(normalizeUsername("ab")).toBeNull();
    expect(normalizeUsername("a".repeat(25))).toBeNull();
    expect(normalizeUsername("will.g")).toBeNull();
    expect(normalizeUsername("will g")).toBeNull();
  });
});

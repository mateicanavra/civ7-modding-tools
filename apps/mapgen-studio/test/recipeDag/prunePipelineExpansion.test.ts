import { describe, expect, it } from "vitest";

import { prunePipelineExpandedStageIds } from "../../src/features/recipeDag/prunePipelineExpansion";

/**
 * VL-2 — the pipeline-expansion prune must drop ids missing from the loaded DAG
 * WITHOUT churning identity when nothing changed. The load-bearing case is the
 * identity-preservation one: if the `===`-stable return is lost, the hook's
 * `setPipelineExpandedStageIds` updater allocates a fresh Set on every settled
 * DAG update, which re-renders the pipeline view in a loop.
 */
describe("prunePipelineExpandedStageIds (VL-2)", () => {
  it("returns the SAME set reference when every id is still known (identity preserved)", () => {
    const current = new Set(["a", "b"]);
    expect(prunePipelineExpandedStageIds(current, new Set(["a", "b", "c"]))).toBe(current);
  });

  it("preserves identity for an empty set (nothing to prune)", () => {
    const current = new Set<string>();
    expect(prunePipelineExpandedStageIds(current, new Set(["a"]))).toBe(current);
  });

  it("drops phantom ids and returns a NEW set with only the known ids", () => {
    const current = new Set(["a", "b", "phantom"]);
    const result = prunePipelineExpandedStageIds(current, new Set(["a", "b"]));
    expect(result).not.toBe(current);
    expect([...result].sort()).toEqual(["a", "b"]);
  });

  it("returns a new empty set when every id is phantom", () => {
    const current = new Set(["x", "y"]);
    const result = prunePipelineExpandedStageIds(current, new Set(["a"]));
    expect(result).not.toBe(current);
    expect([...result]).toEqual([]);
  });
});

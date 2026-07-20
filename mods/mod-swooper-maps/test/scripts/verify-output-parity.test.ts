import { describe, expect, it } from "bun:test";
import type { FinalSurfaceKey, SurfaceDiffSummary } from "../../scripts/live/live-parity.js";
import { assessOutputParity } from "../../scripts/live/verify-output-parity.js";

const thresholds: Readonly<Record<FinalSurfaceKey, number>> = {
  terrain: 5,
  biome: 3,
  feature: 4,
  resource: 7,
};

function diff(
  key: FinalSurfaceKey,
  status: SurfaceDiffSummary["status"],
  compared: number,
  mismatches: number
): SurfaceDiffSummary {
  return {
    key,
    status,
    compared,
    missingLive: 0,
    mismatches,
    mismatchPct: compared > 0 ? mismatches / compared : 1,
    examples: [],
    pairCounts: [],
  };
}

describe("output parity assessment", () => {
  it("fails dimension-incompatible evidence closed instead of treating zero comparisons as parity", () => {
    expect(assessOutputParity([diff("terrain", "dimension-mismatch", 0, 0)], thresholds)).toEqual([
      {
        field: "terrain",
        status: "dimension-mismatch",
        compared: 0,
        mismatches: 0,
        matchPct: null,
        mismatchPct: 0,
        threshold: 5,
        within: false,
        examples: [],
      },
    ]);
  });

  it("preserves complete match and mismatch threshold behavior", () => {
    expect(
      assessOutputParity(
        [
          diff("terrain", "match", 100, 0),
          diff("feature", "mismatch", 100, 4),
          diff("biome", "mismatch", 100, 4),
        ],
        thresholds
      ).map(({ field, status, mismatchPct, within }) => ({
        field,
        status,
        mismatchPct,
        within,
      }))
    ).toEqual([
      { field: "terrain", status: "match", mismatchPct: 0, within: true },
      { field: "feature", status: "mismatch", mismatchPct: 4, within: true },
      { field: "biome", status: "mismatch", mismatchPct: 4, within: false },
    ]);
  });
});

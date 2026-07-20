import { describe, expect, it } from "bun:test";

import {
  choosePhysicalCandidate,
  comparePhysicalCandidates,
} from "@mapgen/domain/ecology/model/policy/feature-score-selection.js";

describe("feature score selection policy", () => {
  it("orders candidates by confidence desc, then stress asc, then tile index asc", () => {
    const byConfidence = comparePhysicalCandidates(
      { feature: "FEATURE_A", confidence01: 0.8, stress01: 0.2, tileIndex: 9 },
      { feature: "FEATURE_B", confidence01: 0.7, stress01: 0.1, tileIndex: 1 }
    );
    expect(byConfidence).toBeLessThan(0);

    const byStress = comparePhysicalCandidates(
      { feature: "FEATURE_A", confidence01: 0.8, stress01: 0.1, tileIndex: 9 },
      { feature: "FEATURE_B", confidence01: 0.8, stress01: 0.2, tileIndex: 1 }
    );
    expect(byStress).toBeLessThan(0);

    const byTileIndex = comparePhysicalCandidates(
      { feature: "FEATURE_A", confidence01: 0.8, stress01: 0.2, tileIndex: 2 },
      { feature: "FEATURE_B", confidence01: 0.8, stress01: 0.2, tileIndex: 7 }
    );
    expect(byTileIndex).toBeLessThan(0);
  });

  it("selects the top physical candidate deterministically", () => {
    const best = choosePhysicalCandidate([
      { feature: "FEATURE_B", confidence01: 0.8, stress01: 0.2, tileIndex: 4 },
      { feature: "FEATURE_A", confidence01: 0.8, stress01: 0.1, tileIndex: 4 },
      { feature: "FEATURE_C", confidence01: 0.7, stress01: 0.1, tileIndex: 1 },
    ]);

    expect(best).toEqual({
      feature: "FEATURE_A",
      confidence01: 0.8,
      stress01: 0.1,
      tileIndex: 4,
    });
  });
});

import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { standardConfig } from "../support/standard-config.js";
import {
  M1_TIER1_ARTIFACT_IDS,
  M1_VALIDATION_DIMENSIONS,
  M1_VALIDATION_SEEDS,
  runValidationHarness,
} from "../support/validation-harness.js";

function runStandardContext(seed: number) {
  const { width, height } = M1_VALIDATION_DIMENSIONS[0];
  const mapInfo = {
    GridWidth: width,
    GridHeight: height,
    MinLatitude: -60,
    MaxLatitude: 60,
    PlayersLandmass1: 4,
    PlayersLandmass2: 4,
    StartSectorRows: 4,
    StartSectorCols: 4,
  };
  const env = {
    seed,
    dimensions: { width, height },
    latitudeBounds: {
      topLatitude: mapInfo.MaxLatitude,
      bottomLatitude: mapInfo.MinLatitude,
    },
  };

  const adapter = createMockAdapter({ width, height, mapInfo, mapSizeId: 1, rng: createLabelRng(seed) });
  const context = createExtendedMapContext({ width, height }, adapter, env);
  initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]", storyEnabled: true });
  standardRecipe.run(context, env, standardConfig, { log: () => {} });
  return context;
}

describe("pipeline validation harness (smoke)", () => {
  it("produces stable fingerprints for identical runs", () => {
    const seed = M1_VALIDATION_SEEDS[0];
    const reportA = runValidationHarness({
      context: runStandardContext(seed),
      artifactIds: M1_TIER1_ARTIFACT_IDS,
      invariants: [],
    });
    const reportB = runValidationHarness({
      context: runStandardContext(seed),
      artifactIds: M1_TIER1_ARTIFACT_IDS,
      invariants: [],
    });

    expect(reportA.fingerprints).toEqual(reportB.fingerprints);
  });

  it("reports invariant failures with names + messages", () => {
    const seed = M1_VALIDATION_SEEDS[0];
    const report = runValidationHarness({
      context: runStandardContext(seed),
      artifactIds: M1_TIER1_ARTIFACT_IDS,
      invariants: [
        {
          name: "smoke-fail",
          check: () => ({
            name: "smoke-fail",
            ok: false,
            message: "expected failure for harness smoke",
            details: { rule: "smoke" },
          }),
        },
      ],
    });

    expect(report.ok).toBe(false);
    expect(report.failures[0]?.name).toBe("smoke-fail");
    expect(report.failures[0]?.message).toContain("expected failure");
  });
});

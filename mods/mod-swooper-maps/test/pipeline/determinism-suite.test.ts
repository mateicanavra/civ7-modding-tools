import { describe, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { M1_TIER1_ARTIFACT_IDS, runValidationHarness } from "../support/validation-harness.js";
import { M1_DETERMINISM_CASES, type DeterminismCase } from "../support/determinism-suite.js";

function runStandardContext(caseData: DeterminismCase) {
  const { width, height, seed, config } = caseData;
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
  initializeStandardRuntime(context, { mapInfo, logPrefix: "[determinism-suite]", storyEnabled: true });
  standardRecipe.run(context, env, config, { log: () => {} });
  return context;
}

function diffFingerprints(a: Record<string, any>, b: Record<string, any>): string[] {
  const diffs: string[] = [];
  const ids = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const id of ids) {
    const entryA = a[id];
    const entryB = b[id];
    if (!entryA || !entryB) {
      diffs.push(`${id}: missing fingerprint entry`);
      continue;
    }
    if (entryA.status !== entryB.status) {
      diffs.push(`${id}: status ${entryA.status} vs ${entryB.status}`);
      continue;
    }
    if (entryA.fingerprint !== entryB.fingerprint) {
      diffs.push(`${id}: fingerprint mismatch`);
    }
  }
  return diffs;
}

describe("pipeline determinism suite (M1)", () => {
  it("produces identical fingerprints across canonical cases", () => {
    for (const caseData of M1_DETERMINISM_CASES) {
      const reportA = runValidationHarness({
        context: runStandardContext(caseData),
        artifactIds: M1_TIER1_ARTIFACT_IDS,
        invariants: [],
      });
      const reportB = runValidationHarness({
        context: runStandardContext(caseData),
        artifactIds: M1_TIER1_ARTIFACT_IDS,
        invariants: [],
      });

      const diffs = diffFingerprints(reportA.fingerprints.artifacts, reportB.fingerprints.artifacts);
      if (reportA.fingerprints.missing.length > 0) {
        diffs.push(`missing artifacts (run A): ${reportA.fingerprints.missing.join(", ")}`);
      }
      if (reportB.fingerprints.missing.length > 0) {
        diffs.push(`missing artifacts (run B): ${reportB.fingerprints.missing.join(", ")}`);
      }
      if (diffs.length > 0) {
        throw new Error(`Determinism drift for ${caseData.label}:\n${diffs.join("\n")}`);
      }
    }
  });
});

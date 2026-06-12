import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../src/recipes/standard/stages/hydrology-hydrography/artifacts.js";
import { mapHydrologyArtifacts } from "../../src/recipes/standard/stages/map-hydrology/artifacts.js";
import { ecologyArtifacts } from "../../src/recipes/standard/stages/ecology/artifacts.js";
import { placementArtifacts } from "../../src/recipes/standard/stages/placement/artifacts.js";
import { computeEarthMetrics } from "../../src/dev/diagnostics/extract-earth-metrics.js";
import { standardConfig } from "../support/standard-config.js";

function runMetrics(seed: number, width: number, height: number) {
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
    latitudeBounds: { topLatitude: mapInfo.MaxLatitude, bottomLatitude: mapInfo.MinLatitude },
  };

  const adapter = createMockAdapter({ width, height, mapInfo, mapSizeId: 1, rng: createLabelRng(seed) });
  const context = createExtendedMapContext({ width, height }, adapter, env);
  initializeStandardRuntime(context, { mapInfo, logPrefix: "[seed-matrix]", storyEnabled: true });
  standardRecipe.run(context, env, standardConfig, { log: () => {} });

  const topography = context.artifacts.get(morphologyArtifacts.topography.id) as
    | { landMask?: Uint8Array }
    | undefined;
  const hydrography = context.artifacts.get(hydrologyHydrographyArtifacts.hydrography.id) as
    | { riverClass?: Uint8Array; sinkMask?: Uint8Array }
    | undefined;
  const riverNetworkMetrics = context.artifacts.get(hydrologyHydrographyArtifacts.riverNetworkMetrics.id) as
    | { benchmarkSummary?: { version: 1 } & Record<string, number> }
    | undefined;
  const engineProjectionLakes = context.artifacts.get(mapHydrologyArtifacts.engineProjectionLakes.id) as
    | { lakeMask?: Uint8Array }
    | undefined;
  const classification = context.artifacts.get(ecologyArtifacts.biomeClassification.id) as
    | { biomeIndex?: Uint8Array }
    | undefined;
  const startAssignment = context.artifacts.get(placementArtifacts.startAssignment.id) as
    | {
        assigned?: number;
        primaryAssigned?: number;
        islandClusterAssigned?: number;
        marginalAssigned?: number;
        desperationAssigned?: number;
        candidateCount?: number;
      }
    | undefined;
  if (!(topography?.landMask instanceof Uint8Array)) throw new Error("Missing topography.landMask.");
  if (!(hydrography?.riverClass instanceof Uint8Array)) throw new Error("Missing hydrography.riverClass.");
  if (!(hydrography?.sinkMask instanceof Uint8Array)) throw new Error("Missing hydrography.sinkMask.");
  if (riverNetworkMetrics?.benchmarkSummary?.version !== 1) {
    throw new Error("Missing hydrology.riverNetworkMetrics.benchmarkSummary.");
  }
  if (!(engineProjectionLakes?.lakeMask instanceof Uint8Array))
    throw new Error("Missing engineProjectionLakes.lakeMask.");
  if (!(classification?.biomeIndex instanceof Uint8Array)) throw new Error("Missing biomeClassification.biomeIndex.");
  if (!startAssignment) throw new Error("Missing placement.startAssignment.");

  return {
    earth: computeEarthMetrics({
      width,
      height,
      landMask: topography.landMask,
      lakeMask: engineProjectionLakes.lakeMask,
      riverClass: hydrography.riverClass,
      riverNetworkBenchmarkSummary: riverNetworkMetrics.benchmarkSummary,
      biomeIndex: classification.biomeIndex,
    }),
    starts: {
      assigned: startAssignment.assigned ?? 0,
      primaryAssigned: startAssignment.primaryAssigned ?? 0,
      islandClusterAssigned: startAssignment.islandClusterAssigned ?? 0,
      marginalAssigned: startAssignment.marginalAssigned ?? 0,
      desperationAssigned: startAssignment.desperationAssigned ?? 0,
      candidateCount: startAssignment.candidateCount ?? 0,
    },
  };
}

describe("pipeline seed matrix stats", () => {
  it("remains deterministic and non-degenerate across canonical seeds", () => {
    const seeds = [1337, 4242, 9001];
    for (const seed of seeds) {
      const metricsA = runMetrics(seed, 32, 20);
      const metricsB = runMetrics(seed, 32, 20);
      expect(metricsA).toEqual(metricsB);

      expect(metricsA.earth.landShare).toBeGreaterThan(0);
      expect(metricsA.earth.landShare).toBeLessThan(1);
      expect(metricsA.earth.lakeShare).toBeGreaterThanOrEqual(0);
      expect(metricsA.earth.lakeShare).toBeLessThan(0.5);
      expect(metricsA.earth.riverClassShare).toBeGreaterThanOrEqual(0);
      expect(metricsA.earth.riverClassShare).toBeLessThan(1);
      expect(metricsA.earth.hydrology.riverNetworkSummary?.landTileCount).toBeGreaterThan(0);
      expect(metricsA.earth.hydrology.riverNetworkSummary?.riverTileCount).toBeGreaterThanOrEqual(0);
      expect(metricsA.earth.hydrology.riverNetworkSummary?.invalidReceiverTileCount).toBe(0);
      expect(metricsA.earth.hydrology.riverNetworkSummary?.downstreamDischargeDropEdgeCount).toBe(0);
      expect(metricsA.earth.biomeDiversity).toBeGreaterThanOrEqual(1);
      expect(metricsA.starts.assigned, `seed ${seed} assigned starts`).toBe(8);
      expect(metricsA.starts.desperationAssigned, `seed ${seed} desperation starts`).toBe(0);
      expect(metricsA.starts.candidateCount, `seed ${seed} start candidate count`).toBeGreaterThan(8);
      expect(
        metricsA.starts.primaryAssigned + metricsA.starts.islandClusterAssigned,
        `seed ${seed} viable starts`
      ).toBeGreaterThanOrEqual(6);
    }
  }, 30_000);
});

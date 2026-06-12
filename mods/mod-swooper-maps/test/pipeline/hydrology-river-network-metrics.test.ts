import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe, { type StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { hydrologyHydrographyArtifacts } from "../../src/recipes/standard/stages/hydrology-hydrography/artifacts.js";
import earthlikeRaw from "../../src/maps/configs/swooper-earthlike.config.json";
import desertMountainsRaw from "../../src/maps/configs/swooper-desert-mountains.config.json";
import { canonicalRecipeConfig, type CanonicalMapConfigWithRecipe } from "../../src/maps/configs/canonical.js";
import {
  HYDROLOGY_FLOW_DRY,
  HYDROLOGY_FLOW_EPHEMERAL,
  HYDROLOGY_FLOW_INTERMITTENT,
  HYDROLOGY_FLOW_PERENNIAL,
  HYDROLOGY_MOUTH_UNRESOLVED,
} from "../../src/domain/hydrology/index.js";

function recipeConfig(config: CanonicalMapConfigWithRecipe): StandardRecipeConfig {
  return canonicalRecipeConfig<StandardRecipeConfig>(config);
}

function runHydrologyMetrics(args: Readonly<{
  config: StandardRecipeConfig;
  width: number;
  height: number;
  seed: number;
}>) {
  const mapInfo = {
    GridWidth: args.width,
    GridHeight: args.height,
    MinLatitude: -80,
    MaxLatitude: 80,
    PlayersLandmass1: 4,
    PlayersLandmass2: 4,
    StartSectorRows: 4,
    StartSectorCols: 4,
  };
  const env = {
    seed: args.seed,
    dimensions: { width: args.width, height: args.height },
    latitudeBounds: { topLatitude: mapInfo.MaxLatitude, bottomLatitude: mapInfo.MinLatitude },
  };

  const adapter = createMockAdapter({
    width: args.width,
    height: args.height,
    mapInfo,
    mapSizeId: 1,
    rng: createLabelRng(args.seed),
  });
  const context = createExtendedMapContext({ width: args.width, height: args.height }, adapter, env);
  initializeStandardRuntime(context, { mapInfo, logPrefix: "[hydrology-metrics]", storyEnabled: true });
  standardRecipe.run(context, env, args.config, { log: () => {} });

  const hydrography = context.artifacts.get(hydrologyHydrographyArtifacts.hydrography.id) as
    | { riverClass?: Uint8Array }
    | undefined;
  const metrics = context.artifacts.get(hydrologyHydrographyArtifacts.riverNetworkMetrics.id) as
    | {
        upstreamArea?: Int32Array;
        streamOrderProxy?: Uint8Array;
        mouthType?: Uint8Array;
        flowPermanenceProxy?: Uint8Array;
        benchmarkSummary?: {
          version: 1;
          landTileCount: number;
          riverTileCount: number;
          minorRiverTileCount: number;
          majorRiverTileCount: number;
          riverLandShare: number;
          minorRiverShareOfRiverTiles: number;
          majorRiverShareOfRiverTiles: number;
          lowOrderRiverShareOfRiverTiles: number;
          lakeLandShare: number;
          nonDryFlowLandShare: number;
          riverDryTileCount: number;
          riverEphemeralTileCount: number;
          riverIntermittentTileCount: number;
          riverPerennialTileCount: number;
          nonPerennialRiverShareOfRiverTiles: number;
          unresolvedMouthTileCount: number;
          assignedBasinLandTileCount: number;
          unassignedBasinLandTileCount: number;
          invalidReceiverTileCount: number;
          downstreamDischargeDropEdgeCount: number;
          maxUpstreamArea: number;
          maxStreamOrderProxy: number;
        };
      }
    | undefined;

  if (!(hydrography?.riverClass instanceof Uint8Array)) {
    throw new Error("Missing hydrology.hydrography.riverClass.");
  }
  if (!(metrics?.upstreamArea instanceof Int32Array)) {
    throw new Error("Missing hydrology.riverNetworkMetrics.upstreamArea.");
  }
  if (!(metrics?.streamOrderProxy instanceof Uint8Array)) {
    throw new Error("Missing hydrology.riverNetworkMetrics.streamOrderProxy.");
  }
  if (!(metrics?.mouthType instanceof Uint8Array)) {
    throw new Error("Missing hydrology.riverNetworkMetrics.mouthType.");
  }
  if (!(metrics?.flowPermanenceProxy instanceof Uint8Array)) {
    throw new Error("Missing hydrology.riverNetworkMetrics.flowPermanenceProxy.");
  }
  if (metrics.benchmarkSummary?.version !== 1) {
    throw new Error("Missing hydrology.riverNetworkMetrics.benchmarkSummary.");
  }

  let unresolvedMouthCount = 0;
  let maxUpstreamArea = 0;
  let maxStreamOrder = 0;
  let dryCount = 0;
  let ephemeralCount = 0;
  let intermittentCount = 0;
  let perennialCount = 0;
  let riverTileCount = 0;

  for (let i = 0; i < hydrography.riverClass.length; i++) {
    const upstreamArea = metrics.upstreamArea[i] ?? 0;
    if (upstreamArea <= 0) continue;
    if ((metrics.mouthType[i] ?? 0) === HYDROLOGY_MOUTH_UNRESOLVED) unresolvedMouthCount += 1;
    maxUpstreamArea = Math.max(maxUpstreamArea, upstreamArea);
    maxStreamOrder = Math.max(maxStreamOrder, metrics.streamOrderProxy[i] ?? 0);
    const permanence = metrics.flowPermanenceProxy[i] ?? 0;
    if (permanence === HYDROLOGY_FLOW_DRY) dryCount += 1;
    if (permanence === HYDROLOGY_FLOW_EPHEMERAL) ephemeralCount += 1;
    if (permanence === HYDROLOGY_FLOW_INTERMITTENT) intermittentCount += 1;
    if (permanence === HYDROLOGY_FLOW_PERENNIAL) perennialCount += 1;
    if ((hydrography.riverClass[i] ?? 0) > 0) riverTileCount += 1;
  }

  return {
    unresolvedMouthCount,
    maxUpstreamArea,
    maxStreamOrder,
    dryCount,
    ephemeralCount,
    intermittentCount,
    perennialCount,
    riverTileCount,
    benchmarkSummary: metrics.benchmarkSummary,
  };
}

describe("pipeline hydrology river-network metrics", () => {
  it("publishes coherent river-network metrics on representative Earthlike seeds", () => {
    const config = recipeConfig(earthlikeRaw);
    for (const seed of [1018, 1, 42]) {
      const stats = runHydrologyMetrics({ config, width: 42, height: 26, seed });
      expect(stats.unresolvedMouthCount, `seed ${seed} unresolved mouths`).toBe(0);
      expect(stats.maxUpstreamArea, `seed ${seed} max upstream area`).toBeGreaterThan(8);
      expect(stats.maxStreamOrder, `seed ${seed} max stream order`).toBeGreaterThanOrEqual(2);
      expect(stats.benchmarkSummary.unresolvedMouthTileCount).toBe(stats.unresolvedMouthCount);
      expect(stats.benchmarkSummary.maxUpstreamArea).toBe(stats.maxUpstreamArea);
      expect(stats.benchmarkSummary.maxStreamOrderProxy).toBe(stats.maxStreamOrder);
      expect(stats.benchmarkSummary.riverTileCount).toBe(stats.riverTileCount);
      expect(stats.benchmarkSummary.minorRiverTileCount).toBeGreaterThan(0);
      expect(stats.benchmarkSummary.majorRiverTileCount).toBeGreaterThan(0);
      expect(stats.benchmarkSummary.riverDryTileCount).toBe(0);
      expect(
        stats.benchmarkSummary.riverEphemeralTileCount +
          stats.benchmarkSummary.riverIntermittentTileCount +
          stats.benchmarkSummary.riverPerennialTileCount
      ).toBe(stats.benchmarkSummary.riverTileCount);
      expect(stats.benchmarkSummary.riverLandShare).toBeGreaterThan(0);
      expect(stats.benchmarkSummary.minorRiverShareOfRiverTiles).toBeGreaterThan(0);
      expect(stats.benchmarkSummary.majorRiverShareOfRiverTiles).toBeGreaterThan(0);
      expect(stats.benchmarkSummary.lowOrderRiverShareOfRiverTiles).toBeGreaterThan(0);
      expect(stats.benchmarkSummary.nonDryFlowLandShare).toBeGreaterThan(0);
      expect(stats.benchmarkSummary.nonPerennialRiverShareOfRiverTiles).toBeGreaterThan(0);
      expect(stats.benchmarkSummary.invalidReceiverTileCount).toBe(0);
      expect(stats.benchmarkSummary.downstreamDischargeDropEdgeCount).toBe(0);
      expect(stats.benchmarkSummary.unassignedBasinLandTileCount).toBe(0);
      expect(stats.benchmarkSummary.assignedBasinLandTileCount).toBe(stats.benchmarkSummary.landTileCount);
      expect(
        stats.ephemeralCount + stats.intermittentCount + stats.perennialCount,
        `seed ${seed} non-dry flow signal`
      ).toBeGreaterThan(stats.riverTileCount / 4);
    }
  });

  it("keeps arid controls typed rather than unresolved", () => {
    const config = recipeConfig(desertMountainsRaw);
    const stats = runHydrologyMetrics({ config, width: 42, height: 26, seed: 1018 });
    expect(stats.unresolvedMouthCount).toBe(0);
    expect(stats.benchmarkSummary.unresolvedMouthTileCount).toBe(0);
    expect(stats.benchmarkSummary.landTileCount).toBeGreaterThan(0);
    expect(stats.benchmarkSummary.invalidReceiverTileCount).toBe(0);
    expect(stats.benchmarkSummary.downstreamDischargeDropEdgeCount).toBe(0);
    expect(stats.benchmarkSummary.lakeLandShare).toBeGreaterThanOrEqual(0);
    expect(stats.benchmarkSummary.riverLandShare).toBeGreaterThanOrEqual(0);
    expect(stats.dryCount).toBeGreaterThan(0);
    expect(stats.maxUpstreamArea).toBeGreaterThan(0);
  });
});

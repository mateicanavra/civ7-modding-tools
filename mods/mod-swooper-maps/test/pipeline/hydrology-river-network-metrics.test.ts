import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  HYDROLOGY_FLOW_DRY,
  HYDROLOGY_FLOW_EPHEMERAL,
  HYDROLOGY_FLOW_INTERMITTENT,
  HYDROLOGY_FLOW_PERENNIAL,
  HYDROLOGY_MOUTH_UNRESOLVED,
} from "../../src/domain/hydrology/index.js";
import {
  type CanonicalMapConfigWithRecipe,
  canonicalRecipeConfig,
} from "../../src/maps/configs/canonical.js";
import desertMountainsRaw from "../../src/maps/configs/swooper-desert-mountains.config.json";
import earthlikeRaw from "../../src/maps/configs/swooper-earthlike.config.json";
import standardRecipe, { type StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { hydrologyHydrographyArtifacts } from "../../src/recipes/standard/stages/hydrology-hydrography/artifacts.js";

function recipeConfig(config: CanonicalMapConfigWithRecipe): StandardRecipeConfig {
  return canonicalRecipeConfig<StandardRecipeConfig>(config);
}

function runHydrologyMetrics(
  args: Readonly<{
    config: StandardRecipeConfig;
    width: number;
    height: number;
    seed: number;
  }>
) {
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
  const context = createExtendedMapContext(
    { width: args.width, height: args.height },
    adapter,
    env
  );
  initializeStandardRuntime(context, {
    mapInfo,
    logPrefix: "[hydrology-metrics]",
    storyEnabled: true,
  });
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
          acceptedLakeMouthTileCount: number;
          closedBasinMouthTileCount: number;
          oceanMouthTileCount: number;
          closedOrLakeTerminalLandShare: number;
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

function expectHealthyRouting(stats: ReturnType<typeof runHydrologyMetrics>, label: string): void {
  expect(stats.unresolvedMouthCount, `${label} unresolved mouths`).toBe(0);
  expect(
    stats.benchmarkSummary.unresolvedMouthTileCount,
    `${label} unresolved mouths summary`
  ).toBe(0);
  expect(stats.benchmarkSummary.invalidReceiverTileCount, `${label} invalid receivers`).toBe(0);
  expect(stats.benchmarkSummary.downstreamDischargeDropEdgeCount, `${label} discharge drops`).toBe(
    0
  );
  expect(stats.benchmarkSummary.unassignedBasinLandTileCount, `${label} unassigned basins`).toBe(0);
  expect(stats.benchmarkSummary.assignedBasinLandTileCount, `${label} assigned basins`).toBe(
    stats.benchmarkSummary.landTileCount
  );
}

function expectBetween(value: number, min: number, max: number, label: string): void {
  expect(value, `${label} lower bound`).toBeGreaterThanOrEqual(min);
  expect(value, `${label} upper bound`).toBeLessThanOrEqual(max);
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
      expect(stats.benchmarkSummary.assignedBasinLandTileCount).toBe(
        stats.benchmarkSummary.landTileCount
      );
      expect(
        stats.ephemeralCount + stats.intermittentCount + stats.perennialCount,
        `seed ${seed} non-dry flow signal`
      ).toBeGreaterThan(stats.riverTileCount / 4);
    }
    // Multi-seed full-pipeline run: 5s default budget flakes under load.
  }, 30_000);

  it("checks Earthlike and holdout seed rows against declared visible-scale stability bands", () => {
    const config = recipeConfig(earthlikeRaw);
    const rows = [
      { label: "earthlike", seeds: [1018, 1, 42] },
      { label: "holdout", seeds: [1337, 4242, 9001] },
    ] as const;

    // These generated-map bands are scoped to this recipe's visible tile floor.
    // Physical truth gates are the routing/terminal invariants plus focused
    // closed-basin and wet-headwater rows; tile-share bands are not Earth data.
    for (const row of rows) {
      for (const seed of row.seeds) {
        const label = `${row.label} seed ${seed}`;
        const stats = runHydrologyMetrics({ config, width: 42, height: 26, seed });

        expectHealthyRouting(stats, label);
        expect(stats.maxStreamOrder, `${label} stream hierarchy`).toBeGreaterThanOrEqual(2);
        expect(stats.maxUpstreamArea, `${label} watershed accumulation`).toBeGreaterThanOrEqual(18);
        expect(
          stats.benchmarkSummary.oceanMouthTileCount,
          `${label} ocean outlets`
        ).toBeGreaterThan(0);
        expect(stats.benchmarkSummary.riverTileCount, `${label} river tiles`).toBeGreaterThan(80);
        expect(
          stats.benchmarkSummary.minorRiverTileCount,
          `${label} minor/headwater tiles`
        ).toBeGreaterThan(0);
        expect(stats.benchmarkSummary.majorRiverTileCount, `${label} major tiles`).toBeGreaterThan(
          0
        );

        expectBetween(
          stats.benchmarkSummary.riverLandShare,
          0.18,
          0.28,
          `${label} river land share`
        );
        expectBetween(
          stats.benchmarkSummary.minorRiverShareOfRiverTiles,
          0.25,
          0.55,
          `${label} visible minor share`
        );
        expectBetween(
          stats.benchmarkSummary.majorRiverShareOfRiverTiles,
          0.45,
          0.75,
          `${label} visible major share`
        );
        expectBetween(
          stats.benchmarkSummary.nonPerennialRiverShareOfRiverTiles,
          0.3,
          0.55,
          `${label} non-perennial river share`
        );
        expect(
          stats.benchmarkSummary.lowOrderRiverShareOfRiverTiles,
          `${label} low-order hierarchy`
        ).toBeGreaterThan(0.95);
        expectBetween(
          stats.benchmarkSummary.lakeLandShare,
          0.005,
          0.05,
          `${label} lake land share`
        );
      }
    }
    // Multi-seed full-pipeline run: 5s default budget flakes under load.
  }, 30_000);

  it("keeps arid controls typed rather than unresolved", () => {
    const config = recipeConfig(desertMountainsRaw);
    const stats = runHydrologyMetrics({ config, width: 42, height: 26, seed: 1018 });
    expectHealthyRouting(stats, "desert mountains seed 1018");
    expect(stats.benchmarkSummary.landTileCount).toBeGreaterThan(0);
    expect(stats.benchmarkSummary.oceanMouthTileCount).toBeGreaterThan(0);
    expectBetween(
      stats.benchmarkSummary.lakeLandShare,
      0,
      0.02,
      "desert mountains lake land share"
    );
    expectBetween(
      stats.benchmarkSummary.riverLandShare,
      0.04,
      0.13,
      "desert mountains river land share"
    );
    expect(stats.benchmarkSummary.riverLandShare).toBeLessThan(0.18);
    expect(stats.dryCount).toBeGreaterThan(0);
    expect(stats.maxUpstreamArea).toBeGreaterThan(0);
  });
});

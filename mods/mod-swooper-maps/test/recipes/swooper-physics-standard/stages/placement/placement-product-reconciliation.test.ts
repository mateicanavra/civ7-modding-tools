import { describe, expect, it } from "bun:test";

import {
  createMockAdapter,
  type MapInfo,
  MockAdapter,
  type ResourcePlacementIntent,
  type ResourcePlacementOutcome,
} from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe, {
  type StandardRecipeConfig,
} from "../../../../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../../../../src/recipes/standard/runtime.js";
import { artifacts as placementArtifacts } from "../../../../../src/recipes/standard/stages/placement/artifacts/index.js";
import { standardConfig } from "../../../../support/standard-config.js";

type PlacementRecipeHarnessOptions = {
  adapter?: MockAdapter;
  config?: StandardRecipeConfig;
  mapInfo?: MapInfo;
  seed?: number;
  width?: number;
  height?: number;
};

/**
 * Runs D4 placement reconciliation through the standard recipe instead of
 * calling placement internals directly. The contract under review is the
 * recipe-published intent/outcome artifact plus adapter materialization effect,
 * so the guard must observe the same boundary that shipped maps exercise.
 */
function runStandardPlacementRecipe({
  adapter,
  config = standardConfig,
  mapInfo,
  seed = 1337,
  width = 20,
  height = 12,
}: PlacementRecipeHarnessOptions = {}) {
  const resolvedMapInfo = {
    GridWidth: width,
    GridHeight: height,
    MinLatitude: -60,
    MaxLatitude: 60,
    PlayersLandmass1: 1,
    PlayersLandmass2: 1,
    StartSectorRows: 1,
    StartSectorCols: 1,
    NumNaturalWonders: 0,
    ...mapInfo,
  };
  const env = {
    seed,
    dimensions: { width, height },
    latitudeBounds: {
      topLatitude: resolvedMapInfo.MaxLatitude ?? 60,
      bottomLatitude: resolvedMapInfo.MinLatitude ?? -60,
    },
  };
  const resolvedAdapter =
    adapter ??
    createMockAdapter({
      width,
      height,
      mapInfo: resolvedMapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
  const context = createExtendedMapContext({ width, height }, resolvedAdapter, env);

  initializeStandardRuntime(context, {
    mapInfo: resolvedMapInfo,
    logPrefix: "[test]",
  });
  standardRecipe.run(context, env, config, { log: () => {} });

  return { adapter: resolvedAdapter, context };
}

function readResourceOutcomes(context: ReturnType<typeof runStandardPlacementRecipe>["context"]) {
  return context.artifacts.get(placementArtifacts.resourcePlacementOutcomes.id) as
    | {
        summary: {
          plannedCount: number;
          placedCount: number;
          rejectedCount: number;
          mismatchCount: number;
        };
      }
    | undefined;
}

function readDiscoveryOutcomes(context: ReturnType<typeof runStandardPlacementRecipe>["context"]) {
  return context.artifacts.get(placementArtifacts.discoveryPlacementOutcomes.id) as
    | {
        summary: {
          plannedCount: number;
          placedCount: number;
          rejectedCount: number;
        };
      }
    | undefined;
}

class MismatchingResourceAdapter extends MockAdapter {
  override placeResourceIntent(
    width: number,
    height: number,
    intent: ResourcePlacementIntent
  ): ResourcePlacementOutcome {
    const outcome = super.placeResourceIntent(width, height, intent);
    if (outcome.status !== "placed") return outcome;
    return {
      ...outcome,
      status: "mismatch",
      reason: "wrong-resource-type",
      observedResourceType: outcome.resourceType + 1,
    };
  }
}

class UntypedResourceRejectionAdapter extends MockAdapter {
  override placeResourceIntent(
    width: number,
    height: number,
    intent: ResourcePlacementIntent
  ): ResourcePlacementOutcome {
    const outcome = super.placeResourceIntent(width, height, intent);
    if (outcome.status !== "placed") return outcome;
    return {
      status: "rejected",
      plotIndex: outcome.plotIndex,
      x: outcome.x,
      y: outcome.y,
      resourceType: outcome.resourceType,
      observedResourceType: outcome.observedResourceType,
    } as ResourcePlacementOutcome;
  }
}

describe("placement reconciliation", () => {
  it("places resources through typed intents and discoveries through the official generator", () => {
    const width = 20;
    const height = 12;
    const seed = 1337;
    const adapter = createMockAdapter({
      width,
      height,
      mapInfo: { GridWidth: width, GridHeight: height },
      mapSizeId: 1,
      rng: createLabelRng(seed),
      officialDiscoveriesPlacedCount: 5,
    });

    const { context } = runStandardPlacementRecipe({ adapter, seed, width, height });

    const resourceOutcomes = readResourceOutcomes(context);
    const discoveryOutcomes = readDiscoveryOutcomes(context);

    // Snow and the official RESOURCE generator stay off: the mod owns resource
    // placement via typed intents (engine indices + readback).
    expect(adapter.calls.generateSnow.length).toBe(0);
    expect(adapter.calls.generateOfficialResources.length).toBe(0);
    expect(resourceOutcomes?.summary.plannedCount).toBeGreaterThan(0);
    expect(adapter.calls.setResourceType.length).toBe(resourceOutcomes?.summary.placedCount);

    // Discoveries defer to Civ7's official generator (narrative-coupled type and
    // availability), not a map-side catalog: the step calls it exactly once and
    // records the observed counts; it never stamps per-tile discovery intents.
    expect(adapter.calls.generateOfficialDiscoveries.length).toBe(1);
    expect(adapter.calls.stampDiscovery.length).toBe(0);
    expect(discoveryOutcomes?.summary.plannedCount).toBe(5);
    expect(discoveryOutcomes?.summary.placedCount).toBe(5);
    expect(discoveryOutcomes?.summary.rejectedCount).toBe(0);
  });

  it("records typed resource rejections without relocation when the engine oracle rejects every intent", () => {
    const width = 20;
    const height = 12;
    const seed = 1441;
    // Plan-authority cutover (S3/D4): the plan is built within static policy
    // legality; a divergent live oracle produces typed per-intent rejections
    // (recorded shortfalls), never relocation, type re-decision, or official
    // generator fallback.
    const adapter = createMockAdapter({
      width,
      height,
      mapInfo: { GridWidth: width, GridHeight: height },
      mapSizeId: 1,
      rng: createLabelRng(seed),
      canHaveResource: () => false,
    });

    const { context } = runStandardPlacementRecipe({ adapter, seed, width, height });
    const resourceOutcomes = readResourceOutcomes(context);

    expect(adapter.calls.generateOfficialResources.length).toBe(0);
    expect(adapter.calls.setResourceType.length).toBe(0);
    expect(resourceOutcomes?.summary.plannedCount).toBeGreaterThan(0);
    expect(resourceOutcomes?.summary.placedCount).toBe(0);
    expect(resourceOutcomes?.summary.rejectedCount).toBe(resourceOutcomes?.summary.plannedCount);
    expect(resourceOutcomes?.summary.mismatchCount).toBe(0);
    expect(
      resourceOutcomes?.summary.byReason.every((row) => row.reason === "cannot-have-resource")
    ).toBe(true);
    expect(resourceOutcomes?.reconciliation.shortfalls.length).toBeGreaterThan(0);
  });

  it("fails hard when resource readback contradicts typed intent", () => {
    const width = 20;
    const height = 12;
    const seed = 1661;
    const adapter = new MismatchingResourceAdapter({
      width,
      height,
      mapInfo: { GridWidth: width, GridHeight: height },
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });

    expect(() => runStandardPlacementRecipe({ adapter, seed, width, height })).toThrow(
      /placement\.resources failed/i
    );
    expect(adapter.calls.generateOfficialResources.length).toBe(0);
    expect(adapter.calls.recalculateFertility).toBe(0);
    expect(adapter.calls.assignAdvancedStartRegions).toBe(0);
  });

  it("fails hard when resource outcomes omit typed rejection reasons", () => {
    const width = 20;
    const height = 12;
    const seed = 1771;
    const adapter = new UntypedResourceRejectionAdapter({
      width,
      height,
      mapInfo: { GridWidth: width, GridHeight: height },
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });

    expect(() => runStandardPlacementRecipe({ adapter, seed, width, height })).toThrow(
      /untyped rejection reason/i
    );
    expect(adapter.calls.generateOfficialResources.length).toBe(0);
    expect(adapter.calls.recalculateFertility).toBe(0);
    expect(adapter.calls.assignAdvancedStartRegions).toBe(0);
  });
});

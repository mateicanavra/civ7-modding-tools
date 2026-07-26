import { describe, expect, it } from "bun:test";

import {
  createMockAdapter,
  MockAdapter,
  type ResourcePlacementIntent,
  type ResourcePlacementOutcome,
} from "@civ7/adapter";
import type { MapContext } from "@swooper/mapgen-core";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import { artifactModules as placementArtifactModules } from "../../../../../src/recipes/standard/stages/placement/artifacts/index.js";
import {
  runStandardRecipeTestMap,
  type StandardRecipeTestAdapterInput,
} from "../../fixtures/standard-recipe.js";

type PlacementRecipeHarnessOptions = {
  createAdapter?: (input: StandardRecipeTestAdapterInput) => MockAdapter;
  seed?: number;
};

/**
 * Runs D4 placement reconciliation through the standard recipe instead of
 * calling placement internals directly. The contract under review is the
 * recipe-published intent/outcome artifact plus adapter materialization effect,
 * so the guard must observe the same boundary that shipped maps exercise.
 */
function runStandardPlacementRecipe({
  createAdapter,
  seed = 1337,
}: PlacementRecipeHarnessOptions = {}): Readonly<{ adapter: MockAdapter; context: MapContext }> {
  const options = {
    seed,
    mapInfo: {
      PlayersLandmass1: 1,
      PlayersLandmass2: 1,
      StartSectorRows: 1,
      StartSectorCols: 1,
      NumNaturalWonders: 0,
    },
  } as const;
  return createAdapter
    ? runStandardRecipeTestMap({ ...options, createAdapter })
    : runStandardRecipeTestMap(options);
}

function readResourceOutcomes(context: ReturnType<typeof runStandardPlacementRecipe>["context"]) {
  return readValidatedArtifact(context, placementArtifactModules.resourcePlacementOutcomes);
}

function readDiscoveryOutcomes(context: ReturnType<typeof runStandardPlacementRecipe>["context"]) {
  return readValidatedArtifact(context, placementArtifactModules.discoveryPlacementOutcomes);
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
    const seed = 1337;
    const { adapter, context } = runStandardPlacementRecipe({
      seed,
      createAdapter: ({ preset, mapInfo }) =>
        createMockAdapter({
          ...preset.dimensions,
          mapInfo,
          mapSizeId: preset.id,
          rng: createLabelRng(seed),
          officialDiscoveriesPlacedCount: 5,
        }),
    });

    const resourceOutcomes = readResourceOutcomes(context);
    const discoveryOutcomes = readDiscoveryOutcomes(context);
    // Snow and the official RESOURCE generator stay off: the mod owns resource
    // placement via typed intents (engine indices + readback).
    expect(adapter.calls.generateSnow.length).toBe(0);
    expect(adapter.calls.generateOfficialResources.length).toBe(0);
    expect(resourceOutcomes.summary.plannedCount).toBeGreaterThan(0);
    expect(adapter.calls.setResourceType.length).toBe(resourceOutcomes.summary.placedCount);

    // Discoveries defer to Civ7's official generator (narrative-coupled type and
    // availability), not a map-side catalog: the step calls it exactly once and
    // records the observed counts; it never stamps per-tile discovery intents.
    expect(adapter.calls.generateOfficialDiscoveries.length).toBe(1);
    expect(adapter.calls.stampDiscovery.length).toBe(0);
    expect(discoveryOutcomes.summary.plannedCount).toBe(5);
    expect(discoveryOutcomes.summary.placedCount).toBe(5);
    expect(discoveryOutcomes.summary.rejectedCount).toBe(0);
  });

  it("records typed resource rejections without relocation when the engine oracle rejects every intent", () => {
    const seed = 1441;
    // Plan-authority cutover (S3/D4): the plan is built within static policy
    // legality; a divergent live oracle produces typed per-intent rejections
    // (recorded shortfalls), never relocation, type re-decision, or official
    // generator fallback.
    const { adapter, context } = runStandardPlacementRecipe({
      seed,
      createAdapter: ({ preset, mapInfo }) =>
        createMockAdapter({
          ...preset.dimensions,
          mapInfo,
          mapSizeId: preset.id,
          rng: createLabelRng(seed),
          canHaveResource: () => false,
        }),
    });
    const resourceOutcomes = readResourceOutcomes(context);
    expect(adapter.calls.generateOfficialResources.length).toBe(0);
    expect(adapter.calls.setResourceType.length).toBe(0);
    expect(resourceOutcomes.summary.plannedCount).toBeGreaterThan(0);
    expect(resourceOutcomes.summary.placedCount).toBe(0);
    expect(resourceOutcomes.summary.rejectedCount).toBe(resourceOutcomes.summary.plannedCount);
    expect(resourceOutcomes.summary.mismatchCount).toBe(0);
    expect(
      resourceOutcomes.summary.byReason.every((row) => row.reason === "cannot-have-resource")
    ).toBe(true);
    expect(resourceOutcomes.reconciliation.shortfalls.length).toBeGreaterThan(0);
  });

  it("fails hard when resource readback contradicts typed intent", () => {
    const seed = 1661;
    let adapter: MismatchingResourceAdapter | undefined;

    expect(() =>
      runStandardPlacementRecipe({
        seed,
        createAdapter: ({ preset, mapInfo }) => {
          adapter = new MismatchingResourceAdapter({
            ...preset.dimensions,
            mapInfo,
            mapSizeId: preset.id,
            rng: createLabelRng(seed),
          });
          return adapter;
        },
      })
    ).toThrow(/placement\.resources failed/i);
    if (!adapter) throw new Error("Expected the mismatching adapter to be constructed.");
    expect(adapter.calls.generateOfficialResources.length).toBe(0);
    expect(adapter.calls.recalculateFertility).toBe(0);
    expect(adapter.calls.assignAdvancedStartRegions).toBe(0);
  });

  it("fails hard when resource outcomes omit typed rejection reasons", () => {
    const seed = 1771;
    let adapter: UntypedResourceRejectionAdapter | undefined;

    expect(() =>
      runStandardPlacementRecipe({
        seed,
        createAdapter: ({ preset, mapInfo }) => {
          adapter = new UntypedResourceRejectionAdapter({
            ...preset.dimensions,
            mapInfo,
            mapSizeId: preset.id,
            rng: createLabelRng(seed),
          });
          return adapter;
        },
      })
    ).toThrow(/untyped rejection reason/i);
    if (!adapter) throw new Error("Expected the rejecting adapter to be constructed.");
    expect(adapter.calls.generateOfficialResources.length).toBe(0);
    expect(adapter.calls.recalculateFertility).toBe(0);
    expect(adapter.calls.assignAdvancedStartRegions).toBe(0);
  });
});

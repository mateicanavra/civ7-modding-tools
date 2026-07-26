import { describe, expect, it } from "bun:test";

import {
  createMockAdapter,
  MockAdapter,
  type OfficialDiscoveryGenerationResult,
  type ResourcePlacementIntent,
  type ResourcePlacementOutcome,
} from "@civ7/adapter";
import type { MapContext } from "@swooper/mapgen-core";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import { Value } from "typebox/value";

import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import {
  type StandardDiscoveryPlacementMeasurements,
  StandardDiscoveryPlacementMeasurementsSchema,
} from "../../../../../src/recipes/standard/metrics/families/discovery-placement.js";
import {
  runStandardRecipeTestMap,
  type StandardRecipeTestAdapterInput,
  type StandardRecipeTestOptions,
} from "../../fixtures/standard-recipe.js";

type PlacementRecipeHarnessOptions = {
  createAdapter?: (input: StandardRecipeTestAdapterInput) => MockAdapter;
  execution?: StandardRecipeTestOptions["execution"];
};

/**
 * Runs D4 placement reconciliation through the standard recipe instead of
 * calling placement internals directly. The contract under review is the
 * recipe-published intent/outcome artifact plus adapter materialization effect,
 * so the guard must observe the same boundary that shipped maps exercise.
 */
function runStandardPlacementRecipe({
  createAdapter,
  execution,
}: PlacementRecipeHarnessOptions = {}): Readonly<{ adapter: MockAdapter; context: MapContext }> {
  const options = {
    mapInfo: {
      PlayersLandmass1: 1,
      PlayersLandmass2: 1,
      StartSectorRows: 1,
      StartSectorCols: 1,
      NumNaturalWonders: 0,
    },
  } as const;
  return createAdapter
    ? runStandardRecipeTestMap({ ...options, createAdapter, execution })
    : runStandardRecipeTestMap({ ...options, execution });
}

function readResourceOutcomes(context: ReturnType<typeof runStandardPlacementRecipe>["context"]) {
  return readValidatedArtifact(context, resourceSiteArtifacts.resourcePlacementOutcomes);
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

class PartiallyAcceptingDiscoveryAdapter extends MockAdapter {
  override generateOfficialDiscoveries(
    width: number,
    height: number,
    startPositions: ReadonlyArray<number>,
    polarMargin: number
  ): OfficialDiscoveryGenerationResult {
    super.generateOfficialDiscoveries(width, height, startPositions, polarMargin);
    return { attemptedCount: 7, placedCount: 5 };
  }
}

describe("placement reconciliation", () => {
  it("places resources through typed intents and projects Civ7 discovery-generation counts", () => {
    let discoveryGeneration: StandardDiscoveryPlacementMeasurements | undefined;
    const { adapter, context } = runStandardPlacementRecipe({
      createAdapter: ({ preset, mapInfo, mapSeed }) =>
        new PartiallyAcceptingDiscoveryAdapter({
          ...preset.dimensions,
          mapInfo,
          mapSizeId: preset.id,
          rng: createLabelRng(mapSeed),
        }),
      execution: {
        facets: {
          metrics: (projection) => {
            const candidate = projection["placement.discoveryGeneration"];
            if (candidate !== undefined) {
              discoveryGeneration = Value.Parse(
                StandardDiscoveryPlacementMeasurementsSchema,
                candidate
              );
            }
          },
        },
      },
    });

    const resourceOutcomes = readResourceOutcomes(context);
    // Snow and the official RESOURCE generator stay off: the mod owns resource
    // placement via typed intents (engine indices + readback).
    expect(adapter.calls.generateSnow.length).toBe(0);
    expect(adapter.calls.generateOfficialResources.length).toBe(0);
    expect(resourceOutcomes.summary.plannedCount).toBeGreaterThan(0);
    expect(adapter.calls.setResourceType.length).toBe(resourceOutcomes.summary.placedCount);

    // Discoveries defer to Civ7's official generator (narrative-coupled type and
    // availability), not a map-side catalog: the step calls it exactly once and
    // never stamps per-tile discovery intents. Its successful observation closes
    // through metrics rather than a fake causal artifact.
    expect(adapter.calls.generateOfficialDiscoveries.length).toBe(1);
    expect(adapter.calls.stampDiscovery.length).toBe(0);
    expect(discoveryGeneration).toEqual({
      version: 1,
      attemptedCount: 7,
      placedCount: 5,
      rejectedCount: 2,
    });
  });

  it("records typed resource rejections without relocation when the engine oracle rejects every intent", () => {
    // Plan-authority cutover (S3/D4): the plan is built within static policy
    // legality; a divergent live oracle produces typed per-intent rejections
    // (recorded shortfalls), never relocation, type re-decision, or official
    // generator fallback.
    const { adapter, context } = runStandardPlacementRecipe({
      createAdapter: ({ preset, mapInfo, mapSeed }) =>
        createMockAdapter({
          ...preset.dimensions,
          mapInfo,
          mapSizeId: preset.id,
          rng: createLabelRng(mapSeed),
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
    let adapter: MismatchingResourceAdapter | undefined;

    expect(() =>
      runStandardPlacementRecipe({
        createAdapter: ({ preset, mapInfo, mapSeed }) => {
          adapter = new MismatchingResourceAdapter({
            ...preset.dimensions,
            mapInfo,
            mapSizeId: preset.id,
            rng: createLabelRng(mapSeed),
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
    let adapter: UntypedResourceRejectionAdapter | undefined;

    expect(() =>
      runStandardPlacementRecipe({
        createAdapter: ({ preset, mapInfo, mapSeed }) => {
          adapter = new UntypedResourceRejectionAdapter({
            ...preset.dimensions,
            mapInfo,
            mapSizeId: preset.id,
            rng: createLabelRng(mapSeed),
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

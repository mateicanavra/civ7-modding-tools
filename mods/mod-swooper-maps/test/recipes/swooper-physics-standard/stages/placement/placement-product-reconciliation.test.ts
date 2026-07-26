import { describe, expect, it } from "bun:test";

import { MockAdapter, type OfficialDiscoveryGenerationResult } from "@civ7/adapter";
import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import type { MapContext } from "@swooper/mapgen-core";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import { Value } from "typebox/value";
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
});

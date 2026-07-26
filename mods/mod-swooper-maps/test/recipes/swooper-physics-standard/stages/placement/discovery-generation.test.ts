import { describe, expect, it } from "bun:test";

import { MockAdapter, type OfficialDiscoveryGenerationResult } from "@civ7/adapter";
import type { MapContext } from "@swooper/mapgen-core";
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

type DiscoveryRecipeHarnessOptions = {
  createAdapter?: (input: StandardRecipeTestAdapterInput) => MockAdapter;
  execution?: StandardRecipeTestOptions["execution"];
};

/**
 * Runs the Standard discovery product boundary through the complete recipe.
 *
 * Discovery delegates narrative-coupled selection to Civ7, so this harness
 * observes the same generator and metric projection boundary shipped maps use.
 */
function runStandardDiscoveryRecipe({
  createAdapter,
  execution,
}: DiscoveryRecipeHarnessOptions = {}): Readonly<{ adapter: MockAdapter; context: MapContext }> {
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

describe("discovery generation", () => {
  it("projects Civ7 discovery-generation counts without map-side discovery intents", () => {
    let discoveryGeneration: StandardDiscoveryPlacementMeasurements | undefined;
    const { adapter } = runStandardDiscoveryRecipe({
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

import { describe, expect, it } from "bun:test";
import type { Static } from "@swooper/mapgen-core/authoring";

import { artifacts as placementArtifacts } from "../../../src/recipes/standard/stages/placement/artifacts/index.js";
import { runStandardRecipeTestMap, standardMapConfig } from "./fixtures/standard-recipe.js";

type PlacementOutputs = Static<(typeof placementArtifacts.placementOutputs)["schema"]>;
type ResourcePlacementOutcomes = Static<
  (typeof placementArtifacts.resourcePlacementOutcomes)["schema"]
>;

describe("Standard recipe generation", () => {
  it("runs one canonical Tiny map through terminal placement product evidence", () => {
    const { context, adapter, preset } = runStandardRecipeTestMap({
      presetId: "MAPSIZE_TINY",
      seed: 1018,
    });
    const outputs = context.artifacts.get(placementArtifacts.placementOutputs.id) as
      | PlacementOutputs
      | undefined;
    const resources = context.artifacts.get(placementArtifacts.resourcePlacementOutcomes.id) as
      | ResourcePlacementOutcomes
      | undefined;

    if (!outputs || !resources) {
      throw new Error("Standard generation did not publish terminal placement evidence.");
    }
    expect(outputs.startsAssigned).toBeGreaterThan(0);
    expect(outputs.resourcesCount).toBe(resources.summary.placedCount);
    expect(resources.summary.plannedCount).toBe(resources.outcomes.length);
    expect(resources.summary.mismatchCount).toBe(0);
    expect(adapter.lookupMapInfo(preset.id)).toMatchObject({
      GridWidth: preset.dimensions.width,
      GridHeight: preset.dimensions.height,
      MinLatitude: standardMapConfig.latitudeBounds.bottomLatitude,
      MaxLatitude: standardMapConfig.latitudeBounds.topLatitude,
    });
  });
});

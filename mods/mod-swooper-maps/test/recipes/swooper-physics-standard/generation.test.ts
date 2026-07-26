import { describe, expect, it } from "bun:test";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";

import { artifactModules as placementArtifactModules } from "../../../src/recipes/standard/stages/placement/artifacts/index.js";
import { runStandardRecipeTestMap, standardMapConfig } from "./fixtures/standard-recipe.js";

describe("Standard recipe generation", () => {
  it("runs the selected test map through terminal placement product evidence", () => {
    const { context, adapter, preset } = runStandardRecipeTestMap({
      seed: 1018,
    });
    const outputs = readValidatedArtifact(context, placementArtifactModules.placementOutputs);
    const resources = readValidatedArtifact(
      context,
      placementArtifactModules.resourcePlacementOutcomes
    );
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
  }, 30_000);
});

import { describe, expect, it } from "bun:test";
import { artifacts as placementStartArtifacts } from "@mapgen/domain/placement/modules/starts/artifacts/index.js";
import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";

import { runStandardRecipeTestMap, standardMapConfig } from "./fixtures/standard-recipe.js";

describe("Standard recipe generation", () => {
  it("runs the selected test map through terminal placement product evidence", () => {
    const { context, adapter, preset } = runStandardRecipeTestMap({});
    const starts = readValidatedArtifact(context, placementStartArtifacts.startAssignment);
    const resources = readValidatedArtifact(
      context,
      resourceSiteArtifacts.resourcePlacementOutcomes
    );
    expect(starts.seats.length).toBeGreaterThan(0);
    expect(starts.assigned).toBe(starts.seats.length);
    expect(starts.unseatedCount).toBe(0);
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

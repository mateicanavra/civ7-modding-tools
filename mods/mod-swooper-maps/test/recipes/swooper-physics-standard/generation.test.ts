import { describe, expect, it } from "bun:test";
import { artifacts as placementStartArtifacts } from "@mapgen/domain/placement/modules/starts/artifacts/index.js";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import { Value } from "typebox/value";

import {
  STANDARD_RESOURCE_PLACEMENT_METRIC_KEY,
  type StandardResourcePlacementMeasurements,
  StandardResourcePlacementMeasurementsSchema,
} from "../../../src/recipes/standard/metrics/families/placement/resource-placement.js";
import { runStandardRecipeTestMap, standardMapConfig } from "./fixtures/standard-recipe.js";

describe("Standard recipe generation", () => {
  it("runs the selected test map through terminal placement product evidence", () => {
    let resourcePlacement: StandardResourcePlacementMeasurements | undefined;
    let metricFailure: unknown;
    const { context, adapter, preset } = runStandardRecipeTestMap({
      execution: {
        facets: {
          metrics: (projection) => {
            const candidate = projection[STANDARD_RESOURCE_PLACEMENT_METRIC_KEY];
            if (candidate !== undefined) {
              resourcePlacement = Value.Parse(
                StandardResourcePlacementMeasurementsSchema,
                candidate
              );
            }
          },
          onError: ({ facet, error }) => {
            if (facet === "metrics") metricFailure = error;
          },
        },
      },
    });
    if (metricFailure !== undefined) throw metricFailure;
    if (resourcePlacement === undefined) {
      throw new Error("Standard generation did not emit terminal resource-placement evidence.");
    }
    const starts = readValidatedArtifact(context, placementStartArtifacts.startAssignment);
    expect(starts.seats.length).toBeGreaterThan(0);
    expect(starts.assigned).toBe(starts.seats.length);
    expect(starts.unseatedCount).toBe(0);
    expect(resourcePlacement.summary.plannedCount).toBe(resourcePlacement.outcomes.length);
    expect(resourcePlacement.summary.placedCount + resourcePlacement.summary.rejectedCount).toBe(
      resourcePlacement.summary.plannedCount
    );
    for (const outcome of resourcePlacement.outcomes) {
      if (outcome.status === "placed") {
        expect(adapter.getResourceType(outcome.x, outcome.y)).toBe(outcome.resourceType);
      }
    }
    expect(adapter.lookupMapInfo(preset.id)).toMatchObject({
      GridWidth: preset.dimensions.width,
      GridHeight: preset.dimensions.height,
      MinLatitude: standardMapConfig.latitudeBounds.bottomLatitude,
      MaxLatitude: standardMapConfig.latitudeBounds.topLatitude,
    });
  }, 30_000);
});

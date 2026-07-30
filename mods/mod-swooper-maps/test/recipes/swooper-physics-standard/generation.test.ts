import { describe, expect, it } from "bun:test";
import { getCiv7StandardMapSizePreset } from "@civ7/map-policy";
import { artifacts as placementStartArtifacts } from "@mapgen/domain/placement/modules/starts/artifacts/index.js";
import { artifacts as resourceDemandArtifacts } from "@mapgen/domain/resources/modules/demand/artifacts/index.js";
import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import { artifacts as resourceSupportArtifacts } from "@mapgen/domain/resources/modules/support/artifacts/index.js";
import { deriveStepSeed } from "@swooper/mapgen-core";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import { Value } from "typebox/value";

import {
  STANDARD_NATURAL_WONDER_PLACEMENT_METRIC_KEY,
  type StandardNaturalWonderPlacementMeasurements,
  StandardNaturalWonderPlacementMeasurementsSchema,
} from "../../../src/recipes/standard/metrics/families/placement/natural-wonder-placement.js";
import {
  STANDARD_RESOURCE_PLACEMENT_METRIC_KEY,
  type StandardResourcePlacementMeasurements,
  StandardResourcePlacementMeasurementsSchema,
} from "../../../src/recipes/standard/metrics/families/placement/resource-placement.js";
import { TEST_GAME_SEED, TEST_MAP_SEED } from "../../setup.js";
import { runStandardRecipeTestMap, standardMapConfig } from "./fixtures/standard-recipe.js";

describe("Standard recipe generation", () => {
  it("runs the selected test map through terminal placement product evidence", () => {
    let naturalWonderPlacement: StandardNaturalWonderPlacementMeasurements | undefined;
    let resourcePlacement: StandardResourcePlacementMeasurements | undefined;
    let metricFailure: unknown;
    const { context, adapter, preset } = runStandardRecipeTestMap({
      execution: {
        facets: {
          metrics: (projection) => {
            const naturalWonderCandidate = projection[STANDARD_NATURAL_WONDER_PLACEMENT_METRIC_KEY];
            if (naturalWonderCandidate !== undefined) {
              naturalWonderPlacement = Value.Parse(
                StandardNaturalWonderPlacementMeasurementsSchema,
                naturalWonderCandidate
              );
            }
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
    if (naturalWonderPlacement === undefined) {
      throw new Error("Standard generation did not emit terminal natural-wonder evidence.");
    }
    if (resourcePlacement === undefined) {
      throw new Error("Standard generation did not emit terminal resource-placement evidence.");
    }
    const starts = readValidatedArtifact(context, placementStartArtifacts.startAssignment);
    expect(starts.seats.length).toBeGreaterThan(0);
    expect(starts.assigned).toBe(starts.seats.length);
    expect(starts.unseatedCount).toBe(0);
    expect(
      naturalWonderPlacement.summary.placedCount + naturalWonderPlacement.summary.rejectedCount
    ).toBe(naturalWonderPlacement.summary.plannedCount);
    for (const outcome of naturalWonderPlacement.outcomes) {
      if (outcome.status === "placed") {
        expect(adapter.getFeatureType(outcome.x, outcome.y)).toBe(outcome.featureType);
      }
    }
    expect(resourcePlacement.summary.plannedCount).toBe(resourcePlacement.outcomes.length);
    expect(resourcePlacement.summary.placedCount + resourcePlacement.summary.rejectedCount).toBe(
      resourcePlacement.summary.plannedCount
    );
    for (const outcome of resourcePlacement.outcomes) {
      if (outcome.status === "placed") {
        expect(adapter.getResourceType(outcome.x, outcome.y)).toBe(outcome.resourceType);
      }
    }
    expect(adapter.lookupMapInfo(preset.id)).toEqual(preset.mapInfo);
    expect(context.setup.latitudeBounds).toEqual(standardMapConfig.latitudeBounds);
  }, 30_000);

  it("keeps physical setup fixed while gameplay resource selection follows the game seed", () => {
    const alternateGameSeed =
      TEST_GAME_SEED === 2_147_483_647 ? TEST_GAME_SEED - 1 : TEST_GAME_SEED + 1;
    const baseline = runStandardRecipeTestMap({
      mapSeed: TEST_MAP_SEED,
      gameSeed: TEST_GAME_SEED,
    });
    const alternate = runStandardRecipeTestMap({
      mapSeed: TEST_MAP_SEED,
      gameSeed: alternateGameSeed,
    });
    const baselinePlan = readValidatedArtifact(
      baseline.context,
      resourceSiteArtifacts.resourcePlan
    );
    const alternatePlan = readValidatedArtifact(
      alternate.context,
      resourceSiteArtifacts.resourcePlan
    );
    const baselineAdjusted = readValidatedArtifact(
      baseline.context,
      resourceSupportArtifacts.resourcePlanAdjusted
    );
    const alternateAdjusted = readValidatedArtifact(
      alternate.context,
      resourceSupportArtifacts.resourcePlanAdjusted
    );

    expect(baseline.context.setup.mapSeed).toBe(TEST_MAP_SEED);
    expect(alternate.context.setup.mapSeed).toBe(TEST_MAP_SEED);
    expect(alternate.context.setup.dimensions).toEqual(baseline.context.setup.dimensions);
    expect(alternate.context.setup.latitudeBounds).toEqual(baseline.context.setup.latitudeBounds);
    expect(baselinePlan.seed).toBe(deriveStepSeed(TEST_GAME_SEED, "resources:selectResourceSites"));
    expect(alternatePlan.seed).toBe(
      deriveStepSeed(alternateGameSeed, "resources:selectResourceSites")
    );
    expect(alternatePlan.intents).not.toEqual(baselinePlan.intents);
    expect(baselineAdjusted.seed).toBe(
      deriveStepSeed(TEST_GAME_SEED, "resources:adjustResourceSupport")
    );
    expect(alternateAdjusted.seed).toBe(
      deriveStepSeed(alternateGameSeed, "resources:adjustResourceSupport")
    );
  }, 30_000);

  it("distinguishes an official map-size selection from custom maps with identical dimensions", () => {
    const tinyPreset = getCiv7StandardMapSizePreset("MAPSIZE_TINY");
    const official = runStandardRecipeTestMap({ presetId: tinyPreset.id });
    const custom = runStandardRecipeTestMap({ presetId: tinyPreset.id, mapInfo: {} });
    const officialDemand = readValidatedArtifact(
      official.context,
      resourceDemandArtifacts.resourceDemandPlan
    );
    const customDemand = readValidatedArtifact(
      custom.context,
      resourceDemandArtifacts.resourceDemandPlan
    );

    expect(custom.context.setup.dimensions).toEqual(official.context.setup.dimensions);
    expect(officialDemand.minimumAmountModifier).toBe(-4);
    expect(customDemand.minimumAmountModifier).toBe(0);
  }, 30_000);
});

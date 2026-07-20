import { describe, expect, it } from "bun:test";
import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";
import { Value } from "typebox/value";

import { PlotRiversStepContract } from "../../../../../../../../src/recipes/standard/stages/map-rivers/steps/plot-rivers/config.js";
import { PlotRiversStep } from "../../../../../../../../src/recipes/standard/stages/map-rivers/steps/plot-rivers/step.js";
import { standardMapConfig } from "../../../../../fixtures/standard-recipe.js";

const tinyPreset = getCiv7StandardMapSizePreset("MAPSIZE_TINY");
const setup = admitMapSetup({
  mapSeed: 123,
  dimensions: tinyPreset.dimensions,
  latitudeBounds: standardMapConfig.latitudeBounds,
});

function normalizeNavigableDensity(navigableRiverDensity: "normal" | "dense") {
  if (!PlotRiversStep.normalize) throw new Error("Plot rivers must normalize visible density.");
  const config = Value.Create(PlotRiversStepContract.schema);
  return validateSchemaValueForTest(
    PlotRiversStepContract.schema,
    PlotRiversStep.normalize(config, { setup, knobs: { navigableRiverDensity } }),
    "/map-rivers/plot-rivers"
  );
}

describe("map-rivers plot-rivers authoring", () => {
  it("selects more Civ-visible river coverage for the dense posture", () => {
    const normal = normalizeNavigableDensity("normal").selectNavigableRiverTerrain.config;
    const dense = normalizeNavigableDensity("dense").selectNavigableRiverTerrain.config;

    expect(dense.endpointDischargePercentileMin).toBeLessThan(
      normal.endpointDischargePercentileMin
    );
    expect(dense.targetMajorTileFraction).toBeGreaterThan(normal.targetMajorTileFraction);
  });
});

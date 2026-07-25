import { describe, expect, it } from "bun:test";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";

import mapRiversStage from "../../../../../../../../src/recipes/standard/stages/map/rivers/index.js";
import { PlotRiversStepContract } from "../../../../../../../../src/recipes/standard/stages/map/rivers/steps/plot-rivers/config.js";
import { PlotRiversStep } from "../../../../../../../../src/recipes/standard/stages/map/rivers/steps/plot-rivers/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../../setup.js";
import {
  createStandardRecipeTestConfig,
  standardMapConfig,
} from "../../../../../fixtures/standard-recipe.js";

const setup = admitMapSetup({
  mapSeed: TEST_MAP_SEED,
  dimensions: TEST_MAP_SIZE.dimensions,
  latitudeBounds: standardMapConfig.latitudeBounds,
});

function normalizeNavigableDensity(navigableRiverDensity: "normal" | "dense" | null) {
  if (!PlotRiversStep.normalize) throw new Error("Plot rivers must normalize its density knob.");
  const authored = createStandardRecipeTestConfig()["map-rivers"];
  authored.knobs.navigableRiverDensity = navigableRiverDensity;
  authored["plot-rivers"].endpointDischargePercentileMin = 0.82;
  authored["plot-rivers"].targetMajorTileFraction = 0.61;
  const stageConfig = validateSchemaValueForTest(
    mapRiversStage.surfaceSchema,
    authored,
    "/map-rivers"
  );
  const { knobs, rawSteps } = mapRiversStage.toInternal({ setup, stageConfig });
  const config = validateSchemaValueForTest(
    PlotRiversStepContract.schema,
    rawSteps["plot-rivers"],
    "/map-rivers/plot-rivers"
  );
  return validateSchemaValueForTest(
    PlotRiversStepContract.schema,
    PlotRiversStep.normalize(config, { setup, knobs }),
    "/map-rivers/plot-rivers"
  );
}

describe("map-rivers plot-rivers authoring", () => {
  it("selects more Civ-visible river coverage for the dense posture", () => {
    const normal = normalizeNavigableDensity("normal");
    const dense = normalizeNavigableDensity("dense");

    expect(dense.endpointDischargePercentileMin).toBeLessThan(
      normal.endpointDischargePercentileMin
    );
    expect(dense.targetMajorTileFraction).toBeGreaterThan(normal.targetMajorTileFraction);
  });

  it("preserves advanced projection thresholds when density authoring is disabled", () => {
    const advanced = normalizeNavigableDensity(null);

    expect(advanced.endpointDischargePercentileMin).toBe(0.82);
    expect(advanced.targetMajorTileFraction).toBe(0.61);
  });
});

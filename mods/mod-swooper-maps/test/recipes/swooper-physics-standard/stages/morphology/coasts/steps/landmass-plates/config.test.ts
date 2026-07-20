import { describe, expect, it } from "bun:test";
import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";

import morphologyCoastsStage from "../../../../../../../../src/recipes/standard/stages/morphology-coasts/index.js";
import { LandmassPlatesStepContract } from "../../../../../../../../src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/config.js";
import { LandmassPlatesStep } from "../../../../../../../../src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/step.js";
import {
  createStandardRecipeTestConfig,
  standardMapConfig,
} from "../../../../../fixtures/standard-recipe.js";

const tinyPreset = getCiv7StandardMapSizePreset("MAPSIZE_TINY");
const setup = admitMapSetup({
  mapSeed: 123,
  dimensions: tinyPreset.dimensions,
  latitudeBounds: standardMapConfig.latitudeBounds,
});

function normalizeSeaLevel(seaLevel: "earthlike" | "water-heavy") {
  if (!LandmassPlatesStep.normalize) throw new Error("Landmass plates must normalize sea level.");
  const stageConfig = createStandardRecipeTestConfig()["morphology-coasts"];
  stageConfig.waterCoverage.targetWaterPercent = 43;
  stageConfig.knobs.seaLevel = seaLevel;
  const admitted = validateSchemaValueForTest(
    morphologyCoastsStage.surfaceSchema,
    stageConfig,
    "/morphology-coasts"
  );
  const { knobs, rawSteps } = morphologyCoastsStage.toInternal({ setup, stageConfig: admitted });
  const config = validateSchemaValueForTest(
    LandmassPlatesStepContract.schema,
    rawSteps["landmass-plates"],
    "/morphology-coasts/landmass-plates"
  );
  return validateSchemaValueForTest(
    LandmassPlatesStepContract.schema,
    LandmassPlatesStep.normalize(config, { setup, knobs }),
    "/morphology-coasts/landmass-plates"
  );
}

describe("morphology landmass-plates authoring", () => {
  it("adds the water-heavy posture to the authored water target", () => {
    const neutral = normalizeSeaLevel("earthlike");
    const waterHeavy = normalizeSeaLevel("water-heavy");

    expect(neutral.seaLevel.config.targetWaterPercent).toBe(43);
    expect(waterHeavy.seaLevel.config.targetWaterPercent).toBe(58);
    expect(
      waterHeavy.seaLevel.config.targetWaterPercent - neutral.seaLevel.config.targetWaterPercent
    ).toBe(15);
  });
});

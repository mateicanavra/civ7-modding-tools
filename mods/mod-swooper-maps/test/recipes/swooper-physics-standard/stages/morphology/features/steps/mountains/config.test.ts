import { describe, expect, it } from "bun:test";
import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";

import morphologyFeaturesStage from "../../../../../../../../src/recipes/standard/stages/morphology-features/index.js";
import { MountainsStepContract } from "../../../../../../../../src/recipes/standard/stages/morphology-features/steps/mountains/config.js";
import { MountainsStep } from "../../../../../../../../src/recipes/standard/stages/morphology-features/steps/mountains/step.js";
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

function normalizeOrogeny(orogeny: "normal" | "high") {
  if (!MountainsStep.normalize) throw new Error("Mountains must normalize orogeny.");
  const stageConfig = createStandardRecipeTestConfig()["morphology-features"];
  stageConfig.mountainRanges.tectonicActivity = 0.8;
  stageConfig.mountainRanges.ridgeWidthTiles = 1;
  stageConfig.mountainRanges.foothillExtentTiles = 3;
  stageConfig.mountainRanges.interiorHighlandExpression = 0.55;
  stageConfig.mountainRanges.terrainTextureFractalMix = 0.5;
  stageConfig.mountainRanges.tectonicSignalSensitivity = 1;
  stageConfig.knobs.orogeny = orogeny;
  const admitted = validateSchemaValueForTest(
    morphologyFeaturesStage.surfaceSchema,
    stageConfig,
    "/morphology-features"
  );
  const { knobs, rawSteps } = morphologyFeaturesStage.toInternal({ setup, stageConfig: admitted });
  const config = validateSchemaValueForTest(
    MountainsStepContract.schema,
    rawSteps.mountains,
    "/morphology-features/mountains"
  );
  return validateSchemaValueForTest(
    MountainsStepContract.schema,
    MountainsStep.normalize(config, { setup, knobs }),
    "/morphology-features/mountains"
  );
}

describe("morphology mountain authoring", () => {
  it("applies one high-orogeny transform to every authored mountain family member", () => {
    const neutral = normalizeOrogeny("normal");
    const high = normalizeOrogeny("high");

    for (const key of ["ridges", "foothills", "roughLands"] as const) {
      const neutralSelection = neutral[key];
      const highSelection = high[key];
      expect(neutralSelection.config.tectonicIntensity).toBe(0.8);
      expect(highSelection.config.tectonicIntensity).toBeCloseTo(
        neutralSelection.config.tectonicIntensity * 1.25,
        6
      );
      expect(highSelection.config.mountainThreshold).toBeCloseTo(
        neutralSelection.config.mountainThreshold - 0.05,
        6
      );
      expect(highSelection.config.hillThreshold).toBeCloseTo(
        neutralSelection.config.hillThreshold - 0.03,
        6
      );
    }
  });
});

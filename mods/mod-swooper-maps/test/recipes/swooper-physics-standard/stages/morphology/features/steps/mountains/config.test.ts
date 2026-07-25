import { describe, expect, it } from "bun:test";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";

import { buildStandardRecipeDefaultConfig } from "../../../../../../../../src/recipes/standard/artifacts.js";
import morphologyFeaturesStage from "../../../../../../../../src/recipes/standard/stages/morphology/features/index.js";
import { MountainsStepContract } from "../../../../../../../../src/recipes/standard/stages/morphology/features/steps/mountains/config.js";
import { MountainsStep } from "../../../../../../../../src/recipes/standard/stages/morphology/features/steps/mountains/step.js";
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

function normalizeOrogeny(orogeny: "normal" | "high") {
  if (!MountainsStep.normalize) throw new Error("Mountains must normalize orogeny.");
  const stageConfig = createStandardRecipeTestConfig()["morphology-features"];
  const mountainRanges = stageConfig.knobs.mountainRanges;
  if (!mountainRanges) throw new Error("The test config must author coupled mountain ranges.");
  mountainRanges.tectonicActivity = 0.8;
  mountainRanges.ridgeWidthTiles = 1;
  mountainRanges.foothillExtentTiles = 3;
  mountainRanges.interiorHighlandExpression = 0.55;
  mountainRanges.terrainTextureFractalMix = 0.5;
  mountainRanges.tectonicSignalSensitivity = 1;
  stageConfig.mountains.ridges.config.tectonicIntensity = 9;
  stageConfig.mountains.foothills.config.tectonicIntensity = 8;
  stageConfig.mountains.roughLands.config.tectonicIntensity = 7;
  stageConfig.knobs.orogeny = orogeny;
  return normalizeStageConfig(stageConfig);
}

function normalizeStageConfig(
  stageConfig: ReturnType<typeof createStandardRecipeTestConfig>["morphology-features"]
) {
  if (!MountainsStep.normalize) throw new Error("Mountains must normalize its authoring controls.");
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
  it("keeps the Standard default coupled to its established range posture", () => {
    const stageConfig = structuredClone(buildStandardRecipeDefaultConfig()["morphology-features"]);
    const normalized = normalizeStageConfig(stageConfig);

    expect(normalized.ridges.config.mountainRangeSpacingTiles).toBe(20);
    expect(normalized.ridges.config.mountainRangeLengthTiles).toBe(22);
    expect(normalized.ridges.config.mountainThreshold).toBeCloseTo(0.25, 6);
    expect(normalized.ridges.config.mountainMaxFraction).toBeCloseTo(0.094, 6);
  });

  it("applies coupled range authoring before one high-orogeny family transform", () => {
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

  it("preserves independently authored operation envelopes when coupled authoring is disabled", () => {
    const stageConfig = createStandardRecipeTestConfig()["morphology-features"];
    stageConfig.knobs.mountainRanges = null;
    stageConfig.knobs.orogeny = "normal";
    stageConfig.mountains.ridges.config.tectonicIntensity = 0.41;
    stageConfig.mountains.foothills.config.tectonicIntensity = 0.52;
    stageConfig.mountains.roughLands.config.tectonicIntensity = 0.63;

    const normalized = normalizeStageConfig(stageConfig);

    expect(normalized.ridges.config.tectonicIntensity).toBe(0.41);
    expect(normalized.foothills.config.tectonicIntensity).toBe(0.52);
    expect(normalized.roughLands.config.tectonicIntensity).toBe(0.63);
  });
});

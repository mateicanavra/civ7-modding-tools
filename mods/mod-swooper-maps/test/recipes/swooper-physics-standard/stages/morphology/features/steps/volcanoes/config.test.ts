import { describe, expect, it } from "bun:test";
import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";

import morphologyFeaturesStage from "../../../../../../../../src/recipes/standard/stages/morphology-features/index.js";
import { VolcanoesStepContract } from "../../../../../../../../src/recipes/standard/stages/morphology-features/steps/volcanoes/config.js";
import { VolcanoesStep } from "../../../../../../../../src/recipes/standard/stages/morphology-features/steps/volcanoes/step.js";
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

function normalizeVolcanism(volcanism: "normal" | "high") {
  if (!VolcanoesStep.normalize) throw new Error("Volcanoes must normalize volcanism.");
  const stageConfig = createStandardRecipeTestConfig()["morphology-features"];
  stageConfig.volcanoes.baseDensity = 0.01;
  stageConfig.volcanoes.hotspotWeight = 0.12;
  stageConfig.volcanoes.convergentMultiplier = 2.4;
  stageConfig.knobs.volcanism = volcanism;
  const admitted = validateSchemaValueForTest(
    morphologyFeaturesStage.surfaceSchema,
    stageConfig,
    "/morphology-features"
  );
  const { knobs, rawSteps } = morphologyFeaturesStage.toInternal({ setup, stageConfig: admitted });
  const config = validateSchemaValueForTest(
    VolcanoesStepContract.schema,
    rawSteps.volcanoes,
    "/morphology-features/volcanoes"
  );
  return validateSchemaValueForTest(
    VolcanoesStepContract.schema,
    VolcanoesStep.normalize(config, { setup, knobs }),
    "/morphology-features/volcanoes"
  );
}

describe("morphology volcano authoring", () => {
  it("multiplies authored density and tectonic weights for high volcanism", () => {
    const neutral = normalizeVolcanism("normal").volcanoes.config;
    const high = normalizeVolcanism("high").volcanoes.config;

    expect(neutral.baseDensity).toBe(0.01);
    expect(neutral.hotspotWeight).toBe(0.12);
    expect(neutral.convergentMultiplier).toBe(2.4);
    expect(high.baseDensity).toBeCloseTo(neutral.baseDensity * 1.5, 6);
    expect(high.hotspotWeight).toBeCloseTo(neutral.hotspotWeight * 1.5, 6);
    expect(high.convergentMultiplier).toBeCloseTo(neutral.convergentMultiplier * 1.25, 6);
  });
});

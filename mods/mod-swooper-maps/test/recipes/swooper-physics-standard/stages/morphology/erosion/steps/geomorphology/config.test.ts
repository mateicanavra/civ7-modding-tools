import { describe, expect, it } from "bun:test";
import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";

import morphologyErosionStage from "../../../../../../../../src/recipes/standard/stages/morphology-erosion/index.js";
import { GeomorphologyStepContract } from "../../../../../../../../src/recipes/standard/stages/morphology-erosion/steps/geomorphology/config.js";
import { GeomorphologyStep } from "../../../../../../../../src/recipes/standard/stages/morphology-erosion/steps/geomorphology/step.js";
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

function normalizeErosion(erosion: "normal" | "high") {
  if (!GeomorphologyStep.normalize) throw new Error("Geomorphology must normalize erosion.");
  const stageConfig = createStandardRecipeTestConfig()["morphology-erosion"];
  stageConfig.geomorphicCycle.geomorphology.fluvial.rate = 0.2;
  stageConfig.geomorphicCycle.geomorphology.diffusion.rate = 0.3;
  stageConfig.geomorphicCycle.geomorphology.deposition.rate = 0.1;
  stageConfig.knobs.erosion = erosion;
  const admitted = validateSchemaValueForTest(
    morphologyErosionStage.surfaceSchema,
    stageConfig,
    "/morphology-erosion"
  );
  const { knobs, rawSteps } = morphologyErosionStage.toInternal({ setup, stageConfig: admitted });
  const config = validateSchemaValueForTest(
    GeomorphologyStepContract.schema,
    rawSteps.geomorphology,
    "/morphology-erosion/geomorphology"
  );
  return validateSchemaValueForTest(
    GeomorphologyStepContract.schema,
    GeomorphologyStep.normalize(config, { setup, knobs }),
    "/morphology-erosion/geomorphology"
  );
}

describe("morphology geomorphology authoring", () => {
  it("multiplies every authored process rate for the high-erosion posture", () => {
    const neutral = normalizeErosion("normal").geomorphology.config.geomorphology;
    const high = normalizeErosion("high").geomorphology.config.geomorphology;

    expect(neutral.fluvial.rate).toBe(0.2);
    expect(neutral.diffusion.rate).toBe(0.3);
    expect(neutral.deposition.rate).toBe(0.1);
    expect(high.fluvial.rate).toBeCloseTo(neutral.fluvial.rate * 1.35, 6);
    expect(high.diffusion.rate).toBeCloseTo(neutral.diffusion.rate * 1.35, 6);
    expect(high.deposition.rate).toBeCloseTo(neutral.deposition.rate * 1.35, 6);
  });
});

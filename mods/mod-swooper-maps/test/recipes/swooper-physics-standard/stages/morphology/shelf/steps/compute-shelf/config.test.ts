import { describe, expect, it } from "bun:test";
import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";
import { Value } from "typebox/value";

import morphologyShelfStage from "../../../../../../../../src/recipes/standard/stages/morphology-shelf/index.js";
import { ComputeShelfStepContract } from "../../../../../../../../src/recipes/standard/stages/morphology-shelf/steps/compute-shelf/config.js";
import { ComputeShelfStep } from "../../../../../../../../src/recipes/standard/stages/morphology-shelf/steps/compute-shelf/step.js";
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

function normalizeShelfWidth(shelfWidth: "narrow" | "normal" | "wide") {
  if (!ComputeShelfStep.normalize) throw new Error("Compute-shelf must normalize shelf width.");
  const stageConfig = createStandardRecipeTestConfig()["morphology-shelf"];
  stageConfig.shelf.breakGradientScale = 0.8;
  stageConfig.knobs.shelfWidth = shelfWidth;
  const admitted = validateSchemaValueForTest(
    morphologyShelfStage.surfaceSchema,
    stageConfig,
    "/morphology-shelf"
  );
  const { knobs, rawSteps } = morphologyShelfStage.toInternal({ setup, stageConfig: admitted });
  const config = validateSchemaValueForTest(
    ComputeShelfStepContract.schema,
    Value.Default(ComputeShelfStepContract.schema, Value.Clone(rawSteps["compute-shelf"])),
    "/morphology-shelf/compute-shelf"
  );
  return validateSchemaValueForTest(
    ComputeShelfStepContract.schema,
    ComputeShelfStep.normalize(config, { setup, knobs }),
    "/morphology-shelf/compute-shelf"
  );
}

describe("morphology compute-shelf authoring", () => {
  it("scales the authored break-gradient threshold for narrow and wide postures", () => {
    const neutral = normalizeShelfWidth("normal").shelfMask.config.breakGradientScale;
    const narrow = normalizeShelfWidth("narrow").shelfMask.config.breakGradientScale;
    const wide = normalizeShelfWidth("wide").shelfMask.config.breakGradientScale;

    expect(neutral).toBe(0.8);
    expect(narrow).toBeCloseTo(neutral * 0.75, 6);
    expect(wide).toBeCloseTo(neutral * 1.25, 6);
  });
});

import { describe, expect, it } from "bun:test";
import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";
import { Value } from "typebox/value";

import morphologyCoastsStage from "../../../../../../../../src/recipes/standard/stages/morphology-coasts/index.js";
import { RuggedCoastsStepContract } from "../../../../../../../../src/recipes/standard/stages/morphology-coasts/steps/rugged-coasts/config.js";
import { RuggedCoastsStep } from "../../../../../../../../src/recipes/standard/stages/morphology-coasts/steps/rugged-coasts/step.js";
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

function normalizeRuggedness(coastRuggedness: "normal" | "rugged") {
  if (!RuggedCoastsStep.normalize) throw new Error("Rugged coasts must normalize ruggedness.");
  const stageConfig = createStandardRecipeTestConfig()["morphology-coasts"];
  stageConfig.coastlineShape.plateBias.bayWeight = 0.5;
  stageConfig.coastlineShape.plateBias.bayNoiseBonus = 0.7;
  stageConfig.coastlineShape.plateBias.fjordWeight = 0.4;
  stageConfig.knobs.coastRuggedness = coastRuggedness;
  const admitted = validateSchemaValueForTest(
    morphologyCoastsStage.surfaceSchema,
    stageConfig,
    "/morphology-coasts"
  );
  const { knobs, rawSteps } = morphologyCoastsStage.toInternal({ setup, stageConfig: admitted });
  const config = validateSchemaValueForTest(
    RuggedCoastsStepContract.schema,
    Value.Default(RuggedCoastsStepContract.schema, Value.Clone(rawSteps["rugged-coasts"])),
    "/morphology-coasts/rugged-coasts"
  );
  return validateSchemaValueForTest(
    RuggedCoastsStepContract.schema,
    RuggedCoastsStep.normalize(config, { setup, knobs }),
    "/morphology-coasts/rugged-coasts"
  );
}

describe("morphology rugged-coasts authoring", () => {
  it("amplifies every authored bay and fjord weight for the rugged posture", () => {
    const neutral = normalizeRuggedness("normal").coastlines.config.coast.plateBias;
    const rugged = normalizeRuggedness("rugged").coastlines.config.coast.plateBias;

    expect(neutral.bayWeight).toBe(0.5);
    expect(neutral.bayNoiseBonus).toBe(0.7);
    expect(neutral.fjordWeight).toBe(0.4);
    expect(rugged.bayWeight).toBeCloseTo(neutral.bayWeight * 1.4, 6);
    expect(rugged.bayNoiseBonus).toBeCloseTo(neutral.bayNoiseBonus * 1.4, 6);
    expect(rugged.fjordWeight).toBeCloseTo(neutral.fjordWeight * 1.4, 6);
  });
});

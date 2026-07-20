import { describe, expect, it } from "bun:test";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";
import { Value } from "typebox/value";

import foundationTectonicsStage from "../../../../../../../../src/recipes/standard/stages/foundation-tectonics/index.js";
import { TectonicsStepContract } from "../../../../../../../../src/recipes/standard/stages/foundation-tectonics/steps/tectonics/config.js";
import { TectonicsStep } from "../../../../../../../../src/recipes/standard/stages/foundation-tectonics/steps/tectonics/step.js";
import { TEST_MAP_SIZE } from "../../../../../../../map-size.js";
import {
  createStandardRecipeTestConfig,
  standardMapConfig,
} from "../../../../../fixtures/standard-recipe.js";

const setup = admitMapSetup({
  mapSeed: 123,
  dimensions: TEST_MAP_SIZE.dimensions,
  latitudeBounds: standardMapConfig.latitudeBounds,
});

function normalizePlateActivity(plateActivity: number) {
  if (!TectonicsStep.normalize) throw new Error("Tectonics must normalize plate activity.");
  const stageConfig = createStandardRecipeTestConfig()["foundation-tectonics"];
  stageConfig.knobs.plateActivity = plateActivity;
  const admitted = validateSchemaValueForTest(
    foundationTectonicsStage.surfaceSchema,
    stageConfig,
    "/foundation-tectonics"
  );
  const { knobs, rawSteps } = foundationTectonicsStage.toInternal({
    setup,
    stageConfig: admitted,
  });
  const config = validateSchemaValueForTest(
    TectonicsStepContract.schema,
    Value.Default(TectonicsStepContract.schema, Value.Clone(rawSteps.tectonics)),
    "/foundation-tectonics/tectonics"
  );
  return validateSchemaValueForTest(
    TectonicsStepContract.schema,
    TectonicsStep.normalize(config, { setup, knobs }),
    "/foundation-tectonics/tectonics"
  );
}

describe("foundation tectonics authoring", () => {
  it("scales orogeny emission without changing motion or regime selection", () => {
    const neutral = normalizePlateActivity(0.5);
    const active = normalizePlateActivity(0.8);

    expect(neutral.computeEraTectonicFields.config.orogenyActivityGain).toBeCloseTo(1, 6);
    expect(active.computeEraTectonicFields.config.orogenyActivityGain).toBeCloseTo(1.12, 6);
    expect(active.computePlateMotion).toEqual(neutral.computePlateMotion);
    expect(active.computeTectonicSegments).toEqual(neutral.computeTectonicSegments);
  });
});

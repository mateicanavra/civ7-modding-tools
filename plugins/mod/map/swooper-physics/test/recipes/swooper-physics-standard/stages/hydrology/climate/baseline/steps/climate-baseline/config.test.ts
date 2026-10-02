import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";

import hydrologyClimateBaselineStage from "../../../../../../../../../src/recipes/standard/stages/hydrology/climate/baseline/index.js";
import { admitStandardMapConfig } from "../../../../../../../../../src/maps/configs/canonical.js";
import { config as climateBaselineConfig } from "../../../../../../../../../src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/config.js";
import { ClimateBaselineStep } from "../../../../../../../../../src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../../../setup.js";
import {
  createStandardRecipeTestConfig,
  standardMapConfig,
} from "../../../../../../fixtures/standard-recipe.js";

const setup = admitMapSetup({
  mapSeed: TEST_MAP_SEED,
  dimensions: TEST_MAP_SIZE.dimensions,
  latitudeBounds: standardMapConfig.latitudeBounds,
});

function normalizeDryness(dryness: "wet" | "mix") {
  if (!ClimateBaselineStep.normalize) throw new Error("Climate baseline must normalize dryness.");
  const stageConfig = createStandardRecipeTestConfig()["hydrology-climate-baseline"];
  const precipitation = stageConfig["climate-baseline"].computePrecipitation;
  if (precipitation.strategy !== "vector") {
    throw new Error("Climate baseline must author vector precipitation.");
  }
  precipitation.config.rainfallScale = 100;
  stageConfig.knobs.dryness = dryness;
  stageConfig.knobs.temperature = "temperate";
  stageConfig.knobs.seasonality = "normal";
  stageConfig.knobs.oceanCoupling = "earthlike";
  const admitted = validateSchemaValueForTest(
    hydrologyClimateBaselineStage.surfaceSchema,
    stageConfig,
    "/hydrology-climate-baseline"
  );
  const { knobs, rawSteps } = hydrologyClimateBaselineStage.toInternal({
    setup,
    stageConfig: admitted,
  });
  const config = validateSchemaValueForTest(
    climateBaselineConfig.schema,
    rawSteps["climate-baseline"],
    "/hydrology-climate-baseline/climate-baseline"
  );
  return validateSchemaValueForTest(
    climateBaselineConfig.schema,
    ClimateBaselineStep.normalize(config, { setup, knobs }),
    "/hydrology-climate-baseline/climate-baseline"
  );
}

describe("hydrology climate-baseline authoring", () => {
  it("preserves each shipped map's demand coefficients at the baseline owner", () => {
    const directory = new URL("../../../../../../../../../src/maps/configs/", import.meta.url);
    const filenames = readdirSync(directory).filter((name) => name.endsWith(".config.json"));
    expect(filenames.sort()).toEqual([
      "sundered-archipelago.config.json",
      "swooper-desert-mountains.config.json",
      "swooper-earthlike.config.json",
    ]);
    for (const filename of filenames) {
      const map = admitStandardMapConfig(
        JSON.parse(readFileSync(new URL(filename, directory), "utf8"))
      );
      const baseline = map.config["hydrology-climate-baseline"]["climate-baseline"];
      const refine = map.config["hydrology-climate-refine"]["climate-refine"];
      const expected =
        filename === "swooper-desert-mountains.config.json"
          ? [0, 35, 40, 140, 0.45]
          : filename === "sundered-archipelago.config.json"
            ? [0, 35, 18, 75, 0.55]
            : [0, 36, 19, 82, 0.5];
      const parameters = baseline.potentialDemand;
      expect([
        parameters.tMinC,
        parameters.tMaxC,
        parameters.petBase,
        parameters.petTemperatureWeight,
        parameters.humidityDampening,
      ]).toEqual(expected);
      expect(refine.computeLandWaterBudget.config).toEqual({});
      expect(refine.computePotentialDemand.config).toEqual({});
    }
  });

  it("rejects invalid demand calibration at the baseline config boundary", () => {
    const config = normalizeDryness("mix");
    expect(() =>
      validateSchemaValueForTest(
        climateBaselineConfig.schema,
        {
          ...config,
          potentialDemand: { ...config.potentialDemand, petBase: -1 },
        },
        "/climate-baseline"
      )
    ).toThrow();
    expect(config.potentialDemand).toEqual(normalizeDryness("wet").potentialDemand);
  });

  it("scales authored rainfall upward for the wet posture", () => {
    const neutral = normalizeDryness("mix");
    const wet = normalizeDryness("wet");
    if (neutral.computePrecipitation.strategy !== "vector") {
      throw new Error("Climate baseline must retain vector precipitation.");
    }
    if (wet.computePrecipitation.strategy !== "vector") {
      throw new Error("Climate baseline must retain vector precipitation.");
    }

    expect(neutral.computePrecipitation.config.rainfallScale).toBe(100);
    expect(wet.computePrecipitation.config.rainfallScale).toBeCloseTo(115, 6);
  });
});

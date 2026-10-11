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

function normalizeDryness(dryness: "wet" | "mix" | "dry", authoredWetnessScale = 1) {
  if (!ClimateBaselineStep.normalize) throw new Error("Climate baseline must normalize dryness.");
  const stageConfig = createStandardRecipeTestConfig()["hydrology-climate-baseline"];
  const forcing = stageConfig["climate-baseline"].computeMoistureForcing;
  if (forcing.strategy !== "source-limited") {
    throw new Error("Climate baseline must author source-limited forcing.");
  }
  forcing.config.wetnessScale = authoredWetnessScale;
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
      expect(baseline.regionalResponse).toEqual({ gainC: 0 });
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

  it("requires the explicit disabled candidate selector and rejects negative gains", () => {
    const config = normalizeDryness("mix");
    expect(config.regionalResponse).toEqual({ gainC: 0 });
    const { regionalResponse, ...withoutSelector } = config;
    expect(regionalResponse.gainC).toBe(0);
    for (const invalid of [withoutSelector, { ...config, regionalResponse: { gainC: -1 } }]) {
      expect(() => validateSchemaValueForTest(
        climateBaselineConfig.schema, invalid, "/climate-baseline/regional-response"
      )).toThrow();
    }
    expect(validateSchemaValueForTest(
      climateBaselineConfig.schema, { ...config, regionalResponse: { gainC: 6 } }, "/climate-baseline/regional-response"
    ).regionalResponse).toEqual({ gainC: 6 });
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

  it("scales authored marine supply once for the wet posture", () => {
    const neutral = normalizeDryness("mix");
    const wet = normalizeDryness("wet");
    if (neutral.computeMoistureForcing.strategy !== "source-limited") {
      throw new Error("Climate baseline must retain source-limited forcing.");
    }
    if (wet.computeMoistureForcing.strategy !== "source-limited") {
      throw new Error("Climate baseline must retain source-limited forcing.");
    }

    expect(neutral.computeMoistureForcing.config.wetnessScale).toBe(1);
    expect(wet.computeMoistureForcing.config.wetnessScale).toBeCloseTo(1.15, 6);
    expect(wet.computeMoistureForcing.config.marineSourceRate).toBe(900);
    expect(wet.computeMoistureForcing.config.transportSpeed).toBe(80);
    expect(wet.computeMoistureForcing.config.backgroundExtractionRate).toBe(neutral.computeMoistureForcing.config.backgroundExtractionRate);
    expect(wet.computeMoistureForcing.config.ascentExtractionRate).toBe(neutral.computeMoistureForcing.config.ascentExtractionRate);
    for (const [dryness, multiplier] of [["wet", 1.15], ["mix", 1], ["dry", 0.85]] as const) {
      const normalized = normalizeDryness(dryness, 0.65);
      expect(normalized.computeMoistureForcing.config).toEqual({
        ...neutral.computeMoistureForcing.config,
        wetnessScale: 0.65 * multiplier,
      });
      expect(normalized.computeAtmosphericCirculation).toEqual(neutral.computeAtmosphericCirculation);
      expect(normalized.computeThermalState).toEqual(neutral.computeThermalState);
      expect(normalized.computeOceanSurfaceCurrents).toEqual(neutral.computeOceanSurfaceCurrents);
    }
  });
});

import { describe, expect, it } from "bun:test";

import { createStage, Type } from "@swooper/mapgen-core/authoring";
import {
  compileRecipeConfig,
  RecipeCompileError,
} from "@swooper/mapgen-core/compiler/recipe-compile";

import standardRecipe, { compileOpsById } from "../src/recipes/standard/recipe.js";
import pedologyStep from "../src/recipes/standard/stages/ecology-pedology/steps/pedology/index.js";

const baseSettings = {
  seed: 42,
  dimensions: { width: 2, height: 2 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
};

const foundationConfig = {
  "foundation-mantle": { knobs: { plateCount: 28 } },
  "foundation-lithosphere": { knobs: { plateCount: 28 } },
  "foundation-tectonics": { knobs: { plateActivity: 0.5 } },
};

function expectCompileError(fn: () => void): RecipeCompileError {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(RecipeCompileError);
    return error as RecipeCompileError;
  }
  throw new Error("Expected RecipeCompileError");
}

function errorPathsFor(config: Record<string, unknown>): string[] {
  const err = expectCompileError(() => standardRecipe.compileConfig(baseSettings, config as any));
  return err.errors.filter((item) => item.code === "config.invalid").map((item) => item.path);
}

describe("standard recipe compile errors", () => {
  it("rejects retired public mirror keys at stage roots", () => {
    const paths = errorPathsFor({
      ...foundationConfig,
      "foundation-mantle": { meshResolution: { cellCount: 128 } },
      "foundation-lithosphere": { platePartition: { referenceArea: 4536 } },
      "hydrology-climate-baseline": {
        seasonalCycle: { modeCount: 2 },
        atmosphericCirculation: { strategy: "latitude" },
      },
      "hydrology-hydrography": { riverNetwork: { majorPercentile: 0.9 } },
      "hydrology-climate-refine": { precipitationRefinement: { riverCorridor: {} } },
      "ecology-pedology": { soilClassification: { strategy: "coastal-shelf" } },
      "ecology-biomes": { biomeClassification: {} },
      "ecology-features": {
        wetlandPlanning: { minConfidence01: 2 },
        plotEffectCoverage: { snow: { coveragePct: 80 } },
      },
      "map-rivers": { riverProjection: { minLength: 0 } },
      "map-ecology": { biomeBindings: { marine: "BIOME_DESERT" } },
      placement: {
        resources: { candidateResourceTypes: [1, 2, 3] },
        starts: { overrides: { startSectors: [] } },
      },
    });

    expect(paths).toEqual(
      expect.arrayContaining([
        "/config/foundation-mantle/meshResolution",
        "/config/foundation-lithosphere/platePartition",
        "/config/hydrology-climate-baseline/seasonalCycle",
        "/config/hydrology-climate-baseline/atmosphericCirculation",
        "/config/hydrology-hydrography/riverNetwork",
        "/config/hydrology-climate-refine/precipitationRefinement",
        "/config/ecology-pedology/soilClassification",
        "/config/ecology-biomes/biomeClassification",
        "/config/ecology-features/wetlandPlanning",
        "/config/ecology-features/plotEffectCoverage",
        "/config/map-rivers/riverProjection",
        "/config/map-ecology/biomeBindings",
        "/config/placement/resources",
        "/config/placement/starts",
      ])
    );
  });

  it("rejects unknown stage public keys", () => {
    expect(errorPathsFor({ ...foundationConfig, "ecology-biomes": { extraField: {} } })).toContain(
      "/config/ecology-biomes/extraField"
    );
  });

  it("points retired top-level Ecology configs at the current split stages", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        ecology: {},
      } as any)
    );

    const legacyEcologyError = err.errors.find((item) => item.path === "/config/ecology");
    expect(legacyEcologyError?.message).toContain('"ecology-features"');
    expect(legacyEcologyError?.message).not.toContain("ecology-features-score");
  });

  it("accepts current flat step envelopes far enough to validate the operation schema", () => {
    const paths = errorPathsFor({
      ...foundationConfig,
      "ecology-biomes": {
        biomes: {
          classify: {
            strategy: "default",
            config: {
              temperature: { equator: "hot" },
            },
          },
        },
      },
      "hydrology-climate-baseline": {
        "climate-baseline": {
          computeRadiativeForcing: {
            strategy: "default",
            config: { equatorInsolation: 3 },
          },
        },
      },
      placement: {
        "plan-resources": {
          selectSites: {
            strategy: "default",
            config: { density: 75 },
          },
        },
      },
    });

    expect(paths).toEqual(
      expect.arrayContaining([
        "/config/ecology-biomes/biomes/classify/config/temperature/equator",
        "/config/hydrology-climate-baseline/climate-baseline/computeRadiativeForcing/config/equatorInsolation",
        "/config/placement/plan-resources/selectSites/config/density",
      ])
    );
  });

  it("rejects malformed current step envelopes", () => {
    const paths = errorPathsFor({
      ...foundationConfig,
      "ecology-biomes": {
        biomes: {
          classify: 123,
        },
      },
      "hydrology-hydrography": {
        lakes: {
          planLakes: 123,
        },
      },
    });

    expect(paths).toEqual(
      expect.arrayContaining([
        "/config/ecology-biomes/biomes/classify",
        "/config/hydrology-hydrography/lakes/planLakes",
      ])
    );
  });

  it("flags unknown step ids returned by stage compile", () => {
    const brokenStage = createStage({
      id: "ecology-pedology",
      knobsSchema: Type.Object({}, { additionalProperties: false, default: {} }),
      public: Type.Object(
        {
          pedology: Type.Optional(pedologyStep.contract.schema),
        },
        { additionalProperties: false, default: {} }
      ),
      compile: ({ config }) => ({
        "unknown-step": config.pedology,
      }),
      steps: [pedologyStep],
    });

    const err = expectCompileError(() =>
      compileRecipeConfig({
        env: baseSettings,
        recipe: { stages: [brokenStage] },
        config: { "ecology-pedology": { pedology: {} } },
        compileOpsById,
      })
    );

    expect(
      err.errors.some(
        (item) => item.code === "stage.unknown-step-id" && item.stepId === "unknown-step"
      )
    ).toBe(true);
  });
});

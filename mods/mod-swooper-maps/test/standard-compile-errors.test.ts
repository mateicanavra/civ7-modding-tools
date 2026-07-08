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
  it("rejects raw internal step keys at semantic stage roots", () => {
    const paths = errorPathsFor({
      ...foundationConfig,
      "foundation-mantle": { mesh: { computeMesh: { strategy: "default", config: {} } } },
      "foundation-lithosphere": { "plate-graph": { computePlateGraph: {} } },
      "foundation-orogeny": {
        "crust-evolution": { computeCrustEvolution: { strategy: "default", config: {} } },
      },
      "hydrology-climate-baseline": {
        "climate-baseline": { computeRadiativeForcing: { strategy: "default", config: {} } },
      },
      "hydrology-hydrography": { rivers: { projectRiverNetwork: {} } },
      "hydrology-climate-refine": { "climate-refine": { computePrecipitation: {} } },
      "ecology-pedology": { pedology: { classify: { strategy: "coastal-shelf" } } },
      "ecology-biomes": { biomes: { classify: {} } },
      "ecology-features": {
        "plan-wetlands": { planWetlands: {} },
        "plan-plot-effects": { plotEffects: {} },
      },
      "map-rivers": { "plot-rivers": { selectNavigableRiverTerrain: {} } },
      "map-ecology": { "plot-biomes": { bindings: { marine: "BIOME_DESERT" } } },
      placement: {
        "plan-resources": { selectSites: { config: {} } },
        "assign-starts": { starts: { config: {} } },
      },
    });

    expect(paths).toEqual(
      expect.arrayContaining([
        "/config/foundation-mantle/mesh",
        "/config/foundation-lithosphere/plate-graph",
        "/config/foundation-orogeny/crust-evolution",
        "/config/hydrology-climate-baseline/climate-baseline",
        "/config/hydrology-hydrography/rivers",
        "/config/hydrology-climate-refine/climate-refine",
        "/config/ecology-pedology/pedology",
        "/config/ecology-biomes/biomes",
        "/config/ecology-features/plan-wetlands",
        "/config/ecology-features/plan-plot-effects",
        "/config/map-rivers/plot-rivers",
        "/config/map-ecology/plot-biomes",
        "/config/placement/plan-resources",
        "/config/placement/assign-starts",
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

  it("accepts current semantic public keys far enough to validate the operation schema", () => {
    const paths = errorPathsFor({
      ...foundationConfig,
      "ecology-biomes": {
        biomeClassification: {
          temperature: { equator: "hot" },
        },
      },
      "hydrology-climate-baseline": {
        solarForcing: { equatorInsolation: 3 },
      },
      placement: {
        resources: { density: 75 },
      },
    });

    expect(paths).toEqual(
      expect.arrayContaining([
        "/config/ecology-biomes/biomeClassification/temperature/equator",
        "/config/hydrology-climate-baseline/solarForcing/equatorInsolation",
        "/config/placement/resources/density",
      ])
    );
  });

  it("rejects malformed current semantic public values", () => {
    const paths = errorPathsFor({
      ...foundationConfig,
      "ecology-biomes": {
        biomeClassification: 123,
      },
      "hydrology-hydrography": {
        lakes: 123,
      },
    });

    expect(paths).toEqual(
      expect.arrayContaining([
        "/config/ecology-biomes/biomeClassification",
        "/config/hydrology-hydrography/lakes",
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

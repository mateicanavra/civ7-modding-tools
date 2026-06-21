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
  "foundation-projection": { knobs: { plateActivity: 0.5 } },
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

describe("standard recipe compile errors (map-rivers)", () => {
  it("rejects retired map-rivers riverDensity alias", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        "map-rivers": {
          knobs: { riverDensity: "dense" },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" && item.path === "/config/map-rivers/knobs/riverDensity"
      )
    ).toBe(true);
  });
});

describe("standard recipe compile errors (ecology)", () => {
  it("flags unknown stage public keys", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        "ecology-biomes": {
          extraField: {},
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" && item.path === "/config/ecology-biomes/extraField"
      )
    ).toBe(true);
  });

  it("points legacy top-level Ecology configs at the current split stages", () => {
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

  it("rejects legacy Ecology step/op envelope config", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        "ecology-biomes": {
          biomes: {
            classify: 123,
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" && item.path.includes("/config/ecology-biomes/biomes")
      )
    ).toBe(true);
  });

  it("rejects stale Ecology public strategy selectors", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        "ecology-pedology": {
          soilClassification: {
            strategy: "coastal-shelf",
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/ecology-pedology/soilClassification/strategy")
      )
    ).toBe(true);
  });

  it("rejects Ecology plot-effect engine selector leakage", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        "ecology-features": {
          plotEffectCoverage: {
            snow: {
              selectors: {
                light: { typeName: "PLOTEFFECT_SNOW_LIGHT_PERMANENT" },
              },
            },
            sand: {
              selector: { typeName: "PLOTEFFECT_SAND" },
            },
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/ecology-features/plotEffectCoverage/snow/selectors")
      )
    ).toBe(true);
    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/ecology-features/plotEffectCoverage/sand/selector")
      )
    ).toBe(true);
  });

  it("rejects out-of-range Ecology public numeric controls", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        "ecology-features": {
          wetlandPlanning: {
            minConfidence01: 2,
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/ecology-features/wetlandPlanning/minConfidence01")
      )
    ).toBe(true);
  });

  it("flags unknown keys in Foundation authoring surface", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        "foundation-mantle": {
          knobs: { plateCount: 28 },
          forbiddenKinematics: { velocity: [1, 2, 3] },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/foundation-mantle/forbiddenKinematics")
      )
    ).toBe(true);
  });

  it("rejects legacy Foundation step/op envelope config", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        "foundation-mantle": {
          mesh: {
            computeMesh: {
              strategy: "default",
              config: { plateCount: 28 },
            },
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" && item.path.includes("/config/foundation-mantle/mesh")
      )
    ).toBe(true);
  });

  it("rejects derived Foundation mesh cellCount on the public surface", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        "foundation-mantle": {
          meshResolution: {
            cellCount: 128,
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/foundation-mantle/meshResolution/cellCount")
      )
    ).toBe(true);
  });

  it("rejects Foundation reference-area scaling fields on the public surface", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        "foundation-mantle": {
          meshResolution: {
            referenceArea: 4536,
            plateScalePower: 0.8,
          },
        },
        "foundation-lithosphere": {
          platePartition: {
            referenceArea: 4536,
            plateScalePower: 0.8,
          },
        },
      } as any)
    );

    for (const path of [
      "/config/foundation-mantle/meshResolution/referenceArea",
      "/config/foundation-mantle/meshResolution/plateScalePower",
      "/config/foundation-lithosphere/platePartition/referenceArea",
      "/config/foundation-lithosphere/platePartition/plateScalePower",
    ]) {
      expect(
        err.errors.some((item) => item.code === "config.invalid" && item.path.includes(path))
      ).toBe(true);
    }
  });

  it("rejects legacy Morphology step/op envelope config", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        "morphology-coasts": {
          "landmass-plates": {
            seaLevel: {
              strategy: "default",
              config: {},
            },
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/morphology-coasts/landmass-plates")
      )
    ).toBe(true);
  });

  it("rejects out-of-range Morphology public numeric controls", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        "morphology-features": {
          volcanoes: {
            baseDensity: 2,
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/morphology-features/volcanoes/baseDensity")
      )
    ).toBe(true);
  });

  it("rejects legacy Hydrology step/op envelope config", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        "hydrology-climate-baseline": {
          "climate-baseline": {
            computeRadiativeForcing: {
              strategy: "default",
              config: {},
            },
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/hydrology-climate-baseline/climate-baseline")
      )
    ).toBe(true);
  });

  it("rejects stale Hydrology public strategy selectors", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        "hydrology-climate-baseline": {
          atmosphericCirculation: {
            strategy: "latitude",
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/hydrology-climate-baseline/atmosphericCirculation/strategy")
      )
    ).toBe(true);
  });

  it("rejects legacy Hydrology nested hydrography op wrappers", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        "hydrology-hydrography": {
          lakes: {
            planLakes: {
              strategy: "default",
              config: {},
            },
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/hydrology-hydrography/lakes/planLakes")
      )
    ).toBe(true);
  });

  it("rejects out-of-range Hydrology public numeric controls", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        "hydrology-climate-baseline": {
          solarForcing: {
            equatorInsolation: 3,
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/hydrology-climate-baseline/solarForcing/equatorInsolation")
      )
    ).toBe(true);
  });

  it("rejects legacy Projection step/op envelope config", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        "map-ecology": {
          "features-apply": {
            apply: {
              strategy: "default",
              config: { maxPerTile: 1 },
            },
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" && item.path.includes("/config/map-ecology/features-apply")
      )
    ).toBe(true);
  });

  it("rejects retired map-rivers projection thresholds from the public config surface", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        "map-rivers": {
          riverProjection: { minLength: 0 },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" && item.path.includes("/config/map-rivers/riverProjection")
      )
    ).toBe(true);
  });

  it("rejects unknown Projection biome globals", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        "map-ecology": {
          biomeBindings: {
            tropicalSeasonal: "BIOME_NOT_REAL",
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/map-ecology/biomeBindings/tropicalSeasonal")
      )
    ).toBe(true);
  });

  it("rejects non-marine Projection marine binding", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        "map-ecology": {
          biomeBindings: {
            marine: "BIOME_DESERT",
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/map-ecology/biomeBindings/marine")
      )
    ).toBe(true);
  });

  it("rejects legacy Placement step/op envelope config", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        placement: {
          "derive-placement-inputs": {
            resources: {
              strategy: "default",
              config: { candidateResourceTypes: [1, 2, 3], densityPer100Tiles: 9 },
            },
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/placement/derive-placement-inputs")
      )
    ).toBe(true);
  });

  it("rejects Placement adapter catalog and runtime start leakage", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        placement: {
          resources: {
            candidateResourceTypes: [1, 2, 3],
          },
          starts: {
            overrides: { startSectors: [] },
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/placement/resources/candidateResourceTypes")
      )
    ).toBe(true);
    expect(
      err.errors.some(
        (item) => item.code === "config.invalid" && item.path.includes("/config/placement/starts")
      )
    ).toBe(true);
  });

  it("rejects out-of-range Placement public numeric controls", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        ...foundationConfig,
        placement: {
          resources: {
            densityPer100Tiles: 75,
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/placement/resources/densityPer100Tiles")
      )
    ).toBe(true);
  });

  it("flags unknown step ids returned by ecology stage compile", () => {
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

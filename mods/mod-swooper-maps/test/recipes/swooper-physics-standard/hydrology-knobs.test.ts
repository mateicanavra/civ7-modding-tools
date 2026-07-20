import { describe, expect, it } from "bun:test";
import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { admitMapSetup } from "@swooper/mapgen-core";

import { buildStandardRecipeDefaultConfig } from "../../../src/recipes/standard/artifacts.js";
import standardRecipe from "../../../src/recipes/standard/recipe.js";
import { artifacts as hydrologyHydrographyArtifacts } from "../../../src/recipes/standard/stages/hydrology-hydrography/artifacts/index.js";
import { runStandardRecipeTestMap, standardMapConfig } from "./fixtures/standard-recipe.js";

const tinyPreset = getCiv7StandardMapSizePreset("MAPSIZE_TINY");
const setup = admitMapSetup({
  mapSeed: 123,
  dimensions: tinyPreset.dimensions,
  latitudeBounds: standardMapConfig.latitudeBounds,
});

function runHydrologyTruth(navigableRiverDensity: "sparse" | "dense") {
  const config = structuredClone(buildStandardRecipeDefaultConfig());
  config["hydrology-hydrography"].knobs.riverDensity = "normal";
  config["map-rivers"].knobs.navigableRiverDensity = navigableRiverDensity;
  const { context } = runStandardRecipeTestMap({ seed: setup.mapSeed, recipeConfig: config });

  return context.artifacts.get(hydrologyHydrographyArtifacts.hydrography.id) as
    | {
        runoff?: Float32Array;
        discharge?: Float32Array;
        riverClass?: Uint8Array;
        flowDir?: Int32Array;
        sinkMask?: Uint8Array;
        outletMask?: Uint8Array;
      }
    | undefined;
}

const navigableProfile = (
  endpointDischargePercentileMin: number,
  targetMajorTileFraction: number
) => ({
  selectNavigableRiverTerrain: {
    strategy: "default" as const,
    config: { endpointDischargePercentileMin, targetMajorTileFraction },
  },
});

function rainfallScale(config: object): number {
  if (!("rainfallScale" in config) || typeof config.rainfallScale !== "number") {
    throw new Error("Compiled precipitation config is missing rainfallScale");
  }
  return config.rainfallScale;
}

function riverLowlandAdjacencyBonus(config: object): number {
  if (!("riverCorridor" in config) || typeof config.riverCorridor !== "object") {
    throw new Error("Compiled precipitation config is missing riverCorridor");
  }
  const riverCorridor = config.riverCorridor;
  if (
    riverCorridor === null ||
    !("lowlandAdjacencyBonus" in riverCorridor) ||
    typeof riverCorridor.lowlandAdjacencyBonus !== "number"
  ) {
    throw new Error("Compiled precipitation config is missing lowlandAdjacencyBonus");
  }
  return riverCorridor.lowlandAdjacencyBonus;
}

describe("hydrology knobs compilation", () => {
  it("is deterministic for identical knob inputs", () => {
    const config = structuredClone(buildStandardRecipeDefaultConfig());
    config["hydrology-climate-baseline"].knobs.dryness = "wet";
    config["hydrology-climate-baseline"].knobs.seasonality = "high";
    config["hydrology-climate-baseline"].knobs.oceanCoupling = "earthlike";
    config["hydrology-hydrography"].knobs.riverDensity = "dense";
    config["hydrology-hydrography"].knobs.lakeiness = "many";
    config["map-rivers"].knobs.navigableRiverDensity = "dense";
    config["hydrology-climate-refine"].knobs.dryness = "wet";

    const a = standardRecipe.compileConfig(setup, config);
    const b = standardRecipe.compileConfig(setup, config);
    expect(a["hydrology-climate-baseline"]).toEqual(b["hydrology-climate-baseline"]);
    expect(a["hydrology-climate-refine"]).toEqual(b["hydrology-climate-refine"]);
    expect(a["map-rivers"]).toEqual(b["map-rivers"]);
  });

  it("maps dryness to monotonic internal wetness tuning (legacy)", () => {
    const wetConfig = structuredClone(buildStandardRecipeDefaultConfig());
    wetConfig["hydrology-climate-baseline"].knobs.dryness = "wet";
    wetConfig["hydrology-climate-refine"].knobs.dryness = "wet";
    const dryConfig = structuredClone(buildStandardRecipeDefaultConfig());
    dryConfig["hydrology-climate-baseline"].knobs.dryness = "dry";
    dryConfig["hydrology-climate-refine"].knobs.dryness = "dry";
    const wet = standardRecipe.compileConfig(setup, wetConfig);
    const dry = standardRecipe.compileConfig(setup, dryConfig);

    const wetScale = rainfallScale(
      wet["hydrology-climate-baseline"]["climate-baseline"].computePrecipitation.config
    );
    const dryScale = rainfallScale(
      dry["hydrology-climate-baseline"]["climate-baseline"].computePrecipitation.config
    );
    expect(wetScale).toBeGreaterThan(dryScale);

    const wetRiverBonus = riverLowlandAdjacencyBonus(
      wet["hydrology-climate-refine"]["climate-refine"].computePrecipitation.config
    );
    const dryRiverBonus = riverLowlandAdjacencyBonus(
      dry["hydrology-climate-refine"]["climate-refine"].computePrecipitation.config
    );
    expect(wetRiverBonus).toBeGreaterThan(dryRiverBonus);
  });

  it("maps riverDensity to monotonic hydrology river thresholds", () => {
    const sparseConfig = structuredClone(buildStandardRecipeDefaultConfig());
    sparseConfig["hydrology-hydrography"].knobs.riverDensity = "sparse";
    const normalConfig = structuredClone(buildStandardRecipeDefaultConfig());
    normalConfig["hydrology-hydrography"].knobs.riverDensity = "normal";
    const denseConfig = structuredClone(buildStandardRecipeDefaultConfig());
    denseConfig["hydrology-hydrography"].knobs.riverDensity = "dense";
    const sparse = standardRecipe.compileConfig(setup, sparseConfig);
    const normal = standardRecipe.compileConfig(setup, normalConfig);
    const dense = standardRecipe.compileConfig(setup, denseConfig);

    expect(
      sparse["hydrology-hydrography"].rivers.projectRiverNetwork.config.minorPercentile
    ).toBeGreaterThan(
      normal["hydrology-hydrography"].rivers.projectRiverNetwork.config.minorPercentile
    );
    expect(
      normal["hydrology-hydrography"].rivers.projectRiverNetwork.config.minorPercentile
    ).toBeGreaterThan(
      dense["hydrology-hydrography"].rivers.projectRiverNetwork.config.minorPercentile
    );
    expect(sparse["map-rivers"]["plot-rivers"]).toEqual(navigableProfile(0.94, 0.28));
    expect(normal["map-rivers"]["plot-rivers"]).toEqual(navigableProfile(0.94, 0.28));
    expect(dense["map-rivers"]["plot-rivers"]).toEqual(navigableProfile(0.94, 0.28));
  });

  it("decouples Civ-visible navigable river density from physical river network density", () => {
    const densePhysicalSparseVisibleConfig = structuredClone(buildStandardRecipeDefaultConfig());
    densePhysicalSparseVisibleConfig["hydrology-hydrography"].knobs.riverDensity = "dense";
    densePhysicalSparseVisibleConfig["map-rivers"].knobs.navigableRiverDensity = "sparse";
    const sparsePhysicalDenseVisibleConfig = structuredClone(buildStandardRecipeDefaultConfig());
    sparsePhysicalDenseVisibleConfig["hydrology-hydrography"].knobs.riverDensity = "sparse";
    sparsePhysicalDenseVisibleConfig["map-rivers"].knobs.navigableRiverDensity = "dense";
    const densePhysicalSparseVisible = standardRecipe.compileConfig(
      setup,
      densePhysicalSparseVisibleConfig
    );
    const sparsePhysicalDenseVisible = standardRecipe.compileConfig(
      setup,
      sparsePhysicalDenseVisibleConfig
    );

    expect(
      densePhysicalSparseVisible["hydrology-hydrography"].rivers.projectRiverNetwork.config
        .minorPercentile
    ).toBeLessThan(
      sparsePhysicalDenseVisible["hydrology-hydrography"].rivers.projectRiverNetwork.config
        .minorPercentile
    );
    expect(densePhysicalSparseVisible["map-rivers"]["plot-rivers"]).toEqual(
      navigableProfile(0.97, 0.18)
    );
    expect(sparsePhysicalDenseVisible["map-rivers"]["plot-rivers"]).toEqual(
      navigableProfile(0.9, 0.4)
    );
  });

  it("changes navigable projection without rewriting Hydrology model artifacts", () => {
    const sparseVisible = runHydrologyTruth("sparse");
    const denseVisible = runHydrologyTruth("dense");

    expect(sparseVisible?.runoff).toEqual(denseVisible?.runoff);
    expect(sparseVisible?.discharge).toEqual(denseVisible?.discharge);
    expect(sparseVisible?.riverClass).toEqual(denseVisible?.riverClass);
    expect(sparseVisible?.flowDir).toEqual(denseVisible?.flowDir);
    expect(sparseVisible?.sinkMask).toEqual(denseVisible?.sinkMask);
    expect(sparseVisible?.outletMask).toEqual(denseVisible?.outletMask);
  });

  it("applies knobs as deterministic transforms over semantic public config baselines", () => {
    const config = structuredClone(buildStandardRecipeDefaultConfig());
    config["hydrology-climate-baseline"].knobs.dryness = "wet";
    config["hydrology-climate-baseline"].knobs.seasonality = "high";
    config["hydrology-climate-baseline"].knobs.oceanCoupling = "off";
    config["hydrology-climate-baseline"].precipitation.rainfallScale = 123;
    config["hydrology-hydrography"].knobs.riverDensity = "dense";
    config["hydrology-hydrography"].knobs.lakeiness = "many";
    config["hydrology-hydrography"].lakes.maxUpstreamSteps = 0;
    config["hydrology-hydrography"].riverNetwork.minorPercentile = 0.85;
    config["hydrology-hydrography"].riverNetwork.majorPercentile = 0.95;
    config["map-rivers"].knobs.navigableRiverDensity = "dense";
    config["hydrology-climate-refine"].knobs.dryness = "wet";
    config["hydrology-climate-refine"].knobs.temperature = "hot";
    config["hydrology-climate-refine"].knobs.cryosphere = "on";
    config["hydrology-climate-refine"].precipitationRefinement.riverCorridor.lowlandAdjacencyBonus =
      44;
    const compiled = standardRecipe.compileConfig(setup, config);

    // Baseline values apply first (schema defaults + semantic public config), then knobs transform them.
    // - lakeiness=many admits a wider high-discharge basin set than normal while keeping lakes clustered.
    expect(compiled["hydrology-hydrography"].lakes.planLakes.config.maxUpstreamSteps).toBe(1);
    expect(
      compiled["hydrology-hydrography"].lakes.planLakes.config.sinkDischargePercentileMin
    ).toBe(0.9);
    expect(compiled["hydrology-hydrography"].lakes.planLakes.config.maxLakeLandFraction).toBe(
      0.006
    );
    // - dryness=wet scales rainfallScale by 1.15 (wetter climate).
    expect(
      rainfallScale(
        compiled["hydrology-climate-baseline"]["climate-baseline"].computePrecipitation.config
      )
    ).toBeCloseTo(141.45, 6);
    // - riverDensity=dense shifts Hydrology river projection percentiles down relative to normal.
    expect(
      compiled["hydrology-hydrography"].rivers.projectRiverNetwork.config.minorPercentile
    ).toBeCloseTo(0.78, 6);
    expect(
      compiled["hydrology-hydrography"].rivers.projectRiverNetwork.config.majorPercentile
    ).toBeCloseTo(0.91, 6);
    // - map-rivers materializes hydrology-owned major rivers without engine generator thresholds,
    //   and exposes a separate navigableRiverDensity knob for Civ-visible trunk density.
    expect(compiled["map-rivers"]["plot-rivers"]).toEqual(navigableProfile(0.9, 0.4));
    expect(
      riverLowlandAdjacencyBonus(
        compiled["hydrology-climate-refine"]["climate-refine"].computePrecipitation.config
      )
    ).toBe(51);
  });
});

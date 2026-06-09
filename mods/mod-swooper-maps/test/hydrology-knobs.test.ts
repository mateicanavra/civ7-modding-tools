import { describe, expect, it } from "bun:test";

import standardRecipe from "../src/recipes/standard/recipe.js";

const env = {
  seed: 123,
  dimensions: { width: 12, height: 9 },
  latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
};

const foundationConfig = {
  knobs: { plateCount: 28, plateActivity: 0.5 },
};

const withFoundation = (config: Record<string, unknown>) => ({
  foundation: foundationConfig,
  ...config,
});

const navigableProfile = (endpointDischargePercentileMin: number, targetMajorTileFraction: number) => ({
  selectNavigableRiverTerrain: {
    strategy: "default",
    config: { endpointDischargePercentileMin, targetMajorTileFraction },
  },
});

describe("hydrology knobs compilation", () => {
  it("treats missing knobs the same as explicit empty knobs objects", () => {
    const compiledMissing = standardRecipe.compileConfig(env, withFoundation({}));
    const compiledExplicit = standardRecipe.compileConfig(
      env,
      withFoundation({
        "hydrology-climate-baseline": { knobs: {} },
        "hydrology-hydrography": { knobs: {} },
        "hydrology-climate-refine": { knobs: {} },
        "map-hydrology": { knobs: {} },
        "map-rivers": { knobs: {} },
      })
    );

    expect(compiledMissing["hydrology-climate-baseline"]).toEqual(
      compiledExplicit["hydrology-climate-baseline"]
    );
    expect(compiledMissing["hydrology-hydrography"]).toEqual(
      compiledExplicit["hydrology-hydrography"]
    );
    expect(compiledMissing["hydrology-climate-refine"]).toEqual(
      compiledExplicit["hydrology-climate-refine"]
    );
    expect(compiledMissing["map-hydrology"]).toEqual(compiledExplicit["map-hydrology"]);
    expect(compiledMissing["map-rivers"]).toEqual(compiledExplicit["map-rivers"]);
  });

  it("is deterministic for identical knob inputs", () => {
    const input = {
      "hydrology-climate-baseline": {
        knobs: { dryness: "wet", seasonality: "high", oceanCoupling: "earthlike" },
      },
      "hydrology-hydrography": { knobs: { riverDensity: "dense", lakeiness: "many" } },
      "map-rivers": { knobs: { navigableRiverDensity: "dense" } },
      "hydrology-climate-refine": { knobs: { dryness: "wet" } },
    } as const;

    const a = standardRecipe.compileConfig(env, withFoundation(input));
    const b = standardRecipe.compileConfig(env, withFoundation(input));
    expect(a["hydrology-climate-baseline"]).toEqual(b["hydrology-climate-baseline"]);
    expect(a["hydrology-climate-refine"]).toEqual(b["hydrology-climate-refine"]);
    expect(a["map-rivers"]).toEqual(b["map-rivers"]);
  });

  it("maps dryness to monotonic internal wetness tuning (legacy)", () => {
    const wet = standardRecipe.compileConfig(
      env,
      withFoundation({
        "hydrology-climate-baseline": { knobs: { dryness: "wet" } },
        "hydrology-climate-refine": { knobs: { dryness: "wet" } },
      })
    );
    const dry = standardRecipe.compileConfig(
      env,
      withFoundation({
        "hydrology-climate-baseline": { knobs: { dryness: "dry" } },
        "hydrology-climate-refine": { knobs: { dryness: "dry" } },
      })
    );

    const wetScale =
      wet["hydrology-climate-baseline"]["climate-baseline"].computePrecipitation.config
        .rainfallScale;
    const dryScale =
      dry["hydrology-climate-baseline"]["climate-baseline"].computePrecipitation.config
        .rainfallScale;
    expect(wetScale).toBeGreaterThan(dryScale);

    const wetRiverBonus =
      wet["hydrology-climate-refine"]["climate-refine"].computePrecipitation.config.riverCorridor
        .lowlandAdjacencyBonus;
    const dryRiverBonus =
      dry["hydrology-climate-refine"]["climate-refine"].computePrecipitation.config.riverCorridor
        .lowlandAdjacencyBonus;
    expect(wetRiverBonus).toBeGreaterThan(dryRiverBonus);
  });

  it("maps riverDensity to monotonic hydrology river thresholds", () => {
    const sparse = standardRecipe.compileConfig(
      env,
      withFoundation({
        "hydrology-hydrography": { knobs: { riverDensity: "sparse" } },
      })
    );
    const normal = standardRecipe.compileConfig(
      env,
      withFoundation({
        "hydrology-hydrography": { knobs: { riverDensity: "normal" } },
      })
    );
    const dense = standardRecipe.compileConfig(
      env,
      withFoundation({
        "hydrology-hydrography": { knobs: { riverDensity: "dense" } },
      })
    );

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
    const densePhysicalSparseVisible = standardRecipe.compileConfig(
      env,
      withFoundation({
        "hydrology-hydrography": { knobs: { riverDensity: "dense" } },
        "map-rivers": { knobs: { navigableRiverDensity: "sparse" } },
      })
    );
    const sparsePhysicalDenseVisible = standardRecipe.compileConfig(
      env,
      withFoundation({
        "hydrology-hydrography": { knobs: { riverDensity: "sparse" } },
        "map-rivers": { knobs: { navigableRiverDensity: "dense" } },
      })
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

  it("keeps map-rivers riverDensity as a legacy alias for navigableRiverDensity", () => {
    const legacy = standardRecipe.compileConfig(
      env,
      withFoundation({
        "map-rivers": { knobs: { riverDensity: "dense" } },
      })
    );
    const current = standardRecipe.compileConfig(
      env,
      withFoundation({
        "map-rivers": { knobs: { navigableRiverDensity: "dense" } },
      })
    );

    expect(legacy["map-rivers"]).toEqual(current["map-rivers"]);
  });

  it("allows duplicate map-rivers alias and current density knobs when they agree", () => {
    const duplicate = standardRecipe.compileConfig(
      env,
      withFoundation({
        "map-rivers": { knobs: { riverDensity: "sparse", navigableRiverDensity: "sparse" } },
      })
    );
    const current = standardRecipe.compileConfig(
      env,
      withFoundation({
        "map-rivers": { knobs: { navigableRiverDensity: "sparse" } },
      })
    );

    expect(duplicate["map-rivers"]).toEqual(current["map-rivers"]);
  });

  it("allows optional semantic public config in hydrology stages", () => {
    const compiled = standardRecipe.compileConfig(
      env,
      withFoundation({
        "hydrology-hydrography": { lakes: {} },
        "map-hydrology": {},
      })
    );
    expect(compiled["hydrology-hydrography"].lakes.planLakes.config).toEqual({
      maxUpstreamSteps: 1,
      sinkDischargePercentileMin: 0.94,
      maxLakeLandFraction: 0.003,
    });
    expect(compiled["map-hydrology"].lakes.projectionReadback).toBe(true);
  });

  it("applies knobs as deterministic transforms over semantic public config baselines", () => {
    const compiled = standardRecipe.compileConfig(
      env,
      withFoundation({
        "hydrology-climate-baseline": {
          knobs: { dryness: "wet", seasonality: "high", oceanCoupling: "off" },
          precipitation: {
            rainfallScale: 123,
            humidityExponent: 1,
            noiseAmplitude: 6,
            noiseScale: 0.12,
            waterGradient: {},
          },
        },
        "hydrology-hydrography": {
          knobs: { riverDensity: "dense", lakeiness: "many" },
          lakes: { maxUpstreamSteps: 0 },
          riverNetwork: {
            minorPercentile: 0.85,
            majorPercentile: 0.95,
          },
        },
        "map-hydrology": {},
        "map-rivers": {
          knobs: { navigableRiverDensity: "dense" },
        },
        "hydrology-climate-refine": {
          knobs: { dryness: "wet", temperature: "hot", cryosphere: "on" },
          precipitationRefinement: {
            riverCorridor: {
              adjacencyRadius: 1,
              lowlandAdjacencyBonus: 44,
              highlandAdjacencyBonus: 10,
              lowlandElevationMax: 250,
            },
            lowBasin: {
              radius: 2,
              delta: 6,
              elevationMax: 200,
              openThresholdM: 20,
            },
          },
        },
      })
    );

    // Baseline values apply first (schema defaults + flat step config), then knobs transform them.
    // - lakeiness=many admits a wider high-discharge basin set than normal while keeping lakes clustered.
    expect(compiled["hydrology-hydrography"].lakes.planLakes.config.maxUpstreamSteps).toBe(1);
    expect(
      compiled["hydrology-hydrography"].lakes.planLakes.config.sinkDischargePercentileMin
    ).toBe(0.9);
    expect(compiled["hydrology-hydrography"].lakes.planLakes.config.maxLakeLandFraction).toBe(0.006);
    // - dryness=wet scales rainfallScale by 1.15 (wetter climate).
    expect(
      compiled["hydrology-climate-baseline"]["climate-baseline"].computePrecipitation.config
        .rainfallScale
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
      compiled["hydrology-climate-refine"]["climate-refine"].computePrecipitation.config
        .riverCorridor.lowlandAdjacencyBonus
    ).toBe(51);
  });
});

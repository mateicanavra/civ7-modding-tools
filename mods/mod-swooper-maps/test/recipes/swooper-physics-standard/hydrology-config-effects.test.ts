import { describe, expect, it } from "bun:test";
import { sha256Hex } from "@swooper/mapgen-core";

import { buildStandardRecipeDefaultConfig } from "../../../src/recipes/standard/artifacts.js";
import type { StandardRecipeConfig } from "../../../src/recipes/standard/recipe.js";
import { artifacts as hydrologyClimateBaselineArtifacts } from "../../../src/recipes/standard/stages/hydrology-climate-baseline/artifacts/index.js";
import { artifacts as hydrologyClimateRefineArtifacts } from "../../../src/recipes/standard/stages/hydrology-climate-refine/artifacts/index.js";
import { artifacts as hydrologyHydrographyArtifacts } from "../../../src/recipes/standard/stages/hydrology-hydrography/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../../src/recipes/standard/stages/morphology/artifacts/index.js";
import { runStandardRecipeTestMap } from "./fixtures/standard-recipe.js";

const seed = 123;

function runStandardConfig(config: StandardRecipeConfig) {
  return runStandardRecipeTestMap({ seed, recipeConfig: config }).context;
}

function mean(values: Uint8Array | Float32Array): number {
  let sum = 0;
  for (let index = 0; index < values.length; index += 1) sum += values[index] ?? 0;
  return sum / values.length;
}

describe("Standard hydrology configuration effects", () => {
  it("makes wet maps wetter than dry maps for the same admitted setup", () => {
    const dryConfig = structuredClone(buildStandardRecipeDefaultConfig());
    dryConfig["hydrology-climate-baseline"].knobs.dryness = "dry";
    dryConfig["hydrology-climate-refine"].knobs.dryness = "dry";
    const wetConfig = structuredClone(buildStandardRecipeDefaultConfig());
    wetConfig["hydrology-climate-baseline"].knobs.dryness = "wet";
    wetConfig["hydrology-climate-refine"].knobs.dryness = "wet";

    const dry = climateSignals(runStandardConfig(dryConfig));
    const wet = climateSignals(runStandardConfig(wetConfig));

    expect(wet.rainfall).toBeGreaterThan(dry.rainfall);
    expect(wet.humidity).toBeGreaterThan(dry.humidity);
    expect(dry.aridity).toBeGreaterThan(wet.aridity);
  }, 30_000);

  it("makes a cold configuration colder than a hot configuration for the same admitted setup", () => {
    const coldConfig = structuredClone(buildStandardRecipeDefaultConfig());
    coldConfig["hydrology-climate-baseline"].knobs.temperature = "cold";
    coldConfig["hydrology-climate-refine"].knobs.temperature = "cold";
    const hotConfig = structuredClone(buildStandardRecipeDefaultConfig());
    hotConfig["hydrology-climate-baseline"].knobs.temperature = "hot";
    hotConfig["hydrology-climate-refine"].knobs.temperature = "hot";

    expect(surfaceTemperature(runStandardConfig(coldConfig))).toBeLessThan(
      surfaceTemperature(runStandardConfig(hotConfig))
    );
  }, 30_000);

  it("changes seasonal amplitude without changing upstream morphology", () => {
    const noTiltConfig = structuredClone(buildStandardRecipeDefaultConfig());
    noTiltConfig["hydrology-climate-baseline"].seasonalCycle.axialTiltDeg = 0;
    const tiltedConfig = structuredClone(buildStandardRecipeDefaultConfig());
    tiltedConfig["hydrology-climate-baseline"].seasonalCycle.axialTiltDeg = 23.44;

    const noTilt = seasonalitySignals(runStandardConfig(noTiltConfig));
    const tilted = seasonalitySignals(runStandardConfig(tiltedConfig));

    expect(noTilt.elevationSha).toBe(tilted.elevationSha);
    expect(noTilt.rainfallAmplitude).toBe(0);
    expect(noTilt.humidityAmplitude).toBe(0);
    expect(tilted.rainfallAmplitude).toBeGreaterThan(0);
    expect(tilted.humidityAmplitude).toBeGreaterThan(0);
  }, 30_000);

  it("materializes at least as many classified river tiles for dense as sparse hydrology", () => {
    const sparseConfig = structuredClone(buildStandardRecipeDefaultConfig());
    sparseConfig["hydrology-hydrography"].knobs.riverDensity = "sparse";
    const denseConfig = structuredClone(buildStandardRecipeDefaultConfig());
    denseConfig["hydrology-hydrography"].knobs.riverDensity = "dense";

    expect(riverTileCount(runStandardConfig(denseConfig))).toBeGreaterThanOrEqual(
      riverTileCount(runStandardConfig(sparseConfig))
    );
  }, 30_000);
});

function riverTileCount(context: ReturnType<typeof runStandardConfig>): number {
  const hydrography = context.artifacts.get(hydrologyHydrographyArtifacts.hydrography.id) as
    | { riverClass?: Uint8Array }
    | undefined;
  if (!(hydrography?.riverClass instanceof Uint8Array)) {
    throw new Error("Standard hydrology did not publish classified river evidence.");
  }
  return hydrography.riverClass.reduce((count, riverClass) => count + Number(riverClass > 0), 0);
}

function climateSignals(context: ReturnType<typeof runStandardConfig>) {
  const field = context.artifacts.get(hydrologyClimateRefineArtifacts.climateField.id) as
    | { rainfall?: Uint8Array; humidity?: Uint8Array }
    | undefined;
  const indices = context.artifacts.get(hydrologyClimateRefineArtifacts.climateIndices.id) as
    | { aridityIndex?: Float32Array }
    | undefined;
  if (
    !(field?.rainfall instanceof Uint8Array) ||
    !(field.humidity instanceof Uint8Array) ||
    !(indices?.aridityIndex instanceof Float32Array)
  ) {
    throw new Error("Standard hydrology did not publish its admitted climate evidence.");
  }
  return {
    rainfall: mean(field.rainfall),
    humidity: mean(field.humidity),
    aridity: mean(indices.aridityIndex),
  };
}

function surfaceTemperature(context: ReturnType<typeof runStandardConfig>): number {
  const indices = context.artifacts.get(hydrologyClimateRefineArtifacts.climateIndices.id) as
    | { surfaceTemperatureC?: Float32Array }
    | undefined;
  if (!(indices?.surfaceTemperatureC instanceof Float32Array)) {
    throw new Error("Standard hydrology did not publish surface-temperature evidence.");
  }
  return mean(indices.surfaceTemperatureC);
}

function seasonalitySignals(context: ReturnType<typeof runStandardConfig>) {
  const topography = context.artifacts.get(morphologyArtifacts.topography.id) as
    | { elevation?: Int16Array }
    | undefined;
  const seasonality = context.artifacts.get(
    hydrologyClimateBaselineArtifacts.climateSeasonality.id
  ) as { rainfallAmplitude?: Uint8Array; humidityAmplitude?: Uint8Array } | undefined;
  if (
    !(topography?.elevation instanceof Int16Array) ||
    !(seasonality?.rainfallAmplitude instanceof Uint8Array) ||
    !(seasonality.humidityAmplitude instanceof Uint8Array)
  ) {
    throw new Error("Standard hydrology did not publish its admitted seasonality evidence.");
  }
  const bytes = new Uint8Array(
    topography.elevation.buffer,
    topography.elevation.byteOffset,
    topography.elevation.byteLength
  );
  return {
    elevationSha: sha256Hex(Buffer.from(bytes).toString("base64")),
    rainfallAmplitude: mean(seasonality.rainfallAmplitude),
    humidityAmplitude: mean(seasonality.humidityAmplitude),
  };
}

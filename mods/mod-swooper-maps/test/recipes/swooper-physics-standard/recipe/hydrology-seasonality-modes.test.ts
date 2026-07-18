import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext, sha256Hex } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import { buildStandardRecipeDefaultConfig } from "../../../../src/recipes/standard/artifacts.js";
import standardRecipe from "../../../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../../../src/recipes/standard/runtime.js";
import { artifacts as hydrologyClimateBaselineArtifacts } from "../../../../src/recipes/standard/stages/hydrology-climate-baseline/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../../../src/recipes/standard/stages/morphology/artifacts/index.js";

const setup = admitMapSetup({
  mapSeed: 123,
  dimensions: { width: 16, height: 12 },
  latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
});

const mapInfo = {
  GridWidth: setup.dimensions.width,
  GridHeight: setup.dimensions.height,
  MinLatitude: setup.latitudeBounds.bottomLatitude,
  MaxLatitude: setup.latitudeBounds.topLatitude,
  PlayersLandmass1: 4,
  PlayersLandmass2: 4,
  StartSectorRows: 4,
  StartSectorCols: 4,
};

function meanU8(values: Uint8Array): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < values.length; i++) sum += values[i] ?? 0;
  return sum / values.length;
}

function runWithTilt(axialTiltDeg: number): {
  elevationSha: string;
  rainfallAmplitudeMean: number;
  humidityAmplitudeMean: number;
} {
  const { width, height } = setup.dimensions;
  const adapter = createMockAdapter({
    width,
    height,
    mapInfo,
    mapSizeId: 1,
    rng: createLabelRng(setup.mapSeed),
  });
  const context = createMapContext({ setup, adapter });
  const config = structuredClone(buildStandardRecipeDefaultConfig());
  config["hydrology-climate-baseline"].seasonalCycle.axialTiltDeg = axialTiltDeg;

  initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]" });
  standardRecipe.run(context, config, { log: () => {} });

  const topography = context.artifacts.get(morphologyArtifacts.topography.id) as
    | { elevation?: Int16Array }
    | undefined;
  if (!(topography?.elevation instanceof Int16Array)) {
    throw new Error("Missing artifact:morphology.topography elevation buffer.");
  }
  const elevationSha = sha256Hex(
    Buffer.from(
      new Uint8Array(
        topography.elevation.buffer,
        topography.elevation.byteOffset,
        topography.elevation.byteLength
      )
    ).toString("base64")
  );

  const seasonality = context.artifacts.get(
    hydrologyClimateBaselineArtifacts.climateSeasonality.id
  ) as { rainfallAmplitude?: Uint8Array; humidityAmplitude?: Uint8Array } | undefined;
  if (
    !(seasonality?.rainfallAmplitude instanceof Uint8Array) ||
    !(seasonality?.humidityAmplitude instanceof Uint8Array)
  ) {
    throw new Error(
      "Missing artifact:hydrology.climateSeasonality rainfallAmplitude/humidityAmplitude buffers."
    );
  }

  return {
    elevationSha,
    rainfallAmplitudeMean: meanU8(seasonality.rainfallAmplitude),
    humidityAmplitudeMean: meanU8(seasonality.humidityAmplitude),
  };
}

describe("hydrology seasonality modes", () => {
  it("changes seasonal amplitudes without changing unrelated elevation (same seed)", () => {
    const tiltOff = runWithTilt(0);
    const tiltOn = runWithTilt(23.44);

    expect(tiltOff.elevationSha).toBe(tiltOn.elevationSha);

    expect(tiltOff.rainfallAmplitudeMean).toBe(0);
    expect(tiltOff.humidityAmplitudeMean).toBe(0);

    expect(tiltOn.rainfallAmplitudeMean).toBeGreaterThan(0);
    expect(tiltOn.humidityAmplitudeMean).toBeGreaterThan(0);
  });
});

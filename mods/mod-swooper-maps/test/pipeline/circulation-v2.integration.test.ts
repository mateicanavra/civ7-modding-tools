import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext, sha256Hex } from "@swooper/mapgen-core";
import type { VizDumper } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { hydrologyClimateBaselineArtifacts } from "../../src/recipes/standard/stages/hydrology-climate-baseline/artifacts.js";
import { standardConfig } from "../support/standard-config.js";

function variance(values: Int8Array, start: number, count: number): number {
  if (count <= 0) return 0;
  let sum = 0;
  for (let i = 0; i < count; i++) sum += values[start + i] ?? 0;
  const mean = sum / count;
  let acc = 0;
  for (let i = 0; i < count; i++) {
    const d = (values[start + i] ?? 0) - mean;
    acc += d * d;
  }
  return acc / count;
}

function runAndCaptureSst(options: {
  seed: number;
  width: number;
  height: number;
  config: StandardRecipeConfig;
}): { sstC: Float32Array; windU: Int8Array; currentU: Int8Array } {
  const { seed, width, height, config } = options;
  const mapInfo = {
    GridWidth: width,
    GridHeight: height,
    MinLatitude: -60,
    MaxLatitude: 60,
    PlayersLandmass1: 4,
    PlayersLandmass2: 4,
    StartSectorRows: 4,
    StartSectorCols: 4,
  };

  const env = {
    seed,
    dimensions: { width, height },
    latitudeBounds: {
      topLatitude: mapInfo.MaxLatitude,
      bottomLatitude: mapInfo.MinLatitude,
    },
  };

  const adapter = createMockAdapter({ width, height, mapInfo, mapSizeId: 1, rng: createLabelRng(seed) });
  const context = createExtendedMapContext({ width, height }, adapter, env);

  let capturedSst: Float32Array | null = null;
  const viz: VizDumper = {
    outputRoot: "<test>",
    dumpGrid: (_trace, layer) => {
      if (layer.dataTypeKey !== "hydrology.ocean.sstC") return;
      if (!(layer.values instanceof Float32Array)) {
        throw new Error("Expected hydrology.ocean.sstC to be dumped as f32 grid.");
      }
      capturedSst = new Float32Array(layer.values);
    },
    dumpPoints: () => {},
    dumpSegments: () => {},
    dumpGridFields: () => {},
  };
  context.viz = viz;

  initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]", storyEnabled: true });
  standardRecipe.run(context, env, config, { log: () => {} });

  if (!capturedSst) throw new Error("Expected hydrology.ocean.sstC to be emitted when circulation v2 is enabled.");

  const windField = context.artifacts.get(hydrologyClimateBaselineArtifacts.windField.id) as
    | { windU?: Int8Array; currentU?: Int8Array }
    | undefined;
  if (!(windField?.windU instanceof Int8Array)) throw new Error("Missing artifact:hydrology._internal.windField windU.");
  if (!(windField?.currentU instanceof Int8Array)) throw new Error("Missing artifact:hydrology._internal.windField currentU.");

  return { sstC: capturedSst, windU: windField.windU, currentU: windField.currentU } as const;
}

describe("circulation v2 (pipeline integration)", () => {
  it("produces non-row-uniform winds and SST responds to currents", () => {
    const width = 32;
    const height = 20;
    const seed = 1337;

    const baseV2: StandardRecipeConfig = {
      ...standardConfig,
      "hydrology-climate-baseline": {
        ...standardConfig["hydrology-climate-baseline"],
        "climate-baseline": {
          computeAtmosphericCirculation: {
            strategy: "default",
            config: {
              maxSpeed: 110,
              zonalStrength: 90,
              meridionalStrength: 30,
              geostrophicStrength: 70,
              pressureNoiseScale: 18,
              pressureNoiseAmp: 55,
              waveStrength: 45,
              landHeatStrength: 20,
              mountainDeflectStrength: 18,
              smoothIters: 4,
            },
          },
          computeOceanGeometry: {
            strategy: "default",
            config: { maxCoastDistance: 64, maxCoastVectorDistance: 10 },
          },
          computeOceanSurfaceCurrents: {
            strategy: "default",
            config: {
              maxSpeed: 80,
              windStrength: 0.9,
              ekmanStrength: 0.35,
              gyreStrength: 26,
              coastStrength: 32,
              smoothIters: 3,
              projectionIters: 8,
            },
          },
          computeOceanThermalState: {
            strategy: "default",
            config: {
              equatorTempC: 28,
              poleTempC: -2,
              advectIters: 24,
              diffusion: 0.12,
              secondaryWeightMin: 0.25,
              seaIceThresholdC: -1,
            },
          },
          transportMoisture: {
            strategy: "default",
            config: { iterations: 42, advection: 0.7, retention: 0.93, secondaryWeightMin: 0.2 },
          },
          computePrecipitation: {
            strategy: "default",
            config: {
              rainfallScale: 180,
              humidityExponent: 1,
              noiseAmplitude: 6,
              noiseScale: 0.12,
              waterGradient: { radius: 5, perRingBonus: 4, lowlandBonus: 2, lowlandElevationMax: 150 },
              upliftStrength: 22,
              convergenceStrength: 16,
            },
          },
        },
      },
    };

    const weakCurrents: StandardRecipeConfig = {
      ...baseV2,
      "hydrology-climate-baseline": {
        ...baseV2["hydrology-climate-baseline"],
        "climate-baseline": {
          ...(baseV2["hydrology-climate-baseline"] as any)["climate-baseline"],
          computeOceanSurfaceCurrents: {
            strategy: "default",
            config: {
              maxSpeed: 80,
              windStrength: 0,
              ekmanStrength: 0,
              gyreStrength: 0,
              coastStrength: 0,
              smoothIters: 3,
              projectionIters: 8,
            },
          },
        },
      },
    };

    const strong = runAndCaptureSst({ seed, width, height, config: baseV2 });
    const weak = runAndCaptureSst({ seed, width, height, config: weakCurrents });

    // Wind should not be a pure latitude stripe; check within-row variance on a mid-lat row.
    const y = Math.floor(height / 2);
    expect(variance(strong.windU, y * width, width)).toBeGreaterThan(0);

    // SST should respond to currents: strong-current run should differ from weak-current run.
    let mad = 0;
    const n = strong.sstC.length;
    for (let i = 0; i < n; i++) mad += Math.abs((strong.sstC[i] ?? 0) - (weak.sstC[i] ?? 0));
    mad /= Math.max(1, n);
    expect(mad).toBeGreaterThan(0.02);
  });

  it("is deterministic for fixed seed+config (SST grid)", () => {
    const width = 32;
    const height = 20;
    const seed = 1337;
    const cfg: StandardRecipeConfig = {
      ...standardConfig,
      "hydrology-climate-baseline": {
        ...standardConfig["hydrology-climate-baseline"],
        "climate-baseline": {
          computeAtmosphericCirculation: {
            strategy: "default",
            config: {
              maxSpeed: 110,
              zonalStrength: 90,
              meridionalStrength: 30,
              geostrophicStrength: 70,
              pressureNoiseScale: 18,
              pressureNoiseAmp: 55,
              waveStrength: 45,
              landHeatStrength: 20,
              mountainDeflectStrength: 18,
              smoothIters: 4,
            },
          },
          computeOceanGeometry: {
            strategy: "default",
            config: { maxCoastDistance: 64, maxCoastVectorDistance: 10 },
          },
          computeOceanSurfaceCurrents: {
            strategy: "default",
            config: {
              maxSpeed: 80,
              windStrength: 0.55,
              ekmanStrength: 0.35,
              gyreStrength: 26,
              coastStrength: 32,
              smoothIters: 3,
              projectionIters: 8,
            },
          },
          computeOceanThermalState: {
            strategy: "default",
            config: {
              equatorTempC: 28,
              poleTempC: -2,
              advectIters: 28,
              diffusion: 0.18,
              secondaryWeightMin: 0.25,
              seaIceThresholdC: -1,
            },
          },
          transportMoisture: {
            strategy: "default",
            config: { iterations: 22, advection: 0.7, retention: 0.93, secondaryWeightMin: 0.2 },
          },
          computePrecipitation: {
            strategy: "default",
            config: {
              rainfallScale: 180,
              humidityExponent: 1,
              noiseAmplitude: 6,
              noiseScale: 0.12,
              waterGradient: { radius: 5, perRingBonus: 4, lowlandBonus: 2, lowlandElevationMax: 150 },
              upliftStrength: 22,
              convergenceStrength: 16,
            },
          },
        },
      },
    };

    const a = runAndCaptureSst({ seed, width, height, config: cfg });
    const b = runAndCaptureSst({ seed, width, height, config: cfg });

    const shaA = sha256Hex(
      Buffer.from(new Uint8Array(a.sstC.buffer, a.sstC.byteOffset, a.sstC.byteLength)).toString("base64")
    );
    const shaB = sha256Hex(
      Buffer.from(new Uint8Array(b.sstC.buffer, b.sstC.byteOffset, b.sstC.byteLength)).toString("base64")
    );
    expect(shaA).toBe(shaB);
  });
});

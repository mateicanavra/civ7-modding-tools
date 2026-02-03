import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeAtmosphericCirculationContract from "../contract.js";
import { computeWindsEarthlike } from "../rules/index.js";

export const earthlikeStrategy = createStrategy(ComputeAtmosphericCirculationContract, "earthlike", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = Math.max(0, width * height);
    const rngSeed = input.rngSeed | 0;

    if (!(input.latitudeByRow instanceof Float32Array) || input.latitudeByRow.length !== height) {
      throw new Error("[Hydrology] Invalid latitudeByRow for hydrology/compute-atmospheric-circulation.");
    }

    if (input.landMask !== undefined && (!(input.landMask instanceof Uint8Array) || input.landMask.length !== size)) {
      throw new Error("[Hydrology] Invalid landMask for hydrology/compute-atmospheric-circulation.");
    }
    if (input.elevation !== undefined && (!(input.elevation instanceof Int16Array) || input.elevation.length !== size)) {
      throw new Error("[Hydrology] Invalid elevation for hydrology/compute-atmospheric-circulation.");
    }

    const seasonPhase01 =
      typeof (input as { seasonPhase01?: unknown }).seasonPhase01 === "number"
        ? (input as { seasonPhase01: number }).seasonPhase01
        : 0;

    return computeWindsEarthlike(width, height, input.latitudeByRow, {
      seed: rngSeed,
      landMask: input.landMask,
      elevation: input.elevation,
      seasonPhase01,
      maxSpeed: config.maxSpeed,
      zonalStrength: config.zonalStrength,
      meridionalStrength: config.meridionalStrength,
      geostrophicStrength: config.geostrophicStrength,
      pressureNoiseScale: config.pressureNoiseScale,
      pressureNoiseAmp: config.pressureNoiseAmp,
      waveStrength: config.waveStrength,
      landHeatStrength: config.landHeatStrength,
      mountainDeflectStrength: config.mountainDeflectStrength,
      smoothIters: config.smoothIters,
    });
  },
});


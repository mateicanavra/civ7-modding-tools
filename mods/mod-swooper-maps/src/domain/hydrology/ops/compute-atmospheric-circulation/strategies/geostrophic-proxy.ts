import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeAtmosphericCirculationContract from "../contract.js";
import { computeWindsEarthlike } from "../rules/index.js";

/** Computes the bounded geostrophic proxy used by the Standard coupled-climate path. */
export const geostrophicProxyStrategy = createStrategy(
  ComputeAtmosphericCirculationContract,
  "geostrophic-proxy",
  {
    run: (input, config) => {
      const width = input.width;
      const height = input.height;
      const rngSeed = input.rngSeed | 0;

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
  }
);

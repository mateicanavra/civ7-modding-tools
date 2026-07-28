import { createStrategy } from "@swooper/mapgen-core/authoring";
import { PerlinNoise } from "@swooper/mapgen-core/lib/noise";

import { computeDistanceToWater } from "../../../../model/rules/coastal-distance.js";
import {
  clampRainfall,
  rainfallToHumidityU8,
} from "../../../../model/rules/precipitation-scale.js";
import { upwindBarrierDistance } from "../../../../model/rules/wind-sampling.js";
import ComputePrecipitationContract from "../../contract.js";
import BaselineDefinition from "./config.js";

/**
 * Maps transported humidity to land rainfall, then applies coastal moisture, upwind barrier
 * drying, and seeded Perlin texture. Every sample is clamped to Civ7's rainfall range and its
 * humidity output is derived from that admitted value.
 */
const baselineStrategy = createStrategy(ComputePrecipitationContract, BaselineDefinition, {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const size = width * height;
    const perlinSeed = input.perlinSeed | 0;

    const rainfall = new Uint8Array(size);
    const humidity = new Uint8Array(size);
    const distToWater = computeDistanceToWater(width, height, input.landMask);
    const perlin = new PerlinNoise(perlinSeed);

    const noiseAmplitude = config.noiseAmplitude;
    const noiseScale = config.noiseScale;
    const rainfallScale = config.rainfallScale;
    const humidityExponent = config.humidityExponent;

    const waterRadius = Math.max(1, config.waterGradient.radius | 0);
    const waterPerRingBonus = config.waterGradient.perRingBonus;
    const waterLowlandBonus = config.waterGradient.lowlandBonus;
    const waterLowlandElevationMax = config.waterGradient.lowlandElevationMax | 0;

    const steps = Math.max(1, config.orographic.steps | 0);
    const reductionBase = config.orographic.reductionBase;
    const reductionPerStep = config.orographic.reductionPerStep;
    const barrierElevationM = config.orographic.barrierElevationM | 0;

    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        const i = row + x;
        if (input.landMask[i] === 0) continue;

        const hum = Math.max(0, Math.min(1, input.humidityF32[i] ?? 0));
        let rf = Math.pow(hum, humidityExponent) * rainfallScale;

        const dist = distToWater[i] | 0;
        if (dist >= 0 && dist <= waterRadius) {
          const elev = input.elevation[i] | 0;
          rf += Math.max(0, waterRadius - dist) * waterPerRingBonus;
          if (elev < waterLowlandElevationMax) rf += waterLowlandBonus;
        }

        const barrier = upwindBarrierDistance(
          x,
          y,
          width,
          height,
          input.elevation,
          input.landMask,
          input.windU,
          input.windV,
          input.latitudeByRow,
          steps,
          { barrierElevationM }
        );
        if (barrier > 0) {
          rf -= reductionBase + barrier * reductionPerStep;
        }

        const noise = perlin.noise2D(x * noiseScale, y * noiseScale);
        rf += noise * noiseAmplitude;

        const clamped = clampRainfall(rf);
        rainfall[i] = clamped;
        humidity[i] = rainfallToHumidityU8(clamped);
      }
    }

    return { rainfall, humidity } as const;
  },
});

export default baselineStrategy;

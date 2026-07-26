import { createStrategy } from "@swooper/mapgen-core/authoring";
import { estimateDivergenceOddQ } from "@swooper/mapgen-core/lib/grid";
import { clamp01 } from "@swooper/mapgen-core/lib/math";

import { computeDistanceToWater } from "../../../../model/rules/coastal-distance.js";
import { upwindBarrierDistance } from "../../../../model/rules/wind-sampling.js";
import ComputeClimateDiagnosticsContract from "../../contract.js";
import TerrainWindIndicesDefinition from "./config.js";

/** Terrain and wind neighborhoods measure explanatory indices from one admitted climate state. */
const terrainWindIndicesStrategy = createStrategy(
  ComputeClimateDiagnosticsContract,
  TerrainWindIndicesDefinition,
  {
    run: (input, config) => {
      const { width, height } = input;
      const distancesToWater = computeDistanceToWater(width, height, input.landMask);
      const rainShadowIndex = new Float32Array(width * height);
      const continentalityIndex = new Float32Array(width * height);
      const convergenceIndex = new Float32Array(width * height);
      const divergence = estimateDivergenceOddQ(
        width,
        height,
        new Float32Array(input.windU),
        new Float32Array(input.windV)
      );

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const index = y * width + x;
          if (input.landMask[index] === 0) continue;

          continentalityIndex[index] = clamp01(
            (distancesToWater[index] ?? 0) / config.continentalityMaxDist
          );
          const barrierDistance = upwindBarrierDistance(
            x,
            y,
            width,
            height,
            input.elevation,
            input.landMask,
            input.windU,
            input.windV,
            input.latitudeByRow,
            config.barrierSteps,
            { barrierElevationM: config.barrierElevationM }
          );
          const rainfall = (input.rainfall[index] ?? 0) / 200;
          rainShadowIndex[index] =
            barrierDistance > 0
              ? clamp01((barrierDistance / config.barrierSteps) * (1 - rainfall))
              : 0;
          convergenceIndex[index] = clamp01(
            Math.max(0, -(divergence[index] ?? 0)) / config.convergenceNormalization
          );
        }
      }

      return { rainShadowIndex, continentalityIndex, convergenceIndex };
    },
  }
);

export default terrainWindIndicesStrategy;

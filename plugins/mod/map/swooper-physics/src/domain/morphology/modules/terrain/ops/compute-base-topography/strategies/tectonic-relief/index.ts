import { deriveStepSeed } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

import ComputeBaseTopographyContract from "../../contract.js";
import {
  blendBoundaryElevation,
  computeElevationRaw,
  quantizeElevation,
} from "../../rules/index.js";
import { createPeriodicReliefNoise } from "../../rules/periodic-noise.js";
import StrategyDefinition from "./config.js";

/** Binds the `tectonic-relief` algorithm to the shared `morphology/compute-base-topography` operation contract. */
export default createStrategy(ComputeBaseTopographyContract, StrategyDefinition, {
  run: (input, config) => {
    const {
      width,
      height,
      crustBaseElevation,
      upliftPotential: uplift,
      riftPotential: rift,
      boundaryCloseness: closeness,
    } = input;
    const size = width * height;

    const noiseAmplitude = config.crustNoiseAmplitude;
    const edgeBlend = config.crustEdgeBlend;
    const arcNoiseWeight = config.tectonics.boundaryArcNoiseWeight;
    const noiseField = createPeriodicReliefNoise({
      width,
      grain: config.tectonics.fractalGrain,
      seed: deriveStepSeed(input.rngSeed, "base-topography"),
    });
    const arcNoiseField = createPeriodicReliefNoise({
      width,
      grain: config.tectonics.fractalGrain,
      seed: deriveStepSeed(input.rngSeed, "boundary-arc"),
    });

    const elevationRaw = new Float32Array(size);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const crustUnit = crustBaseElevation[i] ?? 0;
        const upliftNorm = (uplift[i] ?? 0) / 255;
        const riftNorm = (rift[i] ?? 0) / 255;
        const closenessNorm = (closeness[i] ?? 0) / 255;
        const noise = noiseField(x, y) * noiseAmplitude;
        const arcNoise = arcNoiseField(x, y) * arcNoiseWeight;
        elevationRaw[i] = computeElevationRaw({
          crustBaseElevationUnit: crustUnit,
          upliftNorm,
          riftNorm,
          closenessNorm,
          noise,
          arcNoise,
          config,
        });
      }
    }

    const elevation = new Int16Array(size);
    if (edgeBlend > 0) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = y * width + x;
          let sum = elevationRaw[i];
          let count = 1;
          forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
            const ni = ny * width + nx;
            sum += elevationRaw[ni];
            count++;
          });
          const avg = sum / count;
          const closenessNorm = (closeness[i] ?? 0) / 255;
          const blended = blendBoundaryElevation({
            base: elevationRaw[i],
            neighborAverage: avg,
            closenessNorm,
            edgeBlend,
          });
          elevation[i] = quantizeElevation(blended);
        }
      }
    } else {
      for (let i = 0; i < size; i++) {
        elevation[i] = quantizeElevation(elevationRaw[i]);
      }
    }

    return { elevation };
  },
});

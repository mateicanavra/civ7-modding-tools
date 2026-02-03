import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeOceanThermalStateContract from "../contract.js";
import { computeOceanThermalState } from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeOceanThermalStateContract, "default", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = Math.max(0, width * height);

    if (!(input.latitudeByRow instanceof Float32Array) || input.latitudeByRow.length !== height) {
      throw new Error("[Hydrology] Invalid latitudeByRow for hydrology/compute-ocean-thermal-state.");
    }
    if (!(input.isWaterMask instanceof Uint8Array) || input.isWaterMask.length !== size) {
      throw new Error("[Hydrology] Invalid isWaterMask for hydrology/compute-ocean-thermal-state.");
    }
    if (!(input.shelfMask instanceof Uint8Array) || input.shelfMask.length !== size) {
      throw new Error("[Hydrology] Invalid shelfMask for hydrology/compute-ocean-thermal-state.");
    }
    if (!(input.currentU instanceof Int8Array) || input.currentU.length !== size) {
      throw new Error("[Hydrology] Invalid currentU for hydrology/compute-ocean-thermal-state.");
    }
    if (!(input.currentV instanceof Int8Array) || input.currentV.length !== size) {
      throw new Error("[Hydrology] Invalid currentV for hydrology/compute-ocean-thermal-state.");
    }

    return computeOceanThermalState(width, height, input.latitudeByRow, input.isWaterMask, input.shelfMask, input.currentU, input.currentV, {
      equatorTempC: config.equatorTempC,
      poleTempC: config.poleTempC,
      advectIters: config.advectIters,
      diffusion: config.diffusion,
      secondaryWeightMin: config.secondaryWeightMin,
      seaIceThresholdC: config.seaIceThresholdC,
    });
  },
});

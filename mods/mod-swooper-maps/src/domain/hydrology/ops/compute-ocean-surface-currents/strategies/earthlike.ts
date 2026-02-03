import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeOceanSurfaceCurrentsContract from "../contract.js";
import { computeCurrentsEarthlike } from "../rules/index.js";

export const earthlikeStrategy = createStrategy(ComputeOceanSurfaceCurrentsContract, "earthlike", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = Math.max(0, width * height);

    if (!(input.latitudeByRow instanceof Float32Array) || input.latitudeByRow.length !== height) {
      throw new Error("[Hydrology] Invalid latitudeByRow for hydrology/compute-ocean-surface-currents.");
    }
    if (!(input.isWaterMask instanceof Uint8Array) || input.isWaterMask.length !== size) {
      throw new Error("[Hydrology] Invalid isWaterMask for hydrology/compute-ocean-surface-currents.");
    }
    if (!(input.windU instanceof Int8Array) || input.windU.length !== size) {
      throw new Error("[Hydrology] Invalid windU for hydrology/compute-ocean-surface-currents.");
    }
    if (!(input.windV instanceof Int8Array) || input.windV.length !== size) {
      throw new Error("[Hydrology] Invalid windV for hydrology/compute-ocean-surface-currents.");
    }

    if (input.basinId !== undefined && (!(input.basinId instanceof Int32Array) || input.basinId.length !== size)) {
      throw new Error("[Hydrology] Invalid basinId for hydrology/compute-ocean-surface-currents.");
    }
    if (
      input.coastDistance !== undefined &&
      (!(input.coastDistance instanceof Uint16Array) || input.coastDistance.length !== size)
    ) {
      throw new Error("[Hydrology] Invalid coastDistance for hydrology/compute-ocean-surface-currents.");
    }
    if (
      input.coastTangentU !== undefined &&
      (!(input.coastTangentU instanceof Int8Array) || input.coastTangentU.length !== size)
    ) {
      throw new Error("[Hydrology] Invalid coastTangentU for hydrology/compute-ocean-surface-currents.");
    }
    if (
      input.coastTangentV !== undefined &&
      (!(input.coastTangentV instanceof Int8Array) || input.coastTangentV.length !== size)
    ) {
      throw new Error("[Hydrology] Invalid coastTangentV for hydrology/compute-ocean-surface-currents.");
    }

    return computeCurrentsEarthlike(width, height, input.latitudeByRow, input.isWaterMask, input.windU, input.windV, {
      basinId: input.basinId,
      coastDistance: input.coastDistance,
      coastTangentU: input.coastTangentU,
      coastTangentV: input.coastTangentV,
      maxSpeed: config.maxSpeed,
      windStrength: config.windStrength,
      ekmanStrength: config.ekmanStrength,
      gyreStrength: config.gyreStrength,
      coastStrength: config.coastStrength,
      smoothIters: config.smoothIters,
      projectionIters: config.projectionIters,
    });
  },
});


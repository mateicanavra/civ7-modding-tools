import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import { rampDown01, rampUp01, validateGridSize } from "../../score-shared/index.js";
import ScoreAtollContract from "../contract.js";

export const defaultStrategy = createStrategy(ScoreAtollContract, "default", {
  run: (input, config) => {
    const size = validateGridSize({
      width: input.width,
      height: input.height,
      fields: [
        { label: "landMask", arr: input.landMask as Uint8Array },
        { label: "surfaceTemperature", arr: input.surfaceTemperature as Float32Array },
        { label: "bathymetry", arr: input.bathymetry as Int16Array },
        { label: "shelfMask", arr: input.shelfMask as Uint8Array },
        { label: "coastalWater", arr: input.coastalWater as Uint8Array },
        { label: "distanceToCoast", arr: input.distanceToCoast as Uint16Array },
      ],
    });

    const score01 = new Float32Array(size);

    const shallowDepthM = Math.max(0, config.shallowDepthM | 0);
    const deepDepthM = Math.max(shallowDepthM + 1, config.deepDepthM | 0);
    const minDistanceToCoast = Math.max(0, config.minDistanceToCoast | 0);

    for (let i = 0; i < size; i++) {
      if (input.landMask[i] !== 0) continue;
      if (input.shelfMask[i] !== 1) continue;
      if (input.coastalWater[i] !== 0) continue;
      if ((input.distanceToCoast[i] ?? 0) < minDistanceToCoast) continue;

      // Atolls are isolated warm shallow banks, not every warm coastal reef
      // tile. The coast-distance gate keeps them out of fringing reef habitat.
      const warmSuit = rampUp01(
        input.surfaceTemperature[i],
        config.tempWarmStartC,
        config.tempWarmEndC
      );

      const depth = Math.max(0, -(input.bathymetry[i] | 0));
      const shallowSuit = rampDown01(depth, shallowDepthM, deepDepthM);

      score01[i] = clamp01(warmSuit * shallowSuit);
    }

    return { score01 };
  },
});

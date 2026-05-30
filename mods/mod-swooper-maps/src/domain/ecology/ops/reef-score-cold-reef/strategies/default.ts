import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import { rampDown01, validateGridSize, window01 } from "../../score-shared/index.js";
import ScoreColdReefContract from "../contract.js";

export const defaultStrategy = createStrategy(ScoreColdReefContract, "default", {
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

    const minDepthM = Math.max(0, config.minDepthM | 0);
    const peakDepthM = Math.max(minDepthM + 1, config.peakDepthM | 0);
    const maxDepthM = Math.max(peakDepthM + 1, config.maxDepthM | 0);
    const minDistanceToCoast = Math.max(0, config.minDistanceToCoast | 0);
    const maxDistanceToCoast = Math.max(minDistanceToCoast, config.maxDistanceToCoast | 0);

    for (let i = 0; i < size; i++) {
      if (input.landMask[i] !== 0) continue;
      if (input.shelfMask[i] !== 1) continue;
      const distanceToCoast = input.distanceToCoast[i] ?? 0;
      if (distanceToCoast < minDistanceToCoast || distanceToCoast > maxDistanceToCoast) continue;

      // Civ7 cold reefs are coast-terrain features. Swooper projects shelfMask
      // water to TERRAIN_COAST, so the score must stay on that surface instead
      // of open ocean where the real engine rejects cold reefs.
      const coldSuit = rampDown01(
        input.surfaceTemperature[i],
        config.tempColdMaxC,
        config.tempWarmMaxC
      );

      const depth = Math.max(0, -(input.bathymetry[i] | 0));
      const depthSuit =
        minDepthM === 0 && depth === 0
          ? rampDown01(depth, peakDepthM, maxDepthM)
          : window01(depth, minDepthM, peakDepthM, maxDepthM);

      score01[i] = clamp01(coldSuit * depthSuit);
    }

    return { score01 };
  },
});

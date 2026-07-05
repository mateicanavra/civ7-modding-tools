import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import { rampDown01, rampUp01, validateGridSize } from "../../../model/policy/feature-score-selection.js";
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
        { label: "openOceanMask", arr: input.openOceanMask as Uint8Array },
        { label: "coastalWater", arr: input.coastalWater as Uint8Array },
        { label: "distanceToCoast", arr: input.distanceToCoast as Uint16Array },
      ],
    });

    const score01 = new Float32Array(size);

    const shallowDepthM = Math.max(0, config.shallowDepthM | 0);
    const deepDepthM = Math.max(shallowDepthM + 1, config.deepDepthM | 0);
    const minDistanceToCoast = Math.max(0, config.minDistanceToCoast | 0);
    const maxDistanceToCoast = Math.max(minDistanceToCoast, config.maxDistanceToCoast | 0);

    for (let i = 0; i < size; i++) {
      if (input.landMask[i] !== 0) continue;
      // Atolls MUST sit on ocean terrain: Civ7 rejects FEATURE_ATOLL on coast, and the
      // continental shelf (shelfMask) projects to TERRAIN_COAST. So atolls only score on
      // open-ocean banks beyond the shelf. (A wider shelf therefore yields fewer atolls by
      // converting nearshore shallow banks into coast — an intended shelf-width tradeoff,
      // not a scoring bug: placing atolls on shelf tiles only produces apply-time rejects.)
      if (input.openOceanMask[i] !== 1) continue;
      if (input.shelfMask[i] === 1) continue;
      if (input.coastalWater[i] !== 0) continue;
      const distanceToCoast = input.distanceToCoast[i] ?? 0;
      if (distanceToCoast < minDistanceToCoast || distanceToCoast > maxDistanceToCoast) continue;

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

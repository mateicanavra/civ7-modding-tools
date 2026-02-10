import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import { rampDown01, validateGridSize } from "../../score-shared/index.js";
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
      ],
    });

    const score01 = new Float32Array(size);

    const shallowDepthM = Math.max(0, config.shallowDepthM | 0);
    const deepDepthM = Math.max(shallowDepthM + 1, config.deepDepthM | 0);

    for (let i = 0; i < size; i++) {
      if (input.landMask[i] !== 0) continue;

      const coldSuit = rampDown01(
        input.surfaceTemperature[i],
        config.tempColdMaxC,
        config.tempWarmMaxC
      );

      const depth = Math.max(0, -(input.bathymetry[i] | 0));
      const shallowSuit = rampDown01(depth, shallowDepthM, deepDepthM);

      score01[i] = clamp01(coldSuit * shallowSuit);
    }

    return { score01 };
  },
});


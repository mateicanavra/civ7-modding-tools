import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import { rampDown01, rampUp01, validateGridSize } from "../../score-shared/index.js";
import ScoreIceContract from "../contract.js";

export const defaultStrategy = createStrategy(ScoreIceContract, "default", {
  run: (input, config) => {
    const size = validateGridSize({
      width: input.width,
      height: input.height,
      fields: [
        { label: "landMask", arr: input.landMask as Uint8Array },
        { label: "surfaceTemperature", arr: input.surfaceTemperature as Float32Array },
        { label: "elevation", arr: input.elevation as Int16Array },
        { label: "freezeIndex", arr: input.freezeIndex as Float32Array },
      ],
    });

    const score01 = new Float32Array(size);

    const elevMin = config.alpineElevationMinM | 0;
    const elevMax = Math.max(elevMin + 1, config.alpineElevationMaxM | 0);

    for (let i = 0; i < size; i++) {
      const temp = input.surfaceTemperature[i];
      const isLand = input.landMask[i] !== 0;

      let seaIceSuit = 0;
      if (!isLand) {
        seaIceSuit = rampDown01(temp, config.seaTempColdC, config.seaTempWarmC);
      }

      let alpineSuit = 0;
      if (isLand) {
        const elev = input.elevation[i] | 0;
        const elevSuit = rampUp01(elev, elevMin, elevMax);
        const freezeSuit = rampUp01(input.freezeIndex[i], config.alpineFreezeMin01, 1);
        alpineSuit = elevSuit * freezeSuit;
      }

      score01[i] = clamp01(Math.max(seaIceSuit, alpineSuit));
    }

    return { score01 };
  },
});


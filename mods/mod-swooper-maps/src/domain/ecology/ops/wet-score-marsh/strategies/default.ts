import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import {
  rampDown01,
  rampUp01,
  validateGridSize,
  window01,
} from "../../../model/policy/feature-score-selection.js";
import ScoreWetMarshContract from "../contract.js";

export const defaultStrategy = createStrategy(ScoreWetMarshContract, "default", {
  run: (input, config) => {
    const size = validateGridSize({
      width: input.width,
      height: input.height,
      fields: [
        { label: "landMask", arr: input.landMask as Uint8Array },
        { label: "hydromorphicMask", arr: input.hydromorphicMask as Uint8Array },
        { label: "water01", arr: input.water01 as Float32Array },
        { label: "fertility01", arr: input.fertility01 as Float32Array },
        { label: "surfaceTemperature", arr: input.surfaceTemperature as Float32Array },
        { label: "aridityIndex", arr: input.aridityIndex as Float32Array },
      ],
    });

    const score01 = new Float32Array(size);

    for (let i = 0; i < size; i++) {
      if (input.landMask[i] === 0) continue;
      if (input.hydromorphicMask[i] === 0) continue;

      // Marshes are waterlogged landforms first and humid biomes second; this
      // gate stops broad moisture from painting well-drained land as marsh.
      const waterSuit = rampUp01(input.water01[i], config.waterMin01, 1);
      const fertilitySuit = rampUp01(input.fertility01[i], config.fertilityMin01, 1);
      const tempSuit = window01(
        input.surfaceTemperature[i],
        config.tempMinC,
        config.tempPeakC,
        config.tempMaxC
      );
      const ariditySuit = rampDown01(input.aridityIndex[i], config.aridityMax01, 1);

      score01[i] = clamp01(waterSuit * fertilitySuit * tempSuit * ariditySuit);
    }

    return { score01 };
  },
});

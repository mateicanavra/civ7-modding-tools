import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import { rampDown01, rampUp01, validateGridSize } from "../../score-shared/index.js";
import ScoreWetTundraBogContract from "../contract.js";

export const defaultStrategy = createStrategy(ScoreWetTundraBogContract, "default", {
  run: (input, config) => {
    const size = validateGridSize({
      width: input.width,
      height: input.height,
      fields: [
        { label: "landMask", arr: input.landMask as Uint8Array },
        { label: "nearRiverMask", arr: input.nearRiverMask as Uint8Array },
        { label: "water01", arr: input.water01 as Float32Array },
        { label: "fertility01", arr: input.fertility01 as Float32Array },
        { label: "surfaceTemperature", arr: input.surfaceTemperature as Float32Array },
        { label: "freezeIndex", arr: input.freezeIndex as Float32Array },
      ],
    });

    const score01 = new Float32Array(size);

    for (let i = 0; i < size; i++) {
      if (input.landMask[i] === 0) continue;
      if (input.nearRiverMask[i] === 0) continue;

      const waterSuit = rampUp01(input.water01[i], config.waterMin01, 1);
      const fertilitySuit = rampUp01(input.fertility01[i], config.fertilityMin01, 1);
      const coldSuit = rampDown01(
        input.surfaceTemperature[i],
        config.tempColdMaxC,
        config.tempWarmMaxC
      );
      const freezeSuit = rampUp01(input.freezeIndex[i], config.freezeMin01, 1);

      score01[i] = clamp01(waterSuit * fertilitySuit * coldSuit * freezeSuit);
    }

    return { score01 };
  },
});


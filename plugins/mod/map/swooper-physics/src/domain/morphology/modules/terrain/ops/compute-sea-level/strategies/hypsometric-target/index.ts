import { createLabelRng } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeSeaLevelContract from "../../contract.js";
import { resolveSeaLevel, resolveTargetPercent } from "../../rules/index.js";
import StrategyDefinition from "./config.js";

/** Binds the `hypsometric-target` algorithm to the shared `morphology/compute-sea-level` operation contract. */
export default createStrategy(ComputeSeaLevelContract, StrategyDefinition, {
  run: (input, config) => {
    const { elevation, crustType, boundaryCloseness } = input;
    const rng = createLabelRng(input.rngSeed | 0);
    const targetPct = resolveTargetPercent(config, rng);

    const values = Array.from(elevation);
    values.sort((a, b) => a - b);

    const seaLevel = resolveSeaLevel({
      values,
      targetPct,
      elevation,
      crustType,
      boundaryCloseness,
      boundaryTarget: config.boundaryShareTarget,
      continentalTarget: config.continentalFraction,
    });

    return { seaLevel };
  },
});

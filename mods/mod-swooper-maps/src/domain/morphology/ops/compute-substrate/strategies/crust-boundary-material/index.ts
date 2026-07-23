import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeSubstrateContract from "../../contract.js";
import { erodibilityForTile, sedimentDepthForTile } from "../../rules/index.js";
import StrategyContract from "./contract.js";

/** Binds the `crust-boundary-material` algorithm to the shared `morphology/compute-substrate` operation contract. */
export default createStrategy(ComputeSubstrateContract, StrategyContract, {
  run: (input, config) => {
    const {
      width,
      height,
      upliftPotential: uplift,
      riftPotential: rift,
      boundaryCloseness,
      boundaryType,
      crustType,
      crustAge,
    } = input;
    const size = width * height;

    const erodibilityK = new Float32Array(size);
    const sedimentDepth = new Float32Array(size);

    for (let i = 0; i < size; i++) {
      erodibilityK[i] = erodibilityForTile(
        config,
        uplift[i] ?? 0,
        boundaryCloseness[i] ?? 0,
        boundaryType[i] ?? 0,
        crustType[i] ?? 0,
        crustAge[i] ?? 0
      );
      sedimentDepth[i] = sedimentDepthForTile(
        config,
        rift[i] ?? 0,
        boundaryCloseness[i] ?? 0,
        boundaryType[i] ?? 0,
        crustType[i] ?? 0,
        crustAge[i] ?? 0
      );
    }

    return { erodibilityK, sedimentDepth };
  },
});

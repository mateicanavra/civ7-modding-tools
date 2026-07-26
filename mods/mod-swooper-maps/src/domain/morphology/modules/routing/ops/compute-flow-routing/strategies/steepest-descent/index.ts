import { createStrategy } from "@swooper/mapgen-core/authoring";
import { selectFlowReceiver } from "@swooper/mapgen-core/lib/grid";
import ComputeFlowRoutingContract from "../../contract.js";
import { computeFlowAccumulation } from "../../rules/index.js";
import StrategyDefinition from "./config.js";

/** Binds the `steepest-descent` algorithm to the shared `morphology/compute-flow-routing` operation contract. */
export default createStrategy(ComputeFlowRoutingContract, StrategyDefinition, {
  run: (input) => {
    const { width, height, elevation, landMask } = input;
    const size = width * height;

    const flowDir = new Int32Array(size);
    flowDir.fill(-1);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (landMask[i] === 0) {
          flowDir[i] = -1;
          continue;
        }
        flowDir[i] = selectFlowReceiver(x, y, width, height, elevation);
      }
    }
    const flowAccum = computeFlowAccumulation(elevation, landMask, flowDir);

    const basinId = new Int32Array(size);
    basinId.fill(-1);

    return { flowDir, flowAccum, basinId };
  },
});

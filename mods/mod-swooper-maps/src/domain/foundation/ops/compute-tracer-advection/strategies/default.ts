import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeTracerAdvectionContract from "../contract.js";
import { computeTracerIndexByEra } from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeTracerAdvectionContract, "default", {
  run: (input) => {
    const mesh = input.mesh;
    const mantleForcing = input.mantleForcing;
    if ((mantleForcing.cellCount | 0) !== (mesh.cellCount | 0)) {
      throw new Error("[Foundation] Invalid mantleForcing.cellCount for compute-tracer-advection.");
    }

    const tracerIndex = computeTracerIndexByEra({
      mesh,
      mantleForcing,
      eras: input.eras,
      eraCount: input.eraCount,
    });
    return { tracerIndex } as const;
  },
});

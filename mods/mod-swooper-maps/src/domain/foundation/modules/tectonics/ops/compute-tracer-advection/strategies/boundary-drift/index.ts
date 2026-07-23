import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeTracerAdvectionContract from "../../contract.js";
import { computeTracerIndexByEra } from "../../rules/index.js";
import BoundaryDriftContract from "./contract.js";

/**
 * Advects tracers with mantle forcing and reconstructed boundary drift.
 * This semantic strategy keeps the numerical transport policy replaceable behind one operation contract.
 */
export default createStrategy(ComputeTracerAdvectionContract, BoundaryDriftContract, {
  run: (input) => {
    const mesh = input.mesh;
    const mantleForcing = input.mantleForcing;
    const tracerIndex = computeTracerIndexByEra({
      mesh,
      mantleForcing,
      eras: input.eras,
      eraCount: input.eraCount,
    });
    return { tracerIndex } as const;
  },
});

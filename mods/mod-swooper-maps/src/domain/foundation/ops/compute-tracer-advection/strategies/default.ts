import { createStrategy } from "@swooper/mapgen-core/authoring";

import { computeTracerIndexByEra, requireMantleForcing, requireMesh } from "../rules/index.js";
import ComputeTracerAdvectionContract from "../contract.js";

export const defaultStrategy = createStrategy(ComputeTracerAdvectionContract, "default", {
  run: (input) => {
    const mesh = requireMesh(input.mesh, "foundation/compute-tracer-advection");
    const mantleForcing = requireMantleForcing(
      input.mantleForcing,
      mesh.cellCount | 0,
      "foundation/compute-tracer-advection"
    );
    const tracerIndex = computeTracerIndexByEra({
      mesh,
      mantleForcing,
      eras: input.eras,
      eraCount: input.eraCount,
    });
    return { tracerIndex } as const;
  },
});

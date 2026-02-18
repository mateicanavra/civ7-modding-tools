import { createOp } from "@swooper/mapgen-core/authoring";

import { requireMantleForcing, requireMesh } from "../../lib/require.js";
import { computeTracerIndexByEra } from "../compute-tectonic-history/lib/pipeline-core.js";
import ComputeTracerAdvectionContract from "./contract.js";

const computeTracerAdvection = createOp(ComputeTracerAdvectionContract, {
  strategies: {
    default: {
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
    },
  },
});

export default computeTracerAdvection;

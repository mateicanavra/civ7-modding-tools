import { createOp } from "@swooper/mapgen-core/authoring";

import { requireMesh, requirePlateGraph } from "../../lib/require.js";
import { computeTectonicProvenance } from "../compute-tectonic-history/lib/pipeline-core.js";
import ComputeTectonicProvenanceContract from "./contract.js";

const computeTectonicProvenanceOp = createOp(ComputeTectonicProvenanceContract, {
  strategies: {
    default: {
      run: (input) => {
        const mesh = requireMesh(input.mesh, "foundation/compute-tectonic-provenance");
        const plateGraph = requirePlateGraph(
          input.plateGraph,
          mesh.cellCount | 0,
          "foundation/compute-tectonic-provenance"
        );

        const tectonicProvenance = computeTectonicProvenance({
          mesh,
          plateGraph,
          eras: input.eras,
          tracerIndex: input.tracerIndex,
          eraCount: input.eraCount,
        });

        return { tectonicProvenance } as const;
      },
    },
  },
});

export default computeTectonicProvenanceOp;

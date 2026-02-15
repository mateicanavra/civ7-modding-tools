import { createStrategy } from "@swooper/mapgen-core/authoring";

import { computeTectonicProvenance, requireMesh, requirePlateGraph } from "../rules/index.js";
import ComputeTectonicProvenanceContract from "../contract.js";

export const defaultStrategy = createStrategy(ComputeTectonicProvenanceContract, "default", {
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
});

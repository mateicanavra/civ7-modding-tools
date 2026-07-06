import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeTectonicProvenanceContract from "../contract.js";
import { computeTectonicProvenance } from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeTectonicProvenanceContract, "default", {
  run: (input) => {
    const mesh = input.mesh;
    const plateGraph = input.plateGraph;
    const cellCount = mesh.cellCount | 0;
    if (plateGraph.cellToPlate.length !== cellCount) {
      throw new Error(
        "[Foundation] Invalid plateGraph.cellToPlate for compute-tectonic-provenance."
      );
    }
    for (let era = 0; era < input.tracerIndex.length; era++) {
      if (input.tracerIndex[era]?.length !== cellCount) {
        throw new Error(
          `[Foundation] Invalid tracerIndex[${era}].cellCount for compute-tectonic-provenance.`
        );
      }
    }

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

import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeTectonicProvenanceContract from "../contract.js";
import { computeTectonicProvenance } from "../rules/index.js";

/**
 * Reconstructs lineage from advected tracers and thresholded tectonic resets.
 * The strategy composes provenance rules while leaving its contract stable for the tectonics router.
 */
export const advectedLineageStrategy = createStrategy(
  ComputeTectonicProvenanceContract,
  "advected-lineage",
  {
    run: (input) => {
      const mesh = input.mesh;
      const plateGraph = input.plateGraph;
      const tectonicProvenance = computeTectonicProvenance({
        mesh,
        plateGraph,
        eras: input.eras,
        tracerIndex: input.tracerIndex,
        eraCount: input.eraCount,
      });

      return { tectonicProvenance } as const;
    },
  }
);

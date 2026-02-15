import { createOp } from "@swooper/mapgen-core/authoring";

import { buildTectonicsCurrent } from "../compute-tectonic-history/lib/pipeline-core.js";
import ComputeTectonicsCurrentContract from "./contract.js";

const computeTectonicsCurrent = createOp(ComputeTectonicsCurrentContract, {
  strategies: {
    default: {
      run: (input) => {
        const tectonics = buildTectonicsCurrent({
          newestEra: input.newestEra,
          upliftTotal: input.upliftTotal,
        });
        return { tectonics } as const;
      },
    },
  },
});

export default computeTectonicsCurrent;

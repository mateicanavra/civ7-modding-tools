import { createOp } from "@swooper/mapgen-core/authoring";

import { buildTectonicHistoryRollups } from "../compute-tectonic-history/lib/pipeline-core.js";
import ComputeTectonicHistoryRollupsContract from "./contract.js";

const computeTectonicHistoryRollups = createOp(ComputeTectonicHistoryRollupsContract, {
  strategies: {
    default: {
      run: (input, config) => {
        const tectonicHistory = buildTectonicHistoryRollups({
          eras: input.eras,
          plateIdByEra: input.plateIdByEra,
          activityThreshold: config.activityThreshold,
        });
        return { tectonicHistory } as const;
      },
    },
  },
});

export default computeTectonicHistoryRollups;

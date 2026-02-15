import { createStrategy } from "@swooper/mapgen-core/authoring";

import { buildTectonicHistoryRollups } from "../rules/index.js";
import ComputeTectonicHistoryRollupsContract from "../contract.js";

export const defaultStrategy = createStrategy(ComputeTectonicHistoryRollupsContract, "default", {
  run: (input, config) => {
    const tectonicHistory = buildTectonicHistoryRollups({
      eras: input.eras,
      plateIdByEra: input.plateIdByEra,
      activityThreshold: config.activityThreshold,
    });
    return { tectonicHistory } as const;
  },
});

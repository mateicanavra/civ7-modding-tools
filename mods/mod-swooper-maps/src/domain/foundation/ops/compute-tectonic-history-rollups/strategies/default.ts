import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeTectonicHistoryRollupsContract from "../contract.js";
import { buildTectonicHistoryRollups } from "../rules/index.js";

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

import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeTectonicHistoryRollupsContract from "../../contract.js";
import { buildTectonicHistoryRollups } from "../../rules/index.js";
import CumulativeEraRollupDefinition from "./config.js";

/**
 * Reduces ordered era fields and membership into cumulative totals, recent fractions, and
 * last-active evidence. The authored threshold affects recency admission, not the underlying era
 * fields.
 */
export default createStrategy(
  ComputeTectonicHistoryRollupsContract,
  CumulativeEraRollupDefinition,
  {
    run: (input, config) => {
      const tectonicHistory = buildTectonicHistoryRollups({
        eras: input.eras,
        plateIdByEra: input.plateIdByEra,
        activityThreshold: config.activityThreshold,
      });
      return { tectonicHistory } as const;
    },
  }
);

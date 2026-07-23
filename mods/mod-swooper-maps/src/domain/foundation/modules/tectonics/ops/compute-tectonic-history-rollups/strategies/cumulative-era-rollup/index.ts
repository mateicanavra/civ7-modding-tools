import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeTectonicHistoryRollupsContract from "../../contract.js";
import { buildTectonicHistoryRollups } from "../../rules/index.js";
import CumulativeEraRollupDefinition from "./config.js";

/** Attaches cumulative era aggregation to the tectonic-history operation contract. */
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

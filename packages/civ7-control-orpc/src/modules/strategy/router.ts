import { strategyCivilianRouteTriageProcedure } from "./procedures/civilian-route-triage";
import { strategyFormationSnapshotProcedure } from "./procedures/formation-snapshot";
import { strategyFrontSummaryProcedure } from "./procedures/front-summary";

export const strategyRouter = {
  civilianRouteTriage: strategyCivilianRouteTriageProcedure,
  formationSnapshot: strategyFormationSnapshotProcedure,
  frontSummary: strategyFrontSummaryProcedure,
};

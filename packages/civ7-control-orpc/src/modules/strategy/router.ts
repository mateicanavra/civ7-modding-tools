import { strategyCivilianRouteTriageProcedure } from "./procedures/civilian-route-triage";
import { strategyFrontSummaryProcedure } from "./procedures/front-summary";

export const strategyRouter = {
  civilianRouteTriage: strategyCivilianRouteTriageProcedure,
  frontSummary: strategyFrontSummaryProcedure,
};

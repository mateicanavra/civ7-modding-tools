import { strategyCivilianRouteTriageProcedure } from "./procedures/civilian-route-triage";
import { strategyFormationSnapshotProcedure } from "./procedures/formation-snapshot";
import { strategyFrontSummaryProcedure } from "./procedures/front-summary";
import {
  strategyDestinationAnalysisProcedure,
  strategyTargetCandidatesProcedure,
} from "./procedures/tactical-reads";

export const strategyRouter = {
  civilianRouteTriage: strategyCivilianRouteTriageProcedure,
  destinationAnalysis: strategyDestinationAnalysisProcedure,
  formationSnapshot: strategyFormationSnapshotProcedure,
  frontSummary: strategyFrontSummaryProcedure,
  targetCandidates: strategyTargetCandidatesProcedure,
};

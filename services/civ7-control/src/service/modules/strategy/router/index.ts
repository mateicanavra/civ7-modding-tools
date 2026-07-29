import { civilianRouteTriage } from "./civilian-route-triage";
import { formationSnapshot } from "./formation-snapshot";
import { frontSummary } from "./front-summary";
import { tacticalReads } from "./tactical-reads";
export const router = {
  battlefieldScan: tacticalReads.strategyBattlefieldScanProcedure,
  civilianRouteTriage: civilianRouteTriage,
  destinationAnalysis: tacticalReads.strategyDestinationAnalysisProcedure,
  formationSnapshot: formationSnapshot,
  frontSummary: frontSummary,
  targetCandidates: tacticalReads.strategyTargetCandidatesProcedure,
};

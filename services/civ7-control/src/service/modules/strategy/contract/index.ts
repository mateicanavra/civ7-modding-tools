import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";
import { civilianRouteTriage } from "./civilian-route-triage";
import { formationSnapshot } from "./formation-snapshot";
import { frontSummary } from "./front-summary";
import { tacticalReads } from "./tactical-reads";
export const contract = {
  ...civilianRouteTriage,
  ...formationSnapshot,
  ...frontSummary,
  ...tacticalReads,
};
type Inputs = InferContractRouterInputs<typeof contract>;
type Outputs = InferContractRouterOutputs<typeof contract>;
export type Civ7StrategyFrontSummaryInput = Inputs["frontSummary"];
export type Civ7StrategyFrontSummaryResult = Outputs["frontSummary"];
export type Civ7StrategyTargetCandidatesResult = Outputs["targetCandidates"];
export type Civ7StrategyDestinationAnalysisResult = Outputs["destinationAnalysis"];
export type Civ7StrategyBattlefieldScanResult = Outputs["battlefieldScan"];
export type Civ7StrategyCivilianRouteTriageInput = Inputs["civilianRouteTriage"];
export type Civ7StrategyCivilianRouteTriageResult = Outputs["civilianRouteTriage"];
export type Civ7StrategyFormationSnapshotInput = Inputs["formationSnapshot"];
export type Civ7StrategyFormationSnapshotResult = Outputs["formationSnapshot"];

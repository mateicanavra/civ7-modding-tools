/**
 * Placement stage artifact collection (placement-realignment S6).
 *
 * Artifact contracts live one-per-file under `artifacts/*.artifact.ts`;
 * this module only assembles the stage consumer surface.
 */
import { artifactContracts as placementArtifactContracts } from "./artifacts/index.js";

export const placementArtifacts = {
  placementInputs: placementArtifactContracts.placementInputs.artifact,
  resourceDemandPlan: placementArtifactContracts.resourceDemandPlan.artifact,
  resourcePlan: placementArtifactContracts.resourcePlan.artifact,
  resourceEligibility: placementArtifactContracts.resourceEligibility.artifact,
  resourcePlanAdjusted: placementArtifactContracts.resourcePlanAdjusted.artifact,
  naturalWonderPlan: placementArtifactContracts.naturalWonderPlan.artifact,
  naturalWonderPlacement: placementArtifactContracts.naturalWonderPlacement.artifact,
  placementSurfacePreparation: placementArtifactContracts.placementSurfacePreparation.artifact,
  resourcePlacementOutcomes: placementArtifactContracts.resourcePlacementOutcomes.artifact,
  discoveryPlacementOutcomes: placementArtifactContracts.discoveryPlacementOutcomes.artifact,
  startAssignment: placementArtifactContracts.startAssignment.artifact,
  advancedStartAssignment: placementArtifactContracts.advancedStartAssignment.artifact,
  placementOutputs: placementArtifactContracts.placementOutputs.artifact,
  engineState: placementArtifactContracts.engineState.artifact,
} as const;

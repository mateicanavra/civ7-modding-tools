import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { applyPlacementPlan } from "./apply.js";
import PlacementStepContract from "./contract.js";
import { placementArtifacts } from "../../artifacts.js";
import { mapArtifacts } from "../../../../map-artifacts.js";
export default createStep(PlacementStepContract, {
  artifacts: implementArtifacts(
    [
      placementArtifacts.placementOutputs,
      placementArtifacts.engineState,
      mapArtifacts.placementEngineTerrainSnapshot,
    ],
    {
      placementOutputs: {},
      engineState: {},
      placementEngineTerrainSnapshot: {},
    }
  ),
  run: (context, _config, _ops, deps) => {
    const naturalWonderPlacement = deps.artifacts.naturalWonderPlacement.read(context);
    const surfacePreparation = deps.artifacts.placementSurfacePreparation.read(context);
    const resourcePlacement = deps.artifacts.resourcePlacementOutcomes.read(context);
    const startAssignment = deps.artifacts.startAssignment.read(context);
    const discoveryPlacement = deps.artifacts.discoveryPlacementOutcomes.read(context);
    const advancedStartAssignment = deps.artifacts.advancedStartAssignment.read(context);
    const landmassRegionSlotByTile = deps.artifacts.landmassRegionSlotByTile.read(context);

    applyPlacementPlan({
      context,
      naturalWonderPlacement,
      surfacePreparation,
      resourcePlacement,
      startAssignment,
      discoveryPlacement,
      advancedStartAssignment,
      landmassRegionSlotByTile,
      publishOutputs: (outputs) => deps.artifacts.placementOutputs.publish(context, outputs),
      publishEngineState: (engineState) => deps.artifacts.engineState.publish(context, engineState),
      publishEngineTerrainSnapshot: (snapshot) =>
        deps.artifacts.placementEngineTerrainSnapshot.publish(context, snapshot),
    });
  },
});

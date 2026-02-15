import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { buildPlacementPlanInput } from "./inputs.js";
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
    },
  ),
  run: (context, _config, _ops, deps) => {
    const placementInputs = deps.artifacts.placementInputs.read(context);
    const landmassRegionSlotByTile = deps.artifacts.landmassRegionSlotByTile.read(context);
    const { starts, wonders, floodplains } = buildPlacementPlanInput(placementInputs);

    applyPlacementPlan({
      context,
      starts,
      wonders,
      floodplains,
      landmassRegionSlotByTile,
      publishOutputs: (outputs) =>
        deps.artifacts.placementOutputs.publish(context, outputs),
      publishEngineState: (engineState) =>
        deps.artifacts.engineState.publish(context, engineState),
      publishEngineTerrainSnapshot: (snapshot) =>
        deps.artifacts.placementEngineTerrainSnapshot.publish(context, snapshot),
    });
  },
});

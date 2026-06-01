import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { buildPlacementPlanInput } from "../derive-placement-inputs/inputs.js";
import { runPlacementProductStep } from "../product-runtime.js";
import {
  assignStartPositions,
  emitStartPositionsViz,
  emitStartSectorViz,
} from "./materialize.js";
import { placementArtifacts } from "../../artifacts.js";
import AssignStartsStepContract from "./contract.js";

export default createStep(AssignStartsStepContract, {
  artifacts: implementArtifacts([placementArtifacts.startAssignment], {
    startAssignment: {},
  }),
  run: (context, _config, _ops, deps) => {
    const placementInputs = deps.artifacts.placementInputs.read(context);
    deps.artifacts.placementSurfacePreparation.read(context);
    const landmassRegionSlotByTile = deps.artifacts.landmassRegionSlotByTile.read(context);
    const { starts } = buildPlacementPlanInput(placementInputs);
    const slotByTile = landmassRegionSlotByTile.slotByTile as Uint8Array;
    const emit = (payload: Record<string, unknown>): void => {
      if (!context.trace?.isVerbose) return;
      context.trace.event(() => payload);
    };

    const assignment = runPlacementProductStep("placement.starts", emit, () =>
      assignStartPositions({ context, starts, slotByTile })
    );
    emitStartSectorViz(context, slotByTile, starts);
    emitStartPositionsViz(context, assignment.positions);
    deps.artifacts.startAssignment.publish(context, assignment);
  },
});

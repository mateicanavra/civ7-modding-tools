import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { buildPlacementPlanInput } from "../placement/inputs.js";
import {
  stampNaturalWondersFromPlan,
  type NaturalWonderStampingStats,
} from "../placement/apply.js";
import { placementArtifacts } from "../../artifacts.js";
import PlaceNaturalWondersStepContract from "./contract.js";

export default createStep(PlaceNaturalWondersStepContract, {
  artifacts: implementArtifacts([placementArtifacts.naturalWonderPlacement], {
    naturalWonderPlacement: {},
  }),
  run: (context, _config, _ops, deps) => {
    const placementInputs = deps.artifacts.placementInputs.read(context);
    const naturalWonderPlan = deps.artifacts.naturalWonderPlan.read(context);
    const { wonders } = buildPlacementPlanInput(placementInputs);
    const { width, height } = context.dimensions;

    const stamping: NaturalWonderStampingStats = stampNaturalWondersFromPlan({
      adapter: context.adapter,
      width,
      height,
      wonders: naturalWonderPlan,
      requestedCount: wonders.wondersCount,
    });

    deps.artifacts.naturalWonderPlacement.publish(context, stamping);
  },
});

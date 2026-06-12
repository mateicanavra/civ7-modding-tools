import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import {
  logNaturalWonderPlacementRuntimeTelemetry,
  stampNaturalWondersFromPlan,
  type NaturalWonderStampingStats,
} from "./materialize.js";
import { placementArtifacts } from "../../artifacts.js";
import { validateNaturalWonderPlacementArtifact } from "./validate.js";
import PlaceNaturalWondersStepContract from "./contract.js";

export default createStep(PlaceNaturalWondersStepContract, {
  artifacts: implementArtifacts([placementArtifacts.naturalWonderPlacement], {
    naturalWonderPlacement: {
      validate: (value) => validateNaturalWonderPlacementArtifact(value),
    },
  }),
  run: (context, _config, _ops, deps) => {
    const placementInputs = deps.artifacts.placementInputs.read(context);
    const naturalWonderPlan = deps.artifacts.naturalWonderPlan.read(context);
    const { width, height } = context.dimensions;

    const stamping: NaturalWonderStampingStats = stampNaturalWondersFromPlan({
      adapter: context.adapter,
      width,
      height,
      wonders: naturalWonderPlan,
      requestedCount: placementInputs.wonders.wondersCount,
    });

    deps.artifacts.naturalWonderPlacement.publish(context, stamping);
    logNaturalWonderPlacementRuntimeTelemetry(stamping);
  },
});

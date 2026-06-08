import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { runPlacementProductStep } from "../product-runtime.js";
import {
  logResourcePlacementRuntimeTelemetry,
  placeResourcesWithTypedOutcomes,
} from "./materialize.js";
import { placementArtifacts } from "../../artifacts.js";
import PlaceResourcesStepContract from "./contract.js";

export default createStep(PlaceResourcesStepContract, {
  artifacts: implementArtifacts([placementArtifacts.resourcePlacementOutcomes], {
    resourcePlacementOutcomes: {},
  }),
  run: (context, _config, _ops, deps) => {
    const resources = deps.artifacts.resourcePlan.read(context);
    deps.artifacts.placementSurfacePreparation.read(context);
    const { width, height } = context.dimensions;
    const emit = (payload: Record<string, unknown>): void => {
      if (!context.trace?.isVerbose) return;
      context.trace.event(() => payload);
    };

    const outcomes = runPlacementProductStep("placement.resources", emit, () =>
      placeResourcesWithTypedOutcomes({ adapter: context.adapter, width, height, resources })
    );
    logResourcePlacementRuntimeTelemetry(
      outcomes.summary,
      outcomes.assignment,
      outcomes.outcomes
    );
    deps.artifacts.resourcePlacementOutcomes.publish(context, outcomes);
  },
});

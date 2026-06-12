import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { runPlacementProductStep } from "../product-runtime.js";
import { placeDiscoveriesWithTypedOutcomes } from "./materialize.js";
import { placementArtifacts } from "../../artifacts.js";
import { validateDiscoveryPlacementOutcomesArtifact } from "./validate.js";
import PlaceDiscoveriesStepContract from "./contract.js";

export default createStep(PlaceDiscoveriesStepContract, {
  artifacts: implementArtifacts([placementArtifacts.discoveryPlacementOutcomes], {
    discoveryPlacementOutcomes: {
      validate: (value) => validateDiscoveryPlacementOutcomesArtifact(value),
    },
  }),
  run: (context, _config, _ops, deps) => {
    const discoveries = deps.artifacts.discoveryPlan.read(context);
    const { width, height } = context.dimensions;
    const emit = (payload: Record<string, unknown>): void => {
      if (!context.trace?.isVerbose) return;
      context.trace.event(() => payload);
    };

    const outcomes = runPlacementProductStep("placement.discoveries", emit, () =>
      placeDiscoveriesWithTypedOutcomes({ adapter: context.adapter, width, height, discoveries })
    );
    deps.artifacts.discoveryPlacementOutcomes.publish(context, outcomes);
  },
});

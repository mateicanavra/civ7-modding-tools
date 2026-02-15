import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import DerivePlacementInputsContract from "./contract.js";
import { buildPlacementInputs } from "./inputs.js";
import { placementArtifacts } from "../../artifacts.js";

export default createStep(DerivePlacementInputsContract, {
  artifacts: implementArtifacts([
    placementArtifacts.placementInputs,
    placementArtifacts.resourcePlan,
    placementArtifacts.naturalWonderPlan,
    placementArtifacts.discoveryPlan,
  ], {
    placementInputs: {},
    resourcePlan: {},
    naturalWonderPlan: {},
    discoveryPlan: {},
  }),
  run: (context, config, ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const hydrography = deps.artifacts.hydrography.read(context);
    const lakePlan = deps.artifacts.engineProjectionLakes.read(context);
    const biomeClassification = deps.artifacts.biomeClassification.read(context);
    const pedology = deps.artifacts.pedology.read(context);

    const inputs = buildPlacementInputs(context, config, ops, {
      topography,
      hydrography,
      lakePlan,
      biomeClassification,
      pedology,
    });
    deps.artifacts.placementInputs.publish(context, inputs);
    deps.artifacts.resourcePlan.publish(context, inputs.resources);
    deps.artifacts.naturalWonderPlan.publish(context, inputs.naturalWonderPlan);
    deps.artifacts.discoveryPlan.publish(context, inputs.discoveryPlan);
  },
});

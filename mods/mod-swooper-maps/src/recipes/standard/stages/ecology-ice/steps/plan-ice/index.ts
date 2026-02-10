import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import {
  validateFeatureIntentsListArtifact,
  validateOccupancyArtifact,
} from "../../../ecology/artifact-validation.js";
import PlanIceStepContract from "./contract.js";

export default createStep(PlanIceStepContract, {
  artifacts: implementArtifacts([ecologyArtifacts.featureIntentsIce, ecologyArtifacts.occupancyIce], {
    featureIntentsIce: {
      validate: (value, context) => validateFeatureIntentsListArtifact(value, context.dimensions),
    },
    occupancyIce: {
      validate: (value, context) => validateOccupancyArtifact(value, context.dimensions),
    },
  }),
  run: (context, _config, _ops, deps) => {
    // Early M3-004 scaffold: publish an empty ice intents list + a cloned occupancy snapshot.
    //
    // Follow-up commits will replace this with deterministic planning that consumes FEATURE_ICE
    // scoreLayers and updates occupancy accordingly.
    const base = deps.artifacts.occupancyBase.read(context);
    const { width, height } = context.dimensions;
    deps.artifacts.featureIntentsIce.publish(context, []);
    deps.artifacts.occupancyIce.publish(context, {
      width,
      height,
      featureIndex: new Uint16Array(base.featureIndex),
      reserved: new Uint8Array(base.reserved),
    });
  },
});


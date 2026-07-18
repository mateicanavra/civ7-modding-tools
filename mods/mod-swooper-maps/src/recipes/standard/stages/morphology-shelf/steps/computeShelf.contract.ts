import morphology from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  artifactModules as morphologyArtifactModules,
  artifacts as morphologyArtifacts,
} from "../../morphology/artifacts/index.js";

/**
 * Computes the continental shelf from POST-island morphology truth.
 *
 * Runs after morphology-features (islands + mountains), so the shelf and the
 * post-island coastline reflect final land — island peaks get real shelves, and
 * downstream ocean-geometry / reef / coast consumers see one coherent vintage.
 */
const ComputeShelfStepContract = defineStep({
  id: "compute-shelf",
  phase: "morphology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyArtifacts.topography, morphologyArtifacts.beltDrivers],
    provides: [morphologyArtifactModules.shelf],
  },
  ops: {
    coastalAdjacency: {
      contract: morphology.ops.computeCoastalAdjacency,
      defaultStrategy: "default",
    },
    distanceToCoast: {
      contract: morphology.ops.computeDistanceToCoast,
      defaultStrategy: "default",
    },
    shelfMask: { contract: morphology.ops.computeShelfMask, defaultStrategy: "default" },
  },
  schema: Type.Object({}),
});

export default ComputeShelfStepContract;

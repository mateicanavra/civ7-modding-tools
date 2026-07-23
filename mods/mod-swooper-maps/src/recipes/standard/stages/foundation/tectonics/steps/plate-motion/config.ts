import foundation, {
  artifactModules as foundationArtifactModules,
  artifacts as foundationArtifacts,
} from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines plate motion from the shared mesh, mantle forcing, initial crust, and plate graph.
 * The published motion field is the single input vintage used by subsequent tectonic history
 * operations.
 */
export const PlateMotionStepContract = defineStep({
  id: "plate-motion",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      foundationArtifacts.mesh,
      foundationArtifacts.plateGraph,
      foundationArtifacts.mantleForcing,
    ],
    provides: [foundationArtifactModules.plateMotion],
  },
  ops: {
    computePlateMotion: foundation.ops.computePlateMotion,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

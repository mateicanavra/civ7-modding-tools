import foundation from "@mapgen/domain/foundation";
import { artifacts as lithosphereArtifacts } from "@mapgen/domain/foundation/modules/lithosphere/artifacts";
import { artifacts as mantleArtifacts } from "@mapgen/domain/foundation/modules/mantle/artifacts";
import { artifacts as meshArtifacts } from "@mapgen/domain/foundation/modules/mesh/artifacts";
import { artifacts as tectonicsArtifacts } from "@mapgen/domain/foundation/modules/tectonics/artifacts";
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
    requires: [meshArtifacts.mesh, lithosphereArtifacts.plateGraph, mantleArtifacts.mantleForcing],
    provides: [tectonicsArtifacts.plateMotion],
  },
  ops: {
    computePlateMotion: foundation.tectonics.ops.computePlateMotion,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

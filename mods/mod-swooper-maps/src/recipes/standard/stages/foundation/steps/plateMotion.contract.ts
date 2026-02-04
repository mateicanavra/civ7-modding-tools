import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import foundation from "@mapgen/domain/foundation";

import { foundationArtifacts } from "../artifacts.js";

const PlateMotionStepContract = defineStep({
  id: "plate-motion",
  phase: "foundation",
  requires: [],
  provides: [],
  artifacts: {
    requires: [foundationArtifacts.mesh, foundationArtifacts.plateGraph, foundationArtifacts.mantleForcing],
    provides: [foundationArtifacts.plateMotion],
  },
  ops: {
    computePlateMotion: foundation.ops.computePlateMotion,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default PlateMotionStepContract;

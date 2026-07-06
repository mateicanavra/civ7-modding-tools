import foundation from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";

const PlateGraphStepContract = defineStep({
  id: "plate-graph",
  phase: "foundation",
  requires: [],
  provides: [],
  artifacts: {
    requires: [foundationArtifacts.mesh, foundationArtifacts.crustInit],
    provides: [foundationArtifacts.plateGraph],
  },
  ops: {
    computePlateGraph: foundation.ops.computePlateGraph,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default PlateGraphStepContract;

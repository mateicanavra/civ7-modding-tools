import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { foundationArtifacts } from "../artifacts.js";
import { mapArtifacts } from "../../../map-artifacts.js";

const PlateTopologyStepContract = defineStep({
  id: "plate-topology",
  phase: "foundation",
  requires: [],
  provides: [],
  artifacts: {
    requires: [mapArtifacts.foundationPlates],
    provides: [foundationArtifacts.plateTopology],
  },
  ops: {},
  schema: Type.Object({}, { additionalProperties: false }),
});

export default PlateTopologyStepContract;

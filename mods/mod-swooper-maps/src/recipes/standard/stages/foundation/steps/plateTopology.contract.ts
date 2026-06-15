import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { mapArtifacts } from "../../../map-artifacts.js";
import { foundationArtifacts } from "../artifacts.js";

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

import foundation, { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
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
  ops: {
    computePlateTopology: foundation.ops.computePlateTopology,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default PlateTopologyStepContract;

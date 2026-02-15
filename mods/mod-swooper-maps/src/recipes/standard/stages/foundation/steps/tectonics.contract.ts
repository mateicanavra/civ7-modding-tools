import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import foundation from "@mapgen/domain/foundation";

import { foundationArtifacts } from "../artifacts.js";

const TectonicsStepContract = defineStep({
  id: "tectonics",
  phase: "foundation",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      foundationArtifacts.mesh,
      foundationArtifacts.mantleForcing,
      foundationArtifacts.crustInit,
      foundationArtifacts.plateGraph,
      foundationArtifacts.plateMotion,
    ],
    provides: [
      foundationArtifacts.tectonicSegments,
      foundationArtifacts.tectonicHistory,
      foundationArtifacts.tectonicProvenance,
      foundationArtifacts.tectonics,
    ],
  },
  ops: {
    computePlateMotion: foundation.ops.computePlateMotion,
    computeTectonicSegments: foundation.ops.computeTectonicSegments,
    computeEraPlateMembership: foundation.ops.computeEraPlateMembership,
    computeSegmentEvents: foundation.ops.computeSegmentEvents,
    computeHotspotEvents: foundation.ops.computeHotspotEvents,
    computeEraTectonicFields: foundation.ops.computeEraTectonicFields,
    computeTectonicHistoryRollups: foundation.ops.computeTectonicHistoryRollups,
    computeTectonicsCurrent: foundation.ops.computeTectonicsCurrent,
    computeTracerAdvection: foundation.ops.computeTracerAdvection,
    computeTectonicProvenance: foundation.ops.computeTectonicProvenance,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default TectonicsStepContract;

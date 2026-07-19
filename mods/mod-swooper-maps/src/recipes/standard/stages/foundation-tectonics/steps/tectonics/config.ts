import foundation, {
  artifactModules as foundationArtifactModules,
  artifacts as foundationArtifacts,
} from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the ordered tectonic-history computation over stable plate motion and graph
 * identity. It publishes segments, events, era fields, rollups, current state, and provenance
 * as one coherent history vintage.
 */
export const TectonicsStepContract = defineStep({
  id: "tectonics",
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
      foundationArtifactModules.tectonicSegments,
      foundationArtifactModules.tectonicHistory,
      foundationArtifactModules.tectonicProvenance,
      foundationArtifactModules.currentTectonics,
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

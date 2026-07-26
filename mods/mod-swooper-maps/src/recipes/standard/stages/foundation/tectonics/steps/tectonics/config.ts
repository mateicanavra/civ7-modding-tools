import foundation from "@mapgen/domain/foundation";
import { artifacts as lithosphereArtifacts } from "@mapgen/domain/foundation/modules/lithosphere/artifacts";
import { artifacts as mantleArtifacts } from "@mapgen/domain/foundation/modules/mantle/artifacts";
import { artifacts as meshArtifacts } from "@mapgen/domain/foundation/modules/mesh/artifacts";
import { artifacts as tectonicsArtifacts } from "@mapgen/domain/foundation/modules/tectonics/artifacts";
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
      meshArtifacts.mesh,
      mantleArtifacts.mantleForcing,
      lithosphereArtifacts.initialCrust,
      lithosphereArtifacts.plateGraph,
      tectonicsArtifacts.plateMotion,
    ],
    provides: [
      tectonicsArtifacts.tectonicSegments,
      tectonicsArtifacts.tectonicHistory,
      tectonicsArtifacts.tectonicProvenance,
      tectonicsArtifacts.currentTectonics,
    ],
  },
  ops: {
    computePlateMotion: foundation.tectonics.ops.computePlateMotion,
    computeTectonicSegments: foundation.tectonics.ops.computeTectonicSegments,
    computeEraPlateMembership: foundation.tectonics.ops.computeEraPlateMembership,
    computeSegmentEvents: foundation.tectonics.ops.computeSegmentEvents,
    computeHotspotEvents: foundation.tectonics.ops.computeHotspotEvents,
    computeEraTectonicFields: foundation.tectonics.ops.computeEraTectonicFields,
    computeTectonicHistoryRollups: foundation.tectonics.ops.computeTectonicHistoryRollups,
    computeTectonicsCurrent: foundation.tectonics.ops.computeTectonicsCurrent,
    computeTracerAdvection: foundation.tectonics.ops.computeTracerAdvection,
    computeTectonicProvenance: foundation.tectonics.ops.computeTectonicProvenance,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

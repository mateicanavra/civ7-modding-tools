import foundation from "../../../../../../../domain/foundation/index.js";
import { artifacts as lithosphereArtifacts } from "../../../../../../../domain/foundation/modules/lithosphere/artifacts/index.js";
import { artifacts as mantleArtifacts } from "../../../../../../../domain/foundation/modules/mantle/artifacts/index.js";
import { artifacts as meshArtifacts } from "../../../../../../../domain/foundation/modules/mesh/artifacts/index.js";
import { artifacts as tectonicsArtifacts } from "../../../../../../../domain/foundation/modules/tectonics/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines current plate motion and the ordered tectonic-history computation over
 * one shared operation configuration. It publishes motion, segments, era fields,
 * rollups, current state, and provenance as one coherent history vintage.
 */
export const config = defineStep({
  id: "tectonics",
  requires: [
    meshArtifacts.mesh,
    mantleArtifacts.mantleForcing,
    lithosphereArtifacts.initialCrust,
    lithosphereArtifacts.plateGraph,
  ],
  provides: [
    tectonicsArtifacts.plateMotion,
    tectonicsArtifacts.tectonicSegments,
    tectonicsArtifacts.tectonicHistory,
    tectonicsArtifacts.tectonicProvenance,
    tectonicsArtifacts.currentTectonics,
  ],

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
});

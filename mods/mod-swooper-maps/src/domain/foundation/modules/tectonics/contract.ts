import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ComputeEraPlateMembershipContract from "./ops/compute-era-plate-membership/contract.js";
import ComputeEraTectonicFieldsContract from "./ops/compute-era-tectonic-fields/contract.js";
import ComputeHotspotEventsContract from "./ops/compute-hotspot-events/contract.js";
import ComputePlateMotionContract from "./ops/compute-plate-motion/contract.js";
import ComputeSegmentEventsContract from "./ops/compute-segment-events/contract.js";
import ComputeTectonicHistoryRollupsContract from "./ops/compute-tectonic-history-rollups/contract.js";
import ComputeTectonicProvenanceContract from "./ops/compute-tectonic-provenance/contract.js";
import ComputeTectonicSegmentsContract from "./ops/compute-tectonic-segments/contract.js";
import ComputeTectonicsCurrentContract from "./ops/compute-tectonics-current/contract.js";
import ComputeTracerAdvectionContract from "./ops/compute-tracer-advection/contract.js";

/** Tectonics branch contract for multi-era plate motion, events, history, and provenance. */
const tectonics = defineDomainSubdomain({
  id: "tectonics",
  ops: {
    computePlateMotion: ComputePlateMotionContract,
    computeTectonicSegments: ComputeTectonicSegmentsContract,
    computeEraPlateMembership: ComputeEraPlateMembershipContract,
    computeSegmentEvents: ComputeSegmentEventsContract,
    computeHotspotEvents: ComputeHotspotEventsContract,
    computeEraTectonicFields: ComputeEraTectonicFieldsContract,
    computeTectonicHistoryRollups: ComputeTectonicHistoryRollupsContract,
    computeTectonicsCurrent: ComputeTectonicsCurrentContract,
    computeTracerAdvection: ComputeTracerAdvectionContract,
    computeTectonicProvenance: ComputeTectonicProvenanceContract,
  },
});

export default tectonics;

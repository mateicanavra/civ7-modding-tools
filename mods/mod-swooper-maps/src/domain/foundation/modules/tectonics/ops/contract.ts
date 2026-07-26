import ComputeEraPlateMembershipContract from "./compute-era-plate-membership/contract.js";
import ComputeEraTectonicFieldsContract from "./compute-era-tectonic-fields/contract.js";
import ComputeHotspotEventsContract from "./compute-hotspot-events/contract.js";
import ComputePlateMotionContract from "./compute-plate-motion/contract.js";
import ComputeSegmentEventsContract from "./compute-segment-events/contract.js";
import ComputeTectonicHistoryRollupsContract from "./compute-tectonic-history-rollups/contract.js";
import ComputeTectonicProvenanceContract from "./compute-tectonic-provenance/contract.js";
import ComputeTectonicSegmentsContract from "./compute-tectonic-segments/contract.js";
import ComputeTectonicsCurrentContract from "./compute-tectonics-current/contract.js";
import ComputeTracerAdvectionContract from "./compute-tracer-advection/contract.js";

/** Tectonics operation contracts keyed in causal execution order. */
const contracts = {
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
} as const;

export default contracts;

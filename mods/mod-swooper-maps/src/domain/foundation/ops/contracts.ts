import ComputeEraPlateMembershipContract from "./compute-era-plate-membership/contract.js";
import ComputeEraTectonicFieldsContract from "./compute-era-tectonic-fields/contract.js";
import ComputeHotspotEventsContract from "./compute-hotspot-events/contract.js";
import ComputeCrustContract from "./compute-crust/contract.js";
import ComputeCrustEvolutionContract from "./compute-crust-evolution/contract.js";
import ComputeMantleForcingContract from "./compute-mantle-forcing/contract.js";
import ComputeMantlePotentialContract from "./compute-mantle-potential/contract.js";
import ComputeMeshContract from "./compute-mesh/contract.js";
import ComputePlateGraphContract from "./compute-plate-graph/contract.js";
import ComputePlateMotionContract from "./compute-plate-motion/contract.js";
import ComputePlatesTensorsContract from "./compute-plates-tensors/contract.js";
import ComputeSegmentEventsContract from "./compute-segment-events/contract.js";
import ComputeTectonicHistoryContract from "./compute-tectonic-history/contract.js";
import ComputeTectonicHistoryRollupsContract from "./compute-tectonic-history-rollups/contract.js";
import ComputeTectonicProvenanceContract from "./compute-tectonic-provenance/contract.js";
import ComputeTectonicsCurrentContract from "./compute-tectonics-current/contract.js";
import ComputeTectonicSegmentsContract from "./compute-tectonic-segments/contract.js";
import ComputeTracerAdvectionContract from "./compute-tracer-advection/contract.js";

export const contracts = {
  computeMesh: ComputeMeshContract,
  computeMantlePotential: ComputeMantlePotentialContract,
  computeMantleForcing: ComputeMantleForcingContract,
  computeCrust: ComputeCrustContract,
  computeCrustEvolution: ComputeCrustEvolutionContract,
  computePlateGraph: ComputePlateGraphContract,
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
  computeTectonicHistory: ComputeTectonicHistoryContract,
  computePlatesTensors: ComputePlatesTensorsContract,
} as const;

export default contracts;

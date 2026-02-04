import ComputeCrustContract from "./compute-crust/contract.js";
import ComputeMantleForcingContract from "./compute-mantle-forcing/contract.js";
import ComputeMantlePotentialContract from "./compute-mantle-potential/contract.js";
import ComputeMeshContract from "./compute-mesh/contract.js";
import ComputePlateGraphContract from "./compute-plate-graph/contract.js";
import ComputePlateMotionContract from "./compute-plate-motion/contract.js";
import ComputePlatesTensorsContract from "./compute-plates-tensors/contract.js";
import ComputeTectonicHistoryContract from "./compute-tectonic-history/contract.js";
import ComputeTectonicSegmentsContract from "./compute-tectonic-segments/contract.js";

export const contracts = {
  computeMesh: ComputeMeshContract,
  computeMantlePotential: ComputeMantlePotentialContract,
  computeMantleForcing: ComputeMantleForcingContract,
  computeCrust: ComputeCrustContract,
  computePlateGraph: ComputePlateGraphContract,
  computePlateMotion: ComputePlateMotionContract,
  computeTectonicSegments: ComputeTectonicSegmentsContract,
  computeTectonicHistory: ComputeTectonicHistoryContract,
  computePlatesTensors: ComputePlatesTensorsContract,
} as const;

export default contracts;

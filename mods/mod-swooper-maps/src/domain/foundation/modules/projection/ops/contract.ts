import ComputePlateTopologyContract from "./compute-plate-topology/contract.js";
import ComputePlatesTensorsContract from "./compute-plates-tensors/contract.js";

/** Projection operation contracts keyed in tile-materialization order. */
const contracts = {
  computePlatesTensors: ComputePlatesTensorsContract,
  computePlateTopology: ComputePlateTopologyContract,
} as const;

export default contracts;

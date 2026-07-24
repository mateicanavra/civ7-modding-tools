import ApplyAlbedoFeedbackContract from "./apply-albedo-feedback/contract.js";
import ComputeCryosphereStateContract from "./compute-cryosphere-state/contract.js";

/** Cryosphere operation contracts keyed for exact branch composition. */
const contracts = {
  computeCryosphereState: ComputeCryosphereStateContract,
  applyAlbedoFeedback: ApplyAlbedoFeedbackContract,
} as const;

export default contracts;

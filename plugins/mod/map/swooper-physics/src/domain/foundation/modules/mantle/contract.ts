import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ComputeMantleForcingContract from "./ops/compute-mantle-forcing/contract.js";
import ComputeMantlePotentialContract from "./ops/compute-mantle-potential/contract.js";

/** Mantle branch contract for potential and forcing fields over the Foundation mesh. */
const mantle = defineDomainSubdomain({
  id: "mantle",
  ops: {
    computeMantlePotential: ComputeMantlePotentialContract,
    computeMantleForcing: ComputeMantleForcingContract,
  },
});

export default mantle;

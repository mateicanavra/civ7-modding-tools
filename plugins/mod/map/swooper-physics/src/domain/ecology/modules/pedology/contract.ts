import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import PedologyClassifyContract from "./ops/pedology-classify/contract.js";

/** Pedology branch contract for soil classification and grid-cell evidence. */
const pedology = defineDomainSubdomain({
  id: "pedology",
  ops: {
    classifyPedology: PedologyClassifyContract,
  },
});

export default pedology;

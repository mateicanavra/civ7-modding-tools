import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Resource-site contract for selecting admitted map positions. */
const sites = defineDomainSubdomain({
  id: "sites",
  ops,
});

export default sites;

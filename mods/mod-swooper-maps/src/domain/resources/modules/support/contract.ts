import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Resource-support contract for post-start plan adjustment. */
const support = defineDomainSubdomain({
  id: "support",
  ops,
});

export default support;

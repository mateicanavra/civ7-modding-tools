import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import AdjustResourceSupportContract from "./ops/adjust-resource-support/contract.js";

/** Resource-support contract for post-start plan adjustment. */
const support = defineDomainSubdomain({
  id: "support",
  ops: {
    adjustResourceSupport: AdjustResourceSupportContract,
  },
});

export default support;

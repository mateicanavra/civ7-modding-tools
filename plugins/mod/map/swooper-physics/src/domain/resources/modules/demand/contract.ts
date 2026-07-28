import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ResolveResourceDemandsContract from "./ops/resolve-resource-demands/contract.js";

/** Resource-demand contract over canonical expectation and terminal site-demand resolution. */
const demand = defineDomainSubdomain({
  id: "demand",
  ops: {
    resolveResourceDemands: ResolveResourceDemandsContract,
  },
});

export default demand;

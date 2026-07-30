import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import SelectResourceSitesContract from "./ops/select-resource-sites/contract.js";

/** Resource-site contract for selecting admitted map positions. */
const sites = defineDomainSubdomain({
  id: "sites",
  ops: {
    selectResourceSites: SelectResourceSitesContract,
  },
});

export default sites;

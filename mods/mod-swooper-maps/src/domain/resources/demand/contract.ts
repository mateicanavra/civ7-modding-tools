import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contracts.js";

/** Resource-demand contract over the four family planners and their group rollup. */
const demand = defineDomainSubdomain({
  id: "demand",
  ops,
});

export default demand;

import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contracts.js";

/** Resource-habitat contract for deriving the physical planning lanes. */
const habitat = defineDomainSubdomain({
  id: "habitat",
  ops,
});

export default habitat;

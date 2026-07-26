import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Feature branch contract for substrate derivation, scoring, intent planning, and application. */
const features = defineDomainSubdomain({ id: "features", ops });

export default features;

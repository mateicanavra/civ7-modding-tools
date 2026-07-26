import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Orogeny branch contract for evolving initial crust through reconstructed tectonic history. */
const orogeny = defineDomainSubdomain({ id: "orogeny", ops });

export default orogeny;

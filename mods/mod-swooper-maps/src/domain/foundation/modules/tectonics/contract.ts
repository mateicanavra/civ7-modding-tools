import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Tectonics branch contract for multi-era plate motion, events, history, and provenance. */
const tectonics = defineDomainSubdomain({ id: "tectonics", ops });

export default tectonics;

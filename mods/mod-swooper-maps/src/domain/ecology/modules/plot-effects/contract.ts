import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Plot-effect branch contract for scoring and ranked-coverage planning. */
const plotEffects = defineDomainSubdomain({ id: "plotEffects", ops });

export default plotEffects;

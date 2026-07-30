import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import PlanStartsContract from "./ops/plan-starts/contract.js";

/** Starts branch contract for viable, fair, player-aware start assignment. */
const starts = defineDomainSubdomain({
  id: "starts",
  ops: {
    planStarts: PlanStartsContract,
  },
});

export default starts;

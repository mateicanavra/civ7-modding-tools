import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import PlanNaturalWondersContract from "./ops/plan-natural-wonders/contract.js";

/** Wonders branch contract for pure natural-wonder site planning. */
const wonders = defineDomainSubdomain({
  id: "wonders",
  ops: {
    planNaturalWonders: PlanNaturalWondersContract,
  },
});

export default wonders;

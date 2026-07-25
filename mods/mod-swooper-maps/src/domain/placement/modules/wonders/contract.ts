import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import PlanNaturalWondersContract from "./ops/plan-natural-wonders/contract.js";
import PlanWondersContract from "./ops/plan-wonders/contract.js";

/** Wonders branch contract for map-size demand and natural-wonder site planning. */
const wonders = defineDomainSubdomain({
  id: "wonders",
  ops: {
    planWonders: PlanWondersContract,
    planNaturalWonders: PlanNaturalWondersContract,
  },
});

export default wonders;

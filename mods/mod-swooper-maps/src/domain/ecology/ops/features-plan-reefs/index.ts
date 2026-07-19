import { createOp } from "@swooper/mapgen-core/authoring";
import PlanReefsContract from "./contract.js";
import { diagonalStrideStrategy, habitatStrategy } from "./strategies/index.js";

/** Reef-intent operation exposing habitat selection and an explicit diagonal-spacing mechanism. */
const planReefs = createOp(PlanReefsContract, {
  strategies: {
    habitat: habitatStrategy,
    "diagonal-stride": diagonalStrideStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planReefs;

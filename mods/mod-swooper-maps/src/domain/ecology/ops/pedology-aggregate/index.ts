import { createOp } from "@swooper/mapgen-core/authoring";
import AggregatePedologyContract from "./contract.js";
import { gridCellSummaryStrategy } from "./strategies/index.js";

const aggregatePedology = createOp(AggregatePedologyContract, {
  strategies: {
    "grid-cell-summary": gridCellSummaryStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default aggregatePedology;

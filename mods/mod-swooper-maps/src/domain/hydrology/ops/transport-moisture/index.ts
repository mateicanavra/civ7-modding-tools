import { createOp } from "@swooper/mapgen-core/authoring";
import TransportMoistureContract from "./contract.js";
import { cardinalStrategy, defaultStrategy } from "./strategies/index.js";

const transportMoisture = createOp(TransportMoistureContract, {
  strategies: { default: defaultStrategy, cardinal: cardinalStrategy },
});

export type * from "./types.js";
export type * from "./contract.js";

export default transportMoisture;

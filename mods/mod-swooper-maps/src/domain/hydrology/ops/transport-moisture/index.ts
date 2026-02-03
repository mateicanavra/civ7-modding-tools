import { createOp } from "@swooper/mapgen-core/authoring";
import TransportMoistureContract from "./contract.js";
import { defaultStrategy, vectorStrategy } from "./strategies/index.js";

const transportMoisture = createOp(TransportMoistureContract, {
  strategies: { default: defaultStrategy, vector: vectorStrategy },
});

export type * from "./types.js";
export type * from "./contract.js";

export default transportMoisture;

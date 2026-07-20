import { createOp } from "@swooper/mapgen-core/authoring";
import TransportMoistureContract from "./contract.js";
import { cardinalStrategy, vectorAdvectionStrategy } from "./strategies/index.js";

/** Transports moisture through the selected vector-advection or cardinal mechanism. */
const transportMoisture = createOp(TransportMoistureContract, {
  strategies: { "vector-advection": vectorAdvectionStrategy, cardinal: cardinalStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default transportMoisture;

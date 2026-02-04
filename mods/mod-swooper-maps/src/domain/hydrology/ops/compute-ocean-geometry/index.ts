import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeOceanGeometryContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeOceanGeometry = createOp(ComputeOceanGeometryContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./types.js";
export type * from "./contract.js";

export default computeOceanGeometry;


import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeOceanGeometryContract from "./contract.js";
import { connectedBasinsStrategy } from "./strategies/index.js";

const computeOceanGeometry = createOp(ComputeOceanGeometryContract, {
  strategies: { "connected-basins": connectedBasinsStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeOceanGeometry;

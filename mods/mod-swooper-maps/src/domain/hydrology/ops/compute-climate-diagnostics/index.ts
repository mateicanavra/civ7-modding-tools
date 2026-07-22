import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeClimateDiagnosticsContract from "./contract.js";
import { terrainWindIndicesStrategy } from "./strategies/index.js";

const computeClimateDiagnostics = createOp(ComputeClimateDiagnosticsContract, {
  strategies: { "terrain-wind-indices": terrainWindIndicesStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeClimateDiagnostics;

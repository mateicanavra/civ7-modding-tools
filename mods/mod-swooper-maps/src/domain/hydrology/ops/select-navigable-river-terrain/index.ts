import { createOp } from "@swooper/mapgen-core/authoring";
import SelectNavigableRiverTerrainContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const selectNavigableRiverTerrain = createOp(SelectNavigableRiverTerrainContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default selectNavigableRiverTerrain;

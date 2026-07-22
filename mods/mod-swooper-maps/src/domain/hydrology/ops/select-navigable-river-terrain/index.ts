import { createOp } from "@swooper/mapgen-core/authoring";
import SelectNavigableRiverTerrainContract from "./contract.js";
import { endpointChainRankingStrategy } from "./strategies/index.js";

const selectNavigableRiverTerrain = createOp(SelectNavigableRiverTerrainContract, {
  strategies: { "endpoint-chain-ranking": endpointChainRankingStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default selectNavigableRiverTerrain;

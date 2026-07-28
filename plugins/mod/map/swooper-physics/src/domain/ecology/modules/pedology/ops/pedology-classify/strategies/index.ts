import balanced from "./balanced/index.js";
import coastalShelf from "./coastal-shelf/index.js";
import orogenyBoosted from "./orogeny-boosted/index.js";

/** Derives soil class and fertility from climate, relief, sediment, and bedrock through one shared classifier boundary. Implementations available to the recipe's semantic strategy selection. */
export default [balanced, coastalShelf, orogenyBoosted] as const;

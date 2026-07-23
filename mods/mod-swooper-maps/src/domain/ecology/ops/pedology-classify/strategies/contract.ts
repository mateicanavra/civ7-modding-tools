import balanced from "./balanced/contract.js";
import coastalShelf from "./coastal-shelf/contract.js";
import orogenyBoosted from "./orogeny-boosted/contract.js";

/** Derives soil class and fertility from climate, relief, sediment, and bedrock through one shared classifier boundary. Strategy contracts vary authored policy without redefining the operation input or output. */
export default [balanced, coastalShelf, orogenyBoosted] as const;

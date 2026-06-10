import { createOp } from "@swooper/mapgen-core/authoring";

import AdjustResourceSupportContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const adjustResourceSupport = createOp(AdjustResourceSupportContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default adjustResourceSupport;

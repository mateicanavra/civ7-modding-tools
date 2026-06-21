import { createOp } from "@swooper/mapgen-core/authoring";

import ReconcileHeightfieldFromCoastContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const reconcileHeightfieldFromCoast = createOp(ReconcileHeightfieldFromCoastContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default reconcileHeightfieldFromCoast;

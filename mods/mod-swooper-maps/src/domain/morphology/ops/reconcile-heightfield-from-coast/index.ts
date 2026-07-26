import { createOp } from "@swooper/mapgen-core/authoring";

import ReconcileHeightfieldFromCoastContract from "./contract.js";
import { carvedCoastDatumStrategy } from "./strategies/index.js";

const reconcileHeightfieldFromCoast = createOp(ReconcileHeightfieldFromCoastContract, {
  strategies: {
    "carved-coast-datum": carvedCoastDatumStrategy,
  },
});

export type * from "./contract.js";

export default reconcileHeightfieldFromCoast;

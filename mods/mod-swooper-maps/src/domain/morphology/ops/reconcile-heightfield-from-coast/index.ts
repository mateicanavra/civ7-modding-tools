import { createOp } from "@swooper/mapgen-core/authoring";

import ReconcileHeightfieldFromCoastContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Reconciles land class, elevation, and bathymetry after coastline carving. */
const reconcileHeightfieldFromCoast = createOp(ReconcileHeightfieldFromCoastContract, {
  strategies,
});

export default reconcileHeightfieldFromCoast;

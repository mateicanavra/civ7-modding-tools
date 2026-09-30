import strategy0 from "./legacy-snapshots/index.js";
import strategy1 from "./periodic-cycle/index.js";

/** Available sampling implementations; the operation contract owns default selection. */
export default [strategy0, strategy1] as const;

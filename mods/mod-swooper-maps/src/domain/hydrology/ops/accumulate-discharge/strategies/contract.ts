import topologicalRunoff from "./topological-runoff/contract.js";

/** Topological runoff is the sole discharge posture because accumulation must respect receiver order. */
export default [topologicalRunoff] as const;

import topologicalRunoff from "./topological-runoff/index.js";

/** Topological runoff is the sole discharge posture because accumulation must respect receiver order. */
export default [topologicalRunoff] as const;

import baseline from "./baseline/index.js";
import refine from "./refine/index.js";
import vector from "./vector/index.js";

/** Vector transport is the product precipitation posture; baseline generation and explicit refinement remain selectable mechanisms. */
export default [vector, baseline, refine] as const;

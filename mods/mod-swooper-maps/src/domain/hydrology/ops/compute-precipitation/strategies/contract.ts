import baseline from "./baseline/contract.js";
import refine from "./refine/contract.js";
import vector from "./vector/contract.js";

/** Vector transport is the product precipitation posture; baseline generation and explicit refinement remain selectable mechanisms. */
export default [vector, baseline, refine] as const;

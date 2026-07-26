import hydrographicClassification from "./hydrographic-classification/index.js";

/** Hydrographic classification is the sole strategy so every river measurement describes the same causal network. */
export default [hydrographicClassification] as const;

// Compatibility barrel: morphology-mid stage continues to exist until the recipe cutover.
// The canonical implementations now live in the split stages.
export { default as ruggedCoasts } from "../../morphology-coasts/steps/ruggedCoasts.js";
export { default as routing } from "../../morphology-routing/steps/routing.js";
export { default as geomorphology } from "../../morphology-erosion/steps/geomorphology.js";

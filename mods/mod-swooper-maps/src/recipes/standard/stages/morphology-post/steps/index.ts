// Compatibility barrel: morphology-post stage continues to exist until the recipe cutover.
// The canonical implementations now live in the split stages.
export { default as islands } from "../../morphology-features/steps/islands.js";
export { default as volcanoes } from "../../morphology-features/steps/volcanoes.js";
export { default as landmasses } from "../../morphology-features/steps/landmasses.js";

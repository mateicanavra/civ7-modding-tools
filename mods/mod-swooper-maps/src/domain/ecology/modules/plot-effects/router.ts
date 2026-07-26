import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import planPlotEffects from "./ops/plan-plot-effects/index.js";
import scorePlotEffectsBurned from "./ops/plot-effects-score-burned/index.js";
import scorePlotEffectsJungle from "./ops/plot-effects-score-jungle/index.js";
import scorePlotEffectsSand from "./ops/plot-effects-score-sand/index.js";
import scorePlotEffectsSnow from "./ops/plot-effects-score-snow/index.js";

/**
 * Canonically binds the Plot Effects contract to scoring and planning implementations that produce
 * Civ7-facing snow, sand, burned, and jungle intent. The Ecology router is the sole executable
 * aggregate; step authoring continues to reference the contract.
 */
const plotEffects = createDomainSubdomainRouter(contract, {
  scorePlotEffectsSnow,
  scorePlotEffectsSand,
  scorePlotEffectsBurned,
  scorePlotEffectsJungle,
  planPlotEffects,
});

export default plotEffects;

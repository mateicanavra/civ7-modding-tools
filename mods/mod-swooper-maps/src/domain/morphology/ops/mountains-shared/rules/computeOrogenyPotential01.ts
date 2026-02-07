import { BOUNDARY_TYPE } from "@mapgen/domain/foundation/constants.js";

import type { MountainsConfig } from "./types.js";
import { clamp01 } from "./util.js";
import { resolveBoundaryRegime } from "./resolveBoundaryRegime.js";

export function computeOrogenyPotential01(params: {
  boundaryStrength: number;
  boundaryType: number;
  uplift: number;
  stress: number;
  rift: number;
  config: MountainsConfig;
}): number {
  const { boundaryStrength, boundaryType, uplift, stress, rift, config } = params;
  const regime = resolveBoundaryRegime({ boundaryType, uplift, stress, rift });

  const collision = regime === BOUNDARY_TYPE.convergent ? boundaryStrength : 0;
  const transform = regime === BOUNDARY_TYPE.transform ? boundaryStrength : 0;
  const divergence = regime === BOUNDARY_TYPE.divergent ? boundaryStrength : 0;

  const collisionSignal =
    collision * (config.orogenyCollisionStressWeight * stress + config.orogenyCollisionUpliftWeight * uplift);
  const transformSignal = transform * (config.orogenyTransformStressWeight * stress);
  const divergenceSignal =
    divergence * (config.orogenyDivergentRiftWeight * rift + config.orogenyDivergentStressWeight * stress);

  return clamp01(collisionSignal + transformSignal + divergenceSignal);
}


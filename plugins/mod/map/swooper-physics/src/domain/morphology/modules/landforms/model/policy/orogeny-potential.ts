import { clamp01 } from "@swooper/mapgen-core/lib/math";
import { BOUNDARY_TYPE } from "@swooper/mapgen-core/lib/plates";
import { resolveBoundaryRegime } from "./boundary-regime.js";
import type { OrogenyPotentialPolicy } from "./mountain-scoring-policy.js";

/**
 * Combines boundary-specific tectonic evidence into the shared orogeny potential.
 *
 * Only the resolved boundary regime contributes, preventing collision, transform, and rift
 * weights from stacking on one tile before mountain and foothill scoring.
 *
 * @param params - Boundary evidence and policy weights for one tile.
 * @returns The weighted orogeny signal clamped to the inclusive `0..1` domain.
 */
export function computeOrogenyPotential(params: {
  boundaryStrength: number;
  boundaryType: number;
  uplift: number;
  stress: number;
  rift: number;
  config: OrogenyPotentialPolicy;
}): number {
  const { boundaryStrength, boundaryType, uplift, stress, rift, config } = params;
  const regime = resolveBoundaryRegime({ boundaryType, uplift, stress, rift });

  const collision = regime === BOUNDARY_TYPE.convergent ? boundaryStrength : 0;
  const transform = regime === BOUNDARY_TYPE.transform ? boundaryStrength : 0;
  const divergence = regime === BOUNDARY_TYPE.divergent ? boundaryStrength : 0;

  const collisionSignal =
    collision *
    (config.orogenyCollisionStressWeight * stress + config.orogenyCollisionUpliftWeight * uplift);
  const transformSignal = transform * (config.orogenyTransformStressWeight * stress);
  const divergenceSignal =
    divergence *
    (config.orogenyDivergentRiftWeight * rift + config.orogenyDivergentStressWeight * stress);

  return clamp01(collisionSignal + transformSignal + divergenceSignal);
}

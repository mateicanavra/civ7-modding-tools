import { BOUNDARY_TYPE } from "@swooper/mapgen-core/lib/plates";

/**
 * Resolves the tectonic regime used by mountain and foothill scoring.
 *
 * A recognized authored boundary type is authoritative. Missing or unknown codes fall back to
 * uplift, rift, then stress signals in that order so downstream scoring remains deterministic.
 *
 * @param params - Boundary code and normalized tectonic signals for one tile.
 * @returns The shared plate boundary code, or `0` when no regime has positive evidence.
 */
export function resolveBoundaryRegime(params: {
  boundaryType: number;
  uplift: number;
  stress: number;
  rift: number;
}): number {
  const boundaryType = params.boundaryType | 0;
  if (
    boundaryType === BOUNDARY_TYPE.convergent ||
    boundaryType === BOUNDARY_TYPE.divergent ||
    boundaryType === BOUNDARY_TYPE.transform
  ) {
    return boundaryType;
  }

  const uplift = params.uplift;
  const rift = params.rift;
  const stress = params.stress;

  if (uplift > 0 && uplift >= rift) return BOUNDARY_TYPE.convergent;
  if (rift > 0 && rift > uplift) return BOUNDARY_TYPE.divergent;
  if (stress > 0) return BOUNDARY_TYPE.transform;
  return 0;
}

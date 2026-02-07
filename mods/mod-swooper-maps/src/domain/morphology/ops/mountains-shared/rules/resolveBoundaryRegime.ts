import { BOUNDARY_TYPE } from "@mapgen/domain/foundation/constants.js";

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


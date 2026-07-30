import { clampInt16, roundHalfAwayFromZero } from "@swooper/mapgen-core/lib/math";

/**
 * Reconciles the computed land mask with elevation and bathymetry at one sea-level datum.
 *
 * The admitted land mask is authoritative: submerged land is lifted to the first
 * integer elevation above the datum, exposed water is lowered to the datum, and
 * water depth is derived from the reconciled elevation. Fresh arrays preserve
 * the operation inputs.
 */
export function reconcileTopography({
  landMask: inputLandMask,
  elevation: inputElevation,
  seaLevel,
}: {
  readonly landMask: ArrayLike<number>;
  readonly elevation: ArrayLike<number>;
  readonly seaLevel: number;
}): {
  landMask: Uint8Array;
  elevation: Int16Array;
  seaLevel: number;
  bathymetry: Int16Array;
} {
  const size = inputLandMask.length;
  const landMask = Uint8Array.from(inputLandMask);
  const elevation = Int16Array.from(inputElevation);
  const bathymetry = new Int16Array(size);
  const waterElevation = clampInt16(Math.floor(seaLevel));
  const landElevation = clampInt16(Math.floor(seaLevel) + 1);

  for (let index = 0; index < size; index++) {
    if (landMask[index] === 1) {
      if ((elevation[index] ?? 0) <= seaLevel) elevation[index] = landElevation;
      continue;
    }

    if ((elevation[index] ?? 0) > seaLevel) elevation[index] = waterElevation;
    bathymetry[index] = clampInt16(
      roundHalfAwayFromZero(Math.min(0, (elevation[index] ?? 0) - seaLevel))
    );
  }

  return { landMask, elevation, seaLevel, bathymetry };
}

/** Observed native land floor in the installed Civ7 setter probe, not a physical sea datum. */
export const STANDARD_NATIVE_LAND_ELEVATION_FLOOR = 128;

/** Fixed product calibration from quantized normalized relief to native display values, not meters. */
export const STANDARD_NATIVE_ELEVATION_SCALE = 10;

// Authored admission envelope: refuse overflow instead of relying on native wrapping or clamping.
const MAX_ADMITTED_NATIVE_ELEVATION = 65_535;

type StandardElevationProjectionInput = Readonly<{
  elevation: ArrayLike<number>;
  landMask: ArrayLike<number>;
  seaLevel: number;
  acceptedLakeMask: ArrayLike<number>;
}>;

/**
 * Converts immutable physical topography into the Standard recipe's native elevation request.
 * Accepted lakes retain their per-cell physical projection even on modeled water; Civ7 owns their
 * eventual flat surface. Ocean is zero. No terrain class or per-map normalization changes land rank.
 */
export function projectStandardElevation(input: StandardElevationProjectionInput): number[] {
  const size = input.elevation.length;
  if (
    !Number.isSafeInteger(size) ||
    size <= 0 ||
    input.landMask.length !== size ||
    input.acceptedLakeMask.length !== size
  ) {
    throw new Error("[Elevation] Projection requires nonempty surfaces with matching cardinality.");
  }
  if (!Number.isFinite(input.seaLevel)) {
    throw new Error("[Elevation] Projection requires a finite physical sea-level datum.");
  }

  const projected = new Array<number>(size);
  for (let index = 0; index < size; index += 1) {
    const elevation = input.elevation[index]!;
    const land = input.landMask[index];
    const acceptedLake = input.acceptedLakeMask[index];
    if (!Number.isFinite(elevation)) {
      throw new Error(`[Elevation] Physical elevation is not finite at plot ${index}.`);
    }
    if ((land !== 0 && land !== 1) || (acceptedLake !== 0 && acceptedLake !== 1)) {
      throw new Error(`[Elevation] Projection masks must be binary at plot ${index}.`);
    }
    if (acceptedLake !== 1 && land === 0) {
      projected[index] = 0;
      continue;
    }

    const value =
      STANDARD_NATIVE_LAND_ELEVATION_FLOOR +
      Math.round(Math.max(0, elevation - input.seaLevel) * STANDARD_NATIVE_ELEVATION_SCALE);
    if (value > MAX_ADMITTED_NATIVE_ELEVATION) {
      throw new Error(`[Elevation] Native projection exceeds 65535 at plot ${index}.`);
    }
    projected[index] = value;
  }
  return projected;
}

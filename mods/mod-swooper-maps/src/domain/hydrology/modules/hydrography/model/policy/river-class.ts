/** Encodes the absence of Hydrology-authored channel intent in `riverClass` artifacts. */
export const RIVER_CLASS_NONE = 0;
/** Encodes headwater or minor-channel intent below the engine-projection threshold. */
export const RIVER_CLASS_MINOR = 1;
/** Encodes the minimum major-channel intent eligible for downstream river projection. */
export const RIVER_CLASS_MAJOR = 2;

/**
 * Checks the open-ended river-class encoding accepted by Hydrology artifacts.
 *
 * Nonnegative integers are valid because classes above `RIVER_CLASS_MAJOR` intentionally preserve
 * room for future stream-order refinement while retaining major-channel semantics.
 *
 * @param value - Candidate encoded river class.
 * @returns Whether the value is a nonnegative integer in the open class domain.
 */
export function isValidRiverClass(value: number | undefined): boolean {
  return Number.isInteger(value) && (value ?? -1) >= RIVER_CLASS_NONE;
}

/**
 * Locates malformed river evidence before an artifact crosses the Hydrology boundary.
 *
 * @param values - River-class field to validate in tile-index order.
 * @returns The first invalid tile index, or `-1` when every class is admissible.
 */
export function findInvalidRiverClassIndex(values: ArrayLike<number>): number {
  for (let i = 0; i < values.length; i++) {
    if (!isValidRiverClass(values[i])) return i;
  }
  return -1;
}

/**
 * Tests for the exact headwater/minor class without including future major refinements.
 *
 * @param value - Encoded river class from Hydrology evidence.
 * @returns Whether `value` is exactly `RIVER_CLASS_MINOR`.
 */
export function isMinorRiverClass(value: number | undefined): boolean {
  return value === RIVER_CLASS_MINOR;
}

/**
 * Tests whether channel intent is major enough for major-river policy and projection.
 * Values above the current major code remain major by design.
 *
 * @param value - Encoded river class from Hydrology evidence.
 * @returns Whether `value` is at least `RIVER_CLASS_MAJOR`.
 */
export function isMajorRiverClass(value: number | undefined): boolean {
  return (value ?? RIVER_CLASS_NONE) >= RIVER_CLASS_MAJOR;
}

/**
 * Collapses the open river hierarchy to the channel-presence predicate used by ecology and metrics.
 *
 * @param value - Encoded river class from Hydrology evidence.
 * @returns Whether any minor-or-greater channel intent is present.
 */
export function isAnyRiverClass(value: number | undefined): boolean {
  return (value ?? RIVER_CLASS_NONE) > RIVER_CLASS_NONE;
}

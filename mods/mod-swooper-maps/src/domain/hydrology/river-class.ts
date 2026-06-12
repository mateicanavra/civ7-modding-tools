export const RIVER_CLASS_NONE = 0;
export const RIVER_CLASS_MINOR = 1;
export const RIVER_CLASS_MAJOR = 2;

/**
 * Hydrology-owned river intent classes.
 *
 * `0` means no channel, `1` means minor/headwater channel intent, and values
 * `>=2` mean major/projectable channel intent. Keeping `>=2` valid lets future
 * stream-order metrics refine major hierarchy without changing the current
 * navigable projection contract.
 */
export type RiverClassValue = typeof RIVER_CLASS_NONE | typeof RIVER_CLASS_MINOR | number;

export function isValidRiverClass(value: number | undefined): boolean {
  return Number.isInteger(value) && (value ?? -1) >= RIVER_CLASS_NONE;
}

export function findInvalidRiverClassIndex(values: ArrayLike<number>): number {
  for (let i = 0; i < values.length; i++) {
    if (!isValidRiverClass(values[i])) return i;
  }
  return -1;
}

export function isMinorRiverClass(value: number | undefined): boolean {
  return value === RIVER_CLASS_MINOR;
}

export function isMajorRiverClass(value: number | undefined): boolean {
  return (value ?? RIVER_CLASS_NONE) >= RIVER_CLASS_MAJOR;
}

export function isAnyRiverClass(value: number | undefined): boolean {
  return (value ?? RIVER_CLASS_NONE) > RIVER_CLASS_NONE;
}

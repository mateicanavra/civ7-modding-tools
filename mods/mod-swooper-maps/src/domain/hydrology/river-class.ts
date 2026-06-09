export const RIVER_CLASS_NONE = 0;
export const RIVER_CLASS_MINOR = 1;
export const RIVER_CLASS_MAJOR = 2;

export function isMinorRiverClass(value: number | undefined): boolean {
  return value === RIVER_CLASS_MINOR;
}

export function isMajorRiverClass(value: number | undefined): boolean {
  return (value ?? RIVER_CLASS_NONE) >= RIVER_CLASS_MAJOR;
}

export function isAnyRiverClass(value: number | undefined): boolean {
  return (value ?? RIVER_CLASS_NONE) > RIVER_CLASS_NONE;
}

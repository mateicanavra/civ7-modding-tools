/**
 * Canonical numeric encoding for absent, convergent, divergent, and transform plate boundaries.
 * The values are serialized in byte artifacts and compared across tectonic and morphology consumers,
 * so their assignments are a stable data contract.
 */
export const BOUNDARY_TYPE = {
  none: 0,
  convergent: 1,
  divergent: 2,
  transform: 3,
} as const;

export type BoundaryTypeName = keyof typeof BOUNDARY_TYPE;
export type BoundaryType = (typeof BOUNDARY_TYPE)[BoundaryTypeName];

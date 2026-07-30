import { clampInt16 } from "@swooper/mapgen-core/lib/math";

/**
 * Applies admitted island formation to fresh coherent topography fields.
 */
export function materializeIslandTopography(params: {
  elevation: Int16Array;
  seaLevel: number;
  landMask: Uint8Array;
  bathymetry: Int16Array;
  islandClass: Uint8Array;
}): {
  elevation: Int16Array;
  seaLevel: number;
  landMask: Uint8Array;
  bathymetry: Int16Array;
} {
  const elevation = new Int16Array(params.elevation);
  const landMask = new Uint8Array(params.landMask);
  const bathymetry = new Int16Array(params.bathymetry);
  const landElevation = clampInt16(Math.floor(params.seaLevel) + 1);

  for (let index = 0; index < params.islandClass.length; index += 1) {
    if (params.islandClass[index] === 0) continue;
    landMask[index] = 1;
    elevation[index] = Math.max(elevation[index]!, landElevation);
    bathymetry[index] = 0;
  }

  return {
    elevation,
    seaLevel: params.seaLevel,
    landMask,
    bathymetry,
  };
}

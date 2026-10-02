import { clampInt16, roundHalfAwayFromZero } from "@swooper/mapgen-core/lib/math";

/** Publishes the existing geomorphic land-water identity and integer exposure products. */
export function publishGeomorphicTopography(params: {
  readonly elevation: ArrayLike<number>;
  readonly elevationDelta: ArrayLike<number>;
  readonly landMask: ArrayLike<number>;
  readonly seaLevel: number;
}) {
  const { elevation, elevationDelta, landMask, seaLevel } = params;
  const size = elevation.length;
  const nextElevation = new Int16Array(size);
  const nextLandMask = new Uint8Array(size);
  const bathymetry = new Int16Array(size);

  for (let i = 0; i < size; i++) {
    nextElevation[i] = clampInt16(Math.round((elevation[i] ?? 0) + (elevationDelta[i] ?? 0)));
  }

  const waterElevation = clampInt16(Math.floor(seaLevel));
  const landElevation = clampInt16(Math.floor(seaLevel) + 1);
  for (let i = 0; i < size; i++) {
    const isLand = landMask[i] === 1;
    nextLandMask[i] = isLand ? 1 : 0;
    if (isLand) {
      if ((nextElevation[i] ?? 0) <= seaLevel) nextElevation[i] = landElevation;
      bathymetry[i] = 0;
      continue;
    }

    if ((nextElevation[i] ?? 0) > seaLevel) nextElevation[i] = waterElevation;
    bathymetry[i] = clampInt16(
      roundHalfAwayFromZero(Math.min(0, (nextElevation[i] ?? 0) - seaLevel))
    );
  }

  return { elevation: nextElevation, seaLevel, landMask: nextLandMask, bathymetry };
}

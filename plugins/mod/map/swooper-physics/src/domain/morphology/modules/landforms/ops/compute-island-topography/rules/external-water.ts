import { collectMaskComponentsOddQ } from "@swooper/mapgen-core/lib/grid";

/** Prescribes every exact maximum-area final initial-water component at the existing sea datum. */
export function declareExternalWater(params: {
  width: number;
  height: number;
  landMask: ArrayLike<number>;
  elevation: ArrayLike<number>;
  seaLevel: number;
}): Uint8Array {
  if (!Number.isFinite(params.seaLevel)) {
    throw new RangeError("Expected a finite external-water seaLevel datum.");
  }
  const size = params.width * params.height;
  const waterMask = new Uint8Array(size);
  for (let index = 0; index < size; index += 1) {
    const land = params.landMask[index];
    if (land !== 0 && land !== 1) {
      throw new RangeError(`Expected binary initial landMask at tile ${index}; received ${land}.`);
    }
    waterMask[index] = land === 0 ? 1 : 0;
  }

  const components = collectMaskComponentsOddQ({
    width: params.width,
    height: params.height,
    mask: waterMask,
  });
  let maximumArea = 0;
  for (const component of components) maximumArea = Math.max(maximumArea, component.size);

  const externalWaterMask = new Uint8Array(size);
  for (const component of components) {
    if (component.size !== maximumArea) continue;
    for (const index of component.indices) {
      if (params.elevation[index]! > params.seaLevel) {
        throw new RangeError(`External-water ground at tile ${index} exceeds the seaLevel datum.`);
      }
      externalWaterMask[index] = 1;
    }
  }
  return externalWaterMask;
}

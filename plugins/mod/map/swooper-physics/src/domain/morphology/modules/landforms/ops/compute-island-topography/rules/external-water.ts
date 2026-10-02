import { collectMaskComponentsOddQ } from "@swooper/mapgen-core/lib/grid";

/** Prescribes final initial water connected to a clipped-Y exterior at the existing sea datum. */
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
  const externalWaterMask = new Uint8Array(size);
  for (const component of components) {
    const reachesExterior = component.indices.some((index) =>
      index < params.width || index >= size - params.width
    );
    if (!reachesExterior) continue;
    for (const index of component.indices) {
      if (params.elevation[index]! > params.seaLevel) {
        throw new RangeError(`External-water ground at tile ${index} exceeds the seaLevel datum.`);
      }
      externalWaterMask[index] = 1;
    }
  }
  return externalWaterMask;
}

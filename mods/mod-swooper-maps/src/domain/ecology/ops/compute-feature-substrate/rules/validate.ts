type ComputeInputs = Readonly<{
  width: number;
  height: number;
  riverClass: Uint8Array;
  navigableRiverMask: Uint8Array;
  landMask: Uint8Array;
  elevation: Int16Array;
  discharge: Float32Array;
  sinkMask: Uint8Array;
}>;

/**
 * Validates feature-substrate inputs and returns the expected grid size.
 */
export function validateFeatureSubstrateInputs(input: ComputeInputs): number {
  const width = input.width | 0;
  const height = input.height | 0;
  const size = Math.max(0, width * height);

  if (!(input.riverClass instanceof Uint8Array) || input.riverClass.length !== size) {
    throw new Error("[Ecology] Invalid riverClass for compute-feature-substrate.");
  }
  if (
    !(input.navigableRiverMask instanceof Uint8Array) ||
    input.navigableRiverMask.length !== size
  ) {
    throw new Error("[Ecology] Invalid navigableRiverMask for compute-feature-substrate.");
  }
  if (!(input.landMask instanceof Uint8Array) || input.landMask.length !== size) {
    throw new Error("[Ecology] Invalid landMask for compute-feature-substrate.");
  }
  if (!(input.elevation instanceof Int16Array) || input.elevation.length !== size) {
    throw new Error("[Ecology] Invalid elevation for compute-feature-substrate.");
  }
  if (!(input.discharge instanceof Float32Array) || input.discharge.length !== size) {
    throw new Error("[Ecology] Invalid discharge for compute-feature-substrate.");
  }
  if (!(input.sinkMask instanceof Uint8Array) || input.sinkMask.length !== size) {
    throw new Error("[Ecology] Invalid sinkMask for compute-feature-substrate.");
  }

  return size;
}

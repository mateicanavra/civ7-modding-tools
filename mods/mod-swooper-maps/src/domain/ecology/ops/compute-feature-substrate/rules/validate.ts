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

/** Checks feature-substrate field types and cardinality and returns the shared tile count. */
export function validateFeatureSubstrateInputs(input: ComputeInputs): number {
  const size = input.width * input.height;

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

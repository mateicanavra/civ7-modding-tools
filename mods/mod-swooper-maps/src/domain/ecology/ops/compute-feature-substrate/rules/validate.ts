type ComputeInputs = Readonly<{
  width: number;
  height: number;
  riverClass: Uint8Array;
  landMask: Uint8Array;
}>;

export function validateFeatureSubstrateInputs(input: ComputeInputs): number {
  const width = input.width | 0;
  const height = input.height | 0;
  const size = Math.max(0, width * height);

  if (!(input.riverClass instanceof Uint8Array) || input.riverClass.length !== size) {
    throw new Error("[Ecology] Invalid riverClass for compute-feature-substrate.");
  }
  if (!(input.landMask instanceof Uint8Array) || input.landMask.length !== size) {
    throw new Error("[Ecology] Invalid landMask for compute-feature-substrate.");
  }

  return size;
}


export function validateVegetationSubstrateInputs(args: {
  width: number;
  height: number;
  landMask: Uint8Array;
  effectiveMoisture: Float32Array;
  surfaceTemperature: Float32Array;
  aridityIndex: Float32Array;
  freezeIndex: Float32Array;
  vegetationDensity: Float32Array;
  fertility: Float32Array;
}): number {
  const width = args.width | 0;
  const height = args.height | 0;
  if (!Number.isFinite(width) || width <= 0) throw new Error("invalid width");
  if (!Number.isFinite(height) || height <= 0) throw new Error("invalid height");
  const size = width * height;

  const check = (label: string, arr: { length: number }) => {
    if (arr.length !== size) throw new Error(`${label} length ${arr.length} != ${size}`);
  };

  check("landMask", args.landMask);
  check("effectiveMoisture", args.effectiveMoisture);
  check("surfaceTemperature", args.surfaceTemperature);
  check("aridityIndex", args.aridityIndex);
  check("freezeIndex", args.freezeIndex);
  check("vegetationDensity", args.vegetationDensity);
  check("fertility", args.fertility);

  return size;
}


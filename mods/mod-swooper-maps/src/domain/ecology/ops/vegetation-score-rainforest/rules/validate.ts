export function validateVegetationScoreInputs(args: {
  width: number;
  height: number;
  landMask: Uint8Array;
  energy01: Float32Array;
  water01: Float32Array;
  waterStress01: Float32Array;
  coldStress01: Float32Array;
  biomass01: Float32Array;
  fertility01: Float32Array;
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
  check("energy01", args.energy01);
  check("water01", args.water01);
  check("waterStress01", args.waterStress01);
  check("coldStress01", args.coldStress01);
  check("biomass01", args.biomass01);
  check("fertility01", args.fertility01);

  return size;
}


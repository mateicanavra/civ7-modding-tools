import { clampInt } from "@swooper/mapgen-core/lib/math";

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

export function computeNavigableRiverMask(args: {
  size: number;
  riverClass: Uint8Array;
  navigableRiverClass: number;
}): Uint8Array {
  const mask = new Uint8Array(args.size);
  const target = clampInt(args.navigableRiverClass | 0, 0, 255);
  for (let i = 0; i < args.size; i++) {
    mask[i] = (args.riverClass[i] ?? 0) === target ? 1 : 0;
  }
  return mask;
}

export function computeRiverAdjacencyMask(args: {
  width: number;
  height: number;
  riverClass: Uint8Array;
  radius: number;
}): Uint8Array {
  const width = args.width | 0;
  const height = args.height | 0;
  const radius = clampInt(args.radius | 0, 0, Math.max(width, height));
  const size = Math.max(0, width * height);

  const mask = new Uint8Array(size);
  if (radius <= 0) {
    for (let i = 0; i < size; i++) mask[i] = args.riverClass[i] ? 1 : 0;
    return mask;
  }

  for (let y = 0; y < height; y++) {
    const y0 = Math.max(0, y - radius);
    const y1 = Math.min(height - 1, y + radius);
    for (let x = 0; x < width; x++) {
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(width - 1, x + radius);
      let adjacent = 0;
      for (let ny = y0; ny <= y1 && !adjacent; ny++) {
        const row = ny * width;
        for (let nx = x0; nx <= x1; nx++) {
          if (args.riverClass[row + nx] !== 0) {
            adjacent = 1;
            break;
          }
        }
      }
      mask[y * width + x] = adjacent;
    }
  }

  return mask;
}

export function computeCoastalLandMask(args: {
  width: number;
  height: number;
  landMask: Uint8Array;
  radius: number;
}): Uint8Array {
  const width = args.width | 0;
  const height = args.height | 0;
  const radius = clampInt(args.radius | 0, 0, Math.max(width, height));
  const size = Math.max(0, width * height);

  const mask = new Uint8Array(size);
  if (radius <= 0) return mask;

  for (let y = 0; y < height; y++) {
    const y0 = Math.max(0, y - radius);
    const y1 = Math.min(height - 1, y + radius);
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (args.landMask[i] !== 1) continue;
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(width - 1, x + radius);
      let adjacentWater = 0;
      for (let ny = y0; ny <= y1 && !adjacentWater; ny++) {
        const row = ny * width;
        for (let nx = x0; nx <= x1; nx++) {
          if (nx === x && ny === y) continue;
          if (args.landMask[row + nx] === 0) {
            adjacentWater = 1;
            break;
          }
        }
      }
      mask[i] = adjacentWater;
    }
  }

  return mask;
}


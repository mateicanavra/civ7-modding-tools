import { isAnyRiverClass } from "./river-class.js";

export function computeRiverAdjacencyMaskFromRiverClass(options: {
  width: number;
  height: number;
  riverClass: Uint8Array;
  radius?: number;
}): Uint8Array {
  const width = options.width;
  const height = options.height;
  const radius = Math.max(0, options.radius ?? 1) | 0;
  const size = width * height;

  if (!(options.riverClass instanceof Uint8Array) || options.riverClass.length !== size) {
    throw new Error("[Hydrology] Invalid riverClass for riverAdjacency projection.");
  }

  const mask = new Uint8Array(size);
  if (radius <= 0) {
    for (let i = 0; i < size; i++) mask[i] = isAnyRiverClass(options.riverClass[i]) ? 1 : 0;
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
          if (isAnyRiverClass(options.riverClass[row + nx])) {
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

import { clampInt } from "@swooper/mapgen-core/lib/math";

/**
 * Marks tiles that are within the configured radius of any river class.
 */
export function computeRiverAdjacencyMask(args: {
  readonly width: number;
  readonly height: number;
  readonly riverMask: ArrayLike<number>;
  readonly radius: number;
}): Uint8Array {
  const width = args.width;
  const height = args.height;
  const radius = clampInt(args.radius | 0, 0, Math.max(width, height));
  const size = width * height;

  const mask = new Uint8Array(size);
  if (radius <= 0) {
    mask.set(args.riverMask);
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
          if (args.riverMask[row + nx] === 1) {
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

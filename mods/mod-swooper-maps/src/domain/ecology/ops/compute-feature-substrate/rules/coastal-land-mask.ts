import { clampInt } from "@swooper/mapgen-core/lib/math";

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


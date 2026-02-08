export function isNearVolcanic(args: {
  width: number;
  height: number;
  x: number;
  y: number;
  volcanicMask: Uint8Array;
  radius: number;
}): boolean {
  const { width, height, x, y, volcanicMask } = args;
  const radius = Math.max(0, args.radius | 0);
  if (radius <= 0) return false;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      if (volcanicMask[ny * width + nx] === 1) return true;
    }
  }

  return false;
}


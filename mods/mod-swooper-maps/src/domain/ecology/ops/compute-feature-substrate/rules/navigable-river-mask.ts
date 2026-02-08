import { clampInt } from "@swooper/mapgen-core/lib/math";

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


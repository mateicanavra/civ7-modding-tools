export const BYTE_SHADE_RAMP = " .:-=+*#%@";

export function shadeByte(value: number, ramp: string = BYTE_SHADE_RAMP): string {
  const v = Math.max(0, Math.min(255, value | 0));
  const idx = Math.max(0, Math.min(ramp.length - 1, Math.floor((v / 255) * (ramp.length - 1))));
  return ramp[idx] ?? "?";
}


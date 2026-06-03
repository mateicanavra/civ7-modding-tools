export const CIV7_MAP_SEED_MIN = 0;
export const CIV7_MAP_SEED_MAX = 0x7fffffff;

export function isCiv7MapSeed(value: number): boolean {
  return Number.isInteger(value) && value >= CIV7_MAP_SEED_MIN && value <= CIV7_MAP_SEED_MAX;
}

export function assertCiv7MapSeed(value: unknown): number {
  const seed = Number(value);
  if (!isCiv7MapSeed(seed)) {
    throw new Error(`seed must be an integer between ${CIV7_MAP_SEED_MIN} and ${CIV7_MAP_SEED_MAX}`);
  }
  return seed;
}

export function clampCiv7MapSeed(value: unknown): number {
  const seed = Number(value);
  if (!Number.isInteger(seed)) return CIV7_MAP_SEED_MIN;
  return Math.max(CIV7_MAP_SEED_MIN, Math.min(CIV7_MAP_SEED_MAX, seed));
}

export function randomCiv7MapSeed(): number {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return (buf[0] ?? 0) & CIV7_MAP_SEED_MAX;
    }
  } catch {
    // Fall through to Math.random.
  }
  return Math.floor(Math.random() * (CIV7_MAP_SEED_MAX + 1));
}

export const CIV7_STUDIO_SEED_MIN = 0;
export const CIV7_STUDIO_SEED_MAX = 0x7fff_ffff;

export type Civ7StudioSeedParseResult = Readonly<
  | {
      ok: true;
      value: number;
    }
  | {
      ok: false;
      reason: "empty" | "not-integer" | "out-of-range";
      min: number;
      max: number;
    }
>;

export function parseCiv7StudioSeed(value: unknown): Civ7StudioSeedParseResult {
  const normalized = typeof value === "string" ? value.trim() : value;
  if (normalized === "") {
    return { ok: false, reason: "empty", min: CIV7_STUDIO_SEED_MIN, max: CIV7_STUDIO_SEED_MAX };
  }
  const seed = typeof normalized === "number" ? normalized : Number(normalized);
  if (!Number.isInteger(seed)) {
    return { ok: false, reason: "not-integer", min: CIV7_STUDIO_SEED_MIN, max: CIV7_STUDIO_SEED_MAX };
  }
  if (seed < CIV7_STUDIO_SEED_MIN || seed > CIV7_STUDIO_SEED_MAX) {
    return { ok: false, reason: "out-of-range", min: CIV7_STUDIO_SEED_MIN, max: CIV7_STUDIO_SEED_MAX };
  }
  return { ok: true, value: seed };
}

export function formatCiv7StudioSeedError(seed: Civ7StudioSeedParseResult): string {
  if (seed.ok) return "";
  if (seed.reason === "empty") return `Seed is required (${seed.min} to ${seed.max}).`;
  if (seed.reason === "not-integer") return `Seed must be an integer from ${seed.min} to ${seed.max}.`;
  return `Seed must be between ${seed.min} and ${seed.max}; Civ7 stores setup seeds as signed 32-bit integers.`;
}

export function randomCiv7StudioSeed(): string {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return String((values[0] ?? 0) & CIV7_STUDIO_SEED_MAX);
  }
  return String(Math.floor(Math.random() * (CIV7_STUDIO_SEED_MAX + 1)));
}

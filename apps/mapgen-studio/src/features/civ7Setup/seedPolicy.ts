import {
  assessCiv7SignedIntSeed,
  CIV7_SIGNED_INT_SEED_MAX,
  CIV7_SIGNED_INT_SEED_MIN,
} from "@civ7/direct-control/policy/setup";

/** Smallest setup seed admitted by Studio and Civ7's signed seed fields. */
export const CIV7_STUDIO_SEED_MIN = CIV7_SIGNED_INT_SEED_MIN;
/** Largest setup seed admitted by Studio and Civ7's signed seed fields. */
export const CIV7_STUDIO_SEED_MAX = CIV7_SIGNED_INT_SEED_MAX;

/** Studio-facing seed admission result, including the empty authoring-field state. */
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

/** Parses a Studio seed field without coercing non-scalar caller input. */
export function parseCiv7StudioSeed(value: unknown): Civ7StudioSeedParseResult {
  if (value === undefined || (typeof value === "string" && value.trim() === "")) {
    return { ok: false, reason: "empty", min: CIV7_STUDIO_SEED_MIN, max: CIV7_STUDIO_SEED_MAX };
  }
  if (typeof value !== "string" && typeof value !== "number") {
    return {
      ok: false,
      reason: "not-integer",
      min: CIV7_STUDIO_SEED_MIN,
      max: CIV7_STUDIO_SEED_MAX,
    };
  }
  const result = assessCiv7SignedIntSeed(typeof value === "number" ? value : Number(value.trim()));
  if (!result.ok) {
    return {
      ok: false,
      reason: result.reason,
      min: result.min,
      max: result.max,
    };
  }
  return result;
}

/** Formats a failed Studio seed admission result for the authoring surface. */
export function formatCiv7StudioSeedError(seed: Civ7StudioSeedParseResult): string {
  if (seed.ok) return "";
  if (seed.reason === "empty") return `Seed is required (${seed.min} to ${seed.max}).`;
  if (seed.reason === "not-integer")
    return `Seed must be an integer from ${seed.min} to ${seed.max}.`;
  return `Seed must be between ${seed.min} and ${seed.max}; Civ7 stores setup seeds as signed 32-bit integers.`;
}

/** Produces a nonnegative random seed inside Civ7's signed setup-seed range. */
export function randomCiv7StudioSeed(): string {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return String((values[0] ?? 0) & CIV7_STUDIO_SEED_MAX);
  }
  return String(Math.floor(Math.random() * (CIV7_STUDIO_SEED_MAX + 1)));
}

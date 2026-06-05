export const CIV7_SIGNED_INT_SEED_MIN = -0x8000_0000;
export const CIV7_SIGNED_INT_SEED_MAX = 0x7fff_ffff;

export type Civ7SeedPolicyResult = Readonly<
  | {
      ok: true;
      value: number;
    }
  | {
      ok: false;
      reason: "not-integer" | "out-of-range";
      min: number;
      max: number;
    }
>;

export function assessCiv7SignedIntSeed(value: unknown): Civ7SeedPolicyResult {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return {
      ok: false,
      reason: "not-integer",
      min: CIV7_SIGNED_INT_SEED_MIN,
      max: CIV7_SIGNED_INT_SEED_MAX,
    };
  }
  if (value < CIV7_SIGNED_INT_SEED_MIN || value > CIV7_SIGNED_INT_SEED_MAX) {
    return {
      ok: false,
      reason: "out-of-range",
      min: CIV7_SIGNED_INT_SEED_MIN,
      max: CIV7_SIGNED_INT_SEED_MAX,
    };
  }
  return { ok: true, value };
}

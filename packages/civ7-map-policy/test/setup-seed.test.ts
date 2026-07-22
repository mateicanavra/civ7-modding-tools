import { describe, expect, test } from "bun:test";
import { Value } from "typebox/value";

import {
  assessCiv7SignedIntSeed,
  CIV7_SIGNED_INT_SEED_MAX,
  CIV7_SIGNED_INT_SEED_MIN,
  Civ7SignedIntSeedSchema,
} from "../src/setup.js";

describe("Civ7 setup seed policy", () => {
  test("admits the complete signed 32-bit setup seed domain", () => {
    for (const value of [CIV7_SIGNED_INT_SEED_MIN, 0, CIV7_SIGNED_INT_SEED_MAX]) {
      expect(assessCiv7SignedIntSeed(value)).toEqual({ ok: true, value });
      expect(Value.Check(Civ7SignedIntSeedSchema, value)).toBe(true);
    }
  });

  test("rejects coercion and non-integer numeric values", () => {
    for (const value of ["123", 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(assessCiv7SignedIntSeed(value)).toEqual({
        ok: false,
        reason: "not-integer",
        min: CIV7_SIGNED_INT_SEED_MIN,
        max: CIV7_SIGNED_INT_SEED_MAX,
      });
      expect(Value.Check(Civ7SignedIntSeedSchema, value)).toBe(false);
    }
  });

  test("reports finite integers beyond Civ7's setup range as out of range", () => {
    for (const value of [CIV7_SIGNED_INT_SEED_MIN - 1, CIV7_SIGNED_INT_SEED_MAX + 1]) {
      expect(assessCiv7SignedIntSeed(value)).toEqual({
        ok: false,
        reason: "out-of-range",
        min: CIV7_SIGNED_INT_SEED_MIN,
        max: CIV7_SIGNED_INT_SEED_MAX,
      });
      expect(Value.Check(Civ7SignedIntSeedSchema, value)).toBe(false);
    }
  });
});

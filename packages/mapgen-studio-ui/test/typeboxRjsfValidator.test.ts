// Differential parity suite: the TypeBox-backed validator MUST agree with the
// previous ajv validator (`@rjsf/validator-ajv8`, the oracle) on the config
// form's behavior. The feature matrix is derived from the real recipe config
// schema (`mods/mod-swooper-maps/dist/recipes/standard.schema.json`) feature
// inventory: object + `additionalProperties:false`, integer/number bounds +
// defaults, `pattern`/`minLength`, bounded arrays (`minItems`/`maxItems`/
// `uniqueItems`), tuple `items: [...]` + `additionalItems:false`, `enum` (via
// scalar `const`-union normalization), nested `required`, and multi-variant
// `anyOf` of object variants (the strategy/config discriminator). Every fixture
// is run through `normalizeSchemaForRjsf` first, mirroring the production path
// (`SchemaConfigForm` -> `SchemaForm`).
//
// Parity is asserted two ways:
//   - `isValid`: strict equality on every case (this is the hot path — rjsf
//     calls it to pick the matching `anyOf` option and to gate the form).
//   - error *locations* (which fields carry `__errors` in the `errorSchema`):
//     strict equality on well-attributed cases. For `anyOf` *failures* — where
//     validators legitimately differ on which sub-error to surface — we only
//     require that both agree the data is invalid and both report at least one
//     error, not identical locations.
import type { RJSFSchema } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { describe, expect, it } from "vitest";
import { normalizeSchemaForRjsf } from "../src/components/forms/schemaPresentation.js";
import { createTypeboxValidator } from "../src/components/forms/typeboxRjsfValidator.js";

const ajv = customizeValidator();
const tb = createTypeboxValidator();

/** Collect the set of dotted field paths that carry a non-empty `__errors`. */
function errorPaths(errorSchema: unknown, prefix = ""): string[] {
  if (!errorSchema || typeof errorSchema !== "object") return [];
  const out: string[] = [];
  for (const [key, value] of Object.entries(errorSchema as Record<string, unknown>)) {
    if (key === "__errors") {
      if (Array.isArray(value) && value.length > 0) out.push(prefix || "(root)");
      continue;
    }
    out.push(...errorPaths(value, prefix ? `${prefix}.${key}` : key));
  }
  return out;
}

const norm = (schema: unknown): RJSFSchema => normalizeSchemaForRjsf(schema) as RJSFSchema;

// ---- the storybook fixture (kept identical to SchemaConfigForm.stories.tsx) ----
const storyFixture: RJSFSchema = {
  type: "object",
  properties: {
    climate: {
      type: "object",
      properties: {
        model: { type: "string", enum: ["earthlike", "arid", "tropical", "frozen"] },
        rainfall: { type: "number" },
        enableRivers: { type: "boolean" },
        biomes: {
          type: "array",
          uniqueItems: true,
          items: { type: "string", enum: ["tundra", "grassland", "desert", "rainforest", "marsh"] },
        },
        notes: { type: "string", maxLength: 200 },
      },
    },
    landmass: {
      type: "object",
      properties: {
        waterPercent: { type: "number" },
        continents: { type: "number" },
        islands: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              size: { type: "string", enum: ["small", "medium", "large"] },
            },
          },
        },
      },
    },
  },
};
const storyGood = {
  climate: { model: "arid", rainfall: 3, enableRivers: true, biomes: ["desert"], notes: "ok" },
  landmass: { waterPercent: 60, continents: 2, islands: [{ name: "i", size: "small" }] },
};

// ---- real-shape fixture: nested objects with additionalProperties:false,
// integer/number bounds + defaults, bounded arrays, and a strategy/config
// discriminated union (the compute-crust-evolution pattern). ----
const recipeShape: RJSFSchema = {
  type: "object",
  additionalProperties: false,
  required: ["mesh", "crust"],
  properties: {
    mesh: {
      type: "object",
      additionalProperties: false,
      required: ["plateCount", "cellsPerPlate"],
      properties: {
        plateCount: { type: "integer", minimum: 2, maximum: 256, default: 8 },
        cellsPerPlate: { type: "integer", minimum: 1, maximum: 64, default: 6 },
        eraWeights: {
          type: "array",
          minItems: 2,
          maxItems: 8,
          items: { type: "number", minimum: 0, maximum: 1 },
          default: [0.25, 0.25, 0.25, 0.25],
        },
      },
    },
    crust: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["strategy", "config"],
          properties: {
            strategy: { type: "string", const: "default" },
            config: {
              type: "object",
              additionalProperties: false,
              required: ["intensity"],
              properties: { intensity: { type: "number", minimum: 0, maximum: 1, default: 0.5 } },
            },
          },
        },
        {
          type: "object",
          additionalProperties: false,
          required: ["strategy", "config"],
          properties: {
            strategy: { type: "string", const: "tectonic" },
            config: {
              type: "object",
              additionalProperties: false,
              required: ["plateCount"],
              properties: { plateCount: { type: "integer", minimum: 2, maximum: 64, default: 8 } },
            },
          },
        },
      ],
    },
  },
};
const recipeGood = {
  mesh: { plateCount: 8, cellsPerPlate: 6, eraWeights: [0.5, 0.5] },
  crust: { strategy: "default", config: { intensity: 0.5 } },
};

type Case = {
  name: string;
  schema: unknown;
  data: unknown;
  /** anyOf-failure cases: require agreement on validity, not on error location. */
  anyOfFuzzy?: boolean;
};

const cases: Case[] = [
  // --- storybook fixture ---
  { name: "story: valid", schema: storyFixture, data: storyGood },
  {
    name: "story: model out of enum",
    schema: storyFixture,
    data: { ...storyGood, climate: { ...storyGood.climate, model: "zzz" } },
  },
  {
    name: "story: rainfall wrong type",
    schema: storyFixture,
    data: { ...storyGood, climate: { ...storyGood.climate, rainfall: "wet" } },
  },
  {
    name: "story: biomes non-unique",
    schema: storyFixture,
    data: { ...storyGood, climate: { ...storyGood.climate, biomes: ["desert", "desert"] } },
  },
  {
    name: "story: biome item out of enum",
    schema: storyFixture,
    data: { ...storyGood, climate: { ...storyGood.climate, biomes: ["nope"] } },
  },
  {
    name: "story: notes too long",
    schema: storyFixture,
    data: { ...storyGood, climate: { ...storyGood.climate, notes: "x".repeat(201) } },
  },
  {
    name: "story: island size out of enum",
    schema: storyFixture,
    data: {
      ...storyGood,
      landmass: { ...storyGood.landmass, islands: [{ name: "i", size: "huge" }] },
    },
  },

  // --- real-shape fixture ---
  { name: "recipe: valid (default strategy)", schema: recipeShape, data: recipeGood },
  {
    name: "recipe: valid (tectonic strategy)",
    schema: recipeShape,
    data: { ...recipeGood, crust: { strategy: "tectonic", config: { plateCount: 8 } } },
  },
  {
    name: "recipe: plateCount below min",
    schema: recipeShape,
    data: { ...recipeGood, mesh: { ...recipeGood.mesh, plateCount: 1 } },
  },
  {
    name: "recipe: plateCount not integer",
    schema: recipeShape,
    data: { ...recipeGood, mesh: { ...recipeGood.mesh, plateCount: 8.5 } },
  },
  {
    name: "recipe: eraWeights too few items",
    schema: recipeShape,
    data: { ...recipeGood, mesh: { ...recipeGood.mesh, eraWeights: [0.5] } },
  },
  {
    name: "recipe: eraWeights item out of range",
    schema: recipeShape,
    data: { ...recipeGood, mesh: { ...recipeGood.mesh, eraWeights: [0.5, 2] } },
  },
  {
    name: "recipe: missing required mesh child",
    schema: recipeShape,
    data: { ...recipeGood, mesh: { plateCount: 8 } },
  },
  {
    name: "recipe: extra property (additionalProperties:false)",
    schema: recipeShape,
    data: { ...recipeGood, mesh: { ...recipeGood.mesh, bogus: 1 } },
  },
  {
    name: "recipe: crust strategy out of union",
    schema: recipeShape,
    data: { ...recipeGood, crust: { strategy: "nope", config: {} } },
    anyOfFuzzy: true,
  },
  {
    name: "recipe: crust config violates matched variant",
    schema: recipeShape,
    data: { ...recipeGood, crust: { strategy: "default", config: { intensity: 5 } } },
    anyOfFuzzy: true,
  },

  // --- keyword coverage singletons ---
  { name: "kw: number minimum", schema: { type: "number", minimum: 0 }, data: -1 },
  { name: "kw: number maximum", schema: { type: "number", maximum: 10 }, data: 11 },
  { name: "kw: integer type", schema: { type: "integer" }, data: 1.5 },
  { name: "kw: enum reject", schema: { type: "string", enum: ["a", "b"] }, data: "c" },
  {
    name: "kw: required missing (top-level)",
    schema: { type: "object", properties: { a: { type: "string" } }, required: ["a"] },
    data: {},
  },
  {
    name: "kw: required missing (two props)",
    schema: {
      type: "object",
      properties: { a: { type: "string" }, b: { type: "number" } },
      required: ["a", "b"],
    },
    data: {},
  },
  {
    name: "kw: nested required",
    schema: {
      type: "object",
      properties: { a: { type: "object", properties: { b: { type: "string" } }, required: ["b"] } },
      required: ["a"],
    },
    data: { a: {} },
  },
  {
    name: "kw: array minItems",
    schema: { type: "array", items: { type: "number" }, minItems: 2 },
    data: [1],
  },
  {
    name: "kw: array uniqueItems",
    schema: { type: "array", items: { type: "number" }, uniqueItems: true },
    data: [1, 1],
  },
  {
    name: "kw: additionalProperties false",
    schema: { type: "object", properties: { a: { type: "string" } }, additionalProperties: false },
    data: { a: "x", b: "y" },
  },
  // scalar const-union that normalizeSchemaForRjsf flattens to an enum
  {
    name: "kw: anyOf-const normalized to enum (valid)",
    schema: { anyOf: [{ const: "a" }, { const: "b" }] },
    data: "a",
  },
  {
    name: "kw: anyOf-const normalized to enum (invalid)",
    schema: { anyOf: [{ const: "a" }, { const: "b" }] },
    data: "z",
  },

  // real-schema features the first matrix missed (surfaced by review): `pattern`,
  // `minLength`, and tuple `items: [...]` with `additionalItems: false` (used by
  // standard-map-config.schema.json, e.g. biomeClassification moisture thresholds).
  {
    name: "kw: pattern reject",
    schema: { type: "string", pattern: "^RESOURCE_[A-Z0-9_]+$" },
    data: "nope",
  },
  {
    name: "kw: pattern accept",
    schema: { type: "string", pattern: "^RESOURCE_[A-Z0-9_]+$" },
    data: "RESOURCE_IRON",
  },
  { name: "kw: minLength reject", schema: { type: "string", minLength: 1 }, data: "" },
  {
    name: "kw: tuple item wrong type",
    schema: {
      type: "array",
      additionalItems: false,
      minItems: 2,
      items: [{ type: "number" }, { type: "number" }],
    },
    data: ["x", 2],
  },
  {
    name: "kw: tuple overflow (1 extra)",
    schema: {
      type: "array",
      additionalItems: false,
      minItems: 2,
      items: [{ type: "number" }, { type: "number" }],
    },
    data: [1, 2, 3],
  },
  {
    name: "kw: tuple overflow (2 extra)",
    schema: {
      type: "array",
      additionalItems: false,
      minItems: 2,
      items: [{ type: "number" }, { type: "number" }],
    },
    data: [1, 2, 3, 4],
  },
  {
    name: "kw: tuple valid",
    schema: {
      type: "array",
      additionalItems: false,
      minItems: 2,
      items: [{ type: "number" }, { type: "number" }],
    },
    data: [1, 2],
  },
  // nested tuple overflow must attach to the array field (`t`), not a phantom `t.2`
  {
    name: "nested tuple overflow",
    schema: {
      type: "object",
      properties: {
        t: {
          type: "array",
          additionalItems: false,
          items: [{ type: "number" }, { type: "number" }],
        },
      },
    },
    data: { t: [1, 2, 3] },
  },
];

describe("TypeboxValidator vs @rjsf/validator-ajv8 (parity)", () => {
  it.each(cases)("isValid parity — $name", ({ schema, data }) => {
    const s = norm(schema);
    expect(tb.isValid(s, data, s)).toBe(ajv.isValid(s, data, s));
  });

  it.each(cases)("error-location parity — $name", ({ schema, data, anyOfFuzzy }) => {
    const s = norm(schema);
    const ajvResult = ajv.validateFormData(data, s);
    const tbResult = tb.validateFormData(data, s);
    const ajvLocs = new Set(errorPaths(ajvResult.errorSchema));
    const tbLocs = new Set(errorPaths(tbResult.errorSchema));

    if (anyOfFuzzy) {
      // Validators legitimately differ on which anyOf sub-error to surface;
      // require agreement on invalidity + that both report something.
      expect(ajv.isValid(s, data, s)).toBe(false);
      expect(tbResult.errors.length > 0).toBe(true);
      expect(ajvResult.errors.length > 0).toBe(true);
      return;
    }

    expect(tbLocs).toEqual(ajvLocs);
  });
});

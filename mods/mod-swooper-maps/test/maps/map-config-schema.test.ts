import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { Type } from "typebox";
import { Value } from "typebox/value";
import { describe, expect, it } from "vitest";
import { admitSwooperCatalogConfig } from "../../src/maps/catalog/admission";
import { CatalogSourceIndex } from "../../src/maps/catalog/sourceIndex";
import {
  admitStandardMapConfig,
  buildCanonicalMapConfigSchema,
  validateCanonicalMapConfig,
} from "../../src/maps/configs/canonical";
import standardRecipe, { STANDARD_STAGES } from "../../src/recipes/standard/recipe";
import { TEST_MAP_SIZE } from "../map-size";

const repoRoot = resolve(import.meta.dirname, "../../../..");

async function loadSwooperMapConfigRegistry() {
  const recipeSchema = deriveRecipeConfigSchema(STANDARD_STAGES);
  return Promise.all(
    CatalogSourceIndex.map(async (sourcePath) => ({
      sourcePath,
      ...admitSwooperCatalogConfig({
        sourcePath,
        canonicalConfig: JSON.parse(
          await readFile(resolve(repoRoot, sourcePath), "utf8")
        ) as unknown,
        recipeSchema,
      }),
    }))
  );
}

function authoredEnvelope(
  config: Awaited<ReturnType<typeof loadSwooperMapConfigRegistry>>[number]
) {
  return config.canonicalConfig;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function findRequiredDefaultPath(
  schema: unknown,
  path: readonly string[] = []
): readonly string[] | undefined {
  if (!isRecord(schema)) return undefined;

  const properties = schema.properties;
  const required = Array.isArray(schema.required)
    ? new Set(schema.required.filter((value): value is string => typeof value === "string"))
    : new Set<string>();
  if (isRecord(properties)) {
    for (const [key, propertySchema] of Object.entries(properties)) {
      if (
        required.has(key) &&
        isRecord(propertySchema) &&
        Object.hasOwn(propertySchema, "default")
      ) {
        return [...path, key];
      }
      const nested = findRequiredDefaultPath(propertySchema, [...path, key]);
      if (nested !== undefined) return nested;
    }
  }

  for (const keyword of ["allOf", "anyOf", "oneOf"] as const) {
    const branches = schema[keyword];
    if (!Array.isArray(branches)) continue;
    for (const branch of branches) {
      const nested = findRequiredDefaultPath(branch, path);
      if (nested !== undefined) return nested;
    }
  }
  return undefined;
}

function deleteAtPath(value: Record<string, unknown>, path: readonly string[]): void {
  const leaf = path.at(-1);
  if (leaf === undefined) throw new Error("Expected a non-empty config path");
  let parent = value;
  for (const segment of path.slice(0, -1)) {
    const next = parent[segment];
    if (!isRecord(next)) throw new Error(`Expected object at config path ${segment}`);
    parent = next;
  }
  delete parent[leaf];
}

describe("Shipped map configs", () => {
  it("stay canonical, complete, schema-valid, and catalog-index backed", async () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const configs = await loadSwooperMapConfigRegistry();

    expect(configs).toHaveLength(CatalogSourceIndex.length);

    for (const [index, config] of configs.entries()) {
      const canonicalConfig = config.canonicalConfig;
      expect(config.sourcePath).toBe(CatalogSourceIndex[index]);
      expect(Value.Check(schema, canonicalConfig.config), canonicalConfig.id).toBe(true);
    }
  });

  it("rejects incomplete and unknown config JSON without special cases", async () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const envelopeSchema = buildCanonicalMapConfigSchema(schema);
    const configs = await loadSwooperMapConfigRegistry();
    const [fixture] = configs;
    if (!fixture) throw new Error("Expected shipped Swooper map configs");
    const defaultedRequiredPath = findRequiredDefaultPath(schema);
    if (defaultedRequiredPath === undefined) {
      throw new Error("Expected the Standard schema to have required data with a default");
    }

    const missingDefaultedValue = JSON.parse(JSON.stringify(authoredEnvelope(fixture))) as Record<
      string,
      unknown
    >;
    const missingDefaultConfig = missingDefaultedValue.config;
    if (!isRecord(missingDefaultConfig)) throw new Error("Expected a config object");
    deleteAtPath(missingDefaultConfig, defaultedRequiredPath);

    expect(Value.Check(schema, missingDefaultConfig)).toBe(false);
    expect(() =>
      validateCanonicalMapConfig({
        fileName: `${fixture.canonicalConfig.id}.config.json`,
        raw: missingDefaultedValue,
        recipeSchema: schema,
      })
    ).toThrow("complete recipe config JSON");

    const unknownProperty = JSON.parse(JSON.stringify(authoredEnvelope(fixture))) as Record<
      string,
      unknown
    >;
    const unknownPropertyConfig = unknownProperty.config;
    if (!isRecord(unknownPropertyConfig)) throw new Error("Expected a config object");
    if ((schema as { additionalProperties?: unknown }).additionalProperties !== false) {
      throw new Error("Expected the supplied recipe schema to be closed");
    }
    let unknownKey = "test-unknown-property";
    while (Object.hasOwn(unknownPropertyConfig, unknownKey)) unknownKey += "-next";
    unknownPropertyConfig[unknownKey] = {};

    expect(() =>
      validateCanonicalMapConfig({
        fileName: `${fixture.canonicalConfig.id}.config.json`,
        raw: unknownProperty,
        recipeSchema: schema,
      })
    ).toThrow("Unknown key");
    expect(() => Value.Assert(envelopeSchema, unknownProperty)).toThrow();
  });

  it("admits against the freshly supplied recipe schema into an immutable exact snapshot", async () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const freshSchema = Type.Object(
      {
        ...schema.properties,
        "fresh-schema-property": Type.Object({}, { additionalProperties: false }),
      },
      { additionalProperties: false }
    );
    const [fixture] = await loadSwooperMapConfigRegistry();
    if (!fixture) throw new Error("Expected a shipped Swooper map config");
    const raw = structuredClone(fixture.canonicalConfig) as Record<string, unknown>;
    const config = raw.config as Record<string, unknown>;
    config["fresh-schema-property"] = {};
    const submittedJson = JSON.stringify(raw);

    expect(() => admitStandardMapConfig(raw)).toThrow("Unknown key");
    const admitted = admitSwooperCatalogConfig({
      sourcePath: fixture.sourcePath,
      canonicalConfig: raw,
      recipeSchema: freshSchema,
    });

    expect(JSON.stringify(admitted.canonicalConfig)).toBe(submittedJson);
    expect(admitted.canonicalConfig).toEqual(raw);
    expect(admitted.canonicalConfig).not.toBe(raw);
    expect(Object.isFrozen(admitted.canonicalConfig)).toBe(true);
    expect(Object.isFrozen(admitted.canonicalConfig.config)).toBe(true);
    raw.name = "Mutated source alias";
    expect(admitted.canonicalConfig.name).not.toBe(raw.name);
  });

  it("rejects catalog files whose path identity disagrees with the admitted id", async () => {
    const [fixture] = await loadSwooperMapConfigRegistry();
    if (!fixture) throw new Error("Expected a shipped Swooper map config");
    const sourcePath = fixture.sourcePath.replace(
      `${fixture.canonicalConfig.id}.config.json`,
      `not-${fixture.canonicalConfig.id}.config.json`
    );

    expect(() =>
      admitSwooperCatalogConfig({ sourcePath, canonicalConfig: fixture.canonicalConfig })
    ).toThrow("must match file stem");
    expect(() =>
      admitSwooperCatalogConfig({
        sourcePath: `../${fixture.canonicalConfig.id}.config.json`,
        canonicalConfig: fixture.canonicalConfig,
      })
    ).toThrow("must point at");
  });

  it("uses the studio-contract config id constraint", async () => {
    const [fixture] = await loadSwooperMapConfigRegistry();
    if (!fixture) throw new Error("Expected a shipped Swooper map config");
    const raw = { ...fixture.canonicalConfig, id: "Invalid_Config_ID" };

    expect(() => admitStandardMapConfig(raw)).toThrow("complete portable config envelope");
  });

  it("rejects exotic and non-finite envelope data", async () => {
    const [fixture] = await loadSwooperMapConfigRegistry();
    if (!fixture) throw new Error("Expected a shipped Swooper map config");

    const exotic = structuredClone(fixture.canonicalConfig) as Record<string, unknown>;
    const exoticConfig = exotic.config;
    if (!isRecord(exoticConfig)) throw new Error("Expected a config object");
    const stageId = Object.keys(exoticConfig)[0];
    if (stageId === undefined) throw new Error("Expected a non-empty Standard config");
    exoticConfig[stageId] = new Date("2026-07-11T00:00:00.000Z");

    const nonFinite = structuredClone(fixture.canonicalConfig) as Record<string, unknown>;
    nonFinite.latitudeBounds = { topLatitude: Number.POSITIVE_INFINITY, bottomLatitude: -80 };

    expect(() => admitStandardMapConfig(exotic)).toThrow("complete portable config envelope");
    expect(() => admitStandardMapConfig(nonFinite)).toThrow("complete portable config envelope");
  });

  it("compiles every shipped config into an executable stage plan", async () => {
    const configs = await loadSwooperMapConfigRegistry();

    for (const config of configs) {
      const canonicalConfig = config.canonicalConfig;
      const compiled = standardRecipe.compileConfig(
        {
          mapSeed: 123,
          dimensions: TEST_MAP_SIZE.dimensions,
          latitudeBounds: canonicalConfig.latitudeBounds,
        },
        canonicalConfig.config
      );

      expect(Object.keys(compiled).length, canonicalConfig.id).toBeGreaterThan(0);
    }
  });
});

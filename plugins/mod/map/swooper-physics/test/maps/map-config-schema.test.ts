import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { Type } from "typebox";
import { describe, expect, it } from "vitest";
import { loadSwooperMapConfigCatalog } from "../../scripts/catalog-source";
import { admitMapConfigCatalogConfig } from "../../src/maps/catalog/admission";
import { MAP_CONFIG_CATALOG_IDS } from "../../src/maps/catalog/membership";
import {
  admitStandardMapConfig,
  validateCanonicalMapConfig,
} from "../../src/maps/configs/canonical";
import standardRecipe, { STANDARD_STAGES } from "../../src/recipes/standard/recipe";
import { createStandardRecipeTestInitialSetup } from "../recipes/swooper-physics-standard/fixtures/standard-recipe.js";
import { TEST_MAP_SIZE } from "../setup.js";

async function loadSwooperMapConfigRegistry() {
  return loadSwooperMapConfigCatalog();
}

function authoredEnvelope(
  config: Awaited<ReturnType<typeof loadSwooperMapConfigRegistry>>[number]
) {
  return config.canonicalConfig;
}

describe("Shipped map configs", () => {
  it("stay canonical, complete, and catalog-id backed", async () => {
    const configs = await loadSwooperMapConfigRegistry();

    expect(configs).toHaveLength(MAP_CONFIG_CATALOG_IDS.length);

    for (const [index, config] of configs.entries()) {
      expect(config.canonicalConfig.id).toBe(MAP_CONFIG_CATALOG_IDS[index]);
    }
  });

  it("rejects incomplete and unknown config JSON without backfilling defaults", async () => {
    const [fixture] = await loadSwooperMapConfigRegistry();
    if (!fixture) throw new Error("Expected shipped Swooper map configs");
    const schema = Type.Object(
      { authoredAmount: Type.Number({ default: 3 }) },
      { additionalProperties: false }
    );
    const missingDefaultedValue = {
      ...structuredClone(authoredEnvelope(fixture)),
      config: {},
    };
    expect(() =>
      validateCanonicalMapConfig({
        fileName: `${fixture.canonicalConfig.id}.config.json`,
        raw: missingDefaultedValue,
        recipeSchema: schema,
      })
    ).toThrow("complete recipe config JSON");

    const unknownProperty = {
      ...structuredClone(authoredEnvelope(fixture)),
      config: { authoredAmount: 3, unexpected: true },
    };

    expect(() =>
      validateCanonicalMapConfig({
        fileName: `${fixture.canonicalConfig.id}.config.json`,
        raw: unknownProperty,
        recipeSchema: schema,
      })
    ).toThrow("Unknown key");
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
    const admitted = admitMapConfigCatalogConfig({
      configId: fixture.canonicalConfig.id,
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

  it("rejects a canonical envelope whose id disagrees with its id-derived filename", async () => {
    const [fixture] = await loadSwooperMapConfigRegistry();
    if (!fixture) throw new Error("Expected a shipped Swooper map config");
    expect(() =>
      admitMapConfigCatalogConfig({
        configId: `not-${fixture.canonicalConfig.id}`,
        canonicalConfig: fixture.canonicalConfig,
      })
    ).toThrow("must match file stem");
  });

  it("compiles every shipped config into an executable stage plan", async () => {
    const configs = await loadSwooperMapConfigRegistry();

    for (const config of configs) {
      const canonicalConfig = config.canonicalConfig;
      const compiled = standardRecipe.compileConfig(
        createStandardRecipeTestInitialSetup({
          preset: TEST_MAP_SIZE,
          mapConfig: canonicalConfig,
        }),
        canonicalConfig.config
      );

      expect(Object.keys(compiled).length, canonicalConfig.id).toBeGreaterThan(0);
    }
  });
});

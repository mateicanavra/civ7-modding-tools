import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
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
import standardRecipe, {
  STANDARD_STAGES,
  type StandardRecipeConfig,
} from "../../src/recipes/standard/recipe";
import { collectWorldBalanceStats } from "../support/world-balance-stats";

const GEOGRAPHY_GUARD_SEEDS = [123, 1337, 1538316415, 1538316523] as const;
const repoRoot = resolve(import.meta.dirname, "../../../..");

async function loadSwooperMapConfigRegistry() {
  const recipeSchema = deriveRecipeConfigSchema(STANDARD_STAGES);
  return Promise.all(
    CatalogSourceIndex.map(async (sourcePath) =>
      admitSwooperCatalogConfig({
        sourcePath,
        canonicalConfig: JSON.parse(
          await readFile(resolve(repoRoot, sourcePath), "utf8")
        ) as unknown,
        recipeSchema,
      })
    )
  );
}

function authoredEnvelope(
  config: Awaited<ReturnType<typeof loadSwooperMapConfigRegistry>>[number]
) {
  return config.canonicalConfig;
}

describe("Shipped map configs", () => {
  it("stay canonical, complete, schema-valid, and catalog-index backed", async () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const configs = await loadSwooperMapConfigRegistry();

    expect(configs.map((config) => config.canonicalConfig.id).sort()).toEqual([
      "latest-juicy",
      "mountain-patch",
      "mountain-rivers-patch",
      "mountains-of-time-earthlike",
      "mountains-of-time-original",
      "shattered-ring",
      "sundered-archipelago",
      "swooper-desert-mountains",
      "swooper-earthlike",
    ]);
    expect(configs.every((config) => config.canonicalConfig.recipe === "standard")).toBe(true);
    expect(schema).toHaveProperty("properties");

    for (const config of configs) {
      const canonicalConfig = config.canonicalConfig;
      const normalized = normalizeStrict<Record<string, unknown>>(
        schema,
        canonicalConfig.config,
        `/maps/configs/${canonicalConfig.id}/config`
      );
      expect(normalized.errors, canonicalConfig.id).toEqual([]);
      expect(Value.Equal(normalized.value, canonicalConfig.config), canonicalConfig.id).toBe(true);
      expect(Object.keys(canonicalConfig.config).sort(), canonicalConfig.id).toEqual(
        STANDARD_STAGES.map((stage) => stage.id).sort()
      );
    }
  });

  it("rejects incomplete and unknown config JSON without special cases", async () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const envelopeSchema = buildCanonicalMapConfigSchema(schema);
    const configs = await loadSwooperMapConfigRegistry();
    const [fixture] = configs;
    const [firstStage] = STANDARD_STAGES;
    if (!fixture || !firstStage) throw new Error("Expected shipped Swooper map configs and stages");

    const missingDefaultStage = JSON.parse(JSON.stringify(authoredEnvelope(fixture))) as Record<
      string,
      unknown
    >;
    const missingDefaultConfig = missingDefaultStage.config as Record<string, unknown>;
    delete missingDefaultConfig[firstStage.id];

    expect(() =>
      validateCanonicalMapConfig({
        fileName: `${fixture.canonicalConfig.id}.config.json`,
        raw: missingDefaultStage,
        recipeSchema: schema,
      })
    ).toThrow("complete recipe config JSON");

    const unknownStage = JSON.parse(JSON.stringify(authoredEnvelope(fixture))) as Record<
      string,
      unknown
    >;
    const unknownStageConfig = unknownStage.config as Record<string, unknown>;
    unknownStageConfig["studio-test-unknown-stage"] = {};
    expect(() =>
      validateCanonicalMapConfig({
        fileName: `${fixture.canonicalConfig.id}.config.json`,
        raw: unknownStage,
        recipeSchema: schema,
      })
    ).toThrow("Unknown key");
    expect(() => Value.Assert(envelopeSchema, unknownStage)).toThrow();
  });

  it("admits against the freshly supplied recipe schema into an immutable exact snapshot", async () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const freshSchema = Type.Object(
      {
        ...schema.properties,
        "fresh-source-stage": Type.Object({}, { additionalProperties: false }),
      },
      { additionalProperties: false }
    );
    const [fixture] = await loadSwooperMapConfigRegistry();
    if (!fixture) throw new Error("Expected a shipped Swooper map config");
    const raw = structuredClone(fixture.canonicalConfig) as Record<string, unknown>;
    const config = raw.config as Record<string, unknown>;
    config["fresh-source-stage"] = {};
    const sourcePath = `mods/mod-swooper-maps/src/maps/configs/${raw.id}.config.json`;

    expect(() => admitStandardMapConfig(raw)).toThrow("Unknown key");
    const admitted = admitSwooperCatalogConfig({
      sourcePath,
      canonicalConfig: raw,
      recipeSchema: freshSchema,
    });

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
    const sourcePath = `mods/mod-swooper-maps/src/maps/configs/not-${fixture.canonicalConfig.id}.config.json`;

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

  it("compiles every shipped config into an executable stage plan", async () => {
    const configs = await loadSwooperMapConfigRegistry();

    for (const config of configs) {
      const canonicalConfig = config.canonicalConfig;
      const compiled = standardRecipe.compileConfig(
        {
          seed: 123,
          dimensions: { width: 80, height: 60 },
          latitudeBounds: canonicalConfig.latitudeBounds,
        },
        canonicalConfig.config
      );

      expect(Object.keys(compiled), canonicalConfig.id).toEqual(
        expect.arrayContaining(STANDARD_STAGES.map((stage) => stage.id))
      );
    }
  });

  it("runs every shipped config into non-empty land/water geography", {
    timeout: 120_000,
  }, async () => {
    const configs = await loadSwooperMapConfigRegistry();

    for (const config of configs) {
      const canonicalConfig = config.canonicalConfig;
      for (const seed of GEOGRAPHY_GUARD_SEEDS) {
        const stats = collectWorldBalanceStats({
          label: canonicalConfig.id,
          config: canonicalConfig.config as StandardRecipeConfig,
          seed,
          width: 106,
          height: 66,
          latitudeBounds: canonicalConfig.latitudeBounds,
        });

        expect(
          stats.preLakeLandTiles,
          `${canonicalConfig.id}@${seed} pre-lake land`
        ).toBeGreaterThan(0);
        expect(
          stats.postProjectionLandTiles,
          `${canonicalConfig.id}@${seed} post-projection land`
        ).toBeGreaterThan(0);
        expect(stats.waterTiles, `${canonicalConfig.id}@${seed} water`).toBeGreaterThan(0);
        const tileCount = stats.width * stats.height;
        const landShare = stats.postProjectionLandTiles / tileCount;
        expect(landShare, `${canonicalConfig.id}@${seed} land share`).toBeGreaterThan(0.075);
        expect(landShare, `${canonicalConfig.id}@${seed} land share`).toBeLessThan(0.95);
      }
    }
  });
});

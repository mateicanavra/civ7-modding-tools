import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import { Value } from "typebox/value";
import { describe, expect, it } from "vitest";
import { loadSwooperMapConfigRegistry } from "../../scripts/generate-map-artifacts";
import {
  buildCanonicalMapConfigSchema,
  validateCanonicalMapConfig,
} from "../../src/maps/configs/canonical";
import standardRecipe, {
  STANDARD_STAGES,
  type StandardRecipeConfig,
} from "../../src/recipes/standard/recipe";
import { collectWorldBalanceStats } from "../support/world-balance-stats";

const DEFAULT_LATITUDE_BOUNDS = { topLatitude: 80, bottomLatitude: -80 } as const;
const GEOGRAPHY_GUARD_SEEDS = [123, 1337, 1538316415, 1538316523] as const;

function authoredEnvelope(
  config: Awaited<ReturnType<typeof loadSwooperMapConfigRegistry>>[number]
) {
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    recipe: config.recipe,
    sortIndex: config.sortIndex,
    ...(config.latitudeBounds === undefined ? {} : { latitudeBounds: config.latitudeBounds }),
    config: config.config,
  };
}

describe("Shipped map configs", () => {
  it("stay canonical, complete, schema-valid, and catalog-index backed", async () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const configs = await loadSwooperMapConfigRegistry();

    expect(configs.map((config) => config.id).sort()).toEqual([
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
    expect(configs.every((config) => config.recipe === "standard")).toBe(true);
    expect(schema).toHaveProperty("properties");

    for (const config of configs) {
      const normalized = normalizeStrict<Record<string, unknown>>(
        schema,
        config.config,
        `/maps/configs/${config.id}/config`
      );
      expect(normalized.errors, config.id).toEqual([]);
      expect(Value.Equal(normalized.value, config.config), config.id).toBe(true);
      expect(Object.keys(config.config).sort(), config.id).toEqual(
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
        fileName: `${fixture.id}.config.json`,
        raw: missingDefaultStage,
        recipeSchema: schema,
        stages: STANDARD_STAGES,
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
        fileName: `${fixture.id}.config.json`,
        raw: unknownStage,
        recipeSchema: schema,
        stages: STANDARD_STAGES,
      })
    ).toThrow("Unknown key");
    expect(() => Value.Assert(envelopeSchema, unknownStage)).toThrow();
  });

  it("compiles every shipped config into an executable stage plan", async () => {
    const configs = await loadSwooperMapConfigRegistry();

    for (const config of configs) {
      const compiled = standardRecipe.compileConfig(
        {
          seed: 123,
          dimensions: { width: 80, height: 60 },
          latitudeBounds: config.latitudeBounds ?? DEFAULT_LATITUDE_BOUNDS,
        },
        config.config
      );

      expect(Object.keys(compiled), config.id).toEqual(
        expect.arrayContaining(STANDARD_STAGES.map((stage) => stage.id))
      );
    }
  });

  it("runs every shipped config into non-empty land/water geography", {
    timeout: 120_000,
  }, async () => {
    const configs = await loadSwooperMapConfigRegistry();

    for (const config of configs) {
      for (const seed of GEOGRAPHY_GUARD_SEEDS) {
        const stats = collectWorldBalanceStats({
          label: config.id,
          config: config.config as StandardRecipeConfig,
          seed,
          width: 106,
          height: 66,
          latitudeBounds: config.latitudeBounds ?? DEFAULT_LATITUDE_BOUNDS,
        });

        expect(stats.preLakeLandTiles, `${config.id}@${seed} pre-lake land`).toBeGreaterThan(0);
        expect(
          stats.postProjectionLandTiles,
          `${config.id}@${seed} post-projection land`
        ).toBeGreaterThan(0);
        expect(stats.waterTiles, `${config.id}@${seed} water`).toBeGreaterThan(0);
        const tileCount = stats.width * stats.height;
        const landShare = stats.postProjectionLandTiles / tileCount;
        expect(landShare, `${config.id}@${seed} land share`).toBeGreaterThan(0.075);
        expect(landShare, `${config.id}@${seed} land share`).toBeLessThan(0.95);
      }
    }
  });
});

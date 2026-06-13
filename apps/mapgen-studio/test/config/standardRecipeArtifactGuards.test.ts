import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import {
  STANDARD_RECIPE_CONFIG,
  STANDARD_RECIPE_CONFIG_SCHEMA,
  studioRecipeUiMeta as STANDARD_RECIPE_UI_META,
} from "mod-swooper-maps/recipes/standard-artifacts";
import { describe, expect, it } from "vitest";
import { getRuntimeRecipe } from "../../src/browser-runner/recipeRuntime";
import { migratePipelineConfigUnknown } from "../../src/features/configMigrations/pipelineConfig";
import {
  DEFAULT_STUDIO_RECIPE_ID,
  getRecipeArtifacts,
  STUDIO_RECIPE_ARTIFACTS,
} from "../../src/recipes/catalog";

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function schemaProperties(schema: unknown): Record<string, unknown> {
  return isObject(schema) && isObject(schema.properties) ? schema.properties : {};
}

function getConfigAtPath(config: unknown, path: readonly string[]): unknown {
  let current = config;
  for (const segment of path) {
    if (!isObject(current) || !Object.prototype.hasOwnProperty.call(current, segment)) {
      throw new Error(`Config missing path ${path.join(".")}`);
    }
    current = current[segment];
  }
  return current;
}

function getSchemaAtPath(schema: unknown, path: readonly string[]): unknown {
  let current = schema;
  for (const segment of path) {
    const props = schemaProperties(current);
    if (!Object.prototype.hasOwnProperty.call(props, segment)) {
      throw new Error(`Schema missing path ${path.join(".")}`);
    }
    current = props[segment];
  }
  return current;
}

function hasRawOpEnvelope(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(hasRawOpEnvelope);
  const obj = value as Record<string, unknown>;
  if (
    Object.prototype.hasOwnProperty.call(obj, "strategy") &&
    Object.prototype.hasOwnProperty.call(obj, "config")
  ) {
    return true;
  }
  return Object.values(obj).some(hasRawOpEnvelope);
}

function mergeDeterministic(base: unknown, overrides: unknown): unknown {
  if (overrides === undefined) return base;
  if (!isObject(base) || !isObject(overrides)) return overrides;

  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(overrides)) {
    out[key] = mergeDeterministic(base[key], overrides[key]);
  }
  return out;
}

describe("standard recipe generated artifact guardrails", () => {
  it("keeps Studio catalog and runtime entries on the same standard artifacts", () => {
    expect(DEFAULT_STUDIO_RECIPE_ID).toBe("mod-swooper-maps/standard");

    const catalogEntry = getRecipeArtifacts("mod-swooper-maps/standard");
    const runtimeEntry = getRuntimeRecipe("mod-swooper-maps/standard");

    expect(catalogEntry.configSchema).toBe(STANDARD_RECIPE_CONFIG_SCHEMA);
    expect(catalogEntry.defaultConfig).toBe(STANDARD_RECIPE_CONFIG);
    expect(catalogEntry.uiMeta).toBe(STANDARD_RECIPE_UI_META);
    expect(runtimeEntry.configSchema).toBe(STANDARD_RECIPE_CONFIG_SCHEMA);
    expect(runtimeEntry.defaultConfig).toBe(STANDARD_RECIPE_CONFIG);
    expect(STUDIO_RECIPE_ARTIFACTS.map((entry) => entry.id)).toContain("mod-swooper-maps/standard");
  });

  it("keeps generated Studio focus paths on public schema/default paths", () => {
    const stageSchemas = schemaProperties(STANDARD_RECIPE_CONFIG_SCHEMA);

    for (const stage of STANDARD_RECIPE_UI_META.stages) {
      expect(stageSchemas, `${stage.stageId} schema`).toHaveProperty(stage.stageId);
      expect(STANDARD_RECIPE_CONFIG, `${stage.stageId} default config`).toHaveProperty(
        stage.stageId
      );
      const stageSchema = stageSchemas[stage.stageId];
      const stageDefaults = (STANDARD_RECIPE_CONFIG as Record<string, unknown>)[stage.stageId];

      for (const step of stage.steps) {
        const focusPath = step.configFocusPathWithinStage;
        expect(focusPath, `${stage.stageId}.${step.stepId} focus path`).not.toContain("strategy");
        expect(focusPath, `${stage.stageId}.${step.stepId} focus path`).not.toContain("config");
        if (focusPath.length === 0) continue;
        getSchemaAtPath(stageSchema, focusPath);
        getConfigAtPath(stageDefaults, focusPath);
      }
    }
  });

  it("keeps built-in standard map presets on generated public schema", () => {
    const standardEntry = getRecipeArtifacts("mod-swooper-maps/standard");
    const presets = standardEntry.studioBuiltInPresets ?? [];

    expect(presets.length).toBeGreaterThan(0);
    for (const preset of presets) {
      expect(hasRawOpEnvelope(preset.config), `${preset.id} public config raw envelopes`).toBe(
        false
      );
      const { errors } = normalizeStrict<Record<string, unknown>>(
        STANDARD_RECIPE_CONFIG_SCHEMA,
        preset.config,
        `/studio/presets/${preset.id}`
      );
      expect(errors).toEqual([]);
    }
  });

  it("keeps Studio overrides on the worker-style strict compile path", () => {
    const runtimeEntry = getRuntimeRecipe("mod-swooper-maps/standard");
    const studioOverrides = {
      "hydrology-hydrography": {
        knobs: {
          riverDensity: "normal",
          lakeiness: "many",
        },
      },
    };

    const merged = mergeDeterministic(
      runtimeEntry.defaultConfig,
      migratePipelineConfigUnknown(studioOverrides)
    );
    const { value, errors } = normalizeStrict<Record<string, unknown>>(
      runtimeEntry.configSchema,
      merged,
      "/config"
    );

    expect(errors).toEqual([]);

    const plan = runtimeEntry.recipe.compile(
      {
        seed: 123,
        dimensions: { width: 84, height: 54 },
        latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
      },
      value
    );
    expect(plan.nodes.length).toBeGreaterThan(0);
  });
});

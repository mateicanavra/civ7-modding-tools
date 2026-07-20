import {
  STANDARD_RECIPE_CONFIG,
  STANDARD_RECIPE_CONFIG_SCHEMA,
  studioRecipeUiMeta as STANDARD_RECIPE_UI_META,
} from "mod-swooper-maps/recipes/standard-artifacts";
import { standardMapConfigs } from "mod-swooper-maps/recipes/standard-map-configs";
import { describe, expect, it } from "vitest";
import { getRuntimeRecipe } from "../../src/browser-runner/recipeRuntime";
import {
  admitPipelineConfig,
  applyPresetConfig,
  createStudioEditorCanonicalConfig,
} from "../../src/features/configAuthoring/canonicalConfig";
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

  it("constructs editor defaults from the generated standard recipe config", () => {
    expect(createStudioEditorCanonicalConfig().config).toEqual(STANDARD_RECIPE_CONFIG);
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
        if (focusPath.length === 0) continue;
        getSchemaAtPath(stageSchema, focusPath);
        getConfigAtPath(stageDefaults, focusPath);
      }
    }
  });

  it("accepts every complete generated config unchanged through the current recipe schema", () => {
    const standardEntry = getRecipeArtifacts("mod-swooper-maps/standard");
    const presets = standardEntry.studioBuiltInPresets ?? [];
    const configs = [
      { id: "default", config: STANDARD_RECIPE_CONFIG },
      ...presets.map((preset) => ({
        id: preset.canonicalConfig.id,
        config: preset.canonicalConfig.config,
      })),
    ];

    expect(presets.length).toBeGreaterThan(0);
    expect(presets.map((preset) => preset.canonicalConfig.id)).toEqual(
      standardMapConfigs.map((config) => config.canonicalConfig.id)
    );
    expect(presets.map((preset) => preset.canonicalConfig.config)).toEqual(
      standardMapConfigs.map((config) => config.canonicalConfig.config)
    );

    for (const { id, config } of configs) {
      const applied = applyPresetConfig({
        schema: STANDARD_RECIPE_CONFIG_SCHEMA,
        presetConfig: config,
        label: id,
      });
      expect(applied.ok, `${id} applied preset`).toBe(true);
      if (!applied.ok)
        throw new Error(`${id} applied preset errors: ${JSON.stringify(applied.errors)}`);
      expect(applied.value).toStrictEqual(config);
      expect(applied.value).not.toBe(config);
      expect(Object.isFrozen(applied.value)).toBe(true);
    }
  });

  it("rejects incomplete config JSON at the config boundary", () => {
    const [firstStage] = Object.keys(STANDARD_RECIPE_CONFIG);
    const incompleteConfig = { ...(STANDARD_RECIPE_CONFIG as Record<string, unknown>) };
    delete incompleteConfig[firstStage!];

    const applied = applyPresetConfig({
      schema: STANDARD_RECIPE_CONFIG_SCHEMA,
      presetConfig: incompleteConfig,
      label: "incomplete",
    });

    expect(applied.ok).toBe(false);
    if (applied.ok) throw new Error("incomplete config was accepted");
    expect(applied.errors.length).toBeGreaterThan(0);
    expect(applied.errors.some((error) => error.path === "/config/incomplete")).toBe(true);
  });

  it("rejects unknown root keys and invalid JSON without repairing them", () => {
    const rootMetadataConfig = {
      ...(STANDARD_RECIPE_CONFIG as Record<string, unknown>),
      $schema: "sentinel",
    };
    for (const [label, config] of [
      ["null", null],
      ["root-metadata", rootMetadataConfig],
      ["date", new Date(0)],
      ["non-finite", Number.POSITIVE_INFINITY],
      ["class-instance", new (class CustomConfig {})()],
    ] as const) {
      const applied = applyPresetConfig({
        schema: STANDARD_RECIPE_CONFIG_SCHEMA,
        presetConfig: config,
        label,
      });

      expect(applied.ok, label).toBe(false);
      if (applied.ok) throw new Error(`${label} config unexpectedly applied`);
      expect(applied.errors.length, label).toBeGreaterThan(0);
    }
  });

  it("admits the generated default config before worker compilation", () => {
    const runtimeEntry = getRuntimeRecipe("mod-swooper-maps/standard");

    const admitted = admitPipelineConfig({
      schema: runtimeEntry.configSchema,
      config: runtimeEntry.defaultConfig,
      label: "worker-default",
    });
    expect(admitted.ok).toBe(true);
    if (!admitted.ok) throw new Error(JSON.stringify(admitted.errors));

    const plan = runtimeEntry.recipe.compile(
      {
        seed: 123,
        dimensions: { width: 84, height: 54 },
        latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
      },
      admitted.value
    );
    expect(plan.nodes.length).toBeGreaterThan(0);
  });
});

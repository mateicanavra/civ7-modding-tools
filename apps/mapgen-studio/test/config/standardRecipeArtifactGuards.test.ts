import { describe, expect, it } from "vitest";
import {
  deriveRecipeConfigSchema,
  deriveStageAuthoringModel,
  stripSchemaMetadataRoot,
  type TSchema,
} from "@swooper/mapgen-core/authoring";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import {
  STANDARD_RECIPE_CONFIG,
  STANDARD_RECIPE_CONFIG_SCHEMA,
  studioRecipeUiMeta as STANDARD_RECIPE_UI_META,
} from "mod-swooper-maps/recipes/standard-artifacts";
import { validateCanonicalMapConfig } from "../../../../mods/mod-swooper-maps/src/maps/configs/canonical.js";
import swooperEarthlikeConfigRaw from "../../../../mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json";
import { STANDARD_STAGES as SOURCE_STANDARD_STAGES } from "../../../../mods/mod-swooper-maps/src/recipes/standard/recipe";
import { getRuntimeRecipe } from "../../src/browser-runner/recipeRuntime";
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

function stableJson(value: unknown): unknown {
  const text = JSON.stringify(value);
  if (!text) throw new Error("Value is not JSON-serializable");
  return JSON.parse(text) as unknown;
}

function formatKebabIdLabel(id: string): string {
  return id
    .split("-")
    .map((word) => (word ? word[0]!.toUpperCase() + word.slice(1) : word))
    .join(" ");
}

const STAGE_LABEL_OVERRIDES: Record<string, string> = {
  "morphology-coasts": "Morphology / Coasts",
  "morphology-routing": "Morphology / Routing",
  "morphology-erosion": "Morphology / Erosion",
  "morphology-features": "Morphology / Features",
  "map-morphology": "Map / Morphology",
  "map-hydrology": "Map / Hydrology",
  "map-ecology": "Map / Ecology",
};

const STEP_LABEL_OVERRIDES: Record<string, string> = {
  "plate-graph": "Plate Graph",
  "plate-topology": "Plate Topology",
  "climate-baseline": "Climate Baseline",
  "climate-refine": "Climate Refine",
  "rugged-coasts": "Rugged Coasts",
  "landmass-plates": "Landmass Plates",
};

function deriveSourceStudioUiMeta() {
  return {
    namespace: "mod-swooper-maps",
    recipeId: "standard",
    stages: SOURCE_STANDARD_STAGES.map((stage) => {
      const stageId = stage.id;
      const authoring = deriveStageAuthoringModel(stage);
      return {
        stageId,
        stageLabel: STAGE_LABEL_OVERRIDES[stageId] ?? formatKebabIdLabel(stageId),
        steps: authoring.runtime.steps.map((step) => ({
          stepId: step.stepId,
          stepLabel: STEP_LABEL_OVERRIDES[step.stepId] ?? formatKebabIdLabel(step.stepId),
          fullStepId: `mod-swooper-maps.standard.${stageId}.${step.stepId}`,
          configFocusPathWithinStage: authoring.config.focusPathsByStepId[step.stepId] ?? [],
        })),
      };
    }),
  };
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
  if (Object.prototype.hasOwnProperty.call(obj, "strategy") && Object.prototype.hasOwnProperty.call(obj, "config")) {
    return true;
  }
  return Object.values(obj).some(hasRawOpEnvelope);
}

describe("standard recipe generated artifact guardrails", () => {
  it("keeps generated standard schema and defaults aligned with source stages", () => {
    const sourceSchema = stableJson(deriveRecipeConfigSchema(SOURCE_STANDARD_STAGES as any)) as TSchema;
    expect(STANDARD_RECIPE_CONFIG_SCHEMA).toEqual(sourceSchema);
    expect(STANDARD_RECIPE_UI_META).toEqual(deriveSourceStudioUiMeta());

    const standardDefaultPreset = validateCanonicalMapConfig({
      fileName: "swooper-earthlike.config.json",
      raw: swooperEarthlikeConfigRaw,
      recipeSchema: sourceSchema,
      stages: SOURCE_STANDARD_STAGES,
    });
    const { value, errors } = normalizeStrict<Record<string, unknown>>(
      sourceSchema,
      stripSchemaMetadataRoot(standardDefaultPreset.config),
      "/standard/defaults"
    );
    expect(errors).toEqual([]);
    expect(STANDARD_RECIPE_CONFIG).toEqual(stripSchemaMetadataRoot(value));
    expect(hasRawOpEnvelope(STANDARD_RECIPE_CONFIG)).toBe(false);
  });

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
      expect(STANDARD_RECIPE_CONFIG, `${stage.stageId} default config`).toHaveProperty(stage.stageId);
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
      expect(hasRawOpEnvelope(preset.config), `${preset.id} public config raw envelopes`).toBe(false);
      const { errors } = normalizeStrict<Record<string, unknown>>(
        STANDARD_RECIPE_CONFIG_SCHEMA,
        preset.config,
        `/studio/presets/${preset.id}`
      );
      expect(errors).toEqual([]);
    }
  });
});

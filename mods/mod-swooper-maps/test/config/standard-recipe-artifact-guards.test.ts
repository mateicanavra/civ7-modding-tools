import { describe, expect, it } from "bun:test";

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

import { validateCanonicalMapConfig } from "../../src/maps/configs/canonical.js";
import swooperEarthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";
import { STANDARD_STAGES } from "../../src/recipes/standard/recipe";

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
  "morphology-shelf": "Morphology / Shelf",
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
    stages: STANDARD_STAGES.map((stage) => {
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function setAtPath(root: Record<string, unknown>, path: readonly string[]): void {
  let current = root;
  for (const segment of path) {
    const next = current[segment];
    if (isPlainObject(next)) {
      current = next;
      continue;
    }
    const created: Record<string, unknown> = {};
    current[segment] = created;
    current = created;
  }
}

function buildDefaultsSkeleton(uiMeta: ReturnType<typeof deriveSourceStudioUiMeta>) {
  const out: Record<string, unknown> = {};
  for (const stage of uiMeta.stages) {
    const stageConfig: Record<string, unknown> = { knobs: {} };
    for (const step of stage.steps) {
      setAtPath(stageConfig, step.configFocusPathWithinStage);
    }
    out[stage.stageId] = stageConfig;
  }
  return out;
}

describe("standard recipe source artifact guards", () => {
  it("keeps generated standard schema and defaults aligned with source stages", () => {
    const sourceSchema = stableJson(deriveRecipeConfigSchema(STANDARD_STAGES as any)) as TSchema;
    const sourceUiMeta = deriveSourceStudioUiMeta();
    expect(STANDARD_RECIPE_CONFIG_SCHEMA).toEqual(sourceSchema);
    expect(STANDARD_RECIPE_UI_META).toEqual(sourceUiMeta);

    const standardDefaultPreset = validateCanonicalMapConfig({
      fileName: "swooper-earthlike.config.json",
      raw: swooperEarthlikeConfigRaw,
      recipeSchema: sourceSchema,
      stages: STANDARD_STAGES,
    });
    const { value, errors } = normalizeStrict<Record<string, unknown>>(
      sourceSchema,
      {
        ...buildDefaultsSkeleton(sourceUiMeta),
        ...stripSchemaMetadataRoot(standardDefaultPreset.config),
      },
      "/standard/defaults"
    );
    expect(errors).toEqual([]);
    expect(STANDARD_RECIPE_CONFIG).toEqual(stripSchemaMetadataRoot(value));
  });
});

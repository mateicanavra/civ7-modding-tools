#!/usr/bin/env bun
import {
  STANDARD_RECIPE_CONFIG,
  STANDARD_RECIPE_CONFIG_SCHEMA,
  studioRecipeUiMeta as STANDARD_RECIPE_UI_META,
} from "../../../../../../../mods/mod-swooper-maps/dist/recipes/standard-artifacts.js";
import { deriveStandardRecipeArtifacts } from "../../../../../../../mods/mod-swooper-maps/src/recipes/standard/artifacts.ts";
import { STANDARD_STAGES } from "../../../../../../../mods/mod-swooper-maps/src/recipes/standard/recipe.ts";
import { deriveStageAuthoringModel } from "../../../../../../../packages/mapgen-core/src/authoring/index.ts";

const failures: string[] = [];

function stableJson(value: unknown): unknown {
  const text = JSON.stringify(value);
  if (!text) throw new Error("Value is not JSON-serializable");
  return JSON.parse(text);
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
    stages: STANDARD_STAGES.map((stage: { id: string }) => {
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

function assertJsonEqual(actual: unknown, expected: unknown, label: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures.push(`${label} drifted`);
  }
}

const sourceArtifacts = deriveStandardRecipeArtifacts();
const sourceSchema = stableJson(sourceArtifacts.schema);
const sourceUiMeta = deriveSourceStudioUiMeta();
const sourceDefaults = stableJson(sourceArtifacts.defaults);

assertJsonEqual(STANDARD_RECIPE_CONFIG_SCHEMA, sourceSchema, "standard recipe schema");
assertJsonEqual(STANDARD_RECIPE_UI_META, sourceUiMeta, "standard recipe UI metadata");
assertJsonEqual(STANDARD_RECIPE_CONFIG, sourceDefaults, "standard recipe defaults");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

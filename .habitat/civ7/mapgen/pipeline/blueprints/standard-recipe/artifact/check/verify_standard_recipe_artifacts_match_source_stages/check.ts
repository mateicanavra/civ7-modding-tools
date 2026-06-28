#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const modRoot = join(repoRoot, "mods/mod-swooper-maps");
const failures: string[] = [];

const { STANDARD_STAGES } = await import(
  pathToFileURL(join(modRoot, "src/recipes/standard/recipe.ts")).href
);
const { deriveRecipeConfigSchema, deriveStageAuthoringModel, stripSchemaMetadataRoot } =
  await import(pathToFileURL(join(repoRoot, "packages/mapgen-core/src/authoring/index.ts")).href);
const { normalizeStrict } = await import(
  pathToFileURL(join(repoRoot, "packages/mapgen-core/src/compiler/normalize.ts")).href
);
const {
  STANDARD_RECIPE_CONFIG,
  STANDARD_RECIPE_CONFIG_SCHEMA,
  studioRecipeUiMeta: STANDARD_RECIPE_UI_META,
} = await import(pathToFileURL(join(modRoot, "dist/recipes/standard-artifacts.js")).href);
const { validateCanonicalMapConfig } = await import(
  pathToFileURL(join(modRoot, "src/maps/configs/canonical.ts")).href
);
const swooperEarthlikeConfigRaw = JSON.parse(
  readFileSync(join(modRoot, "src/maps/configs/swooper-earthlike.config.json"), "utf8")
);

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

const ALLOWED_RAW_OP_ENVELOPE_PATHS = new Set([
  "foundation-orogeny.crust-evolution.computeCrustEvolution",
]);

function collectRawOpEnvelopePaths(value: unknown, path: string[] = []): string[] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectRawOpEnvelopePaths(item, [...path, String(index)])
    );
  }
  const obj = value as Record<string, unknown>;
  const paths: string[] = [];
  if (
    Object.prototype.hasOwnProperty.call(obj, "strategy") &&
    Object.prototype.hasOwnProperty.call(obj, "config")
  ) {
    paths.push(path.join("."));
  }
  for (const [key, child] of Object.entries(obj)) {
    paths.push(...collectRawOpEnvelopePaths(child, [...path, key]));
  }
  return paths;
}

function assertJsonEqual(actual: unknown, expected: unknown, label: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures.push(`${label} drifted`);
  }
}

const sourceSchema = stableJson(deriveRecipeConfigSchema(STANDARD_STAGES));
assertJsonEqual(STANDARD_RECIPE_CONFIG_SCHEMA, sourceSchema, "standard recipe schema");
assertJsonEqual(STANDARD_RECIPE_UI_META, deriveSourceStudioUiMeta(), "standard recipe UI metadata");

const standardDefaultPreset = validateCanonicalMapConfig({
  fileName: "swooper-earthlike.config.json",
  raw: swooperEarthlikeConfigRaw,
  recipeSchema: sourceSchema,
  stages: STANDARD_STAGES,
});
const { value, errors } = normalizeStrict<Record<string, unknown>>(
  sourceSchema,
  stripSchemaMetadataRoot(standardDefaultPreset.config),
  "/standard/defaults"
);
if (errors.length > 0) {
  failures.push(`standard defaults failed strict normalization: ${JSON.stringify(errors)}`);
}
assertJsonEqual(STANDARD_RECIPE_CONFIG, stripSchemaMetadataRoot(value), "standard recipe defaults");
const unexpectedRawEnvelopePaths = collectRawOpEnvelopePaths(STANDARD_RECIPE_CONFIG).filter(
  (path) => !ALLOWED_RAW_OP_ENVELOPE_PATHS.has(path)
);
if (unexpectedRawEnvelopePaths.length > 0) {
  failures.push(
    `standard recipe defaults contain unexpected raw operation envelopes: ${unexpectedRawEnvelopePaths.join(", ")}`
  );
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

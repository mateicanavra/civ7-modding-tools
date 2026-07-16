import { readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  deriveStageAuthoringModel,
  type StageAuthoringModel,
} from "@swooper/mapgen-core/authoring";
import { compile } from "json-schema-to-typescript";
import type { TObject, TSchema } from "typebox";
import { admitSwooperCatalogConfig } from "../src/maps/catalog/admission.js";
import { CatalogSourceIndex } from "../src/maps/catalog/sourceIndex.js";
import { parseCatalogSourceIndex } from "../src/maps/catalog/sources.js";
import { deriveStandardRecipeArtifacts } from "../src/recipes/standard/artifacts.js";
import { STANDARD_STAGES } from "../src/recipes/standard/recipe.js";

type JsonObject = Record<string, unknown>;

function assertPlainObject(value: unknown, label: string): asserts value is JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object`);
  }
}

function stableJson(value: unknown): JsonObject {
  const text = JSON.stringify(value);
  if (!text) throw new Error("schema is not JSON-serializable");
  const parsed = JSON.parse(text) as unknown;
  assertPlainObject(parsed, "schema");
  return parsed;
}

type StageLike = Readonly<{
  id: string;
  knobsSchema: TObject;
  steps: readonly Readonly<{ contract: Readonly<{ id: string; schema: TSchema }> }>[];
  public?: TObject;
  surfaceSchema: TObject;
  authoring: StageAuthoringModel;
  toInternal: (args: { env: unknown; stageConfig: unknown }) => {
    rawSteps: Record<string, unknown>;
  };
}>;

function assertStageLikes(value: unknown, label: string): asserts value is readonly StageLike[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} missing export STANDARD_STAGES`);
  }
}

type StudioRecipeUiMeta = Readonly<{
  namespace: string;
  recipeId: string;
  stages: readonly Readonly<{
    stageId: string;
    steps: readonly Readonly<{
      stepId: string;
      fullStepId: string;
      configFocusPathWithinStage: readonly string[];
    }>[];
  }>[];
}>;

function deriveStageStepConfigFocusMap(args: {
  namespace: string;
  recipeId: string;
  stage: StageLike;
}): Readonly<Partial<Record<string, readonly string[]>>> {
  const { stage } = args;
  return deriveStageAuthoringModel(stage).config.focusPathsByStepId;
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

function deriveStudioRecipeUiMeta(args: {
  namespace: string;
  recipeId: string;
  stages: readonly StageLike[];
}): StudioRecipeUiMeta {
  const { namespace, recipeId } = args;

  if (!Array.isArray(args.stages)) {
    throw new Error(`[recipe:${namespace}.${recipeId}] expected "stages" to be an array`);
  }

  return {
    namespace,
    recipeId,
    stages: args.stages.map((stage) => {
      const stageId = stage.id;
      const stageLabel = STAGE_LABEL_OVERRIDES[stageId] ?? formatKebabIdLabel(stageId);
      const stepFocus = deriveStageStepConfigFocusMap({ namespace, recipeId, stage });
      const authoring = deriveStageAuthoringModel(stage);
      return {
        stageId,
        stageLabel,
        steps: authoring.runtime.steps.map((step: Readonly<{ stepId: string }>) => {
          const stepId = step.stepId;
          const configFocusPathWithinStage = stepFocus[stepId] ?? [];
          const stepLabel = STEP_LABEL_OVERRIDES[stepId] ?? formatKebabIdLabel(stepId);
          return {
            stepId,
            stepLabel,
            fullStepId: `${namespace}.${recipeId}.${stageId}.${stepId}`,
            configFocusPathWithinStage,
          };
        }),
      };
    }),
  };
}

async function writeArtifactsModule(args: {
  pkgRoot: string;
  outBase: string; // e.g. "standard-artifacts"
  schemaJson: JsonObject;
  typeName: string; // e.g. "StandardRecipeConfig"
  configTypes: string; // output from json-schema-to-typescript (trimmed)
  configConstName: string; // e.g. "STANDARD_RECIPE_CONFIG"
  schemaConstName: string; // e.g. "STANDARD_RECIPE_CONFIG_SCHEMA"
  configValue: unknown;
  uiMetaValue: StudioRecipeUiMeta;
}): Promise<void> {
  const {
    pkgRoot,
    outBase,
    schemaJson,
    typeName,
    configTypes,
    configConstName,
    schemaConstName,
    configValue,
    uiMetaValue,
  } = args;

  const jsLines = [
    `// This file is generated by scripts/generate-studio-recipe-types.ts`,
    `// Do not edit by hand; re-run \`nx run mod-swooper-maps:build:studio-recipes\`.`,
    ``,
    `export const ${configConstName} = ${JSON.stringify(configValue, null, 2)};`,
    `export const ${schemaConstName} = ${JSON.stringify(schemaJson, null, 2)};`,
    `export const studioRecipeUiMeta = ${JSON.stringify(uiMetaValue, null, 2)};`,
    ``,
  ];

  const dtsLines = [
    `// This file is generated by scripts/generate-studio-recipe-types.ts`,
    `// Do not edit by hand; re-run \`nx run mod-swooper-maps:build:studio-recipes\`.`,
    ``,
    `import type { XSchema } from "typebox/schema";`,
    ``,
    configTypes.trimEnd(),
    ``,
    `export type StudioRecipeUiMeta = Readonly<{`,
    `  namespace: string;`,
    `  recipeId: string;`,
    `  stages: ReadonlyArray<Readonly<{`,
    `    stageId: string;`,
    `    stageLabel: string;`,
    `    steps: ReadonlyArray<Readonly<{`,
    `      stepId: string;`,
    `      stepLabel: string;`,
    `      fullStepId: string;`,
    `      configFocusPathWithinStage: ReadonlyArray<string>;`,
    `    }>>;`,
    `  }>>;`,
    `}>;`,
    ``,
    `export const ${configConstName}: Readonly<${typeName}>;`,
    `export const ${schemaConstName}: XSchema;`,
    `export const studioRecipeUiMeta: Readonly<StudioRecipeUiMeta>;`,
    ``,
  ];

  // Note: we intentionally embed JSON here so the UI can import schema/defaults
  // without importing the runtime recipe module (which is worker-only).
  await writeFile(resolve(pkgRoot, "dist", "recipes", `${outBase}.js`), jsLines.join("\n"));
  await writeFile(resolve(pkgRoot, "dist", "recipes", `${outBase}.d.ts`), dtsLines.join("\n"));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgRoot = resolve(__dirname, "..");

await rm(resolve(pkgRoot, "dist", "recipes", "standard.presets.json"), { force: true });

assertStageLikes(STANDARD_STAGES, "[recipe:mod-swooper-maps.standard]");
const standardStages = STANDARD_STAGES;

const { schema: standardSchema, defaults: standardDefaultsClean } = deriveStandardRecipeArtifacts();
const standardSchemaJson = stableJson(standardSchema);
const standardUiMeta = deriveStudioRecipeUiMeta({
  namespace: "mod-swooper-maps",
  recipeId: "standard",
  stages: standardStages,
});
assertPlainObject(standardDefaultsClean, "standard recipe defaults");

await writeFile(
  resolve(pkgRoot, "dist", "recipes", "standard.schema.json"),
  JSON.stringify(standardSchemaJson, null, 2)
);
await writeFile(
  resolve(pkgRoot, "dist", "recipes", "standard.defaults.json"),
  JSON.stringify(standardDefaultsClean, null, 2)
);
const standardConfigTypes = await compile(standardSchemaJson, "StandardRecipeConfig", {
  bannerComment: "",
  style: {
    singleQuote: false,
    semi: true,
  },
});

const standardDts = [
  `import type { ExtendedMapContext } from "@swooper/mapgen-core";`,
  `import type { RecipeModule } from "@swooper/mapgen-core/authoring";`,
  ``,
  standardConfigTypes.trimEnd(),
  ``,
  `export const compileOpsById: Readonly<Record<string, unknown>>;`,
  `export const STANDARD_STAGES: ReadonlyArray<unknown>;`,
  ``,
  `declare const recipe: RecipeModule<ExtendedMapContext, Readonly<StandardRecipeConfig>, unknown>;`,
  `export default recipe;`,
  ``,
].join("\n");

await writeFile(resolve(pkgRoot, "dist", "recipes", "standard.d.ts"), standardDts);

await writeArtifactsModule({
  pkgRoot,
  outBase: "standard-artifacts",
  schemaJson: standardSchemaJson,
  typeName: "StandardRecipeConfig",
  configTypes: standardConfigTypes,
  configConstName: "STANDARD_RECIPE_CONFIG",
  schemaConstName: "STANDARD_RECIPE_CONFIG_SCHEMA",
  configValue: standardDefaultsClean,
  uiMetaValue: standardUiMeta,
});

async function validateStandardMapConfigs(): Promise<void> {
  const errors: Array<{ path: string; message: string }> = [];
  for (const configPath of parseCatalogSourceIndex(CatalogSourceIndex).entries) {
    try {
      const raw = JSON.parse(
        await readFile(resolve(pkgRoot, "..", "..", configPath), "utf-8")
      ) as unknown;
      admitSwooperCatalogConfig({
        sourcePath: configPath,
        canonicalConfig: raw,
        recipeSchema: standardSchema,
      });
    } catch (err) {
      errors.push({
        path: configPath,
        message: err instanceof Error ? err.message : "Invalid canonical map config",
      });
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid standard map configs:\n${errors.map((e) => `- ${e.path}: ${e.message}`).join("\n")}`
    );
  }
}

await validateStandardMapConfigs();

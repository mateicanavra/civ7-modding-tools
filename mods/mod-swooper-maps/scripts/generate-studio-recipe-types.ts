import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  applyGeneratedFilePlan,
  type GeneratedFilePlan,
  type GeneratedFilePlanFile,
} from "@civ7/plugin-files/generated-file-plan";
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

function schemaForTypeGeneration(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(schemaForTypeGeneration);
  if (!value || typeof value !== "object") return value;

  const schema = Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, schemaForTypeGeneration(child)])
  ) as JsonObject;
  const properties = schema.properties;
  const patternProperties = schema.patternProperties;
  const hasNoNamedProperties =
    properties !== null &&
    typeof properties === "object" &&
    !Array.isArray(properties) &&
    Object.keys(properties).length === 0;
  const hasNoPatternProperties =
    patternProperties === undefined ||
    (patternProperties !== null &&
      typeof patternProperties === "object" &&
      !Array.isArray(patternProperties) &&
      Object.keys(patternProperties).length === 0);

  if (
    schema.type === "object" &&
    schema.additionalProperties === false &&
    hasNoNamedProperties &&
    hasNoPatternProperties
  ) {
    schema.tsType = "Readonly<Record<string, never>>";
  }
  return schema;
}

type StageLike = Readonly<{
  id: string;
  steps: readonly Readonly<{ contract: Readonly<{ id: string; schema: TSchema }> }>[];
  surfaceSchema: TObject;
  authoring: StageAuthoringModel;
  toInternal: (args: { setup: unknown; stageConfig: unknown }) => {
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

function buildArtifactsModuleFiles(args: {
  outBase: string; // e.g. "standard-artifacts"
  schemaJson: JsonObject;
  typeName: string; // e.g. "StandardRecipeConfig"
  configTypes: string; // output from json-schema-to-typescript (trimmed)
  configConstName: string; // e.g. "STANDARD_RECIPE_CONFIG"
  schemaConstName: string; // e.g. "STANDARD_RECIPE_CONFIG_SCHEMA"
  configValue: unknown;
  uiMetaValue: StudioRecipeUiMeta;
}): readonly GeneratedFilePlanFile[] {
  const {
    outBase,
    schemaJson,
    typeName,
    configTypes,
    configConstName,
    schemaConstName,
    configValue,
    uiMetaValue,
  } = args;

  // Embed schema and defaults so Studio imports no worker-only recipe runtime.
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

  return [
    {
      relativePath: `dist/recipes/${outBase}.js`,
      content: jsLines.join("\n"),
    },
    {
      relativePath: `dist/recipes/${outBase}.d.ts`,
      content: dtsLines.join("\n"),
    },
  ];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgRoot = resolve(__dirname, "..");

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
const standardConfigTypes = await compile(
  schemaForTypeGeneration(standardSchemaJson) as JsonObject,
  "StandardRecipeConfig",
  {
    bannerComment: "",
    style: {
      singleQuote: false,
      semi: true,
    },
  }
);

const standardDts = [
  `import type { RecipeModule } from "@swooper/mapgen-core/authoring";`,
  `import type { STANDARD_INITIAL_SETUP } from "../../src/recipes/standard/initial-setup.js";`,
  ``,
  standardConfigTypes.trimEnd(),
  ``,
  `export const STANDARD_STAGES: ReadonlyArray<unknown>;`,
  `export {`,
  `  projectStandardInitialSetup,`,
  `  STANDARD_INITIAL_GAME_OPTION_DESCRIPTORS,`,
  `  STANDARD_INITIAL_MAP_OPTION_DESCRIPTORS,`,
  `  STANDARD_INITIAL_PLAYER_OPTION_DESCRIPTORS,`,
  `} from "../../src/recipes/standard/initial-setup.js";`,
  ``,
  `declare const recipe: RecipeModule<`,
  `  Readonly<StandardRecipeConfig>,`,
  `  unknown,`,
  `  typeof STANDARD_INITIAL_SETUP`,
  `>;`,
  `export default recipe;`,
  ``,
].join("\n");

const standardArtifactModuleFiles = buildArtifactsModuleFiles({
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

const studioRecipeOutputPlan = {
  exclusiveSets: [
    {
      relativeDir: "dist/recipes",
      fileExtension: ".presets.json",
    },
  ],
  files: [
    {
      relativePath: "dist/recipes/standard.schema.json",
      content: JSON.stringify(standardSchemaJson, null, 2),
    },
    {
      relativePath: "dist/recipes/standard.defaults.json",
      content: JSON.stringify(standardDefaultsClean, null, 2),
    },
    {
      relativePath: "dist/recipes/standard.d.ts",
      content: standardDts,
    },
    ...standardArtifactModuleFiles,
  ],
} satisfies GeneratedFilePlan;

await applyGeneratedFilePlan(studioRecipeOutputPlan, { outputRoot: pkgRoot });

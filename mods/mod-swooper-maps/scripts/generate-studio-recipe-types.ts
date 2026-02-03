import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { compile } from "json-schema-to-typescript";
import { Type, type TObject, type TSchema } from "typebox";

type JsonObject = Record<string, unknown>;

const SENTINEL_KEY = "__studioUiMetaSentinelPath";

function assertPlainObject(value: unknown, label: string): asserts value is JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object`);
  }
}

function isPlainObject(value: unknown): value is JsonObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function stableJson(value: unknown): JsonObject {
  const text = JSON.stringify(value);
  if (!text) throw new Error("schema is not JSON-serializable");
  const parsed = JSON.parse(text) as unknown;
  assertPlainObject(parsed, "schema");
  return parsed;
}

function makeSentinel(path: readonly string[]): Record<string, unknown> {
  return { [SENTINEL_KEY]: Array.from(path) };
}

function findSentinelPaths(value: unknown): readonly (readonly string[])[] {
  const found: string[][] = [];
  const seen = new Set<unknown>();

  function walk(node: unknown, depth: number): void {
    if (!node || typeof node !== "object") return;
    if (seen.has(node)) return;
    seen.add(node);

    if (isPlainObject(node)) {
      const maybe = node[SENTINEL_KEY];
      if (Array.isArray(maybe) && maybe.every((v) => typeof v === "string")) {
        found.push(maybe.slice());
      }
      if (depth <= 0) return;
      for (const v of Object.values(node)) walk(v, depth - 1);
      return;
    }

    if (Array.isArray(node)) {
      if (depth <= 0) return;
      for (const v of node) walk(v, depth - 1);
    }
  }

  walk(value, 6);
  return found;
}

function assertSingleSentinelPath(input: { label: string; value: unknown }): readonly string[] {
  const found = findSentinelPaths(input.value);
  if (found.length === 1) return found[0] ?? [];
  if (found.length === 0) throw new Error(`${input.label} did not forward any sentinel value`);
  throw new Error(`${input.label} forwarded multiple sentinel values (ambiguous mapping)`);
}

type StageLike = Readonly<{
  id: string;
  knobsSchema: TObject;
  steps: readonly Readonly<{ contract: Readonly<{ id: string; schema: TSchema }> }>[];
  public?: TObject;
  surfaceSchema: TObject;
  toInternal: (args: { env: unknown; stageConfig: unknown }) => { rawSteps: Record<string, unknown> };
}>;

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

function typeboxObjectProperties(schema: unknown): Record<string, unknown> {
  if (!schema || typeof schema !== "object") return {};
  const props = (schema as any).properties as Record<string, unknown> | undefined;
  return props ?? {};
}

function buildStudioStageSchema(stage: StageLike): TObject {
  if (stage.public) return stage.surfaceSchema;

  const props: Record<string, TSchema> = {
    knobs: Type.Optional(stage.knobsSchema),
  };
  for (const step of stage.steps) {
    props[step.contract.id] = Type.Optional(step.contract.schema);
  }

  return Type.Object(props, { additionalProperties: false });
}

function buildStudioRecipeSchema(stages: readonly StageLike[]): TObject {
  const props: Record<string, TSchema> = {};
  for (const stage of stages) {
    props[stage.id] = Type.Optional(buildStudioStageSchema(stage));
  }
  return Type.Object(props, { additionalProperties: false, default: {} });
}

function deriveStageStepConfigFocusMap(args: {
  namespace: string;
  recipeId: string;
  stage: StageLike;
}): Readonly<Record<string, readonly string[]>> {
  const { stage } = args;
  const stepIds = stage.steps.map((s) => s.contract.id);

  if (!stage.public) {
    return Object.fromEntries(stepIds.map((stepId) => [stepId, [stepId]])) as Record<
      string,
      readonly string[]
    >;
  }

  const publicKeys = Object.keys(typeboxObjectProperties(stage.public));

  if (publicKeys.includes("advanced")) {
    const advanced: Record<string, unknown> = Object.fromEntries(
      stepIds.map((stepId) => [stepId, makeSentinel(["advanced", stepId])])
    );
    const { rawSteps } = stage.toInternal({
      env: {},
      stageConfig: { knobs: {}, advanced },
    });

    const mapping: Record<string, readonly string[]> = {};
    for (const stepId of stepIds) {
      if (!(stepId in rawSteps)) {
        throw new Error(
          `[recipe:${args.namespace}.${args.recipeId}] stage("${stage.id}") missing rawSteps["${stepId}"] when probing advanced mapping`
        );
      }
      const path = assertSingleSentinelPath({
        label: `[recipe:${args.namespace}.${args.recipeId}] stage("${stage.id}") step("${stepId}")`,
        value: rawSteps[stepId],
      });
      if (path.join(".") !== ["advanced", stepId].join(".")) {
        throw new Error(
          `[recipe:${args.namespace}.${args.recipeId}] stage("${stage.id}") advanced mapping produced unexpected focus path for step("${stepId}"): ${JSON.stringify(
            path
          )}`
        );
      }
      mapping[stepId] = path;
    }
    return mapping;
  }

  const stageConfig: Record<string, unknown> = { knobs: {} };
  for (const key of publicKeys) stageConfig[key] = makeSentinel([key]);

  const { rawSteps } = stage.toInternal({ env: {}, stageConfig });

  const mapping: Record<string, readonly string[]> = {};
  for (const stepId of stepIds) {
    if (!(stepId in rawSteps)) {
      throw new Error(
        `[recipe:${args.namespace}.${args.recipeId}] stage("${stage.id}") missing rawSteps["${stepId}"] when probing public-key mapping`
      );
    }
    mapping[stepId] = assertSingleSentinelPath({
      label: `[recipe:${args.namespace}.${args.recipeId}] stage("${stage.id}") step("${stepId}")`,
      value: rawSteps[stepId],
    });
  }

  return mapping;
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
      return {
        stageId,
        stageLabel,
        steps: stage.steps.map((s) => {
          const stepId = s.contract.id;
          const configFocusPathWithinStage = stepFocus[stepId];
          if (!configFocusPathWithinStage) {
            throw new Error(
              `[recipe:${namespace}.${recipeId}] stage("${stage.id}") missing config focus path for step("${stepId}")`
            );
          }
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
    `// Do not edit by hand; re-run \`bun run build:studio-recipes\`.`,
    ``,
    `export const ${configConstName} = ${JSON.stringify(configValue, null, 2)};`,
    `export const ${schemaConstName} = ${JSON.stringify(schemaJson, null, 2)};`,
    `export const studioRecipeUiMeta = ${JSON.stringify(uiMetaValue, null, 2)};`,
    ``,
  ];

  const dtsLines = [
    `// This file is generated by scripts/generate-studio-recipe-types.ts`,
    `// Do not edit by hand; re-run \`bun run build:studio-recipes\`.`,
    ``,
    `import type { TSchema } from "typebox";`,
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
    `export const ${schemaConstName}: TSchema;`,
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

const distBrowserTest = resolve(pkgRoot, "dist", "recipes", "browser-test.js");
const distStandard = resolve(pkgRoot, "dist", "recipes", "standard.js");

const mod = (await import(pathToFileURL(distBrowserTest).href)) as unknown as {
  BROWSER_TEST_FOUNDATION_STAGE_CONFIG: unknown;
  BROWSER_TEST_RECIPE_CONFIG: unknown;
  BROWSER_TEST_RECIPE_CONFIG_SCHEMA: unknown;
  BROWSER_TEST_STAGES: readonly StageLike[];
};

if (!Array.isArray(mod.BROWSER_TEST_STAGES)) {
  throw new Error(`[recipe:mod-swooper-maps.browser-test] missing export BROWSER_TEST_STAGES`);
}

const browserTestSchema = buildStudioRecipeSchema(mod.BROWSER_TEST_STAGES);
const schemaJson = stableJson(browserTestSchema);

const browserTestUiMeta = deriveStudioRecipeUiMeta({
  namespace: "mod-swooper-maps",
  recipeId: "browser-test",
  stages: mod.BROWSER_TEST_STAGES,
});

await writeFile(
  resolve(pkgRoot, "dist", "recipes", "browser-test.schema.json"),
  JSON.stringify(schemaJson, null, 2)
);

const configTypes = await compile(schemaJson, "BrowserTestRecipeConfig", {
  bannerComment: "",
  style: {
    singleQuote: false,
    semi: true,
  },
});

const recipeTypeExports = [
  `export type BrowserTestFoundationStageConfig = NonNullable<BrowserTestRecipeConfig["foundation"]>;`,
  `export type BrowserTestFoundationStageKnobsConfig = NonNullable<BrowserTestFoundationStageConfig["knobs"]>;`,
  `export type BrowserTestFoundationStageAdvancedConfig = NonNullable<BrowserTestFoundationStageConfig["advanced"]>;`,
  `export type BrowserTestRecipeCompiledConfig = Readonly<{`,
  `  foundation?: BrowserTestFoundationStageAdvancedConfig;`,
  `}>;`,
  ``,
];

const browserTestDts = [
  `import type { ExtendedMapContext } from "@swooper/mapgen-core";`,
  `import type { RecipeModule } from "@swooper/mapgen-core/authoring";`,
  `import type { TSchema } from "typebox";`,
  ``,
  configTypes.trimEnd(),
  ``,
  ...recipeTypeExports,
  `export const BROWSER_TEST_FOUNDATION_STAGE_CONFIG: Readonly<BrowserTestFoundationStageConfig>;`,
  `export const BROWSER_TEST_RECIPE_CONFIG: Readonly<BrowserTestRecipeConfig>;`,
  `export const BROWSER_TEST_RECIPE_CONFIG_SCHEMA: TSchema;`,
  `export const compileOpsById: Readonly<Record<string, unknown>>;`,
  ``,
  `declare const recipe: RecipeModule<ExtendedMapContext, Readonly<BrowserTestRecipeConfig>, unknown>;`,
  `export default recipe;`,
  ``,
].join("\n");

await writeFile(resolve(pkgRoot, "dist", "recipes", "browser-test.d.ts"), browserTestDts);

await writeArtifactsModule({
  pkgRoot,
  outBase: "browser-test-artifacts",
  schemaJson,
  typeName: "BrowserTestRecipeConfig",
  configTypes,
  configConstName: "BROWSER_TEST_RECIPE_CONFIG",
  schemaConstName: "BROWSER_TEST_RECIPE_CONFIG_SCHEMA",
  configValue: mod.BROWSER_TEST_RECIPE_CONFIG ?? {},
  uiMetaValue: browserTestUiMeta,
});

const standardMod = (await import(pathToFileURL(distStandard).href)) as Record<string, unknown>;
const standardSchemaRaw = standardMod.STANDARD_RECIPE_CONFIG_SCHEMA;

let standardDts = "";

if (standardSchemaRaw) {
  const standardStages = (standardMod as any).STANDARD_STAGES as unknown;
  if (!Array.isArray(standardStages)) {
    throw new Error(`[recipe:mod-swooper-maps.standard] missing export STANDARD_STAGES`);
  }

  const standardUiMeta = deriveStudioRecipeUiMeta({
    namespace: "mod-swooper-maps",
    recipeId: "standard",
    stages: standardStages as readonly StageLike[],
  });

  const standardSchemaJson = stableJson(buildStudioRecipeSchema(standardStages as StageLike[]));
  await writeFile(
    resolve(pkgRoot, "dist", "recipes", "standard.schema.json"),
    JSON.stringify(standardSchemaJson, null, 2)
  );

  const standardConfigTypes = await compile(standardSchemaJson, "StandardRecipeConfig", {
    bannerComment: "",
    style: {
      singleQuote: false,
      semi: true,
    },
  });

    standardDts = [
      `import type { ExtendedMapContext } from "@swooper/mapgen-core";`,
      `import type { RecipeModule } from "@swooper/mapgen-core/authoring";`,
      `import type { TSchema } from "typebox";`,
      ``,
      standardConfigTypes.trimEnd(),
      ``,
      `export const STANDARD_RECIPE_CONFIG: Readonly<StandardRecipeConfig>;`,
      `export const STANDARD_RECIPE_CONFIG_SCHEMA: TSchema;`,
      `export const compileOpsById: Readonly<Record<string, unknown>>;`,
      ``,
      `declare const recipe: RecipeModule<ExtendedMapContext, Readonly<StandardRecipeConfig>, unknown>;`,
    `export default recipe;`,
    ``,
  ].join("\n");

  await writeArtifactsModule({
    pkgRoot,
    outBase: "standard-artifacts",
    schemaJson: standardSchemaJson,
    typeName: "StandardRecipeConfig",
    configTypes: standardConfigTypes,
    configConstName: "STANDARD_RECIPE_CONFIG",
    schemaConstName: "STANDARD_RECIPE_CONFIG_SCHEMA",
    configValue: standardMod.STANDARD_RECIPE_CONFIG ?? {},
    uiMetaValue: standardUiMeta,
  });
} else {
  standardDts = [
    `import type { ExtendedMapContext } from "@swooper/mapgen-core";`,
    `import type { RecipeModule } from "@swooper/mapgen-core/authoring";`,
    ``,
    `export type StandardRecipeConfig = Readonly<Record<string, unknown>>;`,
    `export const STANDARD_RECIPE_CONFIG: Readonly<StandardRecipeConfig>;`,
    `export const compileOpsById: Readonly<Record<string, unknown>>;`,
    ``,
    `declare const recipe: RecipeModule<ExtendedMapContext, Readonly<StandardRecipeConfig>, unknown>;`,
    `export default recipe;`,
    ``,
  ].join("\n");
}

await writeFile(resolve(pkgRoot, "dist", "recipes", "standard.d.ts"), standardDts);

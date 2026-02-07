import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { compile } from "json-schema-to-typescript";
import type { TObject, TSchema } from "typebox";

import {
  derivePresetLabel,
  deriveRecipeConfigSchema,
  stripSchemaMetadataRoot,
  type RecipePresetDefinitionV1,
} from "@swooper/mapgen-core/authoring";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";

type JsonObject = Record<string, unknown>;
type BuiltInPreset = Readonly<{
  id: string;
  label: string;
  description?: string;
  config: unknown;
}>;

const SENTINEL_KEY = "__studioUiMetaSentinelPath";
const PRESET_WRAPPER_KEYS = new Set(["$schema", "id", "label", "description", "config"]);

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

function setAtPath(root: Record<string, unknown>, path: readonly string[]): void {
  let current: Record<string, unknown> = root;
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

function typeboxObjectProperties(schema: unknown): Record<string, unknown> {
  if (!schema || typeof schema !== "object") return {};
  const props = (schema as { properties?: unknown }).properties;
  return isPlainObject(props) ? props : {};
}

function buildDefaultsSkeleton(uiMeta: StudioRecipeUiMeta): Record<string, unknown> {
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

  const publicProps = typeboxObjectProperties(stage.public);
  const publicKeys = Object.keys(publicProps);
  const advancedProps = typeboxObjectProperties(publicProps.advanced);
  const advancedStepIds = stepIds.filter((stepId) =>
    Object.prototype.hasOwnProperty.call(advancedProps, stepId)
  );

  // If `advanced` is a full step-config map (advanced.<stepId> for every step), we can map
  // all steps directly to `advanced.<stepId>`. This is used by stages whose only public
  // surface is `advanced` (e.g. morphology-coasts).
  if (publicKeys.includes("advanced") && advancedStepIds.length === stepIds.length) {
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

  // Some stages expose an `advanced` surface that configures only a subset of steps.
  // In that case, we focus those steps directly under `advanced.<stepId>`, and fall back
  // to the stage-level mapping (usually `profiles`) for the rest.
  if (publicKeys.includes("advanced") && advancedStepIds.length > 0) {
    // Intentionally schema-driven: `advanced.<stepId>` may be compiled into a derived step config
    // (so a sentinel value won't necessarily survive through `toInternal`), but the Studio editor
    // still needs to focus the relevant subtree for that step.
    for (const stepId of advancedStepIds) mapping[stepId] = ["advanced", stepId];
  }

  return mapping;
}

function readPresetWrapper(args: {
  fileName: string;
  raw: unknown;
  errors: Array<{ path: string; message: string }>;
}): RecipePresetDefinitionV1 | null {
  const { fileName, raw, errors } = args;
  const startErrorCount = errors.length;
  if (!isPlainObject(raw)) {
    errors.push({ path: fileName, message: "Preset wrapper must be a JSON object" });
    return null;
  }

  for (const key of Object.keys(raw)) {
    if (!PRESET_WRAPPER_KEYS.has(key)) {
      errors.push({ path: fileName, message: `Unknown preset wrapper key "${key}"` });
    }
  }

  const schemaValue = raw.$schema;
  if (schemaValue !== undefined && typeof schemaValue !== "string") {
    errors.push({ path: fileName, message: "Preset wrapper $schema must be a string" });
  }

  const idValue = raw.id;
  if (idValue !== undefined && typeof idValue !== "string") {
    errors.push({ path: fileName, message: "Preset wrapper id must be a string" });
  }

  const labelValue = raw.label;
  if (labelValue !== undefined && typeof labelValue !== "string") {
    errors.push({ path: fileName, message: "Preset wrapper label must be a string" });
  }

  const descriptionValue = raw.description;
  if (descriptionValue !== undefined && typeof descriptionValue !== "string") {
    errors.push({ path: fileName, message: "Preset wrapper description must be a string" });
  }

  if (!("config" in raw)) {
    errors.push({ path: fileName, message: "Preset wrapper must include a config object" });
  }

  const configValue = raw.config;
  if (configValue !== undefined && !isPlainObject(configValue)) {
    errors.push({ path: fileName, message: "Preset wrapper config must be a JSON object" });
  }

  if (errors.length != startErrorCount) return null;
  return {
    ...(schemaValue ? { $schema: schemaValue } : {}),
    ...(idValue ? { id: idValue } : {}),
    ...(labelValue ? { label: labelValue } : {}),
    ...(descriptionValue ? { description: descriptionValue } : {}),
    config: configValue as Record<string, unknown>,
  };
}

async function loadBuiltInPresets(args: {
  pkgRoot: string;
  recipeId: string;
  schema: TSchema;
}): Promise<ReadonlyArray<BuiltInPreset>> {
  const { pkgRoot, recipeId, schema } = args;
  const dir = resolve(pkgRoot, "src", "presets", recipeId);
  let entries: Awaited<ReturnType<typeof readdir>>;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const errors: Array<{ path: string; message: string }> = [];
  const presets: BuiltInPreset[] = [];
  const seenIds = new Set<string>();

  for (const ent of entries) {
    if (!ent.isFile()) continue;
    if (!ent.name.endsWith(".json")) continue;
    const abs = resolve(dir, ent.name);
    let raw: unknown;
    try {
      raw = JSON.parse(await readFile(abs, "utf-8")) as unknown;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to parse JSON";
      errors.push({ path: ent.name, message });
      continue;
    }

    const wrapper = readPresetWrapper({ fileName: ent.name, raw, errors });
    if (!wrapper) continue;

    const baseId = (wrapper.id ?? ent.name.replace(/\.json$/i, "")).trim();
    if (!baseId) {
      errors.push({ path: ent.name, message: "Preset id must not be empty" });
      continue;
    }
    if (seenIds.has(baseId)) {
      errors.push({ path: ent.name, message: `Duplicate preset id "${baseId}"` });
      continue;
    }
    seenIds.add(baseId);

    const sanitized = stripSchemaMetadataRoot(wrapper.config);
    if (!isPlainObject(sanitized)) {
      errors.push({ path: ent.name, message: "Preset config must be a JSON object" });
      continue;
    }

    const res = normalizeStrict<Record<string, unknown>>(schema, sanitized, `/preset/${ent.name}`);
    if (res.errors.length > 0) {
      errors.push(
        ...res.errors.map((e) => ({
          path: `${ent.name}${e.path.startsWith("/") ? "" : "/"}${e.path}`,
          message: e.message,
        }))
      );
      continue;
    }

    presets.push({
      id: baseId,
      label: wrapper.label ?? derivePresetLabel(baseId),
      description: wrapper.description,
      config: res.value,
    });
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid studio preset definitions:\n${errors.map((e) => `- ${e.path}: ${e.message}`).join("\n")}`
    );
  }

  return presets;
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
  builtInPresetsValue: ReadonlyArray<BuiltInPreset>;
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
    builtInPresetsValue,
  } = args;

  const jsLines = [
    `// This file is generated by scripts/generate-studio-recipe-types.ts`,
    `// Do not edit by hand; re-run \`bun run build:studio-recipes\`.`,
    ``,
    `export const ${configConstName} = ${JSON.stringify(configValue, null, 2)};`,
    `export const ${schemaConstName} = ${JSON.stringify(schemaJson, null, 2)};`,
    `export const studioRecipeUiMeta = ${JSON.stringify(uiMetaValue, null, 2)};`,
    `export const studioBuiltInPresets = ${JSON.stringify(builtInPresetsValue, null, 2)};`,
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
    `export type StudioBuiltInPreset = Readonly<{`,
    `  id: string;`,
    `  label: string;`,
    `  description?: string;`,
    `  config: unknown;`,
    `}>;`,
    ``,
    `export const ${configConstName}: Readonly<${typeName}>;`,
    `export const ${schemaConstName}: TSchema;`,
    `export const studioRecipeUiMeta: Readonly<StudioRecipeUiMeta>;`,
    `export const studioBuiltInPresets: ReadonlyArray<StudioBuiltInPreset>;`,
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

const browserTestMod = (await import(pathToFileURL(distBrowserTest).href)) as unknown as {
  BROWSER_TEST_STAGES: readonly StageLike[];
  compileOpsById: Readonly<Record<string, unknown>>;
};

if (!Array.isArray(browserTestMod.BROWSER_TEST_STAGES)) {
  throw new Error(`[recipe:mod-swooper-maps.browser-test] missing export BROWSER_TEST_STAGES`);
}

const browserTestSchema = deriveRecipeConfigSchema(browserTestMod.BROWSER_TEST_STAGES);
const browserTestSchemaJson = stableJson(browserTestSchema);
const browserTestUiMeta = deriveStudioRecipeUiMeta({
  namespace: "mod-swooper-maps",
  recipeId: "browser-test",
  stages: browserTestMod.BROWSER_TEST_STAGES,
});
const browserTestDefaultsSeed = buildDefaultsSkeleton(browserTestUiMeta);
const { value: browserTestDefaults, errors: browserTestDefaultsErrors } = normalizeStrict<Record<string, unknown>>(
  browserTestSchema,
  browserTestDefaultsSeed,
  "/defaults"
);
if (browserTestDefaultsErrors.length > 0) {
  throw new Error(
    `[recipe:mod-swooper-maps.browser-test] derived defaults do not validate: ${JSON.stringify(
      browserTestDefaultsErrors,
      null,
      2
    )}`
  );
}
const browserTestDefaultsClean = stripSchemaMetadataRoot(browserTestDefaults);
const browserTestBuiltInPresets = await loadBuiltInPresets({
  pkgRoot,
  recipeId: "browser-test",
  schema: browserTestSchema,
});

await writeFile(
  resolve(pkgRoot, "dist", "recipes", "browser-test.schema.json"),
  JSON.stringify(browserTestSchemaJson, null, 2)
);
await writeFile(
  resolve(pkgRoot, "dist", "recipes", "browser-test.defaults.json"),
  JSON.stringify(browserTestDefaultsClean, null, 2)
);
await writeFile(
  resolve(pkgRoot, "dist", "recipes", "browser-test.presets.json"),
  JSON.stringify(browserTestBuiltInPresets, null, 2)
);

const browserTestConfigTypes = await compile(browserTestSchemaJson, "BrowserTestRecipeConfig", {
  bannerComment: "",
  style: {
    singleQuote: false,
    semi: true,
  },
});

const browserTestDts = [
  `import type { ExtendedMapContext } from "@swooper/mapgen-core";`,
  `import type { RecipeModule } from "@swooper/mapgen-core/authoring";`,
  ``,
  browserTestConfigTypes.trimEnd(),
  ``,
  `export const compileOpsById: Readonly<Record<string, unknown>>;`,
  `export const BROWSER_TEST_STAGES: ReadonlyArray<unknown>;`,
  ``,
  `declare const recipe: RecipeModule<ExtendedMapContext, Readonly<BrowserTestRecipeConfig>, unknown>;`,
  `export default recipe;`,
  ``,
].join("\n");

await writeFile(resolve(pkgRoot, "dist", "recipes", "browser-test.d.ts"), browserTestDts);

await writeArtifactsModule({
  pkgRoot,
  outBase: "browser-test-artifacts",
  schemaJson: browserTestSchemaJson,
  typeName: "BrowserTestRecipeConfig",
  configTypes: browserTestConfigTypes,
  configConstName: "BROWSER_TEST_RECIPE_CONFIG",
  schemaConstName: "BROWSER_TEST_RECIPE_CONFIG_SCHEMA",
  configValue: browserTestDefaultsClean,
  uiMetaValue: browserTestUiMeta,
  builtInPresetsValue: browserTestBuiltInPresets,
});

const standardMod = (await import(pathToFileURL(distStandard).href)) as unknown as {
  STANDARD_STAGES: readonly StageLike[];
  compileOpsById: Readonly<Record<string, unknown>>;
};
if (!Array.isArray(standardMod.STANDARD_STAGES)) {
  throw new Error(`[recipe:mod-swooper-maps.standard] missing export STANDARD_STAGES`);
}

const standardSchema = deriveRecipeConfigSchema(standardMod.STANDARD_STAGES);
const standardSchemaJson = stableJson(standardSchema);
const standardUiMeta = deriveStudioRecipeUiMeta({
  namespace: "mod-swooper-maps",
  recipeId: "standard",
  stages: standardMod.STANDARD_STAGES,
});
const standardDefaultPresetPath = resolve(pkgRoot, "src", "maps", "configs", "swooper-earthlike.config.json");
const standardDefaultPresetRaw = JSON.parse(await readFile(standardDefaultPresetPath, "utf-8")) as unknown;
const standardDefaultPresetClean = stripSchemaMetadataRoot(standardDefaultPresetRaw);
const { value: standardDefaults, errors: standardDefaultsErrors } = normalizeStrict<Record<string, unknown>>(
  standardSchema,
  standardDefaultPresetClean,
  "/defaults"
);
if (standardDefaultsErrors.length > 0) {
  throw new Error(
    `[recipe:mod-swooper-maps.standard] derived defaults do not validate: ${JSON.stringify(
      standardDefaultsErrors,
      null,
      2
    )}`
  );
}
const standardDefaultsClean = stripSchemaMetadataRoot(standardDefaults);
const standardBuiltInPresets = await loadBuiltInPresets({
  pkgRoot,
  recipeId: "standard",
  schema: standardSchema,
});

await writeFile(
  resolve(pkgRoot, "dist", "recipes", "standard.schema.json"),
  JSON.stringify(standardSchemaJson, null, 2)
);
await writeFile(
  resolve(pkgRoot, "dist", "recipes", "standard.defaults.json"),
  JSON.stringify(standardDefaultsClean, null, 2)
);
await writeFile(
  resolve(pkgRoot, "dist", "recipes", "standard.presets.json"),
  JSON.stringify(standardBuiltInPresets, null, 2)
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
  builtInPresetsValue: standardBuiltInPresets,
});

async function validateStandardMapConfigPresets(): Promise<void> {
  const dir = resolve(pkgRoot, "src", "maps", "configs");
  let entries: Awaited<ReturnType<typeof readdir>>;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  const errors: Array<{ path: string; message: string }> = [];
  for (const ent of entries) {
    if (!ent.isFile()) continue;
    if (!ent.name.endsWith(".config.json")) continue;
    const abs = resolve(dir, ent.name);
    const raw = JSON.parse(await readFile(abs, "utf-8")) as unknown;
    const sanitized = stripSchemaMetadataRoot(raw);
    const res = normalizeStrict<Record<string, unknown>>(standardSchema, sanitized, `/preset/${ent.name}`);
    if (res.errors.length > 0) {
      errors.push(
        ...res.errors.map((e) => ({
          path: `${ent.name}${e.path.startsWith("/") ? "" : "/"}${e.path}`,
          message: e.message,
        }))
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid standard map config presets:\n${errors.map((e) => `- ${e.path}: ${e.message}`).join("\n")}`
    );
  }
}

await validateStandardMapConfigPresets();

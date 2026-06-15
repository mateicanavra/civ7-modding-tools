import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  derivePresetLabel,
  deriveRecipeConfigSchema,
  deriveStageAuthoringModel,
  type RecipePresetDefinitionV1,
  type StageAuthoringModel,
  stripSchemaMetadataRoot,
} from "@swooper/mapgen-core/authoring";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import { compile } from "json-schema-to-typescript";
import type { TObject, TSchema } from "typebox";
import { validateCanonicalMapConfig } from "../src/maps/configs/canonical.js";

type JsonObject = Record<string, unknown>;
type BuiltInPreset = Readonly<{
  id: string;
  label: string;
  description?: string;
  config: unknown;
}>;

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
  return deriveStageAuthoringModel(stage).config.focusPathsByStepId;
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
      const authoring = deriveStageAuthoringModel(stage);
      return {
        stageId,
        stageLabel,
        steps: authoring.runtime.steps.map((s) => {
          const stepId = s.stepId;
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

const distStandard = resolve(pkgRoot, "dist", "recipes", "standard.js");

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
const transientStudioCurrentConfig = "studio-current.config.json";
const standardDefaultPresetPath = resolve(
  pkgRoot,
  "src",
  "maps",
  "configs",
  "swooper-earthlike.config.json"
);
const standardDefaultPresetRaw = JSON.parse(
  await readFile(standardDefaultPresetPath, "utf-8")
) as unknown;
const standardDefaultMapConfig = validateCanonicalMapConfig({
  fileName: "swooper-earthlike.config.json",
  raw: standardDefaultPresetRaw,
  recipeSchema: standardSchema,
  stages: standardMod.STANDARD_STAGES,
});
const standardDefaultPresetClean = stripSchemaMetadataRoot(standardDefaultMapConfig.config);
const { value: standardDefaults, errors: standardDefaultsErrors } = normalizeStrict<
  Record<string, unknown>
>(standardSchema, standardDefaultPresetClean, "/defaults");
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
const standardBuiltInPresets: ReadonlyArray<BuiltInPreset> = [];

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
    if (ent.name === transientStudioCurrentConfig) continue;
    const abs = resolve(dir, ent.name);
    const raw = JSON.parse(await readFile(abs, "utf-8")) as unknown;
    try {
      validateCanonicalMapConfig({
        fileName: ent.name,
        raw,
        recipeSchema: standardSchema,
        stages: standardMod.STANDARD_STAGES,
      });
    } catch (err) {
      errors.push({
        path: ent.name,
        message: err instanceof Error ? err.message : "Invalid canonical map config",
      });
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid standard map config presets:\n${errors.map((e) => `- ${e.path}: ${e.message}`).join("\n")}`
    );
  }
}

await validateStandardMapConfigPresets();

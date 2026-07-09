import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { CatalogSourceIndex } from "../src/maps/catalog/sourceIndex.js";
import {
  CATALOG_CONFIG_PATH_PREFIX,
  type CatalogSourceEntry,
  catalogConfigFileNameFromPath,
  parseCatalogSourceIndex,
  validateCatalogSourceIndex,
} from "../src/maps/catalog/sources.js";
import {
  buildCanonicalMapConfigSchema,
  type ValidatedMapConfig,
  validateCanonicalMapConfig,
} from "../src/maps/configs/canonical.js";
import { STANDARD_STAGES } from "../src/recipes/standard/recipe.js";
import {
  buildSwooperCatalogModFilePlan,
  type StudioRunEvidenceEnv,
} from "./map-artifacts/file-plan.js";
import { writeSwooperMapArtifactFilePlan } from "./map-artifacts/write-file-plan.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgRoot = resolve(__dirname, "..");
const repoRoot = resolve(pkgRoot, "../..");

const configsDir = resolve(pkgRoot, "src/maps/configs");
const includeStudioDeployConfigArg = "--include-studio-deploy-config";
const studioDeployConfigIdEnv = "SWOOPER_STUDIO_DEPLOY_CONFIG_ID";
const studioDeployConfigPathEnv = "SWOOPER_STUDIO_DEPLOY_CONFIG_PATH";

/**
 * Reads the all-or-nothing Studio run evidence tuple before generation performs
 * discovery I/O. The executable script owns ambient env discovery; the renderer
 * receives an explicit evidence state and stays deterministic.
 */
export function readStudioRunEvidenceEnv(
  env: NodeJS.ProcessEnv = process.env
): StudioRunEvidenceEnv {
  const requestId = env.SWOOPER_STUDIO_RUN_ID;
  const launchConfigId = env.SWOOPER_STUDIO_LAUNCH_CONFIG_ID;
  const launchEnvelopeDigest = env.SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST;
  if (
    requestId === undefined &&
    launchConfigId === undefined &&
    launchEnvelopeDigest === undefined
  ) {
    return { kind: "none" };
  }
  if (!requestId || !launchConfigId || !launchEnvelopeDigest) {
    throw new Error(
      "Studio run evidence env must set SWOOPER_STUDIO_RUN_ID, SWOOPER_STUDIO_LAUNCH_CONFIG_ID, and SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST together"
    );
  }
  return { kind: "run", requestId, launchConfigId, launchEnvelopeDigest };
}

/**
 * Loads the authored Swooper map config registry for artifact generation. This
 * is the CLI's discovery boundary: it may read config files, while the renderer
 * receives already-validated configs and returns only file-plan data.
 */
export async function loadSwooperMapConfigRegistry(
  options: Readonly<{
    catalogSourceIndex?: unknown;
    repoRoot?: string;
  }> = {}
): Promise<ValidatedMapConfig[]> {
  const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
  const indexValue = options.catalogSourceIndex ?? CatalogSourceIndex;
  const root = options.repoRoot ?? repoRoot;
  const indexEntries = [...parseCatalogSourceIndex(indexValue).entries];
  return loadValidatedCatalogEntries({
    entries: indexEntries,
    indexValue,
    repoRoot: root,
    schema,
  });
}

/**
 * Builds the deploy-only registry used by Studio operations. A selected
 * operation config is not catalog membership; it is an explicit runtime overlay
 * until later packets move every Run in Game launch through the request-local
 * manifest generator.
 */
export async function loadSwooperStudioDeployConfigRegistry(
  options: Readonly<{
    catalogSourceIndex?: unknown;
    deployConfig?: StudioDeployConfigReference;
    repoRoot?: string;
  }> = {}
): Promise<ValidatedMapConfig[]> {
  const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
  const indexValue = options.catalogSourceIndex ?? CatalogSourceIndex;
  const root = options.repoRoot ?? repoRoot;
  const indexEntries = [...parseCatalogSourceIndex(indexValue).entries];
  const deployConfig = options.deployConfig ?? readStudioDeployConfigReference(process.env);
  const configs = await loadValidatedCatalogEntries({
    entries: studioDeployCatalogEntries(indexEntries, deployConfig),
    indexValue,
    repoRoot: root,
    schema,
  });
  assertDeployConfigMatchesLoadedConfig(configs, deployConfig);
  return configs;
}

type StudioDeployConfigReference = Readonly<{
  id: string;
  path: string;
}>;

async function loadValidatedCatalogEntries(args: {
  entries: readonly CatalogSourceEntry[];
  indexValue: unknown;
  repoRoot: string;
  schema: ReturnType<typeof deriveRecipeConfigSchema>;
}): Promise<ValidatedMapConfig[]> {
  const configsByPath = new Map<string, ValidatedMapConfig>();
  const readErrors: string[] = [];

  for (const entry of args.entries) {
    try {
      const fileName = catalogConfigFileNameFromPath(entry.configPath);
      const raw = JSON.parse(
        await readFile(resolve(args.repoRoot, entry.configPath), "utf-8")
      ) as unknown;
      configsByPath.set(
        entry.configPath,
        validateCanonicalMapConfig({
          fileName,
          raw,
          recipeSchema: args.schema,
          stages: STANDARD_STAGES,
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      readErrors.push(`${entry.configPath}: ${message}`);
    }
  }

  const indexErrors = validateCatalogSourceIndex(args.indexValue, {
    knownConfigPaths: new Set(configsByPath.keys()),
    configMetadataByPath: configsByPath,
  });
  if (indexErrors.length > 0 || readErrors.length > 0) {
    throw new Error(
      `Invalid Swooper catalog source index config references:\n${[...indexErrors, ...readErrors]
        .map((error) => `- ${error}`)
        .join("\n")}`
    );
  }

  const configs = args.entries.map((entry) => {
    const config = configsByPath.get(entry.configPath);
    if (!config) throw new Error(`Catalog source config was not loaded: ${entry.configPath}`);
    return config;
  });
  assertUniqueConfigIds(configs);
  if (configs.length === 0) throw new Error(`No canonical map configs found in ${configsDir}`);

  return configs;
}

function assertUniqueConfigIds(configs: readonly ValidatedMapConfig[]): void {
  const seen = new Set<string>();
  for (const config of configs) {
    if (seen.has(config.id)) throw new Error(`Duplicate map config id "${config.id}"`);
    seen.add(config.id);
  }
}

function assertDeployConfigMatchesLoadedConfig(
  configs: readonly ValidatedMapConfig[],
  deployConfig?: StudioDeployConfigReference
): void {
  if (!deployConfig) return;
  const fileName = catalogConfigFileNameFromPath(deployConfig.path);
  const config = configs.find((candidate) => candidate.fileName === fileName);
  if (!config) throw new Error(`Studio deploy config was not loaded: ${deployConfig.path}`);
  if (config.id !== deployConfig.id) {
    throw new Error(
      `Studio deploy config id "${deployConfig.id}" must match loaded config id "${config.id}" at ${deployConfig.path}`
    );
  }
}

function studioDeployCatalogEntries(
  indexEntries: readonly CatalogSourceEntry[],
  deployConfig?: StudioDeployConfigReference
): readonly CatalogSourceEntry[] {
  if (!deployConfig) return indexEntries;
  const configPath = deployConfig.path;
  catalogConfigFileNameFromPath(configPath);
  if (indexEntries.some((entry) => entry.configPath === configPath)) return indexEntries;
  const deployEntry = {
    catalogSourceId: deployConfig.id,
    configPath,
    name: "Studio Deploy Config",
    description: "Current Studio operation configuration.",
    recipe: "standard",
    sortIndex: 9999,
    digestInputs: [{ kind: "config-file", path: configPath }],
  } satisfies CatalogSourceEntry;
  return [...indexEntries, deployEntry];
}

function readStudioDeployConfigReference(
  env: NodeJS.ProcessEnv
): StudioDeployConfigReference | undefined {
  const id = env[studioDeployConfigIdEnv];
  const path = env[studioDeployConfigPathEnv];
  if (id === undefined && path === undefined) return undefined;
  if (id === undefined || path === undefined) {
    throw new Error(
      `${studioDeployConfigIdEnv} and ${studioDeployConfigPathEnv} must be set together`
    );
  }
  return { id, path };
}

function shouldIncludeStudioDeployConfig(args: readonly string[]): boolean {
  return args.includes(includeStudioDeployConfigArg);
}

async function main(): Promise<void> {
  const includeStudioDeployConfig = shouldIncludeStudioDeployConfig(process.argv.slice(2));
  const evidenceEnv = includeStudioDeployConfig ? readStudioRunEvidenceEnv() : { kind: "none" };
  const configs = includeStudioDeployConfig
    ? await loadSwooperStudioDeployConfigRegistry({
        deployConfig: readStudioDeployConfigReference(process.env),
      })
    : await loadSwooperMapConfigRegistry();
  const recipeSchema = deriveRecipeConfigSchema(STANDARD_STAGES);
  const envelopeSchema = buildCanonicalMapConfigSchema(recipeSchema);
  const plan = buildSwooperCatalogModFilePlan({
    configs,
    envelopeSchema,
    evidenceEnv,
  });
  await writeSwooperMapArtifactFilePlan(plan, { outputRoot: pkgRoot });

  const rel = (path: string) => path.replace(`${repoRoot}/`, "");
  console.log(
    `Generated ${configs.length} Swooper map configs from ${rel(configsDir)}: ${configs
      .map((config) => config.id)
      .join(", ")}`
  );
}

if (import.meta.main) {
  await main();
}

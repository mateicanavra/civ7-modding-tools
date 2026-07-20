import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { TSchema } from "typebox";
import { admitSwooperCatalogConfig } from "../src/maps/catalog/admission.js";
import { CatalogSourceIndex } from "../src/maps/catalog/sourceIndex.js";
import {
  catalogConfigFileNameFromPath,
  parseCatalogSourceIndex,
  validateCatalogSourceIndex,
} from "../src/maps/catalog/sources.js";
import type { ValidatedMapConfig } from "../src/maps/configs/canonical.js";
import { deriveStandardRecipeArtifacts } from "../src/recipes/standard/artifacts.js";
import { buildSwooperCatalogModFilePlan } from "./map-artifacts/file-plan.js";
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
 * Loads the authored Swooper map config registry for artifact generation. This
 * is the CLI's discovery boundary: it may read config files, while the renderer
 * receives already-validated configs and returns only file-plan data.
 */
export async function loadSwooperMapConfigRegistry(
  options: Readonly<{
    catalogSourceIndex?: unknown;
    recipeSchema?: TSchema;
    repoRoot?: string;
  }> = {}
): Promise<ValidatedMapConfig[]> {
  const indexValue = options.catalogSourceIndex ?? CatalogSourceIndex;
  const root = options.repoRoot ?? repoRoot;
  const configPaths = [...parseCatalogSourceIndex(indexValue).entries];
  return loadValidatedCatalogEntries({
    configPaths,
    indexValue,
    recipeSchema: options.recipeSchema,
    repoRoot: root,
  });
}

/**
 * Builds the deploy-only registry used by catalog deployment. Run in Game does
 * not pass through this registry: its selected canonical envelope is owned by
 * the request-local generation manifest.
 */
export async function loadSwooperStudioDeployConfigRegistry(
  options: Readonly<{
    catalogSourceIndex?: unknown;
    deployConfig?: StudioDeployConfigReference;
    recipeSchema?: TSchema;
    repoRoot?: string;
  }> = {}
): Promise<ValidatedMapConfig[]> {
  const indexValue = options.catalogSourceIndex ?? CatalogSourceIndex;
  const root = options.repoRoot ?? repoRoot;
  const configPaths = [...parseCatalogSourceIndex(indexValue).entries];
  const deployConfig = options.deployConfig ?? readStudioDeployConfigReference(process.env);
  const configs = await loadValidatedCatalogEntries({
    configPaths: studioDeployConfigPaths(configPaths, deployConfig),
    indexValue,
    recipeSchema: options.recipeSchema,
    repoRoot: root,
  });
  assertDeployConfigMatchesLoadedConfig(configs, deployConfig);
  return configs;
}

type StudioDeployConfigReference = Readonly<{
  id: string;
  path: string;
}>;

async function loadValidatedCatalogEntries(args: {
  configPaths: readonly string[];
  indexValue: unknown;
  recipeSchema?: TSchema;
  repoRoot: string;
}): Promise<ValidatedMapConfig[]> {
  const configsByPath = new Map<string, ValidatedMapConfig>();
  const readErrors: string[] = [];

  for (const configPath of args.configPaths) {
    try {
      const raw = JSON.parse(
        await readFile(resolve(args.repoRoot, configPath), "utf-8")
      ) as unknown;
      configsByPath.set(
        configPath,
        admitSwooperCatalogConfig({
          sourcePath: configPath,
          canonicalConfig: raw,
          recipeSchema: args.recipeSchema,
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      readErrors.push(`${configPath}: ${message}`);
    }
  }

  const indexErrors = validateCatalogSourceIndex(args.indexValue, {
    knownConfigPaths: new Set(configsByPath.keys()),
  });
  if (indexErrors.length > 0 || readErrors.length > 0) {
    throw new Error(
      `Invalid Swooper catalog source index config references:\n${[...indexErrors, ...readErrors]
        .map((error) => `- ${error}`)
        .join("\n")}`
    );
  }

  const configs = args.configPaths.map((configPath) => {
    const config = configsByPath.get(configPath);
    if (!config) throw new Error(`Catalog source config was not loaded: ${configPath}`);
    return config;
  });
  assertUniqueConfigIds(configs);
  if (configs.length === 0) throw new Error(`No canonical map configs found in ${configsDir}`);

  return configs;
}

function assertUniqueConfigIds(configs: readonly ValidatedMapConfig[]): void {
  const seen = new Set<string>();
  for (const config of configs) {
    if (seen.has(config.canonicalConfig.id)) {
      throw new Error(`Duplicate map config id "${config.canonicalConfig.id}"`);
    }
    seen.add(config.canonicalConfig.id);
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
  if (config.canonicalConfig.id !== deployConfig.id) {
    throw new Error(
      `Studio deploy config id "${deployConfig.id}" must match loaded config id "${config.canonicalConfig.id}" at ${deployConfig.path}`
    );
  }
}

function studioDeployConfigPaths(
  configPaths: readonly string[],
  deployConfig?: StudioDeployConfigReference
): readonly string[] {
  if (!deployConfig) return configPaths;
  const configPath = deployConfig.path;
  catalogConfigFileNameFromPath(configPath);
  if (configPaths.includes(configPath)) return configPaths;
  return [...configPaths, configPath];
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
  const { schema: recipeSchema } = deriveStandardRecipeArtifacts();
  const configs = includeStudioDeployConfig
    ? await loadSwooperStudioDeployConfigRegistry({
        deployConfig: readStudioDeployConfigReference(process.env),
        recipeSchema,
      })
    : await loadSwooperMapConfigRegistry({ recipeSchema });
  const plan = buildSwooperCatalogModFilePlan({ configs });
  await writeSwooperMapArtifactFilePlan(plan, { outputRoot: pkgRoot });

  const rel = (path: string) => path.replace(`${repoRoot}/`, "");
  console.log(
    `Generated ${configs.length} Swooper map configs from ${rel(configsDir)}: ${configs
      .map((config) => config.canonicalConfig.id)
      .join(", ")}`
  );
}

if (import.meta.main) {
  await main();
}

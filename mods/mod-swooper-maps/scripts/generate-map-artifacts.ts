import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  applyGeneratedFilePlan,
  type GeneratedFilePlanIssue,
  inspectGeneratedFilePlan,
} from "@civ7/plugin-files/generated-file-plan";
import type { MapConfigId } from "@civ7/studio-contract";
import type { TSchema } from "typebox";
import { admitMapConfigCatalogConfig } from "../src/maps/catalog/admission.js";
import {
  admitMapConfigCatalogIds,
  MAP_CONFIG_CATALOG_IDS,
} from "../src/maps/catalog/membership.js";
import type { ValidatedMapConfig } from "../src/maps/configs/canonical.js";
import { deriveStandardRecipeArtifacts } from "../src/recipes/standard/artifacts.js";
import { buildSwooperCatalogModFilePlan } from "./map-artifacts/file-plan.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgRoot = resolve(__dirname, "..");
const repoRoot = resolve(pkgRoot, "../..");

const catalogConfigDirectory = "mods/mod-swooper-maps/src/maps/configs";
const checkCurrentArg = "--check";
const includeStudioDeployConfigArg = "--include-studio-deploy-config";
const studioDeployConfigIdEnv = "SWOOPER_STUDIO_DEPLOY_CONFIG_ID";

/**
 * Loads the authored Swooper map config registry for artifact generation. This
 * is the CLI's discovery boundary: it may read config files, while the renderer
 * receives already-validated configs and returns only file-plan data.
 */
export async function loadSwooperMapConfigRegistry(
  options: Readonly<{
    catalogConfigIds?: unknown;
    recipeSchema?: TSchema;
    repoRoot?: string;
  }> = {}
): Promise<ValidatedMapConfig[]> {
  const configIds = admitMapConfigCatalogIds(options.catalogConfigIds ?? MAP_CONFIG_CATALOG_IDS);
  const root = options.repoRoot ?? repoRoot;
  return loadValidatedCatalogEntries({
    configIds,
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
    catalogConfigIds?: unknown;
    deployConfigId?: string;
    recipeSchema?: TSchema;
    repoRoot?: string;
  }> = {}
): Promise<ValidatedMapConfig[]> {
  const catalogConfigIds = admitMapConfigCatalogIds(
    options.catalogConfigIds ?? MAP_CONFIG_CATALOG_IDS
  );
  const root = options.repoRoot ?? repoRoot;
  const deployConfigId = options.deployConfigId ?? readStudioDeployConfigId(process.env);
  return loadValidatedCatalogEntries({
    configIds: studioDeployConfigIds(catalogConfigIds, deployConfigId),
    recipeSchema: options.recipeSchema,
    repoRoot: root,
  });
}

async function loadValidatedCatalogEntries(args: {
  configIds: readonly MapConfigId[];
  recipeSchema?: TSchema;
  repoRoot: string;
}): Promise<ValidatedMapConfig[]> {
  const configsById = new Map<string, ValidatedMapConfig>();
  const readErrors: string[] = [];

  for (const configId of args.configIds) {
    const configPath = catalogConfigPath(configId);
    try {
      const raw = JSON.parse(
        await readFile(resolve(args.repoRoot, configPath), "utf-8")
      ) as unknown;
      configsById.set(
        configId,
        admitMapConfigCatalogConfig({
          configId,
          canonicalConfig: raw,
          recipeSchema: args.recipeSchema,
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      readErrors.push(`${configPath}: ${message}`);
    }
  }

  if (readErrors.length > 0) {
    throw new Error(
      `Invalid Swooper map catalog config references:\n${readErrors
        .map((error) => `- ${error}`)
        .join("\n")}`
    );
  }

  const configs = args.configIds.map((configId) => {
    const config = configsById.get(configId);
    if (!config) throw new Error(`Catalog config was not loaded: ${configId}`);
    return config;
  });
  if (configs.length === 0) {
    throw new Error(`No canonical map configs found in ${catalogConfigDirectory}`);
  }

  return configs;
}

function catalogConfigPath(configId: MapConfigId): string {
  return `${catalogConfigDirectory}/${configId}.config.json`;
}

function studioDeployConfigIds(
  catalogConfigIds: readonly MapConfigId[],
  deployConfigId?: string
): readonly MapConfigId[] {
  if (deployConfigId === undefined || catalogConfigIds.includes(deployConfigId)) {
    return catalogConfigIds;
  }
  return admitMapConfigCatalogIds([...catalogConfigIds, deployConfigId]);
}

function readStudioDeployConfigId(env: NodeJS.ProcessEnv): string | undefined {
  return env[studioDeployConfigIdEnv];
}

type GenerationMode = "apply-catalog" | "check-catalog" | "apply-studio-deploy";

function parseGenerationMode(args: readonly string[]): GenerationMode {
  const admitted = new Set<string>();
  for (const arg of args) {
    if (arg !== checkCurrentArg && arg !== includeStudioDeployConfigArg) {
      throw new Error(`Unknown generate-map-artifacts argument: ${arg}`);
    }
    if (admitted.has(arg)) {
      throw new Error(`Duplicate generate-map-artifacts argument: ${arg}`);
    }
    admitted.add(arg);
  }
  if (admitted.has(checkCurrentArg) && admitted.has(includeStudioDeployConfigArg)) {
    throw new Error(
      `${checkCurrentArg} verifies only the durable catalog plan and cannot include a request-local Studio deploy config.`
    );
  }
  if (admitted.has(checkCurrentArg)) return "check-catalog";
  if (admitted.has(includeStudioDeployConfigArg)) return "apply-studio-deploy";
  return "apply-catalog";
}

function formatCurrentnessIssue(issue: GeneratedFilePlanIssue): string {
  switch (issue.kind) {
    case "missing":
      return `${issue.relativePath}: missing`;
    case "content-mismatch":
      return `${issue.relativePath}: content differs from the catalog source plan`;
    case "unexpected":
      return `${issue.relativePath}: unexpected file in an exclusive generated set`;
  }
}

function formatCurrentnessFailure(issues: readonly GeneratedFilePlanIssue[]): string {
  const shown = issues.slice(0, 20).map((issue) => `- ${formatCurrentnessIssue(issue)}`);
  const remainder = issues.length - shown.length;
  return [
    "Swooper tracked map artifacts are not current with their catalog source plan.",
    ...shown,
    ...(remainder > 0 ? [`- ...and ${remainder} more difference(s)`] : []),
    "Run `nx run mod-swooper-maps:gen:maps` to materialize the admitted plan.",
  ].join("\n");
}

async function main(): Promise<void> {
  const mode = parseGenerationMode(process.argv.slice(2));
  const includeStudioDeployConfig = mode === "apply-studio-deploy";
  const checkCurrent = mode === "check-catalog";
  const { schema: recipeSchema } = deriveStandardRecipeArtifacts();
  const configs = includeStudioDeployConfig
    ? await loadSwooperStudioDeployConfigRegistry({
        deployConfigId: readStudioDeployConfigId(process.env),
        recipeSchema,
      })
    : await loadSwooperMapConfigRegistry({ recipeSchema });
  const plan = buildSwooperCatalogModFilePlan({ configs });
  if (checkCurrent) {
    const inspection = await inspectGeneratedFilePlan(plan, { outputRoot: pkgRoot });
    if (inspection.kind === "stale") throw new Error(formatCurrentnessFailure(inspection.issues));
  } else {
    await applyGeneratedFilePlan(plan, { outputRoot: pkgRoot });
  }

  const verb = checkCurrent ? "Verified" : "Generated";
  console.log(
    `${verb} ${configs.length} Swooper map configs from ${catalogConfigDirectory}: ${configs
      .map((config) => config.canonicalConfig.id)
      .join(", ")}`
  );
}

if (import.meta.main) {
  await main();
}

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyGeneratedFilePlan } from "@civ7/plugin-files/generated-file-plan";
import type { MapConfigId } from "@civ7/studio-contract";
import { admitMapConfigCatalogIds, MAP_CONFIG_CATALOG_IDS } from "@swooper/swooper-physics/catalog";
import type { ValidatedMapConfig } from "@swooper/swooper-physics/standard/map-config";
import { loadSwooperMapConfigCatalog } from "@swooper/swooper-physics/tooling/catalog-source";
import {
  buildSwooperCatalogModFilePlan,
  renderSwooperCatalogMapSource,
} from "./runtime/file-plan.js";
import { bundleCiv7MapScript } from "./runtime/map-script/compiler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appRoot = resolve(__dirname, "..");
const modOutputRoot = resolve(appRoot, "dist/mod");

const includeStudioDeployConfigArg = "--include-studio-deploy-config";
const studioDeployConfigIdEnv = "SWOOPER_STUDIO_DEPLOY_CONFIG_ID";

/**
 * Builds the deploy-only registry used by catalog deployment. Run in Game does
 * not pass through this registry: its selected canonical envelope is owned by
 * the request-local generation manifest.
 */
export async function loadSwooperStudioDeployConfigRegistry(
  options: Readonly<{
    catalogConfigIds?: unknown;
    deployConfigId?: string;
  }> = {}
): Promise<readonly ValidatedMapConfig[]> {
  const catalogConfigIds = admitMapConfigCatalogIds(
    options.catalogConfigIds ?? MAP_CONFIG_CATALOG_IDS
  );
  const deployConfigId = options.deployConfigId ?? readStudioDeployConfigId(process.env);
  return loadSwooperMapConfigCatalog({
    catalogConfigIds: selectSwooperStudioDeployConfigIds(catalogConfigIds, deployConfigId),
  });
}

/** Adds one request-local Studio selection without changing durable catalog membership. */
export function selectSwooperStudioDeployConfigIds(
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

function parseIncludeStudioDeployConfig(args: readonly string[]): boolean {
  if (args.length === 0) return false;
  if (args.length === 1 && args[0] === includeStudioDeployConfigArg) return true;
  throw new Error(`Usage: bun ./src/build.ts [${includeStudioDeployConfigArg}]`);
}

async function main(): Promise<void> {
  const includeStudioDeployConfig = parseIncludeStudioDeployConfig(process.argv.slice(2));
  const configs = includeStudioDeployConfig
    ? await loadSwooperStudioDeployConfigRegistry({
        deployConfigId: readStudioDeployConfigId(process.env),
      })
    : await loadSwooperMapConfigCatalog();
  const mapScripts = await Promise.all(
    configs.map(async (config) => ({
      configId: config.canonicalConfig.id,
      content: await bundleCiv7MapScript({
        source: renderSwooperCatalogMapSource(config),
        sourceName: `${config.canonicalConfig.id}.ts`,
        appRoot,
      }),
    }))
  );
  const plan = buildSwooperCatalogModFilePlan({ configs, mapScripts });
  await applyGeneratedFilePlan(plan, { outputRoot: modOutputRoot });

  console.log(
    `Built ${configs.length} Swooper map configs: ${configs
      .map((config) => config.canonicalConfig.id)
      .join(", ")}`
  );
}

if (import.meta.main) {
  await main();
}

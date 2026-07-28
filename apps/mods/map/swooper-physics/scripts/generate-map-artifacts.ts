import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  applyGeneratedFilePlan,
  type GeneratedFilePlanIssue,
  inspectGeneratedFilePlan,
} from "@civ7/plugin-files/generated-file-plan";
import type { MapConfigId } from "@civ7/studio-contract";
import { admitMapConfigCatalogIds, MAP_CONFIG_CATALOG_IDS } from "@swooper/swooper-physics/catalog";
import type { ValidatedMapConfig } from "@swooper/swooper-physics/standard/map-config";
import { loadSwooperMapConfigCatalog } from "@swooper/swooper-physics/tooling/catalog-source";
import { buildSwooperCatalogModFilePlan } from "./map-artifacts/file-plan.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgRoot = resolve(__dirname, "..");

const checkCurrentArg = "--check";
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
): Promise<ValidatedMapConfig[]> {
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
    "Run `nx run swooper-physics-mod:gen:maps` to materialize the admitted plan.",
  ].join("\n");
}

async function main(): Promise<void> {
  const mode = parseGenerationMode(process.argv.slice(2));
  const includeStudioDeployConfig = mode === "apply-studio-deploy";
  const checkCurrent = mode === "check-catalog";
  const configs = includeStudioDeployConfig
    ? await loadSwooperStudioDeployConfigRegistry({
        deployConfigId: readStudioDeployConfigId(process.env),
      })
    : await loadSwooperMapConfigCatalog();
  const plan = buildSwooperCatalogModFilePlan({ configs });
  if (checkCurrent) {
    const inspection = await inspectGeneratedFilePlan(plan, { outputRoot: pkgRoot });
    if (inspection.kind === "stale") throw new Error(formatCurrentnessFailure(inspection.issues));
  } else {
    await applyGeneratedFilePlan(plan, { outputRoot: pkgRoot });
  }

  const verb = checkCurrent ? "Verified" : "Generated";
  console.log(
    `${verb} ${configs.length} Swooper map configs: ${configs
      .map((config) => config.canonicalConfig.id)
      .join(", ")}`
  );
}

if (import.meta.main) {
  await main();
}

import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import {
  buildCanonicalMapConfigSchema,
  type ValidatedMapConfig,
  validateCanonicalMapConfig,
} from "../src/maps/configs/canonical.js";
import { STANDARD_STAGES } from "../src/recipes/standard/recipe.js";
import {
  buildSwooperMapArtifactFilePlan,
  type StudioRunProofEnv,
} from "./map-artifacts/file-plan.js";
import { writeSwooperMapArtifactFilePlan } from "./map-artifacts/write-file-plan.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgRoot = resolve(__dirname, "..");
const repoRoot = resolve(pkgRoot, "../..");

const configsDir = resolve(pkgRoot, "src/maps/configs");
const transientStudioCurrentConfig = "studio-current.config.json";
const includeTransientStudioCurrent = process.env.SWOOPER_INCLUDE_STUDIO_CURRENT === "1";

/**
 * Reads the all-or-nothing Studio run proof tuple before generation performs
 * discovery I/O. The executable script owns ambient env discovery; the renderer
 * receives an explicit proof state and stays deterministic.
 */
export function readStudioRunProofEnv(env: NodeJS.ProcessEnv = process.env): StudioRunProofEnv {
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
      "Studio run proof env must set SWOOPER_STUDIO_RUN_ID, SWOOPER_STUDIO_LAUNCH_CONFIG_ID, and SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST together"
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
    configsRoot?: string;
    includeTransientStudioCurrent?: boolean;
  }> = {}
): Promise<ValidatedMapConfig[]> {
  const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
  const root = options.configsRoot ?? configsDir;
  const shouldIncludeTransientStudioCurrent =
    options.includeTransientStudioCurrent ?? includeTransientStudioCurrent;
  const entries = await readdir(root, { withFileTypes: true });
  const configs: ValidatedMapConfig[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".config.json")) continue;
    if (!shouldIncludeTransientStudioCurrent && entry.name === transientStudioCurrentConfig)
      continue;
    const raw = JSON.parse(await readFile(resolve(root, entry.name), "utf-8")) as unknown;
    configs.push(
      validateCanonicalMapConfig({
        fileName: entry.name,
        raw,
        recipeSchema: schema,
        stages: STANDARD_STAGES,
      })
    );
  }

  configs.sort((a, b) => a.sortIndex - b.sortIndex || a.id.localeCompare(b.id));

  const seen = new Set<string>();
  for (const config of configs) {
    if (seen.has(config.id)) throw new Error(`Duplicate map config id "${config.id}"`);
    seen.add(config.id);
  }
  if (configs.length === 0) throw new Error(`No canonical map configs found in ${root}`);

  return configs;
}

async function main(): Promise<void> {
  const proofEnv = readStudioRunProofEnv();
  const configs = await loadSwooperMapConfigRegistry();
  const recipeSchema = deriveRecipeConfigSchema(STANDARD_STAGES);
  const envelopeSchema = buildCanonicalMapConfigSchema(recipeSchema);
  const plan = buildSwooperMapArtifactFilePlan({
    configs,
    envelopeSchema,
    proofEnv,
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

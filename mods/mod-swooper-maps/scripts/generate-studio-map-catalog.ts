import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyGeneratedFilePlan } from "@civ7/plugin-files/generated-file-plan";

import { buildCanonicalMapConfigSchema } from "../src/maps/configs/canonical.js";
import { deriveStandardRecipeArtifacts } from "../src/recipes/standard/artifacts.js";
import { loadSwooperMapConfigRegistry } from "./generate-map-artifacts.js";
import {
  buildSwooperCatalogMetadataFilePlan,
  type SwooperMapArtifactFilePlan,
} from "./map-artifacts/file-plan.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgRoot = resolve(__dirname, "..");

/** Builds the Studio catalog metadata plan from the admitted Swooper source index. */
export async function buildSwooperStudioCatalogMetadataPlan(
  options: Readonly<{ catalogSourceIndex?: unknown; repoRoot?: string }> = {}
): Promise<SwooperMapArtifactFilePlan> {
  const { schema: recipeSchema } = deriveStandardRecipeArtifacts();
  const configs = await loadSwooperMapConfigRegistry({
    catalogSourceIndex: options.catalogSourceIndex,
    recipeSchema,
    repoRoot: options.repoRoot,
  });
  const envelopeSchema = buildCanonicalMapConfigSchema(recipeSchema);
  return buildSwooperCatalogMetadataFilePlan({ configs, envelopeSchema });
}

/** Applies the admitted Studio catalog metadata plan below its selected package root. */
export async function generateSwooperStudioCatalogMetadata(
  options: Readonly<{
    catalogSourceIndex?: unknown;
    outputRoot?: string;
    repoRoot?: string;
  }> = {}
): Promise<{ configCount: number; fileCount: number }> {
  const plan = await buildSwooperStudioCatalogMetadataPlan({
    catalogSourceIndex: options.catalogSourceIndex,
    repoRoot: options.repoRoot,
  });
  await applyGeneratedFilePlan(plan, { outputRoot: options.outputRoot ?? pkgRoot });
  return {
    configCount: plan.metadata.configProjections.length,
    fileCount: plan.files.length,
  };
}

async function main(): Promise<void> {
  const result = await generateSwooperStudioCatalogMetadata();
  console.log(
    `Generated ${result.configCount} Studio catalog map configs from CatalogSourceIndex.`
  );
}

if (import.meta.main) {
  await main();
}

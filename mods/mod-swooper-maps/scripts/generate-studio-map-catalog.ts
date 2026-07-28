import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyGeneratedFilePlan } from "@civ7/plugin-files/generated-file-plan";

import { buildCanonicalMapConfigSchema } from "../src/maps/configs/canonical.js";
import { deriveStandardRecipeArtifacts } from "../src/recipes/standard/artifacts.js";
import { loadSwooperMapConfigRegistry } from "./generate-map-artifacts.js";
import { buildSwooperCatalogMetadataFilePlan } from "./map-artifacts/file-plan.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgRoot = resolve(__dirname, "..");

/** Applies the admitted Studio catalog metadata plan below its selected package root. */
export async function generateSwooperStudioCatalogMetadata(
  options: Readonly<{
    catalogConfigIds?: unknown;
    outputRoot?: string;
    repoRoot?: string;
  }> = {}
): Promise<{ configCount: number }> {
  const { schema: recipeSchema } = deriveStandardRecipeArtifacts();
  const configs = await loadSwooperMapConfigRegistry({
    catalogConfigIds: options.catalogConfigIds,
    recipeSchema,
    repoRoot: options.repoRoot,
  });
  const envelopeSchema = buildCanonicalMapConfigSchema(recipeSchema);
  const plan = buildSwooperCatalogMetadataFilePlan({ configs, envelopeSchema });
  await applyGeneratedFilePlan(plan, { outputRoot: options.outputRoot ?? pkgRoot });
  return {
    configCount: configs.length,
  };
}

async function main(): Promise<void> {
  const result = await generateSwooperStudioCatalogMetadata();
  console.log(
    `Generated ${result.configCount} Studio catalog map configs from catalog membership.`
  );
}

if (import.meta.main) {
  await main();
}

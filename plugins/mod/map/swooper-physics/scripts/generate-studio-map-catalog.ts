import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyGeneratedFilePlan } from "@civ7/plugin-files/generated-file-plan";
import { authoringTargets } from "../authoring/index.js";
import { loadSwooperMapConfigCatalog } from "./catalog-source.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function main(): Promise<void> {
  const configs = await loadSwooperMapConfigCatalog();
  const plan = authoringTargets.mapCatalogMetadata.createPlan(configs);
  await applyGeneratedFilePlan(plan, { outputRoot: packageRoot });
  console.log(`Generated ${configs.length} Studio catalog map configs from catalog membership.`);
}

if (import.meta.main) {
  await main();
}

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { MapConfigId } from "@civ7/studio-contract";
import { admitMapConfigCatalogConfig } from "../src/maps/catalog/admission.js";
import { admitMapConfigCatalogIds, MAP_CONFIG_CATALOG_IDS } from "../src/maps/catalog/membership.js";
import type { ValidatedMapConfig } from "../src/maps/configs/canonical.js";
import { STANDARD_RECIPE_CONFIG_SCHEMA } from "../src/recipes/standard/artifacts.js";

const authoredConfigDirectory = fileURLToPath(new URL("../src/maps/configs/", import.meta.url));

/**
 * Loads Swooper's authored map configs in admitted catalog order.
 *
 * This is the definition-owned filesystem boundary shared by metadata and Civ7
 * materializers. Callers may select membership, but they do not derive source
 * paths or reconstruct canonical config admission.
 */
export async function loadSwooperMapConfigCatalog(
  options: Readonly<{
    catalogConfigIds?: unknown;
  }> = {}
): Promise<ValidatedMapConfig[]> {
  const configIds = admitMapConfigCatalogIds(options.catalogConfigIds ?? MAP_CONFIG_CATALOG_IDS);
  const configsById = new Map<MapConfigId, ValidatedMapConfig>();
  const readErrors: string[] = [];

  for (const configId of configIds) {
    const configPath = resolve(authoredConfigDirectory, `${configId}.config.json`);
    try {
      const raw = JSON.parse(await readFile(configPath, "utf-8")) as unknown;
      configsById.set(
        configId,
        admitMapConfigCatalogConfig({
          configId,
          canonicalConfig: raw,
          recipeSchema: STANDARD_RECIPE_CONFIG_SCHEMA,
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

  const configs = configIds.map((configId) => {
    const config = configsById.get(configId);
    if (!config) throw new Error(`Catalog config was not loaded: ${configId}`);
    return config;
  });
  if (configs.length === 0) {
    throw new Error(`No canonical map configs found in ${authoredConfigDirectory}`);
  }
  return configs;
}

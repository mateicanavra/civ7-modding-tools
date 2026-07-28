import { fileURLToPath } from "node:url";
import { MAP_CONFIG_CATALOG_IDS } from "../src/maps/catalog/membership.js";
import type { ValidatedMapConfig } from "../src/maps/configs/canonical.js";
import { createSwooperMapConfigSourceStore } from "./config-source-store.js";

const authoredConfigDirectory = fileURLToPath(new URL("../src/maps/configs/", import.meta.url));
const authoredConfigSource = createSwooperMapConfigSourceStore(authoredConfigDirectory);

/**
 * Prepares one admitted authored-config write behind the definition's source boundary.
 *
 * Hosts may commit or roll back the opaque transaction, but source paths and
 * prior file contents remain private to the Swooper definition.
 */
export async function prepareSwooperMapConfigSourceWrite(value: unknown) {
  return authoredConfigSource.prepareWrite(value);
}

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
  return authoredConfigSource.loadCatalog(options.catalogConfigIds ?? MAP_CONFIG_CATALOG_IDS);
}

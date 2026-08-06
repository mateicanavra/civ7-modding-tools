import type { MapConfigId } from "@civ7/studio-contract";
import { admitMapConfigCatalogConfig } from "../src/maps/catalog/admission.js";
import { admitMapConfigCatalogIds } from "../src/maps/catalog/membership.js";
import { admitStandardMapConfig, type ValidatedMapConfig } from "../src/maps/configs/canonical.js";
import { STANDARD_RECIPE_CONFIG_SCHEMA } from "../src/recipes/standard/artifacts.js";

/** Canonical source text and identity for one admitted authored map configuration. */
export type SerializedSwooperMapConfig = Readonly<{
  configId: MapConfigId;
  content: string;
}>;

/**
 * Admits catalog membership and projects raw envelopes into canonical catalog order.
 * Source discovery and reads remain effects supplied by the consuming realization.
 */
export function projectSwooperMapConfigCatalog(args: {
  catalogConfigIds: unknown;
  configsById: ReadonlyMap<MapConfigId, unknown>;
}): readonly ValidatedMapConfig[] {
  const configIds = admitMapConfigCatalogIds(args.catalogConfigIds);
  if (configIds.length === 0) {
    throw new Error("Swooper map catalog must contain at least one canonical config.");
  }

  return Object.freeze(
    configIds.map((configId) => {
      if (!args.configsById.has(configId)) {
        throw new Error(`Catalog config was not supplied: ${configId}`);
      }
      return admitMapConfigCatalogConfig({
        configId,
        canonicalConfig: args.configsById.get(configId),
        recipeSchema: STANDARD_RECIPE_CONFIG_SCHEMA,
      });
    })
  );
}

/** Admits and serializes one complete authored map configuration without host effects. */
export function serializeSwooperMapConfig(value: unknown): SerializedSwooperMapConfig {
  const canonicalConfig = admitStandardMapConfig(value);
  return Object.freeze({
    configId: canonicalConfig.id,
    content: `${JSON.stringify(canonicalConfig, null, 2)}\n`,
  });
}

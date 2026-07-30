import type { MapConfigId } from "@civ7/studio-contract";
import type { TSchema } from "typebox";
import { type ValidatedMapConfig, validateCanonicalMapConfig } from "../configs/canonical.js";

function fileNameForConfigId(configId: MapConfigId): string {
  return `${configId}.config.json`;
}

/**
 * Admits one catalog envelope under its declared map identity. The generator derives the
 * corresponding filename, while canonical admission proves that the envelope id agrees.
 */
export function admitMapConfigCatalogConfig(args: {
  configId: MapConfigId;
  canonicalConfig: unknown;
  recipeSchema?: TSchema;
}): ValidatedMapConfig {
  return validateCanonicalMapConfig({
    fileName: fileNameForConfigId(args.configId),
    raw: args.canonicalConfig,
    recipeSchema: args.recipeSchema,
  });
}

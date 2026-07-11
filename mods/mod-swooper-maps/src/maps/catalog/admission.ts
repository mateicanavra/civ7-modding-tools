import type { TSchema } from "typebox";
import { type ValidatedMapConfig, validateCanonicalMapConfig } from "../configs/canonical.js";
import { catalogConfigFileNameFromPath } from "./sources.js";

/**
 * Catalog generation and runtime resolution share this path-aware boundary so
 * a source cannot be accepted under a different filename identity at runtime.
 */
export function admitSwooperCatalogConfig(args: {
  sourcePath: string;
  canonicalConfig: unknown;
  recipeSchema?: TSchema;
}): ValidatedMapConfig {
  return validateCanonicalMapConfig({
    fileName: catalogConfigFileNameFromPath(args.sourcePath),
    raw: args.canonicalConfig,
    recipeSchema: args.recipeSchema,
  });
}

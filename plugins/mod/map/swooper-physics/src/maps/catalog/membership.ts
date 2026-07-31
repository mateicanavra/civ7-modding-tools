import { isMapConfigId, type MapConfigId } from "@civ7/studio-contract";

/** Ordered identities of the map configurations shipped in the durable Swooper catalog. */
export const MAP_CONFIG_CATALOG_IDS = [
  "swooper-desert-mountains",
  "swooper-earthlike",
  "shattered-ring",
  "sundered-archipelago",
  "mountains-of-time-earthlike",
  "latest-juicy",
  "mountain-patch",
  "mountains-of-time-original",
] as const satisfies readonly MapConfigId[];

/**
 * Admits an ordered catalog membership list while rejecting invalid or duplicate map identities.
 * File discovery remains generator-local and is derived from these admitted ids.
 */
export function admitMapConfigCatalogIds(value: unknown): readonly MapConfigId[] {
  if (!Array.isArray(value)) {
    throw new Error("Swooper map catalog membership must be an array of map config ids.");
  }

  const ids: MapConfigId[] = [];
  const seen = new Map<MapConfigId, number>();
  const errors: string[] = [];
  value.forEach((candidate, index) => {
    if (!isMapConfigId(candidate)) {
      errors.push(`Catalog membership[${index}] must be a lowercase kebab-case map config id.`);
      return;
    }
    const previous = seen.get(candidate);
    if (previous !== undefined) {
      errors.push(
        `Catalog membership[${index}] duplicates membership[${previous}] "${candidate}".`
      );
      return;
    }
    seen.set(candidate, index);
    ids.push(candidate);
  });

  if (errors.length > 0) {
    throw new Error(
      `Invalid Swooper map catalog membership:\n${errors.map((error) => `- ${error}`).join("\n")}`
    );
  }
  return Object.freeze(ids);
}

import type { DiscoveryCatalogEntry } from "./types.js";

/**
 * Adapter-owned symbolic discovery catalog used by deterministic placement.
 *
 * Source of truth:
 * - .civ7/outputs/resources/Base/modules/base-standard/data/narrative-sifting.xml
 * - base-standard discovery generation script (module under maps/)
 *
 * Notes:
 * - We intentionally exclude coast/shipwreck entries from this catalog because
 *   deterministic placement currently targets land tiles only.
 * - We include BASIC + INVESTIGATION activations because they are used in
 *   base-standard discovery generation.
 */
export const PLACEABLE_DISCOVERY_CATALOG_SYMBOLS = [
  { constructibleType: "IMPROVEMENT_CAVE", activationType: "BASIC" },
  { constructibleType: "IMPROVEMENT_CAVE", activationType: "INVESTIGATION" },
  { constructibleType: "IMPROVEMENT_RUINS", activationType: "BASIC" },
  { constructibleType: "IMPROVEMENT_RUINS", activationType: "INVESTIGATION" },
  { constructibleType: "IMPROVEMENT_CAMPFIRE", activationType: "BASIC" },
  { constructibleType: "IMPROVEMENT_CAMPFIRE", activationType: "INVESTIGATION" },
  { constructibleType: "IMPROVEMENT_TENTS", activationType: "BASIC" },
  { constructibleType: "IMPROVEMENT_TENTS", activationType: "INVESTIGATION" },
  { constructibleType: "IMPROVEMENT_PLAZA", activationType: "BASIC" },
  { constructibleType: "IMPROVEMENT_PLAZA", activationType: "INVESTIGATION" },
  { constructibleType: "IMPROVEMENT_CAIRN", activationType: "BASIC" },
  { constructibleType: "IMPROVEMENT_CAIRN", activationType: "INVESTIGATION" },
  { constructibleType: "IMPROVEMENT_RICH", activationType: "BASIC" },
  { constructibleType: "IMPROVEMENT_RICH", activationType: "INVESTIGATION" },
  { constructibleType: "IMPROVEMENT_WRECKAGE", activationType: "BASIC" },
  { constructibleType: "IMPROVEMENT_WRECKAGE", activationType: "INVESTIGATION" },
] as const;

type DiscoveryCatalogSymbol = (typeof PLACEABLE_DISCOVERY_CATALOG_SYMBOLS)[number];

function toHashValue(value: unknown, label: string): number {
  if (typeof value === "number" && Number.isFinite(value)) return value >>> 0;
  throw new Error(`[Adapter] Failed to hash discovery symbol: ${label}.`);
}

/**
 * Resolve symbolic discovery definitions into numeric ids used by addDiscovery.
 */
export function resolvePlaceableDiscoveryCatalog(
  makeHash: (value: string) => number
): DiscoveryCatalogEntry[] {
  const catalog: DiscoveryCatalogEntry[] = [];
  const seen = new Set<string>();
  for (const symbol of PLACEABLE_DISCOVERY_CATALOG_SYMBOLS) {
    const discoveryVisualType = toHashValue(
      makeHash(symbol.constructibleType),
      symbol.constructibleType
    );
    const discoveryActivationType = toHashValue(
      makeHash(symbol.activationType),
      symbol.activationType
    );
    const key = `${discoveryVisualType}:${discoveryActivationType}`;
    if (seen.has(key)) continue;
    seen.add(key);
    catalog.push({
      discoveryVisualType,
      discoveryActivationType,
    });
  }
  return catalog;
}

export type { DiscoveryCatalogSymbol };

import type { EngineAdapter } from "@civ7/adapter";

/** Civ7 terrain identifiers consumed by Standard recipe projection steps. */
export type StandardProjectionTerrainTypes = Readonly<{
  mountain: number;
  hill: number;
  flat: number;
  coast: number;
  ocean: number;
  navigableRiver: number;
}>;

function requireEngineTypeIndex(kind: string, name: string, value: number): number {
  if (Number.isInteger(value) && value >= 0) return value;
  throw new Error(`[Adapter] Missing ${kind} index for ${name}.`);
}

/**
 * Resolves a fresh immutable snapshot of Standard's Civ7 terrain identities.
 * Terrain-only consumers do not acquire unrelated feature identities.
 */
export function resolveStandardProjectionTerrainTypes(
  adapter: EngineAdapter
): StandardProjectionTerrainTypes {
  return Object.freeze({
    mountain: requireEngineTypeIndex(
      "terrain",
      "TERRAIN_MOUNTAIN",
      adapter.getTerrainTypeIndex("TERRAIN_MOUNTAIN")
    ),
    hill: requireEngineTypeIndex(
      "terrain",
      "TERRAIN_HILL",
      adapter.getTerrainTypeIndex("TERRAIN_HILL")
    ),
    flat: requireEngineTypeIndex(
      "terrain",
      "TERRAIN_FLAT",
      adapter.getTerrainTypeIndex("TERRAIN_FLAT")
    ),
    coast: requireEngineTypeIndex(
      "terrain",
      "TERRAIN_COAST",
      adapter.getTerrainTypeIndex("TERRAIN_COAST")
    ),
    ocean: requireEngineTypeIndex(
      "terrain",
      "TERRAIN_OCEAN",
      adapter.getTerrainTypeIndex("TERRAIN_OCEAN")
    ),
    navigableRiver: requireEngineTypeIndex(
      "terrain",
      "TERRAIN_NAVIGABLE_RIVER",
      adapter.getTerrainTypeIndex("TERRAIN_NAVIGABLE_RIVER")
    ),
  });
}

/** Resolves Standard's Civ7 volcano feature identity only for volcano projection. */
export function resolveStandardVolcanoFeatureType(adapter: EngineAdapter): number {
  return requireEngineTypeIndex(
    "feature",
    "FEATURE_VOLCANO",
    adapter.getFeatureTypeIndex("FEATURE_VOLCANO")
  );
}

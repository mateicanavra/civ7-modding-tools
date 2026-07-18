import type { Civ7BiomeGlobal } from "@civ7/map-policy";
import { BIOME_SYMBOL_ORDER, type BiomeSymbol } from "@mapgen/domain/ecology";
import type { BiomeEngineBindings } from "../../../map-projection-public-config.js";

/** Resolves configured Civ7 biome globals without exposing a concrete adapter dependency. */
export type BiomeGlobalResolver = {
  getBiomeGlobal(key: Civ7BiomeGlobal): number | undefined;
};

/**
 * Captures the complete resolved engine identity surface: every canonical
 * Ecology land symbol plus the separately configured marine biome.
 */
export interface ResolvedEngineBiomeIds {
  land: Record<BiomeSymbol, number>;
  marine: number;
}

/**
 * Resolves the complete authored biome-symbol binding into Civ7 runtime IDs at the map-ecology
 * boundary. Missing or non-numeric globals fail closed so projection never silently
 * substitutes a biome.
 *
 * The returned land map follows the canonical biome symbol order and includes the separately
 * configured marine ID.
 */
export function resolveEngineBiomeIds(
  adapter: BiomeGlobalResolver,
  bindings: BiomeEngineBindings
): ResolvedEngineBiomeIds {
  const resolved: Partial<Record<BiomeSymbol, number>> = {};

  for (const symbol of BIOME_SYMBOL_ORDER) {
    const key = bindings[symbol];
    const resolvedId = adapter.getBiomeGlobal(key);
    if (typeof resolvedId !== "number" || Number.isNaN(resolvedId)) {
      throw new Error(
        `resolveEngineBiomeIds: missing biome global "${key}" for symbol "${symbol}"`
      );
    }
    resolved[symbol] = resolvedId;
  }

  const marineKey = bindings.marine;
  const marineId = adapter.getBiomeGlobal(marineKey);
  if (typeof marineId !== "number" || Number.isNaN(marineId)) {
    throw new Error(`resolveEngineBiomeIds: missing biome global "${marineKey}" for marine`);
  }

  return { land: resolved as Record<BiomeSymbol, number>, marine: marineId };
}

import type { Civ7BiomeGlobal } from "@civ7/map-policy";
import { BIOME_SYMBOL_ORDER, type BiomeSymbol } from "@mapgen/domain/ecology";
import type { BiomeEngineBindings } from "../../../map-projection-public-config.js";

export type BiomeGlobalResolver = {
  getBiomeGlobal(key: Civ7BiomeGlobal): number | undefined;
};

export interface ResolvedEngineBiomeIds {
  land: Record<BiomeSymbol, number>;
  marine: number;
}

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

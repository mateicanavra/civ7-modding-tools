import {
  CIV7_BIOME_GLOBAL,
  CIV7_MARINE_BIOME_GLOBAL,
  type Civ7BiomeGlobal,
} from "@civ7/map-policy";
import { BIOME_SYMBOL_ORDER, type BiomeSymbol } from "@mapgen/domain/ecology";

export type BiomeGlobalResolver = {
  getBiomeGlobal(key: Civ7BiomeGlobal): number | undefined;
};

const DEFAULT_ENGINE_BIOME_BINDINGS = Object.freeze({
  snow: CIV7_BIOME_GLOBAL.TUNDRA,
  tundra: CIV7_BIOME_GLOBAL.TUNDRA,
  boreal: CIV7_BIOME_GLOBAL.TUNDRA,
  temperateDry: CIV7_BIOME_GLOBAL.PLAINS,
  temperateHumid: CIV7_BIOME_GLOBAL.GRASSLAND,
  tropicalSeasonal: CIV7_BIOME_GLOBAL.PLAINS,
  tropicalRainforest: CIV7_BIOME_GLOBAL.TROPICAL,
  desert: CIV7_BIOME_GLOBAL.DESERT,
} as const satisfies Record<BiomeSymbol, Civ7BiomeGlobal>);

export interface ResolvedEngineBiomeIds {
  land: Record<BiomeSymbol, number>;
  marine: number;
}

export function resolveEngineBiomeIds(adapter: BiomeGlobalResolver): ResolvedEngineBiomeIds {
  const resolved: Partial<Record<BiomeSymbol, number>> = {};

  for (const symbol of BIOME_SYMBOL_ORDER) {
    const key = DEFAULT_ENGINE_BIOME_BINDINGS[symbol];
    const resolvedId = adapter.getBiomeGlobal(key);
    if (typeof resolvedId !== "number" || Number.isNaN(resolvedId)) {
      throw new Error(
        `resolveEngineBiomeIds: missing biome global "${key}" for symbol "${symbol}"`
      );
    }
    resolved[symbol] = resolvedId;
  }

  const marineId = adapter.getBiomeGlobal(CIV7_MARINE_BIOME_GLOBAL);
  if (typeof marineId !== "number" || Number.isNaN(marineId)) {
    throw new Error(
      `resolveEngineBiomeIds: missing biome global "${CIV7_MARINE_BIOME_GLOBAL}" for marine`
    );
  }

  return { land: resolved as Record<BiomeSymbol, number>, marine: marineId };
}

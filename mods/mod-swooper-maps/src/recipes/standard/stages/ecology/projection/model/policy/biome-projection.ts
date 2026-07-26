import {
  CIV7_BIOME_GLOBAL,
  CIV7_MARINE_BIOME_GLOBAL,
  type Civ7BiomeGlobal,
} from "@civ7/map-policy";
import { BIOME_SYMBOL_ORDER, type BiomeSymbol } from "@mapgen/domain/ecology";

const SWOOPER_LAND_BIOME_PROJECTION = {
  snow: CIV7_BIOME_GLOBAL.TUNDRA,
  tundra: CIV7_BIOME_GLOBAL.TUNDRA,
  boreal: CIV7_BIOME_GLOBAL.TUNDRA,
  temperateDry: CIV7_BIOME_GLOBAL.PLAINS,
  temperateHumid: CIV7_BIOME_GLOBAL.GRASSLAND,
  tropicalSeasonal: CIV7_BIOME_GLOBAL.PLAINS,
  tropicalRainforest: CIV7_BIOME_GLOBAL.TROPICAL,
  desert: CIV7_BIOME_GLOBAL.DESERT,
} as const satisfies Readonly<Record<BiomeSymbol, Civ7BiomeGlobal>>;

type BiomeGlobalResolver = Readonly<{
  getBiomeGlobal(key: Civ7BiomeGlobal): number;
}>;

type ResolvedEngineBiomeIds = Readonly<{
  land: Record<BiomeSymbol, number>;
  marine: number;
}>;

function isEngineBiomeId(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

/**
 * Resolves the stage-owned biome projection policy against the active Civ7 adapter.
 * Missing or non-numeric globals fail closed so projection cannot silently substitute a biome.
 */
export function resolveEngineBiomeIds(adapter: BiomeGlobalResolver): ResolvedEngineBiomeIds {
  const land = {} as Record<BiomeSymbol, number>;
  for (const symbol of BIOME_SYMBOL_ORDER) {
    const key = SWOOPER_LAND_BIOME_PROJECTION[symbol];
    const resolvedId = adapter.getBiomeGlobal(key);
    if (!isEngineBiomeId(resolvedId)) {
      throw new Error(
        `resolveEngineBiomeIds: missing biome global "${key}" for symbol "${symbol}"`
      );
    }
    land[symbol] = resolvedId;
  }

  const marine = adapter.getBiomeGlobal(CIV7_MARINE_BIOME_GLOBAL);
  if (!isEngineBiomeId(marine)) {
    throw new Error(
      `resolveEngineBiomeIds: missing biome global "${CIV7_MARINE_BIOME_GLOBAL}" for marine`
    );
  }

  return { land, marine };
}

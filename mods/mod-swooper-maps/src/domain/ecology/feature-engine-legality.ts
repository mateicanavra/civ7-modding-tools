import { BIOME_SYMBOL_TO_INDEX, type FeatureKey } from "./types.js";

export type EngineFeatureLegality = Readonly<{
  terrain: string;
  biome: string;
  internalBiomeIndexes: ReadonlySet<number>;
}>;

export const ENGINE_FEATURE_LEGALITY_BY_KEY: Readonly<Partial<Record<FeatureKey, EngineFeatureLegality>>> = {
  FEATURE_FOREST: {
    terrain: "TERRAIN_FLAT",
    biome: "BIOME_GRASSLAND",
    internalBiomeIndexes: new Set([BIOME_SYMBOL_TO_INDEX.temperateHumid]),
  },
  FEATURE_RAINFOREST: {
    terrain: "TERRAIN_FLAT",
    biome: "BIOME_TROPICAL",
    internalBiomeIndexes: new Set([BIOME_SYMBOL_TO_INDEX.tropicalRainforest]),
  },
  FEATURE_TAIGA: {
    terrain: "TERRAIN_FLAT",
    biome: "BIOME_TUNDRA",
    internalBiomeIndexes: new Set([
      BIOME_SYMBOL_TO_INDEX.snow,
      BIOME_SYMBOL_TO_INDEX.tundra,
      BIOME_SYMBOL_TO_INDEX.boreal,
    ]),
  },
  FEATURE_SAVANNA_WOODLAND: {
    terrain: "TERRAIN_FLAT",
    biome: "BIOME_PLAINS",
    internalBiomeIndexes: new Set([BIOME_SYMBOL_TO_INDEX.tropicalSeasonal]),
  },
  FEATURE_SAGEBRUSH_STEPPE: {
    terrain: "TERRAIN_FLAT",
    biome: "BIOME_DESERT",
    internalBiomeIndexes: new Set([BIOME_SYMBOL_TO_INDEX.desert]),
  },
  FEATURE_MARSH: {
    terrain: "TERRAIN_FLAT",
    biome: "BIOME_GRASSLAND",
    internalBiomeIndexes: new Set([BIOME_SYMBOL_TO_INDEX.temperateHumid]),
  },
  FEATURE_TUNDRA_BOG: {
    terrain: "TERRAIN_FLAT",
    biome: "BIOME_TUNDRA",
    internalBiomeIndexes: new Set([
      BIOME_SYMBOL_TO_INDEX.snow,
      BIOME_SYMBOL_TO_INDEX.tundra,
      BIOME_SYMBOL_TO_INDEX.boreal,
    ]),
  },
  FEATURE_MANGROVE: {
    terrain: "TERRAIN_FLAT",
    biome: "BIOME_TROPICAL",
    internalBiomeIndexes: new Set([BIOME_SYMBOL_TO_INDEX.tropicalRainforest]),
  },
  FEATURE_OASIS: {
    terrain: "TERRAIN_FLAT",
    biome: "BIOME_DESERT",
    internalBiomeIndexes: new Set([BIOME_SYMBOL_TO_INDEX.desert]),
  },
  FEATURE_WATERING_HOLE: {
    terrain: "TERRAIN_FLAT",
    biome: "BIOME_PLAINS",
    internalBiomeIndexes: new Set([BIOME_SYMBOL_TO_INDEX.tropicalSeasonal]),
  },
  FEATURE_REEF: {
    terrain: "TERRAIN_COAST",
    biome: "BIOME_MARINE",
    internalBiomeIndexes: new Set(),
  },
  FEATURE_COLD_REEF: {
    terrain: "TERRAIN_COAST",
    biome: "BIOME_MARINE",
    internalBiomeIndexes: new Set(),
  },
  FEATURE_ATOLL: {
    terrain: "TERRAIN_OCEAN",
    biome: "BIOME_MARINE",
    internalBiomeIndexes: new Set(),
  },
  FEATURE_LOTUS: {
    terrain: "TERRAIN_COAST",
    biome: "BIOME_MARINE",
    internalBiomeIndexes: new Set(),
  },
};

export function getEngineFeatureLegality(feature: string): EngineFeatureLegality | undefined {
  return ENGINE_FEATURE_LEGALITY_BY_KEY[feature as FeatureKey];
}

export function isEngineCompatibleInternalBiome(feature: string, biomeIndex: number): boolean {
  const legality = getEngineFeatureLegality(feature);
  if (!legality) return false;
  if (legality.internalBiomeIndexes.size === 0) return true;
  return legality.internalBiomeIndexes.has(biomeIndex);
}

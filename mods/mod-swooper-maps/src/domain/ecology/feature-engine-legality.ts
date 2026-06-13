import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";

import { BIOME_SYMBOL_TO_INDEX, FEATURE_PLACEMENT_KEYS, type FeatureKey } from "./types.js";

export type EngineFeatureLegality = Readonly<{
  terrain: string;
  biome: string;
  terrains: readonly string[];
  biomes: readonly string[];
  internalBiomeIndexes: ReadonlySet<number>;
}>;

const INTERNAL_BIOMES_BY_ENGINE_BIOME: Readonly<Record<string, readonly number[]>> = {
  BIOME_DESERT: [BIOME_SYMBOL_TO_INDEX.desert],
  BIOME_GRASSLAND: [BIOME_SYMBOL_TO_INDEX.temperateHumid],
  BIOME_MARINE: [],
  BIOME_PLAINS: [BIOME_SYMBOL_TO_INDEX.temperateDry, BIOME_SYMBOL_TO_INDEX.tropicalSeasonal],
  BIOME_TROPICAL: [BIOME_SYMBOL_TO_INDEX.tropicalRainforest],
  BIOME_TUNDRA: [
    BIOME_SYMBOL_TO_INDEX.snow,
    BIOME_SYMBOL_TO_INDEX.tundra,
    BIOME_SYMBOL_TO_INDEX.boreal,
  ],
};

function nameByIndex(record: Readonly<Record<string, number>>, index: number): string | undefined {
  return Object.entries(record).find(([, value]) => value === index)?.[0];
}

function validNames(
  indicesByFeature: Readonly<Record<string, readonly number[]>>,
  nameToIndex: Readonly<Record<string, number>>,
  featureIndex: number
): string[] {
  const indices = indicesByFeature[String(featureIndex)] ?? [];
  return indices
    .map((index) => nameByIndex(nameToIndex, index))
    .filter((value): value is string => typeof value === "string");
}

function buildEngineFeatureLegality(): Readonly<
  Partial<Record<FeatureKey, EngineFeatureLegality>>
> {
  const out: Partial<Record<FeatureKey, EngineFeatureLegality>> = {};
  for (const feature of FEATURE_PLACEMENT_KEYS) {
    const featureIndex = CIV7_BROWSER_TABLES_V0.featureTypes[feature];
    const terrains = validNames(
      CIV7_BROWSER_TABLES_V0.featureValidTerrainTypeIndices,
      CIV7_BROWSER_TABLES_V0.terrainTypeIndices,
      featureIndex
    );
    const biomes = validNames(
      CIV7_BROWSER_TABLES_V0.featureValidBiomeTypeIndices,
      CIV7_BROWSER_TABLES_V0.biomeGlobals,
      featureIndex
    );
    if (terrains.length === 0 || biomes.length === 0) continue;

    out[feature] = {
      terrain: terrains[0]!,
      biome: biomes[0]!,
      terrains,
      biomes,
      internalBiomeIndexes: new Set(
        biomes.flatMap((biome) => INTERNAL_BIOMES_BY_ENGINE_BIOME[biome] ?? [])
      ),
    };
  }
  return out;
}

export const ENGINE_FEATURE_LEGALITY_BY_KEY = buildEngineFeatureLegality();

export function getEngineFeatureLegality(feature: string): EngineFeatureLegality | undefined {
  return ENGINE_FEATURE_LEGALITY_BY_KEY[feature as FeatureKey];
}

export function isEngineCompatibleInternalBiome(feature: string, biomeIndex: number): boolean {
  const legality = getEngineFeatureLegality(feature);
  if (!legality) return false;
  if (legality.internalBiomeIndexes.size === 0) return true;
  return legality.internalBiomeIndexes.has(biomeIndex);
}

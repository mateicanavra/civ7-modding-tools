import { CIV7_BROWSER_TABLES_V0 } from "./civ7-tables.gen.js";

export type FeatureKey = Extract<keyof typeof CIV7_BROWSER_TABLES_V0.featureTypes, string>;
export type PlotEffectKey = `PLOTEFFECT_${string}`;

export type EngineFeatureLegality = Readonly<{
  terrain: string;
  biome: string;
  terrains: readonly string[];
  biomes: readonly string[];
}>;

function hasOfficialFeatureLegality(featureKey: string): featureKey is FeatureKey {
  const featureIndex = CIV7_BROWSER_TABLES_V0.featureTypes[featureKey as FeatureKey];
  if (featureIndex == null) return false;
  const validTerrain =
    CIV7_BROWSER_TABLES_V0.featureValidTerrainTypeIndices[
      String(featureIndex) as keyof typeof CIV7_BROWSER_TABLES_V0.featureValidTerrainTypeIndices
    ];
  const validBiome =
    CIV7_BROWSER_TABLES_V0.featureValidBiomeTypeIndices[
      String(featureIndex) as keyof typeof CIV7_BROWSER_TABLES_V0.featureValidBiomeTypeIndices
    ];
  return (
    Array.isArray(validTerrain) &&
    validTerrain.length > 0 &&
    Array.isArray(validBiome) &&
    validBiome.length > 0
  );
}

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
  const featureKeys = Object.keys(CIV7_BROWSER_TABLES_V0.featureTypes)
    .filter(hasOfficialFeatureLegality)
    .sort(
      (a, b) => CIV7_BROWSER_TABLES_V0.featureTypes[a] - CIV7_BROWSER_TABLES_V0.featureTypes[b]
    );
  for (const feature of featureKeys) {
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
    };
  }
  return out;
}

export const ENGINE_FEATURE_LEGALITY_BY_KEY = buildEngineFeatureLegality();

export function getEngineFeatureLegality(feature: string): EngineFeatureLegality | undefined {
  return ENGINE_FEATURE_LEGALITY_BY_KEY[feature as FeatureKey];
}

function isEcologyPlacedOfficialFeature(featureKey: string): featureKey is FeatureKey {
  const featureIndex = CIV7_BROWSER_TABLES_V0.featureTypes[featureKey as FeatureKey];
  if (featureIndex == null) return false;
  if (featureKey === "FEATURE_VOLCANO") return false;
  const policy =
    CIV7_BROWSER_TABLES_V0.featurePolicies[
      String(featureIndex) as keyof typeof CIV7_BROWSER_TABLES_V0.featurePolicies
    ];
  if (policy && "naturalWonderTiles" in policy) return false;
  return hasOfficialFeatureLegality(featureKey);
}

export const FEATURE_PLACEMENT_KEYS: readonly FeatureKey[] = Object.keys(
  CIV7_BROWSER_TABLES_V0.featureTypes
)
  .filter(isEcologyPlacedOfficialFeature)
  .sort((a, b) => CIV7_BROWSER_TABLES_V0.featureTypes[a] - CIV7_BROWSER_TABLES_V0.featureTypes[b]);

export const FEATURE_KEY_INDEX: Readonly<Record<FeatureKey, number>> =
  FEATURE_PLACEMENT_KEYS.reduce(
    (acc, key, index) => {
      acc[key] = index;
      return acc;
    },
    {} as Record<FeatureKey, number>
  );

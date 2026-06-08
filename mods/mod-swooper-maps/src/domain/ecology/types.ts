import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";

export type BiomeSymbol =
  | "snow"
  | "tundra"
  | "boreal"
  | "temperateDry"
  | "temperateHumid"
  | "tropicalSeasonal"
  | "tropicalRainforest"
  | "desert";

export const BIOME_SYMBOL_ORDER: ReadonlyArray<BiomeSymbol> = [
  "snow",
  "tundra",
  "boreal",
  "temperateDry",
  "temperateHumid",
  "tropicalSeasonal",
  "tropicalRainforest",
  "desert",
];

export type FeatureKey = Extract<keyof typeof CIV7_BROWSER_TABLES_V0.featureTypes, string>;

function isEcologyPlacedOfficialFeature(featureKey: string): featureKey is FeatureKey {
  const featureIndex = CIV7_BROWSER_TABLES_V0.featureTypes[featureKey as FeatureKey];
  if (featureIndex == null) return false;
  if (featureKey === "FEATURE_VOLCANO") return false;
  const policy =
    CIV7_BROWSER_TABLES_V0.featurePolicies[String(featureIndex) as keyof typeof CIV7_BROWSER_TABLES_V0.featurePolicies];
  if (policy && "naturalWonderTiles" in policy) return false;
  const validTerrain =
    CIV7_BROWSER_TABLES_V0.featureValidTerrainTypeIndices[
      String(featureIndex) as keyof typeof CIV7_BROWSER_TABLES_V0.featureValidTerrainTypeIndices
    ];
  const validBiome =
    CIV7_BROWSER_TABLES_V0.featureValidBiomeTypeIndices[
      String(featureIndex) as keyof typeof CIV7_BROWSER_TABLES_V0.featureValidBiomeTypeIndices
    ];
  return Array.isArray(validTerrain) && validTerrain.length > 0 && Array.isArray(validBiome) && validBiome.length > 0;
}

export const FEATURE_PLACEMENT_KEYS: ReadonlyArray<FeatureKey> = Object.keys(
  CIV7_BROWSER_TABLES_V0.featureTypes
)
  .filter(isEcologyPlacedOfficialFeature)
  .sort(
    (a, b) =>
      CIV7_BROWSER_TABLES_V0.featureTypes[a] - CIV7_BROWSER_TABLES_V0.featureTypes[b]
  );

export const FEATURE_KEY_INDEX = FEATURE_PLACEMENT_KEYS.reduce((acc, key, index) => {
  acc[key] = index;
  return acc;
}, {} as Record<FeatureKey, number>);

export type PlotEffectKey = `PLOTEFFECT_${string}`;

export const BIOME_SYMBOL_TO_INDEX: Readonly<Record<BiomeSymbol, number>> = Object.freeze(
  BIOME_SYMBOL_ORDER.reduce(
    (acc, symbol, index) => {
      acc[symbol] = index;
      return acc;
    },
    {} as Record<BiomeSymbol, number>
  )
);

export function biomeSymbolFromIndex(index: number): BiomeSymbol {
  return BIOME_SYMBOL_ORDER[Math.max(0, Math.min(BIOME_SYMBOL_ORDER.length - 1, index))];
}

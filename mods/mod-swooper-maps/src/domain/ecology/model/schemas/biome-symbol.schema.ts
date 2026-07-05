import { Type } from "@swooper/mapgen-core/authoring/contracts";

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

export const BiomeSymbolSchema = Type.Union(
  [
    Type.Literal("snow"),
    Type.Literal("tundra"),
    Type.Literal("boreal"),
    Type.Literal("temperateDry"),
    Type.Literal("temperateHumid"),
    Type.Literal("tropicalSeasonal"),
    Type.Literal("tropicalRainforest"),
    Type.Literal("desert"),
  ],
  {
    description:
      "Biome symbol names used by the ecology classifier (maps to engine biome bindings).",
  }
);

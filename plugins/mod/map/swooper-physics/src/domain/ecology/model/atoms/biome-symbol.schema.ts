import { Type } from "@swooper/mapgen-core/authoring/schema";

/** Stable ordinal order used by biome-index artifacts and visual projections. */
export const BIOME_SYMBOL_ORDER = [
  "snow",
  "tundra",
  "boreal",
  "temperateDry",
  "temperateHumid",
  "tropicalSeasonal",
  "tropicalRainforest",
  "desert",
] as const;

/** Semantic biome identities produced by Ecology before Civ7 projection chooses engine IDs. */
export type BiomeSymbol = (typeof BIOME_SYMBOL_ORDER)[number];

/**
 * Maps every Ecology biome symbol to its stable artifact and visualization encoding.
 *
 * Consumers use this table rather than relying on incidental array or engine ordinals.
 */
export const BIOME_SYMBOL_TO_INDEX: Readonly<Record<BiomeSymbol, number>> = Object.freeze(
  BIOME_SYMBOL_ORDER.reduce(
    (acc, symbol, index) => {
      acc[symbol] = index;
      return acc;
    },
    {} as Record<BiomeSymbol, number>
  )
);

/** Resolves a stored biome index while clamping malformed edge values to the admitted range. */
export function biomeSymbolFromIndex(index: number): BiomeSymbol {
  return BIOME_SYMBOL_ORDER[Math.max(0, Math.min(BIOME_SYMBOL_ORDER.length - 1, index))];
}

/** Runtime schema for Ecology's engine-independent biome vocabulary. */
export const BiomeSymbolSchema = Type.Enum(BIOME_SYMBOL_ORDER, {
  description:
    "Engine-independent biome identities produced by Ecology and translated only at Civ7 projection.",
});

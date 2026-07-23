import { BIOME_SYMBOL_ORDER } from "@mapgen/domain/ecology";
import type { VizLayerCategory } from "@swooper/mapgen-viz";

/**
 * Stage-owned biome visualization categories shared by the biome truth stage
 * and the map-ecology projection stage.
 *
 * `ecology-biomes` owns the biome index artifact, so it also owns the palette
 * contract that explains those numeric indices to downstream visualizers. The
 * projection stage may consume this stage-level surface, but it must not reach
 * into `ecology-biomes/steps/*` internals where step-local wiring can change.
 */
export const BIOME_INDEX_VIZ_CATEGORIES = [
  { value: 255, label: "Water/Unknown", color: [148, 163, 184, 0] },
  { value: 0, label: "snow", color: [255, 255, 255, 240] },
  { value: 1, label: "tundra", color: [147, 197, 253, 235] },
  { value: 2, label: "boreal", color: [34, 197, 94, 235] },
  { value: 3, label: "temperateDry", color: [132, 204, 22, 235] },
  { value: 4, label: "temperateHumid", color: [22, 163, 74, 235] },
  { value: 5, label: "tropicalSeasonal", color: [250, 204, 21, 235] },
  { value: 6, label: "tropicalRainforest", color: [21, 128, 61, 235] },
  { value: 7, label: "desert", color: [245, 158, 11, 235] },
] as const satisfies readonly [VizLayerCategory, ...VizLayerCategory[]];

/** Ensures visualization categories cover every biome symbol plus the water/unknown sentinel. */
export function assertBiomeIndexVizCategoriesCoverSymbols(): void {
  const maxSymbolValue = BIOME_SYMBOL_ORDER.length - 1;
  const values = new Set<number>(BIOME_INDEX_VIZ_CATEGORIES.map((category) => category.value));
  for (let i = 0; i <= maxSymbolValue; i++) {
    if (!values.has(i)) {
      throw new Error(
        `BiomeIndex viz categories missing value=${i} (${BIOME_SYMBOL_ORDER[i] ?? "?"}).`
      );
    }
  }
  if (!values.has(255)) {
    throw new Error("BiomeIndex viz categories missing sentinel value=255 (Water/Unknown).");
  }
}

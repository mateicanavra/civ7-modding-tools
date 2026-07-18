import { BIOME_SYMBOL_ORDER, type BiomeSymbol } from "@mapgen/domain/ecology";
import type { VizLayerCategory } from "@swooper/mapgen-viz";

import { BIOME_INDEX_VIZ_CATEGORIES } from "../ecology-biomes/viz.js";
import type { ResolvedEngineBiomeIds } from "./steps/plot-biomes/engine-biome-bindings.js";

const MARINE_LABEL = "marine";
type NumericVizLayerCategory = VizLayerCategory & Readonly<{ value: number }>;
const MARINE_COLOR: VizLayerCategory["color"] = [59, 130, 246, 210];

function colorForBiomeSymbol(symbol: BiomeSymbol): VizLayerCategory["color"] {
  const category = BIOME_INDEX_VIZ_CATEGORIES.find((c) => c.label === symbol);
  if (!category) {
    throw new Error(`Missing BIOME_INDEX_VIZ_CATEGORIES color for symbol "${symbol}".`);
  }
  return category.color;
}

/**
 * Builds stable categories/colors for engine biome ids.
 *
 * Notes:
 * - Engine ids are resolved from globals at runtime; categories are computed dynamically.
 * - If multiple biome symbols map to the same engine id, labels are combined deterministically.
 * - Colors reuse the truth biome palette where possible.
 */
export function buildEngineBiomeIdVizCategories(
  args: ResolvedEngineBiomeIds
): readonly [NumericVizLayerCategory, ...NumericVizLayerCategory[]] {
  const byEngineId = new Map<number, { symbols: BiomeSymbol[]; marine: boolean }>();

  for (const symbol of BIOME_SYMBOL_ORDER) {
    const engineId = args.land[symbol];
    const bucket = byEngineId.get(engineId) ?? { symbols: [], marine: false };
    bucket.symbols.push(symbol);
    byEngineId.set(engineId, bucket);
  }

  const marineBucket = byEngineId.get(args.marine) ?? { symbols: [], marine: false };
  marineBucket.marine = true;
  byEngineId.set(args.marine, marineBucket);

  const out: NumericVizLayerCategory[] = [];
  for (const [engineId, bucket] of byEngineId.entries()) {
    const symbols = bucket.symbols
      .slice()
      .sort((a, b) => BIOME_SYMBOL_ORDER.indexOf(a) - BIOME_SYMBOL_ORDER.indexOf(b));
    const labelParts: string[] = [...symbols];
    if (bucket.marine) labelParts.push(MARINE_LABEL);

    const firstSymbol = symbols[0];
    let color: VizLayerCategory["color"] = MARINE_COLOR;
    if (firstSymbol) color = colorForBiomeSymbol(firstSymbol);

    out.push({
      value: engineId,
      label: labelParts.join("|"),
      color,
    });
  }

  // Deterministic ordering (engine ids are the values being visualized).
  out.sort((a, b) => a.value - b.value);
  const first = out[0];
  if (!first) throw new Error("Engine biome visualization categories require a marine binding.");
  return [first, ...out.slice(1)];
}

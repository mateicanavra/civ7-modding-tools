import type { BiomeSymbol } from "@mapgen/domain/ecology";
import { BIOME_SYMBOL_ORDER } from "@mapgen/domain/ecology/types.js";

import { BIOME_INDEX_VIZ_CATEGORIES } from "../../../ecology/steps/biomes/viz.js";

export type VizCategory = Readonly<{
  value: number;
  label: string;
  color: readonly [number, number, number, number];
}>;

const MARINE_LABEL = "marine";
const MARINE_COLOR: VizCategory["color"] = [59, 130, 246, 210];

function colorForBiomeSymbol(symbol: BiomeSymbol): VizCategory["color"] {
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
export function buildEngineBiomeIdVizCategories(args: {
  land: Record<BiomeSymbol, number>;
  marine: number;
}): ReadonlyArray<VizCategory> {
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

  const out: VizCategory[] = [];
  for (const [engineId, bucket] of byEngineId.entries()) {
    const symbols = bucket.symbols.slice().sort((a, b) => BIOME_SYMBOL_ORDER.indexOf(a) - BIOME_SYMBOL_ORDER.indexOf(b));
    const labelParts = symbols.slice();
    if (bucket.marine) labelParts.push(MARINE_LABEL);

    let color: VizCategory["color"] = MARINE_COLOR;
    if (symbols.length > 0) color = colorForBiomeSymbol(symbols[0]!);

    out.push({
      value: engineId,
      label: labelParts.join("|"),
      color,
    });
  }

  // Deterministic ordering (engine ids are the values being visualized).
  out.sort((a, b) => a.value - b.value);
  return out;
}


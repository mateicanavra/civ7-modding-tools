import type { EngineAdapter } from "@civ7/adapter";
import { FEATURE_PLACEMENT_KEYS, type FeatureKey } from "@mapgen/domain/ecology";

export type VizCategory = Readonly<{
  value: number;
  label: string;
  color: readonly [number, number, number, number];
}>;

export const FEATURE_TYPE_NONE_VALUE = -1;

export const FEATURE_TYPE_VIZ_COLORS_BY_KEY: Readonly<Record<FeatureKey, VizCategory["color"]>> = {
  FEATURE_FOREST: [34, 197, 94, 235],
  FEATURE_RAINFOREST: [21, 128, 61, 235],
  FEATURE_TAIGA: [16, 185, 129, 235],
  FEATURE_SAVANNA_WOODLAND: [234, 179, 8, 235],
  FEATURE_SAGEBRUSH_STEPPE: [180, 83, 9, 235],
  FEATURE_MARSH: [74, 222, 128, 235],
  FEATURE_TUNDRA_BOG: [148, 163, 184, 235],
  FEATURE_MANGROVE: [101, 163, 13, 235],
  FEATURE_OASIS: [6, 182, 212, 235],
  FEATURE_WATERING_HOLE: [59, 130, 246, 235],
  FEATURE_REEF: [14, 165, 233, 235],
  FEATURE_COLD_REEF: [37, 99, 235, 235],
  FEATURE_ATOLL: [125, 211, 252, 235],
  FEATURE_LOTUS: [244, 114, 182, 235],
  FEATURE_ICE: [255, 255, 255, 240],
} as const;

const NONE_CATEGORY: VizCategory = Object.freeze({
  value: FEATURE_TYPE_NONE_VALUE,
  label: "None",
  color: [148, 163, 184, 0] as const,
});

function colorForKey(key: FeatureKey): VizCategory["color"] {
  const color = FEATURE_TYPE_VIZ_COLORS_BY_KEY[key];
  if (!color) throw new Error(`Missing FEATURE_TYPE_VIZ_COLORS_BY_KEY entry for "${key}".`);
  return color;
}

/**
 * Builds stable categories/colors for engine featureType indices.
 *
 * Notes:
 * - Engine ids are resolved at runtime; categories are computed dynamically.
 * - If multiple keys map to the same engine id, labels are combined deterministically.
 * - Colors are explicit per feature key (no auto palette).
 */
export function buildFeatureTypeVizCategories(adapter: EngineAdapter): ReadonlyArray<VizCategory> {
  const byEngineId = new Map<number, FeatureKey[]>();

  for (const key of FEATURE_PLACEMENT_KEYS) {
    const engineId = adapter.getFeatureTypeIndex(key);
    if (typeof engineId !== "number" || Number.isNaN(engineId) || engineId < 0) {
      throw new Error(`buildFeatureTypeVizCategories: missing engine feature for key "${key}".`);
    }
    const bucket = byEngineId.get(engineId) ?? [];
    bucket.push(key);
    byEngineId.set(engineId, bucket);
  }

  const out: VizCategory[] = [NONE_CATEGORY];

  for (const [engineId, keys] of byEngineId.entries()) {
    const orderedKeys = keys
      .slice()
      .sort((a, b) => FEATURE_PLACEMENT_KEYS.indexOf(a) - FEATURE_PLACEMENT_KEYS.indexOf(b));
    out.push({
      value: engineId,
      label: orderedKeys.join("|"),
      color: colorForKey(orderedKeys[0]!),
    });
  }

  out.sort((a, b) => a.value - b.value);
  return out;
}

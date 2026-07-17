import type { EngineAdapter } from "@civ7/adapter";
import { FEATURE_PLACEMENT_KEYS, type FeatureKey } from "@civ7/map-policy";

export type VizCategory = Readonly<{
  value: number;
  label: string;
  color: readonly [number, number, number, number];
}>;

/**
 * Sentinel used when no Civ7 feature ID is present in a visualization tile. It stays outside
 * the non-negative engine ID range so ‘none’ cannot collide with a real feature type.
 */
export const FEATURE_TYPE_NONE_VALUE = -1;
const UNKNOWN_FEATURE_COLOR: VizCategory["color"] = [148, 163, 184, 180];

/**
 * Stable RGBA category colors for every authored Civ7 feature key. Module initialization checks
 * catalog completeness so a new placeable feature cannot silently receive an arbitrary palette.
 */
export const FEATURE_TYPE_VIZ_COLORS_BY_KEY: Readonly<
  Partial<Record<FeatureKey, VizCategory["color"]>>
> = {
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
  FEATURE_DESERT_FLOODPLAIN_MINOR: [217, 119, 6, 235],
  FEATURE_DESERT_FLOODPLAIN_NAVIGABLE: [245, 158, 11, 235],
  FEATURE_GRASSLAND_FLOODPLAIN_MINOR: [132, 204, 22, 235],
  FEATURE_GRASSLAND_FLOODPLAIN_NAVIGABLE: [101, 163, 13, 235],
  FEATURE_PLAINS_FLOODPLAIN_MINOR: [190, 242, 100, 235],
  FEATURE_PLAINS_FLOODPLAIN_NAVIGABLE: [163, 230, 53, 235],
  FEATURE_TROPICAL_FLOODPLAIN_MINOR: [45, 212, 191, 235],
  FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE: [20, 184, 166, 235],
  FEATURE_TUNDRA_FLOODPLAIN_MINOR: [125, 211, 252, 235],
  FEATURE_TUNDRA_FLOODPLAIN_NAVIGABLE: [56, 189, 248, 235],
} as const;

for (const key of FEATURE_PLACEMENT_KEYS) {
  if (!FEATURE_TYPE_VIZ_COLORS_BY_KEY[key]) {
    throw new Error(`Missing FEATURE_TYPE_VIZ_COLORS_BY_KEY entry for "${key}".`);
  }
}

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
export function buildFeatureTypeVizCategories(
  adapter: EngineAdapter,
  observedFeatureTypes?: Int16Array | ReadonlyArray<number>
): ReadonlyArray<VizCategory> {
  const byEngineId = new Map<number, FeatureKey[]>();

  for (const key of FEATURE_PLACEMENT_KEYS) {
    const engineId = adapter.getFeatureTypeIndex(key);
    if (typeof engineId !== "number" || Number.isNaN(engineId) || engineId < 0) continue;
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

  if (observedFeatureTypes) {
    const seen = new Set<number>();
    for (const value of observedFeatureTypes) {
      if (!Number.isFinite(value) || value < 0) continue;
      seen.add(value | 0);
    }
    for (const engineId of seen) {
      if (byEngineId.has(engineId)) continue;
      out.push({
        value: engineId,
        label: `FEATURE_ID_${engineId}`,
        color: UNKNOWN_FEATURE_COLOR,
      });
    }
  }

  out.sort((a, b) => a.value - b.value);
  return out;
}

import { FEATURE_PLACEMENT_KEYS, type FeatureKey } from "@civ7/map-policy";

/** Holds the closed official-feature identity mapping resolved from one adapter snapshot. */
export type FeatureKeyLookups = {
  byKey: Record<FeatureKey, number>;
};

/** Resolves every supported Civ7 feature key to its current engine identity. */
export function resolveFeatureKeyLookups(
  getFeatureTypeIndex: (key: FeatureKey) => number
): FeatureKeyLookups {
  const byKey = {} as Record<FeatureKey, number>;

  for (const key of FEATURE_PLACEMENT_KEYS) {
    const engineId = getFeatureTypeIndex(key);
    if (typeof engineId !== "number" || Number.isNaN(engineId) || engineId < 0) {
      throw new Error(`FeaturesStep: Missing engine feature for key "${key}".`);
    }
    byKey[key] = engineId;
  }

  return { byKey };
}

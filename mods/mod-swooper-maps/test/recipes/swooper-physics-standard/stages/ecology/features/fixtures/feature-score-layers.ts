import {
  FEATURE_INTENT_KEYS,
  type FeatureIntentKey,
} from "@mapgen/domain/ecology/model/schemas/index.js";

/** Complete feature-intent score surface used by ecology-feature step fixtures. */
export type TestFeatureScoreLayers = Record<FeatureIntentKey, Float32Array>;

/**
 * Creates one zeroed score grid for every admitted feature intent.
 * Step tests selectively populate only the intent whose planning behavior they own.
 */
export function createEmptyFeatureScoreLayers(size: number): TestFeatureScoreLayers {
  return Object.fromEntries(
    FEATURE_INTENT_KEYS.map((key) => [key, new Float32Array(size)])
  ) as TestFeatureScoreLayers;
}

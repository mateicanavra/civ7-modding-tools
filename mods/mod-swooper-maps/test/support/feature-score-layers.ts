import {
  FEATURE_INTENT_KEYS,
  type FeatureIntentKey,
} from "@mapgen/domain/ecology/model/schemas/index.js";

export type TestFeatureScoreLayers = Record<FeatureIntentKey, Float32Array>;

export function createEmptyFeatureScoreLayers(size: number): TestFeatureScoreLayers {
  return Object.fromEntries(
    FEATURE_INTENT_KEYS.map((key) => [key, new Float32Array(size)])
  ) as TestFeatureScoreLayers;
}

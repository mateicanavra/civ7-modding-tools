import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import { standardConfig } from "./standard-config.js";

export type DeterminismCase = {
  label: string;
  seed: number;
  width: number;
  height: number;
  config: StandardRecipeConfig;
};

function buildConfig(overrides: { plateCount?: number; plateActivity?: number }): StandardRecipeConfig {
  const config = structuredClone(standardConfig) as StandardRecipeConfig;
  config.foundation = {
    ...config.foundation,
    knobs: {
      ...config.foundation?.knobs,
      ...(overrides.plateCount != null ? { plateCount: overrides.plateCount } : null),
      ...(overrides.plateActivity != null ? { plateActivity: overrides.plateActivity } : null),
    },
  };
  return config;
}

// Float policy: fingerprints are byte-level hashes of TypedArray buffers (no quantization).
export const M1_DETERMINISM_CASES: DeterminismCase[] = [
  {
    label: "baseline-balanced",
    seed: 1337,
    width: 32,
    height: 20,
    config: buildConfig({ plateCount: 23, plateActivity: 0.5 }),
  },
  {
    label: "wrap-active",
    seed: 9001,
    width: 37,
    height: 23,
    config: buildConfig({ plateCount: 31, plateActivity: 0.85 }),
  },
  {
    label: "compact-low-plates",
    seed: 4242,
    width: 28,
    height: 18,
    config: buildConfig({ plateCount: 15, plateActivity: 0.25 }),
  },
];

import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import { standardConfig } from "./standard-config.js";

export type DeterminismCase = {
  label: string;
  seed: number;
  width: number;
  height: number;
  config: StandardRecipeConfig;
};

function buildConfig(overrides: {
  plateCount?: number;
  plateActivity?: number;
}): StandardRecipeConfig {
  const config = structuredClone(standardConfig);
  if (overrides.plateCount != null) {
    config["foundation-mantle"].meshResolution.plateCount = overrides.plateCount;
    config["foundation-lithosphere"].platePartition.plateCount = overrides.plateCount;
  }
  if (overrides.plateActivity != null) {
    config["foundation-tectonics"].knobs.plateActivity = overrides.plateActivity;
  }
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

import { createLabelRng } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import type { VolcanoIntent } from "../../../../model/atoms/volcano-intent.schema.js";
import PlanVolcanoesContract from "../../contract.js";
import { classifyVolcanoIntentKind, scoreVolcanoCandidate } from "../../rules/volcano-scoring.js";
import { admitsVolcanoSpacing } from "../../rules/volcano-spacing.js";
import { resolveTargetVolcanoes } from "../../rules/volcano-target.js";
import StrategyDefinition from "./config.js";

/** Binds the `plate-hotspot-ranking` algorithm to the shared `morphology/plan-volcanoes` operation contract. */
export default createStrategy(PlanVolcanoesContract, StrategyDefinition, {
  normalize: (config) =>
    config.maxVolcanoes >= config.minVolcanoes
      ? config
      : { ...config, maxVolcanoes: config.minVolcanoes },
  run: (input, config) => {
    const { width, height, landMask, boundaryCloseness, boundaryType, shieldStability, volcanism } =
      input;
    const size = width * height;
    const volcanoMask = new Uint8Array(size);

    if (!config.enabled) return { volcanoMask, volcanoes: [] };

    let landTiles = 0;
    for (let i = 0; i < size; i++) {
      if (landMask[i] === 1) landTiles++;
    }

    const targetVolcanoes = resolveTargetVolcanoes(landTiles, config);

    if (targetVolcanoes <= 0) return { volcanoMask, volcanoes: [] };

    const rng = createLabelRng(input.rngSeed | 0);
    const candidates: Array<{ index: number; weight: number }> = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (landMask[i] === 0) continue;

        const weight = scoreVolcanoCandidate({
          boundaryCloseness01: boundaryCloseness[i] / 255,
          boundaryType: boundaryType[i],
          shieldStability01: shieldStability[i] / 255,
          volcanism01: volcanism[i] / 255,
          config,
          rng,
        });
        if (weight > 0) candidates.push({ index: i, weight });
      }
    }

    if (candidates.length === 0) return { volcanoMask, volcanoes: [] };

    candidates.sort((left, right) => right.weight - left.weight || left.index - right.index);

    const placedIndices: number[] = [];
    for (const candidate of candidates) {
      if (placedIndices.length >= targetVolcanoes) break;
      if (!admitsVolcanoSpacing(candidate.index, placedIndices, config.minSpacing, width)) continue;
      placedIndices.push(candidate.index);
    }

    placedIndices.sort((left, right) => left - right);
    const volcanoes: VolcanoIntent[] = placedIndices.map((tileIndex) => {
      volcanoMask[tileIndex] = 1;
      return {
        tileIndex,
        kind: classifyVolcanoIntentKind(
          boundaryType[tileIndex],
          boundaryCloseness[tileIndex] / 255,
          config.boundaryThreshold
        ),
        strength01: volcanism[tileIndex] / 255,
      };
    });
    return { volcanoMask, volcanoes };
  },
});

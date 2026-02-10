import { clamp01 } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import { validateGridSize } from "../../score-shared/index.js";
import PlanWetlandsContract from "../contract.js";

export const defaultStrategy = createStrategy(PlanWetlandsContract, "default", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = validateGridSize({
      width,
      height,
      fields: [
        { label: "scoreMarsh01", arr: input.scoreMarsh01 as Float32Array },
        { label: "scoreTundraBog01", arr: input.scoreTundraBog01 as Float32Array },
        { label: "scoreMangrove01", arr: input.scoreMangrove01 as Float32Array },
        { label: "scoreOasis01", arr: input.scoreOasis01 as Float32Array },
        { label: "scoreWateringHole01", arr: input.scoreWateringHole01 as Float32Array },
        { label: "featureIndex", arr: input.featureIndex as Uint16Array },
        { label: "reserved", arr: input.reserved as Uint8Array },
      ],
    });

    const placements: Array<{ x: number; y: number; feature: string; weight?: number }> = [];
    const minScore01 = clamp01(config.minScore01);
    const rng = createLabelRng(input.seed);
    const candidates: string[] = [];

    for (let i = 0; i < size; i++) {
      if (input.reserved[i] !== 0) continue;
      if (input.featureIndex[i] !== 0) continue;

      const marsh = input.scoreMarsh01[i] ?? 0;
      const tundraBog = input.scoreTundraBog01[i] ?? 0;
      const mangrove = input.scoreMangrove01[i] ?? 0;
      const oasis = input.scoreOasis01[i] ?? 0;
      const wateringHole = input.scoreWateringHole01[i] ?? 0;

      let bestScore = marsh;
      candidates.length = 0;
      candidates.push("FEATURE_MARSH");

      if (tundraBog > bestScore) {
        bestScore = tundraBog;
        candidates.length = 0;
        candidates.push("FEATURE_TUNDRA_BOG");
      } else if (tundraBog === bestScore) {
        candidates.push("FEATURE_TUNDRA_BOG");
      }

      if (mangrove > bestScore) {
        bestScore = mangrove;
        candidates.length = 0;
        candidates.push("FEATURE_MANGROVE");
      } else if (mangrove === bestScore) {
        candidates.push("FEATURE_MANGROVE");
      }

      if (oasis > bestScore) {
        bestScore = oasis;
        candidates.length = 0;
        candidates.push("FEATURE_OASIS");
      } else if (oasis === bestScore) {
        candidates.push("FEATURE_OASIS");
      }

      if (wateringHole > bestScore) {
        bestScore = wateringHole;
        candidates.length = 0;
        candidates.push("FEATURE_WATERING_HOLE");
      } else if (wateringHole === bestScore) {
        candidates.push("FEATURE_WATERING_HOLE");
      }

      if (!Number.isFinite(bestScore) || bestScore < minScore01) continue;

      const feature =
        candidates.length === 1 ? candidates[0]! : candidates[rng(candidates.length, `wet:${i}`)]!;
      const x = i % width;
      const y = (i / width) | 0;
      placements.push({ x, y, feature });
    }

    return { placements };
  },
});

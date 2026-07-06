import { createStrategy } from "@swooper/mapgen-core/authoring";
import {
  choosePhysicalCandidate,
  confidenceFromScore01,
  stressFromConfidence01,
  validateGridSize,
} from "../../../model/policy/feature-score-selection.js";
import type { FeatureIntentKey } from "../../../model/schemas/index.js";
import PlanReefsContract from "../contract.js";
import { admitReefIntent, admitReefStride } from "../policy/index.js";

export const shippingLanesStrategy = createStrategy(PlanReefsContract, "shipping-lanes", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = validateGridSize({
      width,
      height,
      fields: [
        { label: "scoreReef01", arr: input.scoreReef01 as Float32Array },
        { label: "scoreColdReef01", arr: input.scoreColdReef01 as Float32Array },
        { label: "scoreAtoll01", arr: input.scoreAtoll01 as Float32Array },
        { label: "scoreLotus01", arr: input.scoreLotus01 as Float32Array },
        { label: "featureOccupancyMask", arr: input.featureOccupancyMask as Uint8Array },
        { label: "reserved", arr: input.reserved as Uint8Array },
      ],
    });

    const placements: Array<{ x: number; y: number; feature: FeatureIntentKey; weight?: number }> =
      [];
    void input.seed;

    for (let i = 0; i < size; i++) {
      if (input.reserved[i] !== 0) continue;
      if (input.featureOccupancyMask[i] !== 0) continue;

      const reef = input.scoreReef01[i] ?? 0;
      const coldReef = input.scoreColdReef01[i] ?? 0;
      const atoll = input.scoreAtoll01[i] ?? 0;
      const lotus = input.scoreLotus01[i] ?? 0;

      const reefConfidence01 = confidenceFromScore01(reef);
      const coldReefConfidence01 = confidenceFromScore01(coldReef);
      const atollConfidence01 = confidenceFromScore01(atoll);
      const lotusConfidence01 = confidenceFromScore01(lotus);

      const best = choosePhysicalCandidate([
        {
          feature: "reef",
          confidence01: reefConfidence01,
          stress01: stressFromConfidence01(reefConfidence01),
          tileIndex: i,
        },
        {
          feature: "cold-reef",
          confidence01: coldReefConfidence01,
          stress01: stressFromConfidence01(coldReefConfidence01),
          tileIndex: i,
        },
        {
          feature: "atoll",
          confidence01: atollConfidence01,
          stress01: stressFromConfidence01(atollConfidence01),
          tileIndex: i,
        },
        {
          feature: "lotus",
          confidence01: lotusConfidence01,
          stress01: stressFromConfidence01(lotusConfidence01),
          tileIndex: i,
        },
      ]);
      if (best === null) continue;
      if (!admitReefIntent(best, config)) continue;
      if (!admitReefStride(best, config)) continue;

      const x = i % width;
      const y = (i / width) | 0;

      // Stripe bias to mimic lanes/hops without introducing probabilistic gating.
      const stripe = (x + 2 * y) % 5 === 0;
      if (!stripe) continue;

      placements.push({ x, y, feature: best.feature });
    }
    return { placements };
  },
});

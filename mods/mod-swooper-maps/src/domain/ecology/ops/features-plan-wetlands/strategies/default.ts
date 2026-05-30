import { createStrategy } from "@swooper/mapgen-core/authoring";

import {
  choosePhysicalCandidate,
  confidenceFromScore01,
  stressFromConfidence01,
  validateGridSize,
} from "../../score-shared/index.js";
import { isEngineCompatibleInternalBiome } from "../../../feature-engine-legality.js";
import PlanWetlandsContract from "../contract.js";
import { admitWetlandIntent } from "../policies/index.js";

function isEngineCompatibleWetlandSurface(
  feature: string,
  tileIndex: number,
  flatLandMask: Uint8Array,
  biomeIndex: Uint8Array
): boolean {
  if (flatLandMask[tileIndex] !== 1) return false;
  return isEngineCompatibleInternalBiome(feature, biomeIndex[tileIndex] ?? 255);
}

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
        { label: "flatLandMask", arr: input.flatLandMask as Uint8Array },
        { label: "biomeIndex", arr: input.biomeIndex as Uint8Array },
        { label: "featureIndex", arr: input.featureIndex as Uint16Array },
        { label: "reserved", arr: input.reserved as Uint8Array },
      ],
    });
    const flatLandMask = input.flatLandMask as Uint8Array;
    const biomeIndex = input.biomeIndex as Uint8Array;

    const placements: Array<{ x: number; y: number; feature: string; weight?: number }> = [];
    void input.seed;

    for (let i = 0; i < size; i++) {
      if (input.reserved[i] !== 0) continue;
      if (input.featureIndex[i] !== 0) continue;

      const marsh = input.scoreMarsh01[i] ?? 0;
      const tundraBog = input.scoreTundraBog01[i] ?? 0;
      const mangrove = input.scoreMangrove01[i] ?? 0;
      const oasis = input.scoreOasis01[i] ?? 0;
      const wateringHole = input.scoreWateringHole01[i] ?? 0;

      const marshConfidence01 = confidenceFromScore01(marsh);
      const bogConfidence01 = confidenceFromScore01(tundraBog);
      const mangroveConfidence01 = confidenceFromScore01(mangrove);
      const oasisConfidence01 = confidenceFromScore01(oasis);
      const wateringHoleConfidence01 = confidenceFromScore01(wateringHole);

      const candidates = [
        {
          feature: "FEATURE_MARSH",
          confidence01: marshConfidence01,
          stress01: stressFromConfidence01(marshConfidence01),
          tileIndex: i,
        },
        {
          feature: "FEATURE_TUNDRA_BOG",
          confidence01: bogConfidence01,
          stress01: stressFromConfidence01(bogConfidence01),
          tileIndex: i,
        },
        {
          feature: "FEATURE_MANGROVE",
          confidence01: mangroveConfidence01,
          stress01: stressFromConfidence01(mangroveConfidence01),
          tileIndex: i,
        },
        {
          feature: "FEATURE_OASIS",
          confidence01: oasisConfidence01,
          stress01: stressFromConfidence01(oasisConfidence01),
          tileIndex: i,
        },
        {
          feature: "FEATURE_WATERING_HOLE",
          confidence01: wateringHoleConfidence01,
          stress01: stressFromConfidence01(wateringHoleConfidence01),
          tileIndex: i,
        },
      ] as const;

      const best = choosePhysicalCandidate(
        candidates.filter((candidate) =>
          isEngineCompatibleWetlandSurface(candidate.feature, i, flatLandMask, biomeIndex)
        )
      );
      if (best === null) continue;
      if (!admitWetlandIntent(best, config)) continue;

      const x = i % width;
      const y = (i / width) | 0;
      placements.push({ x, y, feature: best.feature });
    }

    return { placements };
  },
});

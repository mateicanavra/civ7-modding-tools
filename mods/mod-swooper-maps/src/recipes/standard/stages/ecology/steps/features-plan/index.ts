import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { FEATURE_PLACEMENT_KEYS } from "@mapgen/domain/ecology";
import { ecologyArtifacts } from "../../artifacts.js";
import { validateFeatureIntentsListArtifact } from "../../artifact-validation.js";
import FeaturesPlanStepContract from "./contract.js";

const GROUP_FEATURE_INTENTS = "Ecology / Feature Intents";

function labelFeatureKey(key: string): string {
  const trimmed = key.replace(/^FEATURE_/, "");
  return trimmed
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (hue < 60) {
    r = c;
    g = x;
  } else if (hue < 120) {
    r = x;
    g = c;
  } else if (hue < 180) {
    g = c;
    b = x;
  } else if (hue < 240) {
    g = x;
    b = c;
  } else if (hue < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function featureColor(index: number, count: number): [number, number, number, number] {
  const hue = (index / Math.max(1, count)) * 360;
  const [r, g, b] = hslToRgb(hue, 0.6, 0.5);
  return [r, g, b, 220];
}

export default createStep(FeaturesPlanStepContract, {
  artifacts: implementArtifacts(
    [ecologyArtifacts.featureIntentsVegetation],
    {
      featureIntentsVegetation: {
        validate: (value, context) => validateFeatureIntentsListArtifact(value, context.dimensions),
      },
    }
  ),
  run: (context, config, ops, deps) => {
    const classification = deps.artifacts.biomeClassification.read(context);
    const pedology = deps.artifacts.pedology.read(context);
    const topography = deps.artifacts.topography.read(context);
    const hydrography = deps.artifacts.hydrography.read(context);

    const { width, height } = context.dimensions;
    const size = width * height;
    const navigableRiverMask = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      navigableRiverMask[i] = hydrography.riverClass[i] === 2 ? 1 : 0;
    }

    const vegetationSubstrate = ops.vegetationSubstrate(
      {
        width,
        height,
        landMask: topography.landMask,
        effectiveMoisture: classification.effectiveMoisture,
        surfaceTemperature: classification.surfaceTemperature,
        aridityIndex: classification.aridityIndex,
        freezeIndex: classification.freezeIndex,
        vegetationDensity: classification.vegetationDensity,
        fertility: pedology.fertility,
      },
      config.vegetationSubstrate
    );

    const forestScore = ops.scoreForest(
      { width, height, landMask: topography.landMask, ...vegetationSubstrate },
      config.scoreForest
    ).score01;
    const rainforestScore = ops.scoreRainforest(
      { width, height, landMask: topography.landMask, ...vegetationSubstrate },
      config.scoreRainforest
    ).score01;
    const taigaScore = ops.scoreTaiga(
      { width, height, landMask: topography.landMask, ...vegetationSubstrate },
      config.scoreTaiga
    ).score01;
    const savannaWoodlandScore = ops.scoreSavannaWoodland(
      { width, height, landMask: topography.landMask, ...vegetationSubstrate },
      config.scoreSavannaWoodland
    ).score01;
    const sagebrushSteppeScore = ops.scoreSagebrushSteppe(
      { width, height, landMask: topography.landMask, ...vegetationSubstrate },
      config.scoreSagebrushSteppe
    ).score01;

    const vegetationPlacements: Array<{
      x: number;
      y: number;
      feature: (typeof FEATURE_PLACEMENT_KEYS)[number];
      weight: number;
    }> = [];

    const minScoreThreshold = config.vegetation?.minScoreThreshold ?? 0.15;
    const candidates: Array<{
      feature: (typeof FEATURE_PLACEMENT_KEYS)[number];
      score: Float32Array;
    }> = [
      { feature: "FEATURE_FOREST", score: forestScore },
      { feature: "FEATURE_RAINFOREST", score: rainforestScore },
      { feature: "FEATURE_TAIGA", score: taigaScore },
      { feature: "FEATURE_SAVANNA_WOODLAND", score: savannaWoodlandScore },
      { feature: "FEATURE_SAGEBRUSH_STEPPE", score: sagebrushSteppeScore },
    ];

    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        const idx = row + x;
        if (topography.landMask[idx] === 0) continue;
        if (navigableRiverMask[idx] === 1) continue;

        let bestFeature: (typeof FEATURE_PLACEMENT_KEYS)[number] | null = null;
        let bestScore = -1;

        for (const candidate of candidates) {
          const score = candidate.score[idx] ?? 0;
          if (score > bestScore) {
            bestScore = score;
            bestFeature = candidate.feature;
          }
        }

        if (!bestFeature) continue;
        if (bestScore < minScoreThreshold) continue;

        vegetationPlacements.push({ x, y, feature: bestFeature, weight: bestScore });
      }
    }

    const allPlacements = vegetationPlacements;
    if (allPlacements.length > 0) {
      const knownKeys = new Set(FEATURE_PLACEMENT_KEYS);
      const unknownKeys = new Set<string>();
      for (const placement of allPlacements) {
        if (!knownKeys.has(placement.feature as (typeof FEATURE_PLACEMENT_KEYS)[number])) {
          unknownKeys.add(placement.feature);
        }
      }

      const extraKeys = Array.from(unknownKeys).sort();
      const categoryKeys = [...FEATURE_PLACEMENT_KEYS, ...extraKeys];
      const valueByKey = new Map<string, number>();
      for (let i = 0; i < categoryKeys.length; i++) {
        valueByKey.set(categoryKeys[i]!, i + 1);
      }

      const positions = new Float32Array(allPlacements.length * 2);
      const values = new Uint16Array(allPlacements.length);
      for (let i = 0; i < allPlacements.length; i++) {
        const placement = allPlacements[i]!;
        positions[i * 2] = placement.x;
        positions[i * 2 + 1] = placement.y;
        values[i] = valueByKey.get(placement.feature) ?? 0;
      }

      context.viz?.dumpPoints(context.trace, {
        dataTypeKey: "ecology.featureIntents.featureType",
        spaceId: "tile.hexOddR",
        positions,
        values,
        valueFormat: "u16",
        meta: defineVizMeta("ecology.featureIntents.featureType", {
          label: "Feature Intents",
          group: GROUP_FEATURE_INTENTS,
          categories: categoryKeys.map((key, index) => ({
            value: index + 1,
            label: labelFeatureKey(key),
            color: featureColor(index, categoryKeys.length),
          })),
        }),
      });
    }

    deps.artifacts.featureIntentsVegetation.publish(context, vegetationPlacements);
  },
});

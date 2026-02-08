import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { FEATURE_PLACEMENT_KEYS } from "@mapgen/domain/ecology";
import { ecologyArtifacts } from "../../artifacts.js";
import { validateFeatureIntentsListArtifact } from "../../artifact-validation.js";
import FeaturesPlanStepContract from "./contract.js";
import { computeRiverAdjacencyMaskFromRiverClass } from "../../../hydrology-hydrography/river-adjacency.js";
import { deriveStepSeed } from "@swooper/mapgen-core/lib/rng";

const GROUP_FEATURE_INTENTS = "Ecology / Feature Intents";

function readRulesRadius(
  config: unknown,
  key: "nearRiverRadius" | "isolatedRiverRadius",
  fallback: number
): number {
  if (!config || typeof config !== "object") return fallback;
  const rules = (config as Record<string, unknown>).rules;
  if (!rules || typeof rules !== "object") return fallback;
  const raw = (rules as Record<string, unknown>)[key];
  return typeof raw === "number" && Number.isFinite(raw) ? raw : fallback;
}

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
    [
      ecologyArtifacts.featureIntentsVegetation,
      ecologyArtifacts.featureIntentsWetlands,
      ecologyArtifacts.featureIntentsReefs,
      ecologyArtifacts.featureIntentsIce,
    ],
    {
      featureIntentsVegetation: {
        validate: (value, context) => validateFeatureIntentsListArtifact(value, context.dimensions),
      },
      featureIntentsWetlands: {
        validate: (value, context) => validateFeatureIntentsListArtifact(value, context.dimensions),
      },
      featureIntentsReefs: {
        validate: (value, context) => validateFeatureIntentsListArtifact(value, context.dimensions),
      },
      featureIntentsIce: {
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
    const seed = deriveStepSeed(context.env.seed, "ecology:planFeatureIntents");
    const size = width * height;
    const emptyFeatureKeyField = (): Int16Array => new Int16Array(size).fill(-1);
    const navigableRiverMask = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      navigableRiverMask[i] = hydrography.riverClass[i] === 2 ? 1 : 0;
    }

    const advancedVegetated = config.vegetatedFeaturePlacements;
    const useAdvancedVegetated = advancedVegetated.strategy !== "disabled";

    const vegetationPlacements = useAdvancedVegetated
      ? ops.vegetatedFeaturePlacements(
          {
            width,
            height,
            seed,
            biomeIndex: classification.biomeIndex,
            vegetationDensity: classification.vegetationDensity,
            effectiveMoisture: classification.effectiveMoisture,
            surfaceTemperature: classification.surfaceTemperature,
            aridityIndex: classification.aridityIndex,
            freezeIndex: classification.freezeIndex,
            landMask: topography.landMask,
            navigableRiverMask,
            featureKeyField: emptyFeatureKeyField(),
          },
          advancedVegetated
        ).placements
      : ops.vegetation(
          {
            width,
            height,
            biomeIndex: classification.biomeIndex,
            vegetationDensity: classification.vegetationDensity,
            effectiveMoisture: classification.effectiveMoisture,
            surfaceTemperature: classification.surfaceTemperature,
            fertility: pedology.fertility,
            landMask: topography.landMask,
          },
          config.vegetation
        ).placements;

    const wetlandsPlan = ops.wetlands(
      {
        width,
        height,
        landMask: topography.landMask,
        effectiveMoisture: classification.effectiveMoisture,
        surfaceTemperature: classification.surfaceTemperature,
        fertility: pedology.fertility,
        elevation: topography.elevation,
      },
      config.wetlands
    );

    const advancedWet = config.wetFeaturePlacements;
    const useAdvancedWet = advancedWet.strategy !== "disabled";

    const wetPlacements = useAdvancedWet
      ? ops.wetFeaturePlacements(
          {
            width,
            height,
            seed,
            biomeIndex: classification.biomeIndex,
            surfaceTemperature: classification.surfaceTemperature,
            landMask: topography.landMask,
            navigableRiverMask,
            featureKeyField: emptyFeatureKeyField(),
            nearRiverMask: computeRiverAdjacencyMaskFromRiverClass({
              width,
              height,
              riverClass: hydrography.riverClass,
              radius: Math.max(1, Math.floor(readRulesRadius(advancedWet.config, "nearRiverRadius", 2))),
            }),
            isolatedRiverMask: computeRiverAdjacencyMaskFromRiverClass({
              width,
              height,
              riverClass: hydrography.riverClass,
              radius: Math.max(1, Math.floor(readRulesRadius(advancedWet.config, "isolatedRiverRadius", 1))),
            }),
          },
          advancedWet
        ).placements
      : [];

    const reefsPlan = ops.reefs(
      {
        width,
        height,
        landMask: topography.landMask,
        surfaceTemperature: classification.surfaceTemperature,
      },
      config.reefs
    );

    const icePlan = ops.ice(
      {
        width,
        height,
        landMask: topography.landMask,
        surfaceTemperature: classification.surfaceTemperature,
        elevation: topography.elevation,
      },
      config.ice
    );

    const wetlandsPlacements = [...wetlandsPlan.placements, ...wetPlacements];
    const reefsPlacements = reefsPlan.placements;
    const icePlacements = icePlan.placements;

    const allPlacements = [
      ...vegetationPlacements,
      ...wetlandsPlacements,
      ...reefsPlacements,
      ...icePlacements,
    ];
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
    deps.artifacts.featureIntentsWetlands.publish(context, wetlandsPlacements);
    deps.artifacts.featureIntentsReefs.publish(context, reefsPlacements);
    deps.artifacts.featureIntentsIce.publish(context, icePlacements);
  },
});

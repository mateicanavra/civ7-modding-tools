import { FEATURE_PLACEMENT_KEYS, type FeatureKey } from "@civ7/map-policy";
import type { FeatureIntentKey } from "@mapgen/domain/ecology/modules/features/model/atoms/index.js";
import { createStep } from "@swooper/mapgen-core/authoring";
import { encodeBoundedJsonLogLines } from "@swooper/mapgen-core/lib/log";
import { measureStandardFeatureProjection } from "../../../../../metrics/families/ecology-projection.js";
import { landMaskFromWaterMask } from "../../../../../water-surface-parity.js";
import { config } from "./config.js";
import { buildFeaturesApplyVizProjections } from "./viz.js";

const FEATURE_KEY_BY_INTENT: Readonly<Record<FeatureIntentKey, FeatureKey>> = {
  forest: "FEATURE_FOREST",
  rainforest: "FEATURE_RAINFOREST",
  taiga: "FEATURE_TAIGA",
  "savanna-woodland": "FEATURE_SAVANNA_WOODLAND",
  "sagebrush-steppe": "FEATURE_SAGEBRUSH_STEPPE",
  marsh: "FEATURE_MARSH",
  "tundra-bog": "FEATURE_TUNDRA_BOG",
  mangrove: "FEATURE_MANGROVE",
  oasis: "FEATURE_OASIS",
  "watering-hole": "FEATURE_WATERING_HOLE",
  reef: "FEATURE_REEF",
  "cold-reef": "FEATURE_COLD_REEF",
  atoll: "FEATURE_ATOLL",
  lotus: "FEATURE_LOTUS",
  ice: "FEATURE_ICE",
  "desert-floodplain-minor": "FEATURE_DESERT_FLOODPLAIN_MINOR",
  "desert-floodplain-navigable": "FEATURE_DESERT_FLOODPLAIN_NAVIGABLE",
  "grassland-floodplain-minor": "FEATURE_GRASSLAND_FLOODPLAIN_MINOR",
  "grassland-floodplain-navigable": "FEATURE_GRASSLAND_FLOODPLAIN_NAVIGABLE",
  "plains-floodplain-minor": "FEATURE_PLAINS_FLOODPLAIN_MINOR",
  "plains-floodplain-navigable": "FEATURE_PLAINS_FLOODPLAIN_NAVIGABLE",
  "tropical-floodplain-minor": "FEATURE_TROPICAL_FLOODPLAIN_MINOR",
  "tropical-floodplain-navigable": "FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE",
  "tundra-floodplain-minor": "FEATURE_TUNDRA_FLOODPLAIN_MINOR",
  "tundra-floodplain-navigable": "FEATURE_TUNDRA_FLOODPLAIN_NAVIGABLE",
};

/** Resolves an admitted Ecology feature intent to its official Civ7 projection identity. */
function resolveFeatureKeyForIntent(intent: FeatureIntentKey): FeatureKey {
  return FEATURE_KEY_BY_INTENT[intent];
}

/** Holds the closed official-feature identity mapping resolved from one adapter snapshot. */
type FeatureKeyLookups = {
  byKey: Record<FeatureKey, number>;
};

/** Resolves every supported Civ7 feature key to its current engine identity. */
function resolveFeatureKeyLookups(
  getFeatureTypeIndex: (key: FeatureKey) => number
): FeatureKeyLookups {
  const byKey = {} as Record<FeatureKey, number>;

  for (const key of FEATURE_PLACEMENT_KEYS) {
    const engineId = getFeatureTypeIndex(key);
    if (typeof engineId !== "number" || Number.isNaN(engineId) || engineId < 0) {
      throw new Error(`FeaturesStep: Missing engine feature for key "${key}".`);
    }
    byKey[key] = engineId;
  }

  return { byKey };
}

const FLOODPLAIN_FEATURE_KEY_PATTERN = /^FEATURE_[A-Z]+_FLOODPLAIN_(?:MINOR|NAVIGABLE)$/;

type FeatureProjectionRejection = Readonly<{
  x: number;
  y: number;
  feature: FeatureKey;
  reason: "out-of-bounds" | "canHaveFeature=false";
}>;

function incrementCount(counts: Record<string, number>, key: string): void {
  counts[key] = (counts[key] ?? 0) + 1;
}

function isFloodplainFeatureKey(feature: string): boolean {
  return FLOODPLAIN_FEATURE_KEY_PATTERN.test(feature);
}

/**
 * Merges all ordered feature-family intents at Ecology's sole Civ7 mutation
 * boundary and records typed rejection diagnostics without rewriting intent evidence.
 */
export const FeaturesApplyStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const topography = deps.artifacts.topography.read();
    const placements = {
      vegetation: Array.from(deps.artifacts.vegetationIntents.read()),
      wetlands: Array.from(deps.artifacts.wetlandIntents.read()),
      floodplains: Array.from(deps.artifacts.floodplainIntents.read()),
      reefs: Array.from(deps.artifacts.reefIntents.read()),
      ice: Array.from(deps.artifacts.iceIntents.read()),
    };

    const merged = ops.apply(placements, stepConfig.apply);

    const lookups = resolveFeatureKeyLookups((key) =>
      deps.engine.getFeatureTypeIndex(context, key)
    );

    const resolvedPlacements: Array<{
      x: number;
      y: number;
      feature: FeatureKey;
      weight?: number;
    }> = merged.placements.map((placement) => ({
      x: placement.x,
      y: placement.y,
      feature: resolveFeatureKeyForIntent(placement.feature),
      weight: placement.weight,
    }));

    resolvedPlacements.sort(
      (a, b) =>
        a.y * context.setup.dimensions.width + a.x - (b.y * context.setup.dimensions.width + b.x)
    );

    const { width, height } = context.setup.dimensions;
    const floodplainIntentMask = new Uint8Array(width * height);
    for (const placement of placements.floodplains) {
      const x = placement.x | 0;
      const y = placement.y | 0;
      if (x >= 0 && x < width && y >= 0 && y < height) floodplainIntentMask[y * width + x] = 1;
    }
    const rejections: FeatureProjectionRejection[] = [];
    const attemptedByFeature: Record<string, number> = {};
    const appliedByFeature: Record<string, number> = {};
    const rejectedCanHaveFeatureByFeature: Record<string, number> = {};
    const floodplainAppliedMask = new Uint8Array(width * height);
    const floodplainRejectedMask = new Uint8Array(width * height);
    let applied = 0;

    for (const placement of resolvedPlacements) {
      incrementCount(attemptedByFeature, placement.feature);
      const x = placement.x | 0;
      const y = placement.y | 0;
      if (x < 0 || x >= width || y < 0 || y >= height) {
        rejections.push({ x, y, feature: placement.feature, reason: "out-of-bounds" });
        continue;
      }
      const featureIndex = lookups.byKey[placement.feature];
      if (!deps.engine.canHaveFeature(context, x, y, featureIndex)) {
        rejections.push({ x, y, feature: placement.feature, reason: "canHaveFeature=false" });
        incrementCount(rejectedCanHaveFeatureByFeature, placement.feature);
        continue;
      }
      deps.engine.setFeatureType(context, x, y, {
        Feature: featureIndex,
        Direction: -1,
        Elevation: 0,
      });
      if (isFloodplainFeatureKey(placement.feature)) floodplainAppliedMask[y * width + x] = 1;
      incrementCount(appliedByFeature, placement.feature);
      applied += 1;
    }

    const rejectionMask = new Uint8Array(width * height);
    let rejectedCanHaveFeature = 0;
    let rejectedOutOfBounds = 0;
    for (const rejection of rejections) {
      if (rejection.reason === "canHaveFeature=false") rejectedCanHaveFeature += 1;
      if (rejection.reason === "out-of-bounds") rejectedOutOfBounds += 1;
      if (rejection.x >= 0 && rejection.x < width && rejection.y >= 0 && rejection.y < height) {
        const index = rejection.y * width + rejection.x;
        rejectionMask[index] = 1;
        if (isFloodplainFeatureKey(rejection.feature)) floodplainRejectedMask[index] = 1;
      }
    }

    const projectionMeasurementInput = {
      attempted: resolvedPlacements.length,
      applied,
      rejected: rejections.length,
      rejectedCanHaveFeature,
      rejectedOutOfBounds,
      attemptedByFeature,
      appliedByFeature,
      rejectedCanHaveFeatureByFeature,
    };

    for (const line of encodeBoundedJsonLogLines({
      prefix: "[SWOOPER_MOD]",
      marker: "FEATURE_APPLY_V1",
      payload: {
        attempted: resolvedPlacements.length,
        applied,
        rejected: rejections.length,
        rejectedCanHaveFeature,
        attemptedByFeature,
        appliedByFeature,
        rejectedCanHaveFeatureByFeature,
      },
    })) {
      console.log(line);
    }

    context.trace.event(() => ({
      type: "map.ecology.features.parity",
      attempted: resolvedPlacements.length,
      applied,
      rejected: rejections.length,
      rejectedCanHaveFeature,
      rejectedOutOfBounds,
      attemptedByFeature,
      appliedByFeature,
      rejectedCanHaveFeatureByFeature,
    }));

    const hardRejections = rejections.filter((rejection) => rejection.reason === "out-of-bounds");
    if (hardRejections.length > 0) {
      const sample = hardRejections
        .slice(0, 12)
        .map(
          (rejection) => `(${rejection.x},${rejection.y}) ${rejection.feature} ${rejection.reason}`
        );
      throw new Error(
        `features-apply hard-rejected ${hardRejections.length}/${resolvedPlacements.length} placements; sample: ${sample.join(
          "; "
        )}`
      );
    }

    if (rejectedCanHaveFeature > 0) {
      context.trace.event(() => ({
        type: "map.ecology.features.rejections.soft",
        reason: "canHaveFeature=false",
        rejectedCanHaveFeature,
        attempted: resolvedPlacements.length,
        applied,
      }));
    }

    if (applied > 0) {
      deps.engine.validateAndFixTerrain(context);
    }

    const featureType = deps.engine.readCurrentMapFeatureTypes(context);

    const engine =
      applied > 0
        ? (() => {
            const waterMask = deps.engine.readCurrentMapWaterMask(context);
            return {
              landMask: landMaskFromWaterMask(waterMask),
              terrain: deps.engine.readCurrentMapTerrainTypes(context),
            };
          })()
        : undefined;
    if (applied > 0) deps.engine.recalculateAreas(context);

    return {
      floodplainIntentMask,
      rejectionMask,
      floodplainAppliedMask,
      floodplainRejectedMask,
      applied,
      featureType,
      featureEngineIdsByKey: lookups.byKey,
      projectionMeasurementInput,
      topographyLandMask: applied > 0 ? topography.landMask : undefined,
      engine,
    };
  },
  metrics: ({ result }) => ({
    "ecology.featureProjection": measureStandardFeatureProjection(
      result.projectionMeasurementInput
    ),
  }),
  viz: ({ result, dimensions }) => buildFeaturesApplyVizProjections(result, dimensions),
});

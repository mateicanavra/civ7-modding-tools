import type { FeatureKey } from "@civ7/map-policy";
import { createStep } from "@swooper/mapgen-core/authoring";
import {
  captureEngineFeatureTypes,
  captureEngineTerrainTypes,
  captureEngineWaterMask,
  engineLandMaskFromWaterMask,
} from "../../../../../current-engine-surface.js";
import { measureStandardFeatureProjection } from "../../../../../metrics/families/ecology-projection.js";
import { resolveFeatureKeyForIntent } from "./apply.js";
import { config } from "./config.js";
import { resolveFeatureKeyLookups } from "./feature-keys.js";
import { buildFeaturesApplyVizProjections } from "./viz.js";

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
    const topography = deps.artifacts.topography.read(context);
    const placements = {
      vegetation: Array.from(deps.artifacts.vegetationIntents.read(context)),
      wetlands: Array.from(deps.artifacts.wetlandIntents.read(context)),
      floodplains: Array.from(deps.artifacts.floodplainIntents.read(context)),
      reefs: Array.from(deps.artifacts.reefIntents.read(context)),
      ice: Array.from(deps.artifacts.iceIntents.read(context)),
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

    console.log(
      `[SWOOPER_MOD] FEATURE_APPLY_V1 ${JSON.stringify({
        attempted: resolvedPlacements.length,
        applied,
        rejected: rejections.length,
        rejectedCanHaveFeature,
        attemptedByFeature,
        appliedByFeature,
        rejectedCanHaveFeatureByFeature,
      })}`
    );

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

    const featureType = captureEngineFeatureTypes(context.setup.dimensions, (x, y) =>
      deps.engine.getFeatureType(context, x, y)
    );

    const engine =
      applied > 0
        ? (() => {
            const waterMask = captureEngineWaterMask(context.setup.dimensions, (x, y) =>
              deps.engine.isWater(context, x, y)
            );
            return {
              landMask: engineLandMaskFromWaterMask(waterMask),
              terrain: captureEngineTerrainTypes(context.setup.dimensions, (x, y) =>
                deps.engine.getTerrainType(context, x, y)
              ),
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

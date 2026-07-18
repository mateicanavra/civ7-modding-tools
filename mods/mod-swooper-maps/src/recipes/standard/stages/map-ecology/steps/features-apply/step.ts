import type { EngineAdapter } from "@civ7/adapter";
import type { FeatureKey } from "@civ7/map-policy";
import { defineVizMeta, snapshotEngineHeightfield } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { resolveFeatureKeyForIntent } from "./apply.js";
import { FeaturesApplyStepContract } from "./config.js";
import { resolveFeatureKeyLookups } from "./feature-keys.js";
import { buildFeatureTypeVizCategories } from "./viz.js";

const GROUP_MAP_ECOLOGY = "Map / Ecology (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;
const FLOODPLAIN_FEATURE_KEY_PATTERN = /^FEATURE_[A-Z]+_FLOODPLAIN_(?:MINOR|NAVIGABLE)$/;

function incrementCount(counts: Record<string, number>, key: string): void {
  counts[key] = (counts[key] ?? 0) + 1;
}

function isFloodplainFeatureKey(feature: string): boolean {
  return FLOODPLAIN_FEATURE_KEY_PATTERN.test(feature);
}

/**
 * Copies the complete post-Ecology engine feature surface into producer-owned artifact storage.
 * Reading every tile after validation preserves the engine's exact IDs and no-feature sentinel.
 */
function readPostEcologyFeatureSurface(
  adapter: EngineAdapter,
  width: number,
  height: number
): Int16Array {
  const featureType = new Int16Array(width * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      featureType[rowOffset + x] = adapter.getFeatureType(x, y) | 0;
    }
  }
  return featureType;
}

/**
 * Merges all ordered feature-family intents at Ecology's sole Civ7 mutation
 * boundary and records typed rejection diagnostics without rewriting intent evidence.
 */
export const FeaturesApplyStep = createStep(FeaturesApplyStepContract, {
  run: (context, config, ops, deps) => {
    const placements = {
      vegetation: Array.from(deps.artifacts.featureIntentsVegetation.read(context)),
      wetlands: Array.from(deps.artifacts.featureIntentsWetlands.read(context)),
      floodplains: Array.from(deps.artifacts.featureIntentsFloodplains.read(context)),
      reefs: Array.from(deps.artifacts.featureIntentsReefs.read(context)),
      ice: Array.from(deps.artifacts.featureIntentsIce.read(context)),
    };

    const merged = ops.apply(placements, config.apply);

    const lookups = resolveFeatureKeyLookups(context.adapter);
    const unknown: string[] = [];
    for (const placement of merged.placements) {
      const feature = resolveFeatureKeyForIntent(placement.feature);
      if (!(feature in lookups.byKey)) unknown.push(feature);
    }
    if (unknown.length > 0) {
      const unique = [...new Set(unknown)].sort((a, b) => a.localeCompare(b));
      throw new Error(
        `features-apply rejected unknown feature keys: ${unique.slice(0, 12).join(", ")}${
          unique.length > 12 ? ` (and ${unique.length - 12} more)` : ""
        }`
      );
    }

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
      (a, b) => a.y * context.dimensions.width + a.x - (b.y * context.dimensions.width + b.x)
    );

    const { width, height } = context.dimensions;
    const floodplainIntentMask = new Uint8Array(width * height);
    for (const placement of placements.floodplains) {
      const x = placement.x | 0;
      const y = placement.y | 0;
      if (x >= 0 && x < width && y >= 0 && y < height) floodplainIntentMask[y * width + x] = 1;
    }
    const rejections: Array<{ x: number; y: number; feature: FeatureKey; reason: string }> = [];
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
      if (featureIndex == null || featureIndex < 0) {
        rejections.push({ x, y, feature: placement.feature, reason: "unknown-feature-index" });
        continue;
      }
      if (!context.adapter.canHaveFeature(x, y, featureIndex)) {
        rejections.push({ x, y, feature: placement.feature, reason: "canHaveFeature=false" });
        incrementCount(rejectedCanHaveFeatureByFeature, placement.feature);
        continue;
      }
      context.adapter.setFeatureType(x, y, { Feature: featureIndex, Direction: -1, Elevation: 0 });
      if (isFloodplainFeatureKey(placement.feature)) floodplainAppliedMask[y * width + x] = 1;
      incrementCount(appliedByFeature, placement.feature);
      applied += 1;
    }

    const rejectionMask = new Uint8Array(width * height);
    let rejectedCanHaveFeature = 0;
    let rejectedOutOfBounds = 0;
    let rejectedUnknownFeature = 0;
    for (const rejection of rejections) {
      if (rejection.reason === "canHaveFeature=false") rejectedCanHaveFeature += 1;
      if (rejection.reason === "out-of-bounds") rejectedOutOfBounds += 1;
      if (rejection.reason === "unknown-feature-index") rejectedUnknownFeature += 1;
      if (rejection.x >= 0 && rejection.x < width && rejection.y >= 0 && rejection.y < height) {
        const index = rejection.y * width + rejection.x;
        rejectionMask[index] = 1;
        if (isFloodplainFeatureKey(rejection.feature)) floodplainRejectedMask[index] = 1;
      }
    }

    deps.artifacts.featureApplyDiagnostics.publish(context, {
      width,
      height,
      attempted: resolvedPlacements.length,
      applied,
      rejected: rejections.length,
      rejectedCanHaveFeature,
      rejectedOutOfBounds,
      rejectedUnknownFeature,
      attemptedByFeature,
      appliedByFeature,
      rejectedCanHaveFeatureByFeature,
      rejectionMask,
    });

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
      rejectedUnknownFeature,
      attemptedByFeature,
      appliedByFeature,
      rejectedCanHaveFeatureByFeature,
    }));

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.ecology.features.floodplainIntentMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: floodplainIntentMask,
      meta: defineVizMeta("map.ecology.features.floodplainIntentMask", {
        label: "Floodplain Intent Mask",
        group: GROUP_MAP_ECOLOGY,
        palette: "categorical",
        role: "intent",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.ecology.features.rejectionMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: rejectionMask,
      meta: defineVizMeta("map.ecology.features.rejectionMask", {
        label: "Feature Rejection Mask",
        group: GROUP_MAP_ECOLOGY,
        palette: "categorical",
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.ecology.features.floodplainAppliedMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: floodplainAppliedMask,
      meta: defineVizMeta("map.ecology.features.floodplainAppliedMask", {
        label: "Floodplain Applied Mask",
        group: GROUP_MAP_ECOLOGY,
        palette: "categorical",
        role: "engine",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.ecology.features.floodplainRejectedMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: floodplainRejectedMask,
      meta: defineVizMeta("map.ecology.features.floodplainRejectedMask", {
        label: "Floodplain Rejected Mask",
        group: GROUP_MAP_ECOLOGY,
        palette: "categorical",
        visibility: "debug",
      }),
    });

    const hardRejections = rejections.filter(
      (rejection) => rejection.reason !== "canHaveFeature=false"
    );
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
      context.adapter.validateAndFixTerrain();
    }

    const featureType = readPostEcologyFeatureSurface(context.adapter, width, height);
    deps.artifacts.featureEngineSnapshot.publish(context, {
      width,
      height,
      featureType,
    });

    if (applied > 0) {
      const featureTypeCategories = buildFeatureTypeVizCategories(context.adapter, featureType);
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.ecology.featureType",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "i16",
        values: featureType,
        meta: defineVizMeta("map.ecology.featureType", {
          label: "Feature Type (Engine)",
          group: GROUP_MAP_ECOLOGY,
          palette: "categorical",
          categories: featureTypeCategories.map((category) => ({
            value: category.value,
            label: category.label,
            color: [...category.color] as [number, number, number, number],
          })),
        }),
      });
      const physics = context.buffers.heightfield;
      const engine = snapshotEngineHeightfield(context);
      if (engine) {
        context.viz?.dumpGrid(context.trace, {
          dataTypeKey: "debug.heightfield.terrain",
          spaceId: TILE_SPACE_ID,
          dims: { width: context.dimensions.width, height: context.dimensions.height },
          format: "u8",
          values: physics.terrain,
          meta: defineVizMeta("debug.heightfield.terrain", {
            label: "Terrain (Physics Source Evidence)",
            group: GROUP_MAP_ECOLOGY,
            palette: "categorical",
            role: "physics",
            visibility: "debug",
          }),
        });
        context.viz?.dumpGrid(context.trace, {
          dataTypeKey: "debug.heightfield.terrain",
          spaceId: TILE_SPACE_ID,
          dims: { width: context.dimensions.width, height: context.dimensions.height },
          format: "u8",
          values: engine.terrain,
          meta: defineVizMeta("debug.heightfield.terrain", {
            label: "Terrain (Engine After Features)",
            group: GROUP_MAP_ECOLOGY,
            palette: "categorical",
            role: "engine",
            visibility: "debug",
          }),
        });
        context.viz?.dumpGrid(context.trace, {
          dataTypeKey: "debug.heightfield.landMask",
          spaceId: TILE_SPACE_ID,
          dims: { width: context.dimensions.width, height: context.dimensions.height },
          format: "u8",
          values: physics.landMask,
          meta: defineVizMeta("debug.heightfield.landMask", {
            label: "Land Mask (Physics Source Evidence)",
            group: GROUP_MAP_ECOLOGY,
            palette: "categorical",
            role: "physics",
            visibility: "debug",
          }),
        });
        context.viz?.dumpGrid(context.trace, {
          dataTypeKey: "debug.heightfield.landMask",
          spaceId: TILE_SPACE_ID,
          dims: { width: context.dimensions.width, height: context.dimensions.height },
          format: "u8",
          values: engine.landMask,
          meta: defineVizMeta("debug.heightfield.landMask", {
            label: "Land Mask (Engine After Features)",
            group: GROUP_MAP_ECOLOGY,
            palette: "categorical",
            role: "engine",
            visibility: "debug",
          }),
        });
      }
      context.adapter.recalculateAreas();
    }
  },
});

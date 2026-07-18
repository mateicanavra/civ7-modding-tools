import type { FeatureKey } from "@civ7/map-policy";
import { defineVizMeta, snapshotEngineHeightfield } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { reifyFeatureField, resolveFeatureKeyForIntent } from "../features/apply.js";
import { resolveFeatureKeyLookups } from "../features/feature-keys.js";
import FeaturesApplyStepContract from "./contract.js";
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
 * Merges all ordered feature-family intents at Ecology's sole Civ7 mutation
 * boundary and records typed rejection diagnostics without rewriting truth.
 */
export default createStep(FeaturesApplyStepContract, {
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

    const size = context.dimensions.width * context.dimensions.height;
    if (!context.fields.featureType || context.fields.featureType.length !== size) {
      context.fields.featureType = new Int16Array(size);
    }
    if (applied > 0) {
      context.adapter.validateAndFixTerrain();
    }
    // The field:featureType this step provides must always be the reified
    // engine surface — even when zero features applied — because downstream
    // planning (placement) consumes the field as a declared engine-feature
    // projection instead of re-reading the adapter per tile.
    reifyFeatureField(context);
    if (applied > 0) {
      const featureTypeCategories = buildFeatureTypeVizCategories(
        context.adapter,
        context.fields.featureType
      );
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.ecology.featureType",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "i16",
        values: context.fields.featureType,
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
            label: "Terrain (Physics Truth)",
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
            label: "Land Mask (Physics Truth)",
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

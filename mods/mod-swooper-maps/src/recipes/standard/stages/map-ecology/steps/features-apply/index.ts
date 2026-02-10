import { createStep } from "@swooper/mapgen-core/authoring";
import type { FeatureKey } from "@mapgen/domain/ecology";
import { defineVizMeta, snapshotEngineHeightfield } from "@swooper/mapgen-core";
import FeaturesApplyStepContract from "./contract.js";
import { reifyFeatureField } from "../features/apply.js";
import { resolveFeatureKeyLookups } from "../features/feature-keys.js";
import { buildFeatureTypeVizCategories } from "./viz.js";

const GROUP_MAP_ECOLOGY = "Map / Ecology (Engine)";
const TILE_SPACE_ID = "tile.hexOddR" as const;

export default createStep(FeaturesApplyStepContract, {
  run: (context, config, ops, deps) => {
    const placements = {
      vegetation: Array.from(deps.artifacts.featureIntentsVegetation.read(context)),
      wetlands: Array.from(deps.artifacts.featureIntentsWetlands.read(context)),
      reefs: Array.from(deps.artifacts.featureIntentsReefs.read(context)),
      ice: Array.from(deps.artifacts.featureIntentsIce.read(context)),
    };

    const merged = ops.apply(
      placements,
      config.apply
    );

    const lookups = resolveFeatureKeyLookups(context.adapter);
    const unknown: string[] = [];
    for (const placement of merged.placements) {
      if (!(placement.feature in lookups.byKey)) unknown.push(placement.feature);
    }
    if (unknown.length > 0) {
      const unique = [...new Set(unknown)].sort((a, b) => a.localeCompare(b));
      throw new Error(
        `features-apply rejected unknown feature keys: ${unique.slice(0, 12).join(", ")}${
          unique.length > 12 ? ` (and ${unique.length - 12} more)` : ""
        }`
      );
    }

    const resolvedPlacements = merged.placements as Array<{
      x: number;
      y: number;
      feature: FeatureKey;
      weight?: number;
    }>;

    resolvedPlacements.sort(
      (a, b) => a.y * context.dimensions.width + a.x - (b.y * context.dimensions.width + b.x)
    );

    const { width, height } = context.dimensions;
    const rejections: Array<{ x: number; y: number; feature: FeatureKey; reason: string }> = [];
    let applied = 0;

    for (const placement of resolvedPlacements) {
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
        continue;
      }
      context.adapter.setFeatureType(x, y, { Feature: featureIndex, Direction: -1, Elevation: 0 });
      applied += 1;
    }

    if (rejections.length > 0) {
      const sample = rejections.slice(0, 12).map((r) => `(${r.x},${r.y}) ${r.feature} ${r.reason}`);
      throw new Error(
        `features-apply rejected ${rejections.length}/${resolvedPlacements.length} placements; sample: ${sample.join(
          "; "
        )}`
      );
    }

    const size = context.dimensions.width * context.dimensions.height;
    if (!context.fields.featureType || context.fields.featureType.length !== size) {
      context.fields.featureType = new Int16Array(size);
    }
    if (applied > 0) {
      reifyFeatureField(context);
      const featureTypeCategories = buildFeatureTypeVizCategories(context.adapter);
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
          categories: featureTypeCategories,
        }),
      });
      context.adapter.validateAndFixTerrain();
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

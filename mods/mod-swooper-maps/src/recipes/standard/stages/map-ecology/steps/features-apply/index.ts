import { createStep } from "@swooper/mapgen-core/authoring";
import type { FeatureKey } from "@mapgen/domain/ecology";
import { defineVizMeta, snapshotEngineHeightfield } from "@swooper/mapgen-core";
import FeaturesApplyStepContract from "./contract.js";
import { applyFeaturePlacements, reifyFeatureField } from "../features/apply.js";
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
    const filteredPlacements = merged.placements.filter(
      (placement): placement is { x: number; y: number; feature: FeatureKey; weight?: number } =>
        placement.feature in lookups.byKey
    );
    const size = context.dimensions.width * context.dimensions.height;
    if (!context.fields.featureType || context.fields.featureType.length !== size) {
      context.fields.featureType = new Int16Array(size);
    }
    const applied = applyFeaturePlacements(context, filteredPlacements, lookups);
    if (applied > 0) {
      reifyFeatureField(context);
      const featureTypeCategories = buildFeatureTypeVizCategories(
        context.adapter,
        context.fields.featureType
      );
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.ecology.featureType",
        spaceId: TILE_SPACE_ID,
        dims: { width: context.dimensions.width, height: context.dimensions.height },
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

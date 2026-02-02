import { createStep } from "@swooper/mapgen-core/authoring";
import type { FeatureKey } from "@mapgen/domain/ecology";
import { defineVizMeta, syncHeightfield } from "@swooper/mapgen-core";
import FeaturesApplyStepContract from "./contract.js";
import { applyFeaturePlacements, reifyFeatureField } from "../features/apply.js";
import { resolveFeatureKeyLookups } from "../features/feature-keys.js";

const GROUP_MAP_ECOLOGY = "Map / Ecology (Projection)";
const TILE_SPACE_ID = "tile.hexOddR" as const;

export default createStep(FeaturesApplyStepContract, {
  run: (context, config, ops, deps) => {
    const intents = deps.artifacts.featureIntents.read(context);
    const placements = {
      vegetation: Array.from(intents.vegetation),
      wetlands: Array.from(intents.wetlands),
      reefs: Array.from(intents.reefs),
      ice: Array.from(intents.ice),
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
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.ecology.featureType",
        spaceId: TILE_SPACE_ID,
        dims: { width: context.dimensions.width, height: context.dimensions.height },
        format: "i16",
        values: context.fields.featureType,
        meta: defineVizMeta("map.ecology.featureType", {
          label: "Feature Type (Projected)",
          group: GROUP_MAP_ECOLOGY,
          palette: "categorical",
        }),
      });
      context.adapter.validateAndFixTerrain();
      syncHeightfield(context);
      context.adapter.recalculateAreas();
    }
  },
});

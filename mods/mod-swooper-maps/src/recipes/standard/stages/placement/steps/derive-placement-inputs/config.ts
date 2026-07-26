import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as pedologyArtifacts } from "@mapgen/domain/ecology/modules/pedology/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import placement from "@mapgen/domain/placement";
import { artifacts as placementWonderArtifacts } from "@mapgen/domain/placement/modules/wonders/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import {
  MAP_PROJECTION_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../../../tag-contracts.js";

/**
 * Defines placement-input admission from final domain products and current
 * adapter observations, publishing wonder intent without mutating Civ7.
 */
export const config = defineStep({
  id: "derive-placement-inputs",
  engine: [
    "getMapSizeId",
    "lookupMapInfo",
    "getNaturalWonderCatalog",
    "getTerrainType",
    "getBiomeType",
    "getFeatureType",
  ] as const,
  requires: [
    MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted,
    STANDARD_ENGINE_EFFECT_TAGS.engine.featuresApplied,
  ],
  provides: [],
  artifacts: {
    requires: [
      morphologyLandformsArtifacts.topography,
      climateArtifacts.climateIndices,
      hydrographyArtifacts.hydrography,
      hydrographyArtifacts.riverNetwork,
      hydrographyArtifacts.lakePlan,
      biomeArtifacts.biomeClassification,
      pedologyArtifacts.pedology,
    ],
    provides: [placementWonderArtifacts.naturalWonderPlan],
  },
  ops: {
    wonders: placement.wonders.ops.planWonders,
    naturalWonders: placement.wonders.ops.planNaturalWonders,
  },
});

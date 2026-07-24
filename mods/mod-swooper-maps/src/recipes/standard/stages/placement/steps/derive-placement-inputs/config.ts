import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as pedologyArtifacts } from "@mapgen/domain/ecology/modules/pedology/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import placement from "@mapgen/domain/placement";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  MAP_PROJECTION_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../../../tag-contracts.js";
import { artifacts as placementArtifacts } from "../../artifacts/index.js";

/**
 * Defines placement-input admission from final physics artifacts and declared
 * engine surfaces, publishing input and wonder intent without mutating Civ7.
 */
export const DerivePlacementInputsStepContract = defineStep({
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
      morphologyArtifacts.topography,
      climateArtifacts.climateIndices,
      hydrographyArtifacts.hydrography,
      hydrographyArtifacts.riverNetwork,
      hydrographyArtifacts.lakePlan,
      biomeArtifacts.biomeClassification,
      pedologyArtifacts.pedology,
    ],
    provides: [placementArtifacts.placementInputs, placementArtifacts.naturalWonderPlan],
  },
  ops: {
    wonders: placement.ops.planWonders,
    naturalWonders: placement.ops.planNaturalWonders,
  },
  schema: Type.Object({}),
});

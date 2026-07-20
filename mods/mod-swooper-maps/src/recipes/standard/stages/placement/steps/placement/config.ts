import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  artifactModules as standardArtifactModules,
  artifacts as standardArtifacts,
} from "../../../../artifacts/index.js";
import {
  MAP_PROJECTION_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../../../tag-contracts.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";
import {
  artifactModules as placementArtifactModules,
  artifacts as placementArtifacts,
} from "../../artifacts/index.js";

/**
 * Terminal placement evidence step. DECLARED parity read (ADR-009): this step
 * intentionally reads final Morphology topography and compares its land mask
 * against an engine readback snapshot - that product-vs-engine comparison
 * (waterDriftCount, placementEngineTerrainSnapshot) is the step's product,
 * so both sides of the comparison are evidence inputs, not planning truth.
 */
export const PlacementStepContract = defineStep({
  id: "placement",
  phase: "placement",
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.advancedStartsAssigned],
  provides: [
    STANDARD_ENGINE_EFFECT_TAGS.engine.placementApplied,
    MAP_PROJECTION_EFFECT_TAGS.map.placementParityCaptured,
  ],
  artifacts: {
    requires: [
      placementArtifacts.naturalWonderPlacement,
      placementArtifacts.placementSurfacePreparation,
      placementArtifacts.resourcePlacementOutcomes,
      placementArtifacts.startAssignment,
      placementArtifacts.discoveryPlacementOutcomes,
      placementArtifacts.advancedStartAssignment,
      standardArtifacts.landmassRegionSlotByTile,
      morphologyArtifacts.topography,
    ],
    provides: [
      placementArtifactModules.placementOutputs,
      placementArtifactModules.engineState,
      standardArtifactModules.placementEngineTerrainSnapshot,
    ],
  },
  schema: Type.Object({}),
});

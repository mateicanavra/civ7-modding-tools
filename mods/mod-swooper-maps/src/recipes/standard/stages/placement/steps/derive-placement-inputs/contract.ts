import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import placement from "@mapgen/domain/placement";

import {
  FIELD_DEPENDENCY_TAGS,
  MAP_PROJECTION_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../../../tags.js";
import { placementArtifacts } from "../../artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts.js";
import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import { morphologyArtifacts } from "../../../morphology/artifacts.js";
import { mapRiversArtifacts } from "../../../map-rivers/artifacts.js";

/**
 * Builds the placement input artifact from runtime config and placement ops.
 *
 * Planning surfaces come from pipeline artifacts and declared fields:
 * lake truth from Hydrology `lakePlan`, the engine biome surface from the
 * ecology `biomeBindings` projection artifact, and the engine feature surface
 * from the declared `field:featureType` dependency reified by the features
 * projection step.
 *
 * DECLARED engine-surface read (ADR-009): per-tile TERRAIN is read from the
 * engine because `validateAndFixTerrain` applies engine-only terrain
 * maintenance after every artifact-published terrain intent — there is no
 * artifact that carries the post-maintenance terrain surface. This mirrors
 * the declared resource legality surface read in plan-resources.
 */
const DerivePlacementInputsContract = defineStep({
  id: "derive-placement-inputs",
  phase: "placement",
  requires: [
    MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted,
    STANDARD_ENGINE_EFFECT_TAGS.engine.featuresApplied,
    FIELD_DEPENDENCY_TAGS.field.featureType,
  ],
  provides: [],
  artifacts: {
    requires: [
      morphologyArtifacts.topography,
      hydrologyHydrographyArtifacts.hydrography,
      hydrologyHydrographyArtifacts.lakePlan,
      mapRiversArtifacts.projectedNavigableRivers,
      mapRiversArtifacts.engineProjectionRivers,
      ecologyArtifacts.biomeClassification,
      ecologyArtifacts.biomeBindings,
      ecologyArtifacts.pedology,
    ],
    provides: [
      placementArtifacts.placementInputs,
      placementArtifacts.naturalWonderPlan,
      placementArtifacts.discoveryPlan,
    ],
  },
  ops: {
    wonders: placement.ops.planWonders,
    naturalWonders: placement.ops.planNaturalWonders,
    discoveries: placement.ops.planDiscoveries,
  },
  schema: Type.Object({}),
});

export default DerivePlacementInputsContract;

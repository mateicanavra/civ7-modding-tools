import placement from "@mapgen/domain/placement";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import {
  MAP_PROJECTION_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../../../tag-contracts.js";
import { artifacts as ecologyArtifacts } from "../../../ecology/artifacts/index.js";
import { artifacts as hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";
import { artifactModules as placementArtifactModules } from "../../artifacts/index.js";

/**
 * Builds the placement input artifact from runtime config and placement ops.
 *
 * Planning surfaces come from pipeline artifacts:
 * lake intent from Hydrology `lakePlan`, the engine biome surface from the
 * ecology `biomeBindings` projection artifact, and the engine feature surface
 * from the ecology `featureEngineSnapshot` projection artifact published after
 * feature stamping and terrain validation.
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
  ],
  provides: [],
  artifacts: {
    requires: [
      morphologyArtifacts.topography,
      hydrologyHydrographyArtifacts.hydrography,
      hydrologyHydrographyArtifacts.riverNetworkMetrics,
      hydrologyHydrographyArtifacts.lakePlan,
      ecologyArtifacts.biomeClassification,
      ecologyArtifacts.biomeBindings,
      ecologyArtifacts.featureEngineSnapshot,
      ecologyArtifacts.pedology,
    ],
    provides: [
      placementArtifactModules.placementInputs,
      placementArtifactModules.naturalWonderPlan,
    ],
  },
  ops: {
    wonders: placement.ops.planWonders,
    naturalWonders: placement.ops.planNaturalWonders,
  },
  schema: Type.Object({}),
});

export default DerivePlacementInputsContract;

import { artifacts as biomeArtifacts } from "../../../../../../domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as pedologyArtifacts } from "../../../../../../domain/ecology/modules/pedology/artifacts/index.js";
import { artifacts as climateArtifacts } from "../../../../../../domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import placement from "../../../../../../domain/placement/index.js";
import { artifacts as placementWonderArtifacts } from "../../../../../../domain/placement/modules/wonders/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_COMPLETIONS } from "../../../../completions.js";
import { STANDARD_INITIAL_SETUP } from "../../../../initial-setup.js";

/**
 * Defines natural-wonder planning from final domain products, current adapter
 * observations, and active Civ7 map-size metadata without mutating Civ7.
 */
export const config = defineStep({
  id: "plan-natural-wonders",
  initialSetup: STANDARD_INITIAL_SETUP,
  engine: [
    "readCurrentMapTerrainTypes",
    "readCurrentMapBiomeTypes",
    "readCurrentMapFeatureTypes",
  ] as const,
  requires: [
    STANDARD_COMPLETIONS.featuresApplied,
    STANDARD_COMPLETIONS.riversPlotted,
    morphologyLandformsArtifacts.topography,
    climateArtifacts.climateIndices,
    hydrographyArtifacts.hydrography,
    hydrographyArtifacts.riverNetwork,
    hydrographyArtifacts.lakePlan,
    biomeArtifacts.biomeClassification,
    pedologyArtifacts.pedology,
  ],
  provides: [placementWonderArtifacts.naturalWonderPlan],

  ops: {
    naturalWonders: placement.wonders.ops.planNaturalWonders,
  },
});

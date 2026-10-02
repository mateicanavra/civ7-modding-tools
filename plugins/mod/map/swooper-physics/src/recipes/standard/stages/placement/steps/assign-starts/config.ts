import { artifacts as pedologyArtifacts } from "../../../../../../domain/ecology/modules/pedology/artifacts/index.js";
import { artifacts as climateArtifacts } from "../../../../../../domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyErosionArtifacts } from "../../../../../../domain/morphology/modules/erosion/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "../../../../../../domain/morphology/modules/shelf/artifacts/index.js";
import { artifacts as morphologyCoastsArtifacts } from "../../../../../../domain/morphology/modules/coasts/artifacts/index.js";
import placement from "../../../../../../domain/placement/index.js";
import { artifacts as placementRegionArtifacts } from "../../../../../../domain/placement/modules/regions/artifacts/index.js";
import { artifacts as placementStartArtifacts } from "../../../../../../domain/placement/modules/starts/artifacts/index.js";
import { ResourceSupportSettingsSchema } from "../../../../../../domain/resources/modules/support/model/atoms/resource-support-evidence.schema.js";
import { artifacts as resourceSiteArtifacts } from "../../../../../../domain/resources/modules/sites/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_INITIAL_SETUP } from "../../../../initial-setup.js";

/**
 * S5 (D3 contract change): starts assign against the resource PLAN, not the
 * stamped outcomes — stamping happens after the resource↔start support pass.
 * The resource-support scoring term reads planned site intents.
 */
export const config = defineStep({
  id: "assign-starts",
  initialSetup: STANDARD_INITIAL_SETUP,
  engine: ["emitRuntimeWarning", "readCurrentMapFeatureTypes", "setStartPosition"] as const,
  requires: [
    resourceSiteArtifacts.resourcePlan,
    placementRegionArtifacts.landmassRegionSlotByTile,
    morphologyErosionArtifacts.topography,
    morphologyLandformsArtifacts.landmasses,
    morphologyLandformsArtifacts.mountains,
    morphologyLandformsArtifacts.volcanoes,
    morphologyShelfArtifacts.shelf,
    morphologyCoastsArtifacts.resolvedCoastline,
    climateArtifacts.climateIndices,
    hydrographyArtifacts.hydrography,
    hydrographyArtifacts.lakePlan,
    pedologyArtifacts.pedology,
  ],
  provides: [placementStartArtifacts.startAssignment],

  ops: {
    starts: placement.starts.ops.planStarts,
  },
  schema: Type.Object({
    supportRequirements: Type.Pick(ResourceSupportSettingsSchema, [
      "supportFloor",
      "supportRadiusTiles",
      "equityTolerance",
    ]),
  }),
});

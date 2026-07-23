import { artifacts as hydrologyArtifacts } from "@mapgen/domain/hydrology";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";
import { artifacts as mapHydrologyArtifacts } from "../../artifacts/index.js";

/**
 * Lake projection step (engine-facing).
 *
 * Hydrology owns lake intent. This map stage only materializes that intent and
 * records readback evidence from the adapter.
 */
const LakesStepConfigSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Lake projection has no authored step configuration; stamping and readback evidence are unconditional at the engine boundary.",
  }
);

/**
 * Defines the engine-facing lake projection boundary: it requires upstream lake and mountain
 * truth and declares both stamping and terrain-readback evidence. The implementation owns the
 * Civ7 mutation and observation.
 */
export const LakesStepContract = defineStep({
  id: "lakes",
  engine: ["stampLakes"] as const,
  requires: [],
  provides: [
    MAP_PROJECTION_EFFECT_TAGS.map.lakesPlotted,
    MAP_PROJECTION_EFFECT_TAGS.map.hydrologyLakesParityCaptured,
  ],
  artifacts: {
    requires: [
      hydrologyArtifacts.lakePlan,
      morphologyArtifacts.mountains,
      morphologyArtifacts.topography,
    ],
    provides: [
      mapHydrologyArtifacts.engineProjectionLakes,
      mapHydrologyArtifacts.hydrologyLakesEngineTerrainSnapshot,
    ],
  },
  schema: LakesStepConfigSchema,
});

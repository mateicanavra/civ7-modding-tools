import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  BathymetryFieldSchema,
  ElevationFieldSchema,
  LandMaskSchema,
  SeaLevelDatumSchema,
} from "../../../model/atoms/index.js";

/** Registers the base topography consumed only by coastline carving. */
export const artifact = defineArtifact({
  name: "baseTopography",
  id: "artifact:morphology.topography.base",
  schema: Type.Object(
    {
      elevation: ElevationFieldSchema,
      seaLevel: SeaLevelDatumSchema,
      landMask: LandMaskSchema,
      bathymetry: BathymetryFieldSchema,
    },
    {
      additionalProperties: false,
      description: "Initial Morphology topography before coastline carving.",
    }
  ),
});

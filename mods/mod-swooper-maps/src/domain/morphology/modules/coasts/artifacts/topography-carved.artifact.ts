import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  BathymetryFieldSchema,
  ElevationFieldSchema,
  LandMaskSchema,
  SeaLevelDatumSchema,
} from "../../../model/atoms/index.js";

/** Registers the carved topography consumed by routing and geomorphology. */
export const artifact = defineArtifact({
  name: "carvedTopography",
  id: "artifact:morphology.topography.carved",
  schema: Type.Object(
    {
      elevation: ElevationFieldSchema,
      seaLevel: SeaLevelDatumSchema,
      landMask: LandMaskSchema,
      bathymetry: BathymetryFieldSchema,
    },
    {
      additionalProperties: false,
      description: "Coastline-carved Morphology topography used by routing and erosion.",
    }
  ),
});

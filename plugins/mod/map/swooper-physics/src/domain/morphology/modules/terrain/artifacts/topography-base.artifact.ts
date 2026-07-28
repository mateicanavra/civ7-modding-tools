import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  BathymetryFieldSchema,
  ElevationFieldSchema,
  LandMaskSchema,
  SeaLevelDatumSchema,
} from "../../../model/atoms/index.js";

/** Registers coherent base topography shared by coastline evidence, routing, and erosion. */
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
      description:
        "Coherent base Morphology topography consumed by coastline observation and early geomorphic shaping.",
    }
  ),
});

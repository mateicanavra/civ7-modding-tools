import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  BathymetryFieldSchema,
  ElevationFieldSchema,
  LandMaskSchema,
  SeaLevelDatumSchema,
} from "../../../model/atoms/index.js";

/** Registers the canonical final topography consumed by downstream stages. */
export const artifact = defineArtifact({
  name: "topography",
  id: "artifact:morphology.topography",
  schema: Type.Object(
    {
      elevation: ElevationFieldSchema,
      seaLevel: SeaLevelDatumSchema,
      landMask: LandMaskSchema,
      bathymetry: BathymetryFieldSchema,
    },
    {
      additionalProperties: false,
      description: "Final Morphology topography consumed throughout the remaining recipe.",
    }
  ),
});

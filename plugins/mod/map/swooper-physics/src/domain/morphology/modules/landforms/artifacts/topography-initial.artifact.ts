import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  BathymetryFieldSchema,
  ElevationFieldSchema,
  ExternalWaterMaskSchema,
  LandMaskSchema,
  SeaLevelDatumSchema,
} from "../../../model/atoms/index.js";

/** Registers island-complete ground before climate-fed channel evolution and final sealing. */
export const artifact = defineArtifact({
  name: "initialTopography",
  id: "artifact:morphology.topography.initial",
  schema: Type.Object(
    {
      elevation: ElevationFieldSchema,
      seaLevel: SeaLevelDatumSchema,
      landMask: LandMaskSchema,
      externalWaterMask: ExternalWaterMaskSchema,
      bathymetry: BathymetryFieldSchema,
    },
    {
      additionalProperties: false,
      description:
        "Island-complete initial Morphology ground and wetness with an independent external-water prescription at seaLevel.",
    }
  ),
  refine: (value, { cellCount, issues }) => {
    if (!Number.isFinite(value.seaLevel)) {
      issues.add("Expected a finite external-water seaLevel datum.");
    }
    for (let index = 0; index < cellCount; index += 1) {
      const land = value.landMask[index];
      if (land !== 0 && land !== 1) {
        issues.add(`landMask[${index}] must be binary; received ${land}.`);
      }
      const membership = value.externalWaterMask[index];
      if (membership !== 0 && membership !== 1) {
        issues.add(`externalWaterMask[${index}] must be binary; received ${membership}.`);
      }
      if (membership !== 1) continue;
      if (value.landMask[index] !== 0) {
        issues.add(`externalWaterMask[${index}] must be a subset of initial water.`);
      }
      if (value.elevation[index]! > value.seaLevel) {
        issues.add(`externalWaterMask[${index}] ground must not exceed the prescribed seaLevel datum.`);
      }
    }
  },
});

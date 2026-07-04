import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const MorphologyTopographyArtifactSchema = Type.Object(
  {
    elevation: TypedArraySchemas.i16({
      description:
        "Signed elevation per tile (integer meters). Publish-once buffer handle; steps may mutate in-place via ctx.buffers.heightfield.",
    }),
    seaLevel: Type.Number({
      description:
        "Global sea level threshold in the same datum/units as elevation (meters; may be fractional).",
    }),
    landMask: TypedArraySchemas.u8({
      description:
        "Land/water mask per tile (1=land, 0=water). Must be consistent with elevation > seaLevel.",
    }),
    bathymetry: TypedArraySchemas.i16({
      description:
        "Derived bathymetry per tile (integer meters): 0 on land; <=0 in water; consistent with elevation/seaLevel.",
    }),
  },
  {
    additionalProperties: false,
    description: "Canonical Morphology topography truth (Phase 2 schema; publish-once handle).",
  }
);

export const Schema = MorphologyTopographyArtifactSchema;

export const artifact = defineArtifact({
  name: "topography",
  id: "artifact:morphology.topography",
  schema: Schema,
});

import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

type Cryosphere = Readonly<{
  snowCover: Uint8Array;
  seaIceCover: Uint8Array;
  albedo: Uint8Array;
  groundIce01: Float32Array;
  permafrost01: Float32Array;
  meltPotential01: Float32Array;
}>;

/**
 * Registers refined snow, sea-ice, albedo, ground-ice, permafrost, and melt-potential fields.
 * Downstream biome and ice planning consume one dimension-aligned cryosphere vintage.
 */
export const artifact = defineArtifact({
  name: "cryosphere",
  id: "artifact:hydrology.cryosphere",
  schema: Type.Object(
    {
      snowCover: TypedArraySchemas.u8({
        description: "Seasonal snow-cover fraction per tile (0..255).",
      }),
      seaIceCover: TypedArraySchemas.u8({
        description: "Sea-ice cover fraction per tile (0..255).",
      }),
      albedo: TypedArraySchemas.u8({
        description: "Surface reflectivity proxy used by bounded thermal feedback (0..255).",
      }),
      groundIce01: TypedArraySchemas.f32({
        description: "Persistence of subsurface ground ice on land (0..1).",
      }),
      permafrost01: TypedArraySchemas.f32({
        description: "Persistence of permafrost conditions on land (0..1).",
      }),
      meltPotential01: TypedArraySchemas.f32({
        description: "Snow-weighted capacity for seasonal melt on land (0..1).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Hydrology snow, sea-ice, albedo, ground-ice, permafrost, and melt-potential state aligned to the map grid.",
    }
  ),
  refine: (
    input: unknown,
    context?: ArtifactValidationContext
  ): readonly ArtifactValidationIssue[] => {
    const value = input as Cryosphere;
    const expectedLength = artifactCellCount(context);
    const errors: ArtifactValidationIssue[] = [];
    appendArtifactTypedArrayIssues(
      errors,
      "cryosphere.snowCover",
      value.snowCover,
      Uint8Array,
      expectedLength
    );
    appendArtifactTypedArrayIssues(
      errors,
      "cryosphere.seaIceCover",
      value.seaIceCover,
      Uint8Array,
      expectedLength
    );
    appendArtifactTypedArrayIssues(
      errors,
      "cryosphere.albedo",
      value.albedo,
      Uint8Array,
      expectedLength
    );
    appendArtifactTypedArrayIssues(
      errors,
      "cryosphere.groundIce01",
      value.groundIce01,
      Float32Array,
      expectedLength
    );
    appendArtifactTypedArrayIssues(
      errors,
      "cryosphere.permafrost01",
      value.permafrost01,
      Float32Array,
      expectedLength
    );
    appendArtifactTypedArrayIssues(
      errors,
      "cryosphere.meltPotential01",
      value.meltPotential01,
      Float32Array,
      expectedLength
    );
    return errors;
  },
});

import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers map-tile-sized tectonic belt drivers projected from Foundation
 * history and provenance for landmass, mountain, and shelf policy. Admission
 * preserves each declared typed-array constructor and one value per map tile.
 */
export const artifact = defineArtifact({
  name: "beltDrivers",
  id: "artifact:morphology.beltDrivers",
  schema: Type.Object(
    {
      boundaryCloseness: TypedArraySchemas.u8({
        description:
          "Boundary proximity field per tile (0..255), weighted by tectonic intensity and belt decay.",
      }),
      boundaryType: TypedArraySchemas.u8({
        description:
          "Boundary regime per tile (BOUNDARY_TYPE values), resolved from active eras/provenance.",
      }),
      upliftPotential: TypedArraySchemas.u8({
        description:
          "Orogeny / uplift potential per tile (0..255), decayed away from belt seed centers.",
      }),
      collisionPotential: TypedArraySchemas.u8({
        description:
          "Collision-driven uplift potential per tile (0..255), decayed away from belt seed centers.",
      }),
      subductionPotential: TypedArraySchemas.u8({
        description:
          "Subduction-driven uplift potential per tile (0..255), decayed away from belt seed centers.",
      }),
      riftPotential: TypedArraySchemas.u8({
        description: "Rift potential per tile (0..255), decayed away from belt seed centers.",
      }),
      tectonicStress: TypedArraySchemas.u8({
        description:
          "Combined tectonic stress per tile (0..255), derived from uplift/rift/shear contributions.",
      }),
      beltAge: TypedArraySchemas.u8({
        description:
          "Normalized belt age proxy per tile (0..255). 0=youngest/most recently active, 255=oldest/least recently active.",
      }),
      dominantEra: TypedArraySchemas.u8({
        description:
          "Dominant tectonic era index per tile (0..eraCount-1), based on weighted boundary intensity.",
      }),
      beltMask: TypedArraySchemas.u8({
        description: "Seed mask (1/0): tiles considered belt seed centers prior to decay.",
      }),
      beltDistance: TypedArraySchemas.u8({
        description: "Discrete distance-to-nearest-belt-seed per tile (0..255; 255=unreached).",
      }),
      beltNearestSeed: TypedArraySchemas.i32({
        description: "Nearest belt seed tile index per tile (-1 when no seed is within reach).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Canonical belt-driver fields derived from tectonic history/provenance, consumed by landmask/belts/mountains.",
    }
  ),
  refine: (input: unknown, context?: ArtifactValidationContext): ArtifactValidationIssue[] => {
    const value = input as Static<typeof artifact.schema>;
    const errors: ArtifactValidationIssue[] = [];
    const size = artifactCellCount(context);
    appendArtifactTypedArrayIssues(
      errors,
      "beltDrivers.boundaryCloseness",
      value.boundaryCloseness,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      errors,
      "beltDrivers.boundaryType",
      value.boundaryType,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      errors,
      "beltDrivers.upliftPotential",
      value.upliftPotential,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      errors,
      "beltDrivers.collisionPotential",
      value.collisionPotential,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      errors,
      "beltDrivers.subductionPotential",
      value.subductionPotential,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      errors,
      "beltDrivers.riftPotential",
      value.riftPotential,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      errors,
      "beltDrivers.tectonicStress",
      value.tectonicStress,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(errors, "beltDrivers.beltAge", value.beltAge, Uint8Array, size);
    appendArtifactTypedArrayIssues(
      errors,
      "beltDrivers.dominantEra",
      value.dominantEra,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      errors,
      "beltDrivers.beltMask",
      value.beltMask,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      errors,
      "beltDrivers.beltDistance",
      value.beltDistance,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      errors,
      "beltDrivers.beltNearestSeed",
      value.beltNearestSeed,
      Int32Array,
      size
    );
    return errors;
  },
});

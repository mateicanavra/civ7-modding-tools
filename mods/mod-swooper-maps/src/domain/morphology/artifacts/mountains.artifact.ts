import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  defineArtifactValidator,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/** Runtime schema for Morphology-owned mountain, foothill, and rough-land intent. */
export const Schema = Type.Object(
  {
    mountainMask: TypedArraySchemas.u8({
      description: "Mask (1/0): Morphology model intent for mountain terrain.",
    }),
    mountainRegionMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): Morphology model footprint for orographic provinces, including peak spines, passes, valleys, foothills, and internal rough terrain.",
    }),
    mountainRegionIdByTile: TypedArraySchemas.i32({
      description: "Per-tile orographic province id (-1 outside the mountain-region footprint).",
    }),
    hillMask: TypedArraySchemas.u8({
      description: "Mask (1/0): Morphology model intent for hill terrain excluding mountain tiles.",
    }),
    foothillMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): ridge-skirt hill terrain intent before non-foothill rough-land merge.",
    }),
    roughLandMask: TypedArraySchemas.u8({
      description: "Mask (1/0): non-foothill rough-land hill terrain intent.",
    }),
    orogenyPotential: TypedArraySchemas.u8({
      description: "Orogeny suitability field used to explain mountain placement.",
    }),
    fracturePotential: TypedArraySchemas.u8({
      description: "Fracture/rift suitability field used to explain hill and mountain placement.",
    }),
    roughnessPotential: TypedArraySchemas.u8({
      description:
        "Rolling-upland, old-highland, plateau-rim, basin-margin, and escarpment roughness field.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Mountain, foothill, and rough-land terrain intent. Morphology owns this model; map-morphology only projects it into engine terrain.",
  }
);

/**
 * Registers Morphology-owned mountain, foothill, and rough-land intent for
 * later engine projection and placement suitability.
 */
export const artifact = defineArtifact({
  name: "mountains",
  id: "artifact:morphology.mountains",
  schema: Schema,
});

/**
 * Validates map-sized typed arrays for mountain-family intent and keeps each membership mask
 * binary. Potential fields remain byte-valued measurements rather than membership masks.
 */
function validateLocal(
  input: unknown,
  context?: ArtifactValidationContext
): readonly ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  const size = artifactCellCount(context);
  for (const key of [
    "mountainMask",
    "mountainRegionMask",
    "hillMask",
    "foothillMask",
    "roughLandMask",
  ] as const) {
    if (appendArtifactTypedArrayIssues(issues, `mountains.${key}`, value[key], Uint8Array, size)) {
      validateBinaryMask(issues, `mountains.${key}`, value[key]);
    }
  }
  appendArtifactTypedArrayIssues(
    issues,
    "mountains.mountainRegionIdByTile",
    value.mountainRegionIdByTile,
    Int32Array,
    size
  );
  for (const key of ["orogenyPotential", "fracturePotential", "roughnessPotential"] as const) {
    appendArtifactTypedArrayIssues(issues, `mountains.${key}`, value[key], Uint8Array, size);
  }
  return Object.freeze(issues);
}

/** Admits map-sized mountain fields and binary terrain masks after structural admission. */
export const validate = defineArtifactValidator(artifact, validateLocal);

function validateBinaryMask(
  issues: ArtifactValidationIssue[],
  label: string,
  value: unknown
): void {
  if (!(value instanceof Uint8Array)) return;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== 0 && value[index] !== 1) {
      issues.push({
        message: `Expected ${label} values to be 0 or 1 (first invalid index ${index}).`,
      });
      return;
    }
  }
}

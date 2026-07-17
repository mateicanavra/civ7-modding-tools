import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

const MorphologyMountainsArtifactSchema = Type.Object(
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

/** Runtime schema for Morphology-owned mountain, foothill, and rough-land intent. */
export const Schema = MorphologyMountainsArtifactSchema;

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
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const issues = [...validateArtifactSchema(Schema, value)];
  if (isRecord(value)) {
    const size = artifactCellCount(context);
    for (const key of [
      "mountainMask",
      "mountainRegionMask",
      "hillMask",
      "foothillMask",
      "roughLandMask",
    ] as const) {
      if (validateTypedArray(issues, `mountains.${key}`, value[key], Uint8Array, size)) {
        validateBinaryMask(issues, `mountains.${key}`, value[key]);
      }
    }
    validateTypedArray(
      issues,
      "mountains.mountainRegionIdByTile",
      value.mountainRegionIdByTile,
      Int32Array,
      size
    );
    for (const key of ["orogenyPotential", "fracturePotential", "roughnessPotential"] as const) {
      validateTypedArray(issues, `mountains.${key}`, value[key], Uint8Array, size);
    }
  }
  return Object.freeze(issues);
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateTypedArray(
  issues: { message: string }[],
  label: string,
  value: unknown,
  constructor: { new (...args: any[]): { length: number } },
  expectedLength?: number
): value is { length: number } {
  if (!(value instanceof constructor)) {
    issues.push({ message: `Expected ${label} to be ${constructor.name}.` });
    return false;
  }
  if (expectedLength !== undefined && value.length !== expectedLength) {
    issues.push({
      message: `Expected ${label} length ${expectedLength} (received ${value.length}).`,
    });
  }
  return true;
}

function validateBinaryMask(issues: { message: string }[], label: string, value: unknown): void {
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

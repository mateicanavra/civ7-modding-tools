import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

const MorphologyShelfArtifactSchema = Type.Object(
  {
    shelfMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): continental-shelf water (margin-aware, depth-gated, shore-connected) eligible for TERRAIN_COAST projection. Derived from POST-island morphology truth so island peaks get shelves.",
    }),
    coastalLand: TypedArraySchemas.u8({
      description: "Mask (1/0): POST-island land tiles adjacent to water.",
    }),
    coastalWater: TypedArraySchemas.u8({
      description: "Mask (1/0): POST-island water tiles adjacent to land.",
    }),
    distanceToCoast: TypedArraySchemas.u16({
      description: "POST-island minimum hex distance to the nearest coastline tile (0=coast).",
    }),
    activeMarginMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): water tiles treated as active margin (convergent/transform, high closeness) => shallower break.",
    }),
    depthGateMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): water tiles passing the per-tile depth gate (bathymetry >= break depth).",
    }),
    nearshoreCandidateMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): water tiles within breakDepthSampleRadius used to sample the break depth.",
    }),
    shelfBreakDepthByTile: TypedArraySchemas.i16({
      description:
        "Per-tile shelf-break depth (engine elevation units, <=0) after margin modulation; deeper => wider local shelf.",
    }),
    shallowCutoff: Type.Number({
      description:
        "Base shelf-break depth (engine elevation units, <=0): nearshore quantile before margin modulation.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Continental-shelf truth + post-island coastline metrics (stage morphology-shelf, after islands/mountains).",
  }
);

export const Schema = MorphologyShelfArtifactSchema;

export const artifact = defineArtifact({
  name: "shelf",
  id: "artifact:morphology.shelf",
  schema: Schema,
});

type ArtifactValidationIssue = Readonly<{ message: string }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function expectedSize(dimensions: NonNullable<ArtifactValidationContext["dimensions"]>): number {
  return Math.max(0, (dimensions.width | 0) * (dimensions.height | 0));
}

function validateTypedArray(
  errors: ArtifactValidationIssue[],
  label: string,
  value: unknown,
  ctor: { new (...args: any[]): { length: number } },
  expectedLength?: number
): value is { length: number } {
  if (!(value instanceof ctor)) {
    errors.push({ message: `Expected ${label} to be ${ctor.name}.` });
    return false;
  }
  if (expectedLength != null && value.length !== expectedLength) {
    errors.push({
      message: `Expected ${label} length ${expectedLength} (received ${value.length}).`,
    });
  }
  return true;
}

function validatePayload(
  value: unknown,
  dimensions: NonNullable<ArtifactValidationContext["dimensions"]>
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    errors.push({ message: "Missing shelf artifact." });
    return errors;
  }
  const size = expectedSize(dimensions);
  const c = value as Record<string, unknown>;
  validateTypedArray(errors, "shelf.shelfMask", c.shelfMask, Uint8Array, size);
  validateTypedArray(errors, "shelf.coastalLand", c.coastalLand, Uint8Array, size);
  validateTypedArray(errors, "shelf.coastalWater", c.coastalWater, Uint8Array, size);
  validateTypedArray(errors, "shelf.distanceToCoast", c.distanceToCoast, Uint16Array, size);
  validateTypedArray(errors, "shelf.activeMarginMask", c.activeMarginMask, Uint8Array, size);
  validateTypedArray(errors, "shelf.depthGateMask", c.depthGateMask, Uint8Array, size);
  validateTypedArray(
    errors,
    "shelf.nearshoreCandidateMask",
    c.nearshoreCandidateMask,
    Uint8Array,
    size
  );
  validateTypedArray(
    errors,
    "shelf.shelfBreakDepthByTile",
    c.shelfBreakDepthByTile,
    Int16Array,
    size
  );
  if (!Number.isFinite(c.shallowCutoff) || (c.shallowCutoff as number) > 0) {
    errors.push({ message: "shelf.shallowCutoff must be a finite number <= 0." });
  }
  return errors;
}

export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  if (!context?.dimensions) return schemaIssues;
  return Object.freeze([...schemaIssues, ...validatePayload(value, context.dimensions)]);
}

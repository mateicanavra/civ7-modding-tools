import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

const MorphologyBeltComponentSummarySchema = Type.Object(
  {
    id: Type.Integer({
      minimum: 0,
      description: "Stable id within this belt-driver snapshot (1..n).",
    }),
    boundaryType: Type.Integer({
      minimum: 0,
      description: "Boundary type (BOUNDARY_TYPE values).",
    }),
    size: Type.Integer({
      minimum: 0,
      description: "Number of tiles in this connected belt seed component.",
    }),
    diameter: Type.Integer({
      minimum: 0,
      description: "Approximate hex-graph end-to-end length of this connected belt seed component.",
    }),
    meanUpliftBlend: Type.Number({
      description:
        "Mean uplift blend intensity (0..255) across belt seeds in this component (pre-decay).",
    }),
    meanWidthScale: Type.Number({
      description: "Mean width scale multiplier (unitless) across belt seeds in this component.",
    }),
    meanSigma: Type.Number({
      description: "Mean sigma used to decay belt influence (unitless; larger = wider belts).",
    }),
    meanOriginEra: Type.Number({
      description: "Mean origin era index across belt seeds in this component (0..eraCount-1).",
    }),
    meanOriginPlateId: Type.Number({
      description:
        "Mean origin plate id across belt seeds in this component (plate id; -1 for unknown).",
    }),
  },
  {
    additionalProperties: false,
    description: "One connected belt seed component summary (debugging/diagnostics payload).",
  }
);

const MorphologyBeltDriversArtifactSchema = Type.Object(
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
    beltComponents: Type.Immutable(Type.Array(MorphologyBeltComponentSummarySchema)),
  },
  {
    additionalProperties: false,
    description:
      "Canonical belt-driver fields derived from tectonic history/provenance, consumed by landmask/belts/mountains.",
  }
);

export const Schema = MorphologyBeltDriversArtifactSchema;

export const artifact = defineArtifact({
  name: "beltDrivers",
  id: "artifact:morphology.beltDrivers",
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
    errors.push({ message: "Missing beltDrivers buffer." });
    return errors;
  }
  const size = expectedSize(dimensions);
  const candidate = value as {
    boundaryCloseness?: unknown;
    boundaryType?: unknown;
    upliftPotential?: unknown;
    collisionPotential?: unknown;
    subductionPotential?: unknown;
    riftPotential?: unknown;
    tectonicStress?: unknown;
    beltAge?: unknown;
    dominantEra?: unknown;
    beltMask?: unknown;
    beltDistance?: unknown;
    beltNearestSeed?: unknown;
    beltComponents?: unknown;
  };
  validateTypedArray(
    errors,
    "beltDrivers.boundaryCloseness",
    candidate.boundaryCloseness,
    Uint8Array,
    size
  );
  validateTypedArray(errors, "beltDrivers.boundaryType", candidate.boundaryType, Uint8Array, size);
  validateTypedArray(
    errors,
    "beltDrivers.upliftPotential",
    candidate.upliftPotential,
    Uint8Array,
    size
  );
  validateTypedArray(
    errors,
    "beltDrivers.collisionPotential",
    candidate.collisionPotential,
    Uint8Array,
    size
  );
  validateTypedArray(
    errors,
    "beltDrivers.subductionPotential",
    candidate.subductionPotential,
    Uint8Array,
    size
  );
  validateTypedArray(
    errors,
    "beltDrivers.riftPotential",
    candidate.riftPotential,
    Uint8Array,
    size
  );
  validateTypedArray(
    errors,
    "beltDrivers.tectonicStress",
    candidate.tectonicStress,
    Uint8Array,
    size
  );
  validateTypedArray(errors, "beltDrivers.beltAge", candidate.beltAge, Uint8Array, size);
  validateTypedArray(errors, "beltDrivers.dominantEra", candidate.dominantEra, Uint8Array, size);
  validateTypedArray(errors, "beltDrivers.beltMask", candidate.beltMask, Uint8Array, size);
  validateTypedArray(errors, "beltDrivers.beltDistance", candidate.beltDistance, Uint8Array, size);
  validateTypedArray(
    errors,
    "beltDrivers.beltNearestSeed",
    candidate.beltNearestSeed,
    Int32Array,
    size
  );
  if (!Array.isArray(candidate.beltComponents)) {
    errors.push({ message: "Expected beltDrivers.beltComponents to be an array." });
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

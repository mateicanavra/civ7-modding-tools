import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
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

/** Runtime schema for canonical tectonic belt drivers and their component summaries. */
export const Schema = MorphologyBeltDriversArtifactSchema;

/**
 * Registers map-tile-sized tectonic belt drivers projected from Foundation
 * history and provenance for landmass, mountain, and shelf policy.
 */
export const artifact = defineArtifact({
  name: "beltDrivers",
  id: "artifact:morphology.beltDrivers",
  schema: Schema,
});

type ArtifactValidationIssue = Readonly<{ message: string }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validatePayload(
  value: unknown,
  context?: ArtifactValidationContext
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    if (context?.dimensions) {
      errors.push({ message: "Missing beltDrivers artifact value." });
    }
    return errors;
  }
  const size = artifactCellCount(context);
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
  appendArtifactTypedArrayIssues(
    errors,
    "beltDrivers.boundaryCloseness",
    candidate.boundaryCloseness,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "beltDrivers.boundaryType",
    candidate.boundaryType,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "beltDrivers.upliftPotential",
    candidate.upliftPotential,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "beltDrivers.collisionPotential",
    candidate.collisionPotential,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "beltDrivers.subductionPotential",
    candidate.subductionPotential,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "beltDrivers.riftPotential",
    candidate.riftPotential,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "beltDrivers.tectonicStress",
    candidate.tectonicStress,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "beltDrivers.beltAge",
    candidate.beltAge,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "beltDrivers.dominantEra",
    candidate.dominantEra,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "beltDrivers.beltMask",
    candidate.beltMask,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "beltDrivers.beltDistance",
    candidate.beltDistance,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "beltDrivers.beltNearestSeed",
    candidate.beltNearestSeed,
    Int32Array,
    size
  );
  if (context?.dimensions && !Array.isArray(candidate.beltComponents)) {
    errors.push({ message: "Expected beltDrivers.beltComponents to be an array." });
  }
  return errors;
}

/**
 * Validates the closed belt vocabulary, component summaries, typed-array
 * kinds, and, when dimensions are available, one value per map tile.
 */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  return Object.freeze([...schemaIssues, ...validatePayload(value, context)]);
}

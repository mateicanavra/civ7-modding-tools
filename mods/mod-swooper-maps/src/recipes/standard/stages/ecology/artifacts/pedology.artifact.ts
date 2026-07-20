import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Runtime contract for Ecology's per-tile soil class and normalized fertility truth. */
export const PedologyArtifactSchema = Type.Object({
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  soilType: TypedArraySchemas.u8({ description: "Soil type index per tile." }),
  fertility: TypedArraySchemas.f32({ description: "Fertility per tile (0..1)." }),
});

export type PedologyArtifact = Static<typeof PedologyArtifactSchema>;

/** Canonical schema entrypoint used by pedology publication and payload admission. */
export const Schema = PedologyArtifactSchema;

/**
 * Registers per-tile soil class and normalized fertility derived from morphology and baseline
 * climate. Biome and resource-basin planning share this artifact rather than recomputing soil
 * proxies.
 */
export const artifact = defineArtifact({
  name: "pedology",
  id: "artifact:ecology.soils",
  schema: Schema,
});

export type ArtifactValidationIssue = Readonly<{ message: string }>;

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validatePayload(
  value: unknown,
  context?: ArtifactValidationContext
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    if (context?.dimensions) errors.push({ message: "Invalid pedology artifact payload." });
    return errors;
  }
  const dimensions = context?.dimensions;
  const size = artifactCellCount(context);
  if (dimensions && (value.width !== dimensions.width || value.height !== dimensions.height)) {
    errors.push({ message: "Pedology dimensions mismatch." });
  }
  appendArtifactTypedArrayIssues(errors, "soilType", value.soilType, Uint8Array, size);
  appendArtifactTypedArrayIssues(errors, "fertility", value.fertility, Float32Array, size);
  return errors;
}

/**
 * Validates pedology against its closed schema and, when map dimensions are supplied, verifies
 * every tile field matches that width × height. It returns accumulated issues so artifact
 * admission can reject a structurally valid but spatially inconsistent payload.
 */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  return Object.freeze([...schemaIssues, ...validatePayload(value, context)]);
}

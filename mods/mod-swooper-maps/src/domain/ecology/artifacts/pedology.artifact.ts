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

/** Runtime contract for Ecology's per-tile soil class and normalized fertility truth. */
const Schema = Type.Object({
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  soilType: TypedArraySchemas.u8({ description: "Soil type index per tile." }),
  fertility: TypedArraySchemas.f32({ description: "Fertility per tile (0..1)." }),
});

export type PedologyArtifact = Static<typeof Schema>;

/**
 * Registers per-tile soil class and normalized fertility derived from morphology and baseline
 * climate. Biome and resource-basin planning share this artifact rather than recomputing soil
 * proxies.
 */
export const artifact = defineArtifact({
  name: "pedology",
  id: "artifact:ecology.soils",
  schema: Schema,
  refine: validateLocal,
});

/**
 * Validates pedology against its closed schema and, when map dimensions are supplied, verifies
 * every tile field matches that width × height. It returns accumulated issues so artifact
 * admission can reject a structurally valid but spatially inconsistent payload.
 */
function validateLocal(
  input: unknown,
  context?: ArtifactValidationContext
): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const errors: ArtifactValidationIssue[] = [];
  const dimensions = context?.dimensions;
  const size = artifactCellCount(context);
  if (dimensions && (value.width !== dimensions.width || value.height !== dimensions.height)) {
    errors.push({ message: "Pedology dimensions mismatch." });
  }
  appendArtifactTypedArrayIssues(errors, "soilType", value.soilType, Uint8Array, size);
  appendArtifactTypedArrayIssues(errors, "fertility", value.fertility, Float32Array, size);
  return errors;
}

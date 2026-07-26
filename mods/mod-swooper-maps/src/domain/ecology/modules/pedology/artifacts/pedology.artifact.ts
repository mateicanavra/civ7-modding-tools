import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

type Pedology = Readonly<{
  width: number;
  height: number;
  soilType: Uint8Array;
  fertility: Float32Array;
}>;

/**
 * Registers per-tile soil class and normalized fertility derived from morphology and baseline
 * climate. Biome and resource-basin planning share this artifact rather than recomputing soil
 * proxies.
 */
export const artifact = defineArtifact({
  name: "pedology",
  id: "artifact:ecology.soils",
  schema: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map-grid width represented by the fields." }),
      height: Type.Integer({
        minimum: 1,
        description: "Map-grid height represented by the fields.",
      }),
      soilType: TypedArraySchemas.u8({ description: "Soil type index per tile." }),
      fertility: TypedArraySchemas.f32({ description: "Normalized fertility per tile (0..1)." }),
    },
    {
      additionalProperties: false,
      description: "Per-tile Ecology soil class and normalized fertility evidence.",
    }
  ),
  refine: (
    input: unknown,
    context?: ArtifactValidationContext
  ): readonly ArtifactValidationIssue[] => {
    const value = input as Pedology;
    const errors: ArtifactValidationIssue[] = [];
    const dimensions = context?.dimensions;
    const size = artifactCellCount(context);
    if (dimensions && (value.width !== dimensions.width || value.height !== dimensions.height)) {
      errors.push({ message: "Pedology dimensions mismatch." });
    }
    appendArtifactTypedArrayIssues(errors, "soilType", value.soilType, Uint8Array, size);
    appendArtifactTypedArrayIssues(errors, "fertility", value.fertility, Float32Array, size);
    return errors;
  },
});

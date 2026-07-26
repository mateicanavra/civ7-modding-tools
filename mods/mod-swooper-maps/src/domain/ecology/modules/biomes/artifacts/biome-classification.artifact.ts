import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";
import { BIOME_SYMBOL_ORDER } from "../../../model/atoms/biome-symbol.schema.js";

type BiomeClassification = Readonly<{
  width: number;
  height: number;
  biomeIndex: Uint8Array;
  vegetationDensity: Float32Array;
  treeLine01: Float32Array;
}>;

/**
 * Registers Ecology's per-tile biome classification after climate, pedology, and topography
 * classification. Feature scoring and map projection consume this field beside the declared
 * Hydrology climate and cryosphere vintages rather than a denormalized copy.
 */
export const artifact = defineArtifact({
  name: "biomeClassification",
  id: "artifact:ecology.biomeClassification",
  schema: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map-grid width represented by the fields." }),
      height: Type.Integer({
        minimum: 1,
        description: "Map-grid height represented by the fields.",
      }),
      biomeIndex: TypedArraySchemas.u8({
        description: "Biome symbol index per land tile; 255 marks water or an unclassified tile.",
      }),
      vegetationDensity: TypedArraySchemas.f32({
        description: "Vegetation density per tile (0..1).",
      }),
      treeLine01: TypedArraySchemas.f32({
        description: "Tree-line suitability per tile (0..1).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Per-tile Ecology biome identity, vegetation density, and derived tree-line evidence.",
    }
  ),
  refine: (
    input: unknown,
    context?: ArtifactValidationContext
  ): readonly ArtifactValidationIssue[] => {
    const value = input as BiomeClassification;
    const errors: ArtifactValidationIssue[] = [];
    const dimensions = context?.dimensions;
    const size = artifactCellCount(context);
    if (dimensions && (value.width !== dimensions.width || value.height !== dimensions.height)) {
      errors.push({ message: "Biome classification dimensions mismatch." });
    }
    if (
      appendArtifactTypedArrayIssues<Uint8Array>(
        errors,
        "biomeIndex",
        value.biomeIndex,
        Uint8Array,
        size
      )
    ) {
      validateBiomeIndices(errors, value.biomeIndex);
    }
    if (
      appendArtifactTypedArrayIssues<Float32Array>(
        errors,
        "vegetationDensity",
        value.vegetationDensity,
        Float32Array,
        size
      )
    ) {
      validateFiniteValues(errors, "vegetationDensity", value.vegetationDensity, 0, 1);
    }
    if (
      appendArtifactTypedArrayIssues<Float32Array>(
        errors,
        "treeLine01",
        value.treeLine01,
        Float32Array,
        size
      )
    ) {
      validateFiniteValues(errors, "treeLine01", value.treeLine01, 0, 1);
    }
    return errors;
  },
});

function validateBiomeIndices(errors: ArtifactValidationIssue[], values: Uint8Array): void {
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]!;
    if (value !== 255 && value >= BIOME_SYMBOL_ORDER.length) {
      errors.push({
        message: `Expected biomeIndex values to reference the closed biome vocabulary or sentinel 255 (first invalid index ${index}).`,
      });
      return;
    }
  }
}

function validateFiniteValues(
  errors: ArtifactValidationIssue[],
  label: string,
  values: Float32Array,
  minimum?: number,
  maximum?: number
): void {
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]!;
    if (
      !Number.isFinite(value) ||
      (minimum !== undefined && value < minimum) ||
      (maximum !== undefined && value > maximum)
    ) {
      const range =
        minimum === undefined || maximum === undefined ? "finite" : `${minimum}..${maximum}`;
      errors.push({
        message: `Expected ${label} values to be ${range} (first invalid index ${index}).`,
      });
      return;
    }
  }
}

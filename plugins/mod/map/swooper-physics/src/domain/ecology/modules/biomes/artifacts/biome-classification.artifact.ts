import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { BIOME_SYMBOL_ORDER } from "../../../model/atoms/biome-symbol.schema.js";

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
        cardinality: "map-grid",
        description: "Biome symbol index per land tile; 255 marks water or an unclassified tile.",
      }),
      vegetationDensity: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description: "Vegetation density per tile (0..1).",
      }),
      treeLine01: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description: "Tree-line suitability per tile (0..1).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Per-tile Ecology biome identity, vegetation density, and derived tree-line evidence.",
    }
  ),
  refine: (value, { dimensions, issues }) => {
    if (value.width !== dimensions.width || value.height !== dimensions.height) {
      issues.add("Biome classification dimensions mismatch.");
    }
    const invalidBiomeIndex = findInvalidBiomeIndex(value.biomeIndex);
    if (invalidBiomeIndex >= 0) {
      issues.add(
        `Expected biomeIndex values to reference the closed biome vocabulary or sentinel 255 (first invalid index ${invalidBiomeIndex}).`
      );
    }
    const invalidVegetationDensityIndex = findInvalidFiniteValueIndex(
      value.vegetationDensity,
      0,
      1
    );
    if (invalidVegetationDensityIndex >= 0) {
      issues.add(
        `Expected vegetationDensity values to be 0..1 (first invalid index ${invalidVegetationDensityIndex}).`
      );
    }
    const invalidTreeLineIndex = findInvalidFiniteValueIndex(value.treeLine01, 0, 1);
    if (invalidTreeLineIndex >= 0) {
      issues.add(
        `Expected treeLine01 values to be 0..1 (first invalid index ${invalidTreeLineIndex}).`
      );
    }
  },
});

function findInvalidBiomeIndex(values: ArrayLike<number>): number {
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]!;
    if (value !== 255 && value >= BIOME_SYMBOL_ORDER.length) {
      return index;
    }
  }
  return -1;
}

function findInvalidFiniteValueIndex(
  values: ArrayLike<number>,
  minimum: number,
  maximum: number
): number {
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]!;
    if (!Number.isFinite(value) || value < minimum || value > maximum) {
      return index;
    }
  }
  return -1;
}

import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

const MapMorphologyCoastClassificationArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    baseWaterClass: TypedArraySchemas.u8({
      description:
        "Pre-policy water class derived from Morphology truth (0=land, 1=coast, 2=ocean).",
    }),
    sourceCoastMask: TypedArraySchemas.u8({
      description:
        "Mask of water tiles selected for coast projection from the post-island continental shelf (shelf.shelfMask) or the shoreline ring (shelf.coastalWater), before the coast-ring guarantee.",
    }),
    waterClass: TypedArraySchemas.u8({
      description:
        "Water class stamped into engine terrain (0=land, 1=coast, 2=ocean): the shelf plus the guaranteed land-adjacent coast ring.",
    }),
    coastRingMask: TypedArraySchemas.u8({
      description:
        "Mask of ocean tiles promoted to coast by the land-adjacent coast-ring guarantee (residue not already covered by the shelf).",
    }),
    promotedOceanToCoast: Type.Integer({
      minimum: 0,
      description: "Count of ocean tiles promoted to coast by the coast-ring guarantee.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Map-morphology coast classification snapshot captured before terrain stamping for parity diagnostics.",
  }
);

/** Runtime schema for the authored coast classes and masks captured before engine stamping. */
export const Schema = MapMorphologyCoastClassificationArtifactSchema;

/**
 * Registers the pre-stamp coast policy result consumed by continent projection
 * and coast parity diagnostics.
 */
export const artifact = defineArtifact({
  name: "coastClassification",
  id: "artifact:map.morphology.coastClassification",
  schema: Schema,
});

/** Validates the closed coast classes, masks, dimensions, and promotion count. */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const issues = [...validateArtifactSchema(Schema, value)];
  if (value === null || typeof value !== "object") return Object.freeze(issues);
  const candidate = value as Record<string, unknown>;
  const cellCount = artifactCellCount(context);
  appendArtifactTypedArrayIssues(
    issues,
    "baseWaterClass",
    candidate.baseWaterClass,
    Uint8Array,
    cellCount
  );
  appendArtifactTypedArrayIssues(
    issues,
    "sourceCoastMask",
    candidate.sourceCoastMask,
    Uint8Array,
    cellCount
  );
  appendArtifactTypedArrayIssues(issues, "waterClass", candidate.waterClass, Uint8Array, cellCount);
  appendArtifactTypedArrayIssues(
    issues,
    "coastRingMask",
    candidate.coastRingMask,
    Uint8Array,
    cellCount
  );
  return Object.freeze(issues);
}

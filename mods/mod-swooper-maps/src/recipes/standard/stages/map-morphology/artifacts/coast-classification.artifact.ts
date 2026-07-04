import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";

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

export const Schema = MapMorphologyCoastClassificationArtifactSchema;

export const artifact = defineArtifact({
  name: "coastClassification",
  id: "artifact:map.morphology.coastClassification",
  schema: Schema,
});

export function validate(value: unknown): readonly { message: string }[] {
  return validateArtifactSchema(Schema, value);
}

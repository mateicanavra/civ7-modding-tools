import { Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Reusable Ecology model for feature claims and permanently reserved map tiles. */
export const FeatureOccupancySchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1, description: "Map-grid width represented by both masks." }),
    height: Type.Integer({
      minimum: 1,
      description: "Map-grid height represented by both masks.",
    }),
    featureOccupancyMask: TypedArraySchemas.u8({
      description: "0 = unoccupied, nonzero = already claimed by an ecology feature intent",
    }),
    reserved: TypedArraySchemas.u8({
      description: "0 = tile can be claimed, 1 = permanently blocked",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Ecology feature claims and permanent reservations aligned to one declared map grid.",
  }
);

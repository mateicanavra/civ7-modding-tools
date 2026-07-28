import { type Static, Type } from "@swooper/mapgen-core/authoring/schema";

/** One projected plate's tile-space area, centroid, and adjacency. */
export const PlateTopologyNodeSchema = Type.Object(
  {
    id: Type.Integer({ minimum: 0, description: "Index-aligned plate identifier." }),
    area: Type.Integer({ minimum: 0, description: "Plate area measured in map tiles." }),
    centroid: Type.Object(
      {
        x: Type.Number({ description: "Plate centroid X coordinate in tile space." }),
        y: Type.Number({ description: "Plate centroid Y coordinate in tile space." }),
      },
      { additionalProperties: false, description: "Plate centroid in map-tile coordinates." }
    ),
    neighbors: Type.Array(Type.Integer({ minimum: 0 }), {
      default: [],
      description: "Sorted unique identifiers of adjacent plates.",
    }),
  },
  {
    additionalProperties: false,
    description: "One projected plate's tile-space area, centroid, and adjacency.",
  }
);

/** Tile-space topology record for one projected plate. */
export type PlateTopologyNode = Static<typeof PlateTopologyNodeSchema>;

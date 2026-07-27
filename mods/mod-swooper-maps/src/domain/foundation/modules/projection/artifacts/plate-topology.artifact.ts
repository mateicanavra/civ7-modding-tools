import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { PlateTopologyNodeSchema } from "../model/atoms/plate-topology-node.schema.js";

/**
 * Publishes tile-space plate areas, centroids, and adjacency for topology-aware downstream
 * consumers. Admission preserves direct indexing by requiring canonical plate ids, exact count
 * alignment, and in-range neighbor references.
 */
export const artifact = defineArtifact({
  name: "plateTopology",
  id: "artifact:foundation.plateTopology",
  schema: Type.Object(
    {
      plateCount: Type.Integer({ minimum: 1, description: "Number of represented plates." }),
      plates: Type.Array(PlateTopologyNodeSchema, {
        description: "Topology nodes indexed by plate identifier.",
      }),
    },
    {
      additionalProperties: false,
      description: "Index-aligned plate areas, centroids, and adjacency in map-tile space.",
    }
  ),
  refine: (value, { issues }) => {
    if (value.plates.length !== value.plateCount) {
      issues.add("plates length must match plateCount");
    }
    value.plates.forEach((plate, index) => {
      if (plate.id !== index) {
        issues.add(`plates[${index}].id must match its index`);
      }
      if (plate.neighbors.some((neighbor) => neighbor >= value.plateCount)) {
        issues.add(`plates[${index}].neighbors contains an invalid plate id`);
      }
    });
  },
});

import type { ArtifactValidationIssue } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  type PlateTopologyNode,
  PlateTopologyNodeSchema,
} from "../model/atoms/plate-topology-node.schema.js";

type PlateTopology = Readonly<{ plateCount: number; plates: ReadonlyArray<PlateTopologyNode> }>;

/** Registers Foundation's plate-topology artifact. */
export const artifact = defineArtifact({
  name: "foundationPlateTopology",
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
  refine: (value): readonly ArtifactValidationIssue[] => {
    const topology = value as PlateTopology;
    const issues: ArtifactValidationIssue[] = [];
    if (topology.plates.length !== topology.plateCount) {
      issues.push({ message: "plates length must match plateCount" });
    }
    topology.plates.forEach((plate, index) => {
      if (plate.id !== index) {
        issues.push({ message: `plates[${index}].id must match its index` });
      }
      if (plate.neighbors.some((neighbor) => neighbor >= topology.plateCount)) {
        issues.push({ message: `plates[${index}].neighbors contains an invalid plate id` });
      }
    });
    return issues;
  },
});

import type { ArtifactValidationIssue, Static } from "@swooper/mapgen-core/authoring/contracts";
import {
  defineArtifact,
  defineArtifactValidator,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

const PlateTopologyNodeSchema = Type.Object(
  {
    id: Type.Integer({ minimum: 0, description: "Plate id (0..plateCount-1)." }),
    area: Type.Integer({ minimum: 0, description: "Plate area in tiles." }),
    centroid: Type.Object(
      {
        x: Type.Number({ description: "Plate centroid X (tile space)." }),
        y: Type.Number({ description: "Plate centroid Y (tile space)." }),
      },
      { description: "Plate centroid in tile-space coordinates." }
    ),
    neighbors: Type.Array(Type.Integer({ minimum: 0, description: "Neighbor plate id." }), {
      default: [],
      description: "Sorted, unique adjacent plate ids.",
    }),
  },
  { additionalProperties: false }
);

/** Structural contract for index-addressed plate topology. */
export const Schema = Type.Object(
  {
    plateCount: Type.Integer({ minimum: 1, description: "Number of plates." }),
    plates: Type.Array(PlateTopologyNodeSchema, {
      description: "Plate topology nodes (indexed by plate id).",
    }),
  },
  { additionalProperties: false }
);

/** Plate topology state published by Foundation. */
export type Artifact = Static<typeof Schema>;

/** Registers Foundation's plate-topology artifact. */
export const artifact = defineArtifact({
  name: "foundationPlateTopology",
  id: "artifact:foundation.plateTopology",
  schema: Schema,
});

function validateLocal(value: unknown): readonly ArtifactValidationIssue[] {
  const topology = value as Artifact;
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
}

/** Validates topology cardinality, index-aligned identities, and bounded neighbor references. */
export const validate = defineArtifactValidator(artifact, validateLocal);

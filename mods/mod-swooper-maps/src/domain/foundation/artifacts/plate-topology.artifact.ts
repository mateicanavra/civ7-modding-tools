import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

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

export const Schema = Type.Object(
  {
    plateCount: Type.Integer({ minimum: 1, description: "Number of plates." }),
    plates: Type.Array(PlateTopologyNodeSchema, {
      description: "Plate topology nodes (indexed by plate id).",
    }),
  },
  { additionalProperties: false }
);

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "foundationPlateTopology",
  id: "artifact:foundation.plateTopology",
  schema: Schema,
});

function issue(message: string): { message: string } {
  return { message };
}

export function validate(value: unknown): readonly { message: string }[] {
  const issues = Array.from(Value.Errors(Schema, value), (error) =>
    issue(
      `${(error as { path?: string; instancePath?: string }).path ?? (error as { instancePath?: string }).instancePath ?? "/"} ${error.message}`
    )
  );

  if (value && typeof value === "object") {
    const topology = value as Record<string, unknown>;
    const plateCount = Number.isInteger(topology.plateCount) ? (topology.plateCount as number) : 0;
    if (plateCount <= 0) issues.push(issue("plateCount must be positive"));
    if (!Array.isArray(topology.plates) || topology.plates.length !== plateCount) {
      issues.push(issue("plates length must match plateCount"));
    } else {
      topology.plates.forEach((plate, index) => {
        if (!plate || typeof plate !== "object") {
          issues.push(issue(`plates[${index}] must be an object`));
          return;
        }
        const record = plate as Record<string, unknown>;
        if (!Number.isInteger(record.id) || record.id !== index) {
          issues.push(issue(`plates[${index}].id must match its index`));
        }
        if (!Number.isInteger(record.area) || (record.area as number) < 0) {
          issues.push(issue(`plates[${index}].area must be a nonnegative integer`));
        }
        const centroid = record.centroid as Record<string, unknown> | undefined;
        if (
          !centroid ||
          typeof centroid.x !== "number" ||
          !Number.isFinite(centroid.x) ||
          typeof centroid.y !== "number" ||
          !Number.isFinite(centroid.y)
        ) {
          issues.push(issue(`plates[${index}].centroid must contain finite x/y`));
        }
        if (!Array.isArray(record.neighbors)) {
          issues.push(issue(`plates[${index}].neighbors must be an array`));
        } else if (
          record.neighbors.some(
            (neighbor) =>
              !Number.isInteger(neighbor) || (neighbor as number) < 0 || (neighbor as number) >= plateCount
          )
        ) {
          issues.push(issue(`plates[${index}].neighbors contains an invalid plate id`));
        }
      });
    }
  }

  return Object.freeze(issues);
}

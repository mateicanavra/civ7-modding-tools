import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

const PlateSchema = Type.Object(
  {
    id: Type.Integer({ minimum: 0 }),
    role: Type.Union([
      Type.Literal("polarCap"),
      Type.Literal("polarMicroplate"),
      Type.Literal("tectonic"),
    ]),
    kind: Type.Union([Type.Literal("major"), Type.Literal("minor")]),
    seedX: Type.Number(),
    seedY: Type.Number(),
  },
  { additionalProperties: false }
);

export const Schema = Type.Object(
  {
    cellToPlate: TypedArraySchemas.i16({ shape: null }),
    plates: Type.Immutable(Type.Array(PlateSchema)),
  },
  { additionalProperties: false }
);

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "foundationPlateGraph",
  id: "artifact:foundation.plateGraph",
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
    const graph = value as Record<string, unknown>;
    if (!(graph.cellToPlate instanceof Int16Array)) {
      issues.push(issue("cellToPlate must be Int16Array"));
    }
    if (!Array.isArray(graph.plates) || graph.plates.length <= 0) {
      issues.push(issue("plates must be a nonempty array"));
    } else {
      graph.plates.forEach((plate, index) => {
        if (!plate || typeof plate !== "object") {
          issues.push(issue(`plates[${index}] must be an object`));
          return;
        }
        const record = plate as Record<string, unknown>;
        if (!Number.isInteger(record.id) || (record.id as number) < 0) {
          issues.push(issue(`plates[${index}].id must be a nonnegative integer`));
        }
        if (!["polarCap", "polarMicroplate", "tectonic"].includes(String(record.role))) {
          issues.push(issue(`plates[${index}].role is invalid`));
        }
        if (!["major", "minor"].includes(String(record.kind))) {
          issues.push(issue(`plates[${index}].kind is invalid`));
        }
        if (typeof record.seedX !== "number" || !Number.isFinite(record.seedX)) {
          issues.push(issue(`plates[${index}].seedX must be finite`));
        }
        if (typeof record.seedY !== "number" || !Number.isFinite(record.seedY)) {
          issues.push(issue(`plates[${index}].seedY must be finite`));
        }
      });
    }
  }
  return Object.freeze(issues);
}

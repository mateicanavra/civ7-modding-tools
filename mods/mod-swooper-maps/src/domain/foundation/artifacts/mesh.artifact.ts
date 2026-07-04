import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

const BoundingBoxSchema = Type.Object(
  {
    xl: Type.Number(),
    xr: Type.Number(),
    yt: Type.Number(),
    yb: Type.Number(),
  },
  { additionalProperties: false }
);

export const Schema = Type.Object(
  {
    cellCount: Type.Integer({ minimum: 1 }),
    wrapWidth: Type.Number(),
    siteX: TypedArraySchemas.f32({ shape: null }),
    siteY: TypedArraySchemas.f32({ shape: null }),
    neighborsOffsets: TypedArraySchemas.i32({ shape: null }),
    neighbors: TypedArraySchemas.i32({ shape: null }),
    areas: TypedArraySchemas.f32({ shape: null }),
    bbox: BoundingBoxSchema,
  },
  { additionalProperties: false }
);

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "foundationMesh",
  id: "artifact:foundation.mesh",
  schema: Schema,
});

function issue(message: string): { message: string } {
  return { message };
}

function typedArrayIssue(
  value: unknown,
  ctor: Float32ArrayConstructor | Int32ArrayConstructor,
  key: string,
  length?: number
): { message: string } | null {
  if (!(value instanceof ctor)) return issue(`${key} must be ${ctor.name}`);
  if (length !== undefined && value.length !== length) {
    return issue(`${key} length must be ${length}`);
  }
  return null;
}

export function validate(value: unknown): readonly { message: string }[] {
  const issues = Array.from(Value.Errors(Schema, value), (error) =>
    issue(
      `${(error as { path?: string; instancePath?: string }).path ?? (error as { instancePath?: string }).instancePath ?? "/"} ${error.message}`
    )
  );

  if (value && typeof value === "object") {
    const mesh = value as Record<string, unknown>;
    const cellCount = Number.isInteger(mesh.cellCount) ? (mesh.cellCount as number) : 0;
    if (
      typeof mesh.wrapWidth !== "number" ||
      !Number.isFinite(mesh.wrapWidth) ||
      mesh.wrapWidth <= 0
    ) {
      issues.push(issue("wrapWidth must be finite and positive"));
    }
    for (const candidate of [
      typedArrayIssue(mesh.siteX, Float32Array, "siteX", cellCount),
      typedArrayIssue(mesh.siteY, Float32Array, "siteY", cellCount),
      typedArrayIssue(mesh.neighborsOffsets, Int32Array, "neighborsOffsets", cellCount + 1),
      typedArrayIssue(mesh.neighbors, Int32Array, "neighbors"),
      typedArrayIssue(mesh.areas, Float32Array, "areas", cellCount),
    ]) {
      if (candidate) issues.push(candidate);
    }
  }

  return Object.freeze(issues);
}

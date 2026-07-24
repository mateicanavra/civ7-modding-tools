import { describe, expect, it } from "bun:test";
import { applySchemaConventions } from "@mapgen/authoring/schema/conventions.js";
import { type TSchema, Type } from "typebox";

function additionalProperties(schema: TSchema): unknown {
  return (schema as Record<PropertyKey, unknown>).additionalProperties;
}

describe("schema conventions", () => {
  it("closes nested TypeBox object algebra in place", () => {
    const nestedObject = Type.Object({ value: Type.Number() });
    const arrayObject = Type.Object({ value: Type.Number() });
    const tupleObject = Type.Object({ value: Type.Number() });
    const unionObject = Type.Object({ value: Type.Number() });
    const intersectObject = Type.Object({ value: Type.Number() });
    const schema = Type.Object({
      nested: nestedObject,
      array: Type.Array(arrayObject),
      tuple: Type.Tuple([tupleObject]),
      union: Type.Union([unionObject, Type.Literal("none")]),
      intersect: Type.Intersect([intersectObject]),
    });

    expect(applySchemaConventions(schema)).toBe(schema);
    for (const candidate of [
      schema,
      nestedObject,
      arrayObject,
      tupleObject,
      unionObject,
      intersectObject,
    ]) {
      expect(additionalProperties(candidate)).toBe(false);
    }
  });

  it("preserves raw anyOf, oneOf, allOf, not, and tuple-item traversal", () => {
    const branches = Array.from({ length: 6 }, () => Type.Object({ value: Type.Number() }));
    const schema = {
      type: "object",
      properties: {
        any: { anyOf: [branches[0]] },
        one: { oneOf: [branches[1]] },
        all: { allOf: [branches[2]] },
        excluded: { not: branches[3] },
        tuple: { items: [branches[4], branches[5]] },
      },
    } as unknown as TSchema;

    applySchemaConventions(schema);

    expect(additionalProperties(schema)).toBe(false);
    for (const branch of branches) expect(additionalProperties(branch)).toBe(false);
  });
});

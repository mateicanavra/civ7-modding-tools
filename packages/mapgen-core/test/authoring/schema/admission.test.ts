import { describe, expect, it } from "bun:test";
import { compileSchemaAdmission } from "@mapgen/authoring/schema/admission.js";
import { Type } from "typebox";

describe("schema admission", () => {
  it("checks the supplied schema without taking schema ownership", () => {
    const schema = Type.Object(
      { value: Type.Integer({ minimum: 1 }) },
      { additionalProperties: false }
    );
    const admit = compileSchemaAdmission(schema);

    expect(Object.isFrozen(schema)).toBe(false);
    expect(admit({ value: 1 })).toEqual([]);
    expect(admit({ value: 0 })).toEqual([
      expect.objectContaining({ code: "schema", keyword: "minimum", path: "/value" }),
    ]);
    expect(admit({ value: 1, shadow: true })).toEqual([
      expect.objectContaining({ code: "schema", keyword: "additionalProperties", path: "/" }),
    ]);
  });

  it("fails closed when a stateful refinement yields no diagnostic after refusal", () => {
    let calls = 0;
    const admit = compileSchemaAdmission(Type.Refine(Type.Number(), () => ++calls > 1));

    expect(admit(1)).toEqual([
      {
        code: "schema",
        keyword: "inspection",
        path: "/",
        message: "Schema validation refused input without diagnostics.",
      },
    ]);
    expect(calls).toBe(2);
  });

  it("fails closed when diagnostic inspection re-evaluates a refusing refinement and throws", () => {
    let calls = 0;
    const admit = compileSchemaAdmission(
      Type.Refine(Type.Number(), () => {
        calls += 1;
        if (calls === 1) return false;
        throw new Error("stateful refinement cannot be inspected twice");
      })
    );

    expect(admit(1)).toEqual([
      {
        code: "schema",
        keyword: "inspection",
        path: "/",
        message: "Schema validation failed safely.",
      },
    ]);
    expect(calls).toBe(2);
  });
});

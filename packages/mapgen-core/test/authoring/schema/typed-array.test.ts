import { describe, expect, it } from "bun:test";
import {
  assertTypedArrayOf,
  isSupportedTypedArrayName,
  isTypedArrayOf,
  TypedArraySchemas,
  typedArrayConstructorFor,
} from "@mapgen/authoring/schema/typed-array.js";
import {
  compileTypedArrayAdmissionPlan,
  validateTypedArrayAdmission,
} from "@mapgen/authoring/schema/typed-array-admission.js";
import { Type } from "typebox";

function runtimeMetadata(schema: object): unknown {
  return (schema as Record<PropertyKey, unknown>)["x-runtime"];
}

describe("typed-array schemas and guards", () => {
  it("selects only the required root object variant and retains branch-owned cardinalities", () => {
    const schema = Type.Union([
      Type.Object({
        model: Type.Literal("small"),
        width: Type.Integer(),
        height: Type.Integer(),
        values: TypedArraySchemas.u8(),
        optional: Type.Optional(TypedArraySchemas.i16()),
      }),
      Type.Object({
        model: Type.Literal("wide"),
        count: Type.Integer(),
        values: TypedArraySchemas.i32({ cardinality: ["count"] }),
      }),
    ]);
    const plan = compileTypedArrayAdmissionPlan(schema, {
      subject: "Test",
      contextualCardinality: "refuse",
    });
    expect(
      validateTypedArrayAdmission(plan, {
        model: "small",
        width: 2,
        height: 3,
        values: new Uint8Array(6),
      })
    ).toEqual([]);
    expect(
      validateTypedArrayAdmission(plan, { model: "wide", count: 3, values: new Int32Array(3) })
    ).toEqual([]);
    expect(
      validateTypedArrayAdmission(plan, {
        model: "small",
        width: 2,
        height: 3,
        values: new Int32Array(6),
      })
    ).toEqual([
      {
        code: "typed-array-constructor",
        path: "$.values",
        expectedConstructors: ["Uint8Array"],
        observedConstructor: "Int32Array",
      },
    ]);
    expect(
      validateTypedArrayAdmission(plan, { model: "wide", count: 3, values: new Int32Array(2) })
    ).toEqual([
      {
        code: "typed-array-cardinality",
        path: "$.values",
        cardinalityPaths: ["count"],
        addend: 0,
        expectedLength: 3,
        observedLength: 2,
      },
    ]);
    expect(Object.isFrozen(plan.taggedUnion?.branches[0]?.plan)).toBe(true);
    for (const model of [undefined, "unknown", 1]) {
      expect(validateTypedArrayAdmission(plan, { model, values: new Uint8Array(6) })).toEqual([
        {
          code: "typed-array-discriminant",
          path: "$.model",
          expectedTags: ["small", "wide"],
          observed: model,
        },
      ]);
    }
    const inheritedTag = Object.assign(Object.create({ model: "small" }), {
      width: 2,
      height: 3,
      values: new Uint8Array(6),
    });
    expect(validateTypedArrayAdmission(plan, inheritedTag)[0]?.code).toBe(
      "typed-array-discriminant"
    );
  });

  it("compiles and validates contextual typed arrays in every tagged branch", () => {
    const schema = Type.Union([
      Type.Object({
        kind: Type.Literal("bytes"),
        values: TypedArraySchemas.u8({ cardinality: "map-grid" }),
      }),
      Type.Object({
        kind: Type.Literal("shorts"),
        values: TypedArraySchemas.i16({ cardinality: "map-grid" }),
      }),
    ]);
    expect(() =>
      compileTypedArrayAdmissionPlan(schema, { subject: "Test", contextualCardinality: "refuse" })
    ).toThrow("requires an admitted validation context");
    const plan = compileTypedArrayAdmissionPlan(schema, {
      subject: "Test",
      contextualCardinality: "allow",
    });
    expect(
      validateTypedArrayAdmission(
        plan,
        { kind: "shorts", values: new Int16Array(6) },
        { dimensions: { width: 2, height: 3 } }
      )
    ).toEqual([]);
    expect(
      validateTypedArrayAdmission(plan, { kind: "shorts", values: new Int16Array(6) })[0]?.code
    ).toBe("typed-array-cardinality-source");
    const malformed = Type.Union([
      Type.Object({
        kind: Type.Literal("a"),
        width: Type.Integer(),
        height: Type.Integer(),
        values: TypedArraySchemas.u8(),
      }),
      Type.Object({
        kind: Type.Literal("b"),
        values: TypedArraySchemas.u8({ cardinality: ["missing"] }),
      }),
    ]);
    expect(() =>
      compileTypedArrayAdmissionPlan(malformed, { subject: "Test", contextualCardinality: "allow" })
    ).toThrow('cardinality source "missing"');
  });

  it("still refuses ambiguous, optional-tagged, nested, and mixed typed-array unions", () => {
    const buffer = TypedArraySchemas.u8({ cardinality: "constructor-only" });
    const a = Type.Object({ model: Type.Literal("a"), values: buffer });
    const b = Type.Object({ model: Type.Literal("b"), values: buffer });
    for (const schema of [
      Type.Union([a, Type.Object({ model: Type.Literal("a"), other: buffer })]),
      Type.Union([a, Type.Object({ model: Type.Optional(Type.Literal("b")), values: buffer })]),
      Type.Object({ nested: Type.Union([a, b]) }),
      Type.Union([buffer, Type.Array(Type.Number())]),
    ]) {
      expect(() =>
        compileTypedArrayAdmissionPlan(schema, { subject: "Test", contextualCardinality: "allow" })
      ).toThrow("must contain only direct typed-array alternatives");
    }
    const siblingConstraint = Type.Union([a, b], {
      allOf: [Type.Object({ extra: buffer })],
    });
    expect(() =>
      compileTypedArrayAdmissionPlan(siblingConstraint, {
        subject: "Test",
        contextualCardinality: "allow",
      })
    ).toThrow("cannot combine sibling validation constraints");
    const siblingRequired = Type.Union(
      [
        Type.Object({ model: Type.Literal("a"), values: Type.Optional(buffer) }),
        Type.Object({ model: Type.Literal("b"), values: Type.Optional(buffer) }),
      ],
      { required: ["values"] }
    );
    expect(() =>
      compileTypedArrayAdmissionPlan(siblingRequired, {
        subject: "Test",
        contextualCardinality: "allow",
      })
    ).toThrow("cannot combine sibling validation constraints");
  });

  it("encodes exact constructor identity and input-relative cardinality metadata", () => {
    expect(runtimeMetadata(TypedArraySchemas.u8())).toEqual({
      kind: "typed-array",
      ctor: "Uint8Array",
      cardinality: ["width", "height"],
    });
    expect(
      runtimeMetadata(
        TypedArraySchemas.i32({ cardinality: { factors: ["plan.count"], addend: 1 } })
      )
    ).toEqual({
      kind: "typed-array",
      ctor: "Int32Array",
      cardinality: { factors: ["plan.count"], addend: 1 },
    });
    expect(runtimeMetadata(TypedArraySchemas.f32({ cardinality: "constructor-only" }))).toEqual({
      kind: "typed-array",
      ctor: "Float32Array",
      cardinality: "constructor-only",
    });
    const mapGrid = TypedArraySchemas.u16({ cardinality: "map-grid" });
    expect(runtimeMetadata(mapGrid)).toEqual({
      kind: "typed-array",
      ctor: "Uint16Array",
      cardinality: "map-grid",
    });
    expect(Object.getOwnPropertyDescriptor(mapGrid, "x-runtime")?.enumerable).toBe(true);
    expect(JSON.parse(JSON.stringify(mapGrid))["x-runtime"]).toEqual({
      kind: "typed-array",
      ctor: "Uint16Array",
      cardinality: "map-grid",
    });
  });

  it("uses one exact constructor registry for schema admission", () => {
    expect(isSupportedTypedArrayName("Uint16Array")).toBe(true);
    expect(isSupportedTypedArrayName("Float64Array")).toBe(false);
    expect(typedArrayConstructorFor("Uint16Array")).toBe(Uint16Array);
  });

  it("admits map-grid only from supplied dimensions and fails closed without them", () => {
    const schema = Type.Object({
      values: TypedArraySchemas.u8({ cardinality: "map-grid" }),
    });
    const plan = compileTypedArrayAdmissionPlan(schema, {
      subject: "Test",
      contextualCardinality: "allow",
    });

    expect(validateTypedArrayAdmission(plan, { values: new Uint8Array(6) })).toEqual([
      {
        code: "typed-array-cardinality-source",
        path: "$.values",
        sourcePath: "map-grid",
        observed: undefined,
      },
    ]);
    expect(
      validateTypedArrayAdmission(
        plan,
        { values: new Uint8Array(6) },
        { dimensions: { width: 2, height: 3 } }
      )
    ).toEqual([]);
    expect(
      validateTypedArrayAdmission(
        plan,
        { values: new Uint8Array(5) },
        { dimensions: { width: 2, height: 3 } }
      )
    ).toEqual([
      {
        code: "typed-array-cardinality",
        path: "$.values",
        cardinalityPaths: ["map-grid"],
        addend: 0,
        expectedLength: 6,
        observedLength: 5,
      },
    ]);
    expect(
      validateTypedArrayAdmission(
        plan,
        { values: new Uint8Array(0) },
        { dimensions: { width: 2.5, height: 3 } }
      )
    ).toEqual([
      {
        code: "typed-array-cardinality-source",
        path: "$.values",
        sourcePath: "map-grid.width",
        observed: 2.5,
      },
    ]);
    expect(
      validateTypedArrayAdmission(
        plan,
        { values: new Uint8Array(0) },
        { dimensions: { width: Number.MAX_SAFE_INTEGER, height: 2 } }
      )
    ).toEqual([
      {
        code: "typed-array-cardinality-overflow",
        path: "$.values",
        cardinalityPaths: ["map-grid"],
        factors: [Number.MAX_SAFE_INTEGER, 2],
        addend: 0,
      },
    ]);
  });

  it("refuses wrong constructors, subclasses, spoofed prototypes, and non-array views", () => {
    class ExtendedUint8Array extends Uint8Array {}
    const prototypeMutatedUint16 = new Uint16Array(2);
    Object.setPrototypeOf(prototypeMutatedUint16, Uint8Array.prototype);
    const prototypeMutatedInt8 = new Int8Array(2);
    Object.setPrototypeOf(prototypeMutatedInt8, Uint8Array.prototype);

    expect(isTypedArrayOf(new Uint8Array(2), Uint8Array, 2)).toBe(true);
    expect(isTypedArrayOf(new Uint16Array(2), Uint8Array, 2)).toBe(false);
    expect(isTypedArrayOf(new Uint8Array(1), Uint8Array, 2)).toBe(false);
    expect(isTypedArrayOf(new ExtendedUint8Array(2), Uint8Array, 2)).toBe(false);
    expect(isTypedArrayOf(Object.create(Uint8Array.prototype), Uint8Array)).toBe(false);
    expect(isTypedArrayOf(prototypeMutatedUint16, Uint8Array, 2)).toBe(false);
    expect(isTypedArrayOf(prototypeMutatedInt8, Uint8Array, 2)).toBe(false);
    expect(isTypedArrayOf(new DataView(new ArrayBuffer(2)), Uint8Array)).toBe(false);
    expect(() => assertTypedArrayOf("cells", new Uint8Array(1), Uint8Array, 2)).toThrow(
      'Invalid "cells" (expected Uint8Array (len=2))'
    );
  });
});

import { describe, expect, it } from "bun:test";
import {
  assertTypedArrayOf,
  isSupportedTypedArrayName,
  isTypedArrayOf,
  TypedArraySchemas,
  typedArrayConstructorFor,
} from "@mapgen/authoring/schema/typed-array.js";

function runtimeMetadata(schema: object): unknown {
  return (schema as Record<PropertyKey, unknown>)["x-runtime"];
}

describe("typed-array schemas and guards", () => {
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
  });

  it("uses one exact constructor registry for schema admission", () => {
    expect(isSupportedTypedArrayName("Uint16Array")).toBe(true);
    expect(isSupportedTypedArrayName("Float64Array")).toBe(false);
    expect(typedArrayConstructorFor("Uint16Array")).toBe(Uint16Array);
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

import { describe, expect, it } from "bun:test";
import { assertCompleteConfigSchema } from "@mapgen/authoring/schema/config.js";
import { type TSchema, Type } from "typebox";
import { Value } from "typebox/value";

describe("complete authored configuration", () => {
  it("admits closed, required, portable TypeBox algebra", () => {
    const schema = Type.Object(
      {
        scalar: Type.Number({ default: 1 }),
        union: Type.Union([Type.Literal("automatic"), Type.Literal("manual")], {
          default: "automatic",
        }),
        array: Type.Array(Type.String(), { default: [] }),
        tuple: Type.Tuple([Type.Boolean(), Type.Integer()], {
          default: [false, 0],
        }),
        intersection: Type.Intersect([
          Type.Object(
            { enabled: Type.Boolean({ default: false }) },
            { additionalProperties: false }
          ),
        ]),
      },
      { additionalProperties: false }
    );

    expect(() => assertCompleteConfigSchema(schema, "config")).not.toThrow();
    expect(Value.Create(schema)).toEqual({
      scalar: 1,
      union: "automatic",
      array: [],
      tuple: [false, 0],
      intersection: { enabled: false },
    });
  });

  it("refuses implicit TypeBox defaults for authored scalar and collection values", () => {
    const cases: readonly TSchema[] = [
      Type.Number(),
      Type.Integer(),
      Type.String(),
      Type.Boolean(),
      Type.Enum(["automatic", "manual"]),
      Type.TemplateLiteral("value-${string}"),
      Type.Array(Type.String()),
      Type.Tuple([Type.Boolean()]),
      Type.Union([Type.Literal("automatic"), Type.Literal("manual")]),
    ];

    for (const schema of cases) {
      expect(() => assertCompleteConfigSchema(schema, "config/value")).toThrow(
        /must declare a default/
      );
    }
  });

  it("treats literal and null values as self-defining", () => {
    expect(() => assertCompleteConfigSchema(Type.Literal("fixed"), "config/literal")).not.toThrow();
    expect(() => assertCompleteConfigSchema(Type.Null(), "config/null")).not.toThrow();
  });

  it("refuses optional properties throughout supported schema algebra", () => {
    const optional = () => Type.Optional(Type.Number({ default: 1 }));
    const cases: readonly TSchema[] = [
      Type.Object({ amount: optional() }, { additionalProperties: false }),
      Type.Object(
        { nested: Type.Object({ amount: optional() }, { additionalProperties: false }) },
        { additionalProperties: false }
      ),
      Type.Union(
        [
          Type.Object({ amount: optional() }, { additionalProperties: false }),
          Type.Object({ amount: Type.Number() }, { additionalProperties: false }),
        ],
        { default: { amount: 1 } }
      ),
      Type.Array(Type.Object({ amount: optional() }, { additionalProperties: false }), {
        default: [],
      }),
      Type.Tuple([Type.Object({ amount: optional() }, { additionalProperties: false })], {
        default: [{}],
      }),
      Type.Intersect([Type.Object({ amount: optional() }, { additionalProperties: false })]),
    ];

    for (const schema of cases) {
      expect(() => assertCompleteConfigSchema(schema, "config")).toThrow(/amount.*optional/);
    }
  });

  it("refuses dynamic, open, and structurally defaulted objects", () => {
    const cases: ReadonlyArray<readonly [TSchema, RegExp]> = [
      [Type.Record(Type.String(), Type.Number()), /statically named properties/],
      [Type.Object({ value: Type.Number() }), /must be closed/],
      [
        Type.Object(
          { value: Type.Number({ default: 1 }) },
          { additionalProperties: false, default: {} }
        ),
        /structural default/,
      ],
    ];

    for (const [schema, refusal] of cases) {
      expect(() => assertCompleteConfigSchema(schema, "config")).toThrow(refusal);
    }
  });

  it("fails closed for unresolved or non-portable TypeBox kinds", () => {
    const cases: ReadonlyArray<readonly [TSchema, RegExp]> = [
      [Type.Ref("Missing"), /unresolved Ref/],
      [
        Type.Cyclic(
          { Node: Type.Object({ value: Type.Number() }, { additionalProperties: false }) },
          "Node"
        ),
        /unresolved Cyclic/,
      ],
      [Type.Partial(Type.Ref("Missing")), /unresolved Deferred/],
      [Type.BigInt(), /non-portable/],
      [Type.Literal(1n), /non-portable Literal/],
      [Type.Symbol(), /non-portable/],
      [Type.Unknown(), /unsupported, unresolved, or non-portable/],
      [Type.Undefined(), /non-portable/],
      [Type.Void(), /non-portable/],
    ];

    for (const [schema, refusal] of cases) {
      expect(() => assertCompleteConfigSchema(schema, "config")).toThrow(refusal);
    }
  });
});

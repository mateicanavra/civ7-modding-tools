import { describe, expect, it } from "bun:test";
import { buildOpEnvelopeSchema } from "@mapgen/authoring/operation/envelope.js";
import { defineStrategy } from "@mapgen/authoring/operation/strategy-definition.js";
import { Type } from "typebox";
import { Value } from "typebox/value";

describe("op envelope defaults", () => {
  it("refuses an empty default-strategy identity", () => {
    expect(() => buildOpEnvelopeSchema("test/empty-default", {}, "")).toThrow(
      "op(test/empty-default) requires an explicit default strategy"
    );
  });

  it("refuses a default strategy that is absent from the declared strategy set", () => {
    expect(() =>
      buildOpEnvelopeSchema(
        "test/missing-default",
        {
          available: defineStrategy({
            id: "available",
            config: Type.Object({}, { additionalProperties: false }),
          }),
        },
        "missing"
      )
    ).toThrow('op(test/missing-default) missing strategy "missing" (available: available)');
  });

  it("materializes the selected strategy directly regardless of strategy order", () => {
    const result = buildOpEnvelopeSchema(
      "test/ordered-strategies",
      {
        first: defineStrategy({
          id: "first",
          config: Type.Object(
            { requiredWithoutDefault: Type.String() },
            { additionalProperties: false }
          ),
        }),
        selected: defineStrategy({
          id: "selected",
          config: Type.Object(
            {
              nested: Type.Object(
                { count: Type.Integer({ default: 3 }) },
                { additionalProperties: false }
              ),
            },
            { additionalProperties: false }
          ),
        }),
      },
      "selected"
    );

    expect(result.defaultConfig).toEqual({
      strategy: "selected",
      config: { nested: { count: 3 } },
    });
    expect(Value.Check(result.schema, result.defaultConfig)).toBe(true);
  });

  it("creates required nested strategy objects without structural defaults", () => {
    const result = buildOpEnvelopeSchema(
      "test/native-create",
      {
        selected: defineStrategy({
          id: "selected",
          config: Type.Object(
            {
              nested: Type.Object(
                { label: Type.String(), count: Type.Integer({ default: 3 }) },
                { additionalProperties: false }
              ),
            },
            { additionalProperties: false }
          ),
        }),
      },
      "selected"
    );

    expect(result.defaultConfig).toEqual({
      strategy: "selected",
      config: { nested: { label: "", count: 3 } },
    });
    expect(() => Value.Assert(result.schema, result.defaultConfig)).not.toThrow();
  });
});

import { describe, expect, it } from "bun:test";
import {
  buildOpEnvelopeSchema,
  buildOpEnvelopeSchemaWithDefaultStrategy,
} from "@mapgen/authoring/op/envelope.js";
import { Type } from "typebox";
import { Value } from "typebox/value";

describe("op envelope defaults", () => {
  it("reports one authoritative error when the default strategy is missing", () => {
    expect(() => buildOpEnvelopeSchema("test/missing-default", {})).toThrow(
      'op(test/missing-default) missing required "default" strategy schema'
    );
  });

  it("materializes the selected strategy directly regardless of strategy order", () => {
    const result = buildOpEnvelopeSchemaWithDefaultStrategy(
      "test/ordered-strategies",
      {
        first: Type.Object(
          { requiredWithoutDefault: Type.String() },
          { additionalProperties: false }
        ),
        selected: Type.Object(
          {
            nested: Type.Object(
              { count: Type.Integer({ default: 3 }) },
              { additionalProperties: false }
            ),
          },
          { additionalProperties: false }
        ),
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
    const result = buildOpEnvelopeSchemaWithDefaultStrategy(
      "test/native-create",
      {
        selected: Type.Object(
          {
            nested: Type.Object(
              { label: Type.String(), count: Type.Integer({ default: 3 }) },
              { additionalProperties: false }
            ),
          },
          { additionalProperties: false }
        ),
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

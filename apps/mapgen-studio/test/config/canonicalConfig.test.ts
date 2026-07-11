import { Type } from "typebox";
import { describe, expect, it } from "vitest";
import { admitPipelineConfig } from "../../src/features/configAuthoring/canonicalConfig";

describe("Studio config admission", () => {
  const schema = Type.Object(
    {
      nested: Type.Object(
        {
          count: Type.Number({ default: 3 }),
        },
        { additionalProperties: false }
      ),
    },
    { additionalProperties: false }
  );

  it("keeps exact XSchema rejection without defaulting or repairing input", () => {
    const config = { nested: {} };

    expect(admitPipelineConfig({ schema, config, label: "test" })).toEqual({
      ok: false,
      errors: [
        {
          path: "/config/test/nested",
          message: "must have required properties count",
        },
      ],
    });
    expect(config).toStrictEqual({ nested: {} });
  });

  it("preserves the portable JSON error contract", () => {
    expect(admitPipelineConfig({ schema, config: new Date(0), label: "test" })).toEqual({
      ok: false,
      errors: [
        {
          path: "/config/test",
          message: "Config must be plain JSON data.",
        },
      ],
    });
  });

  it("returns an independently owned deeply frozen config snapshot", () => {
    const config = { nested: { count: 7 } };

    const admitted = admitPipelineConfig({ schema, config, label: "test" });

    expect(admitted).toEqual({ ok: true, value: config });
    if (!admitted.ok) throw new Error("Expected config admission to succeed.");
    expect(admitted.value).not.toBe(config);
    expect(Object.isFrozen(admitted.value)).toBe(true);
    expect(Object.isFrozen(admitted.value.nested)).toBe(true);
  });
});

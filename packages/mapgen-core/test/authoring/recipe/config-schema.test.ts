import { describe, expect, it } from "bun:test";
import {
  createStage,
  createStep,
  defineOp,
  defineStep,
  defineStrategy,
  deriveRecipeConfigSchema,
} from "@mapgen/authoring/index.js";
import { Type } from "typebox";
import { Value } from "typebox/value";

describe("recipe config schema", () => {
  it("projects explicit stage surfaces without exposing internal operation envelopes", () => {
    const op = defineOp({
      kind: "compute",
      id: "test/op/private-envelope",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Object({}, { additionalProperties: false }),
      strategies: [
        defineStrategy({
          id: "internal",
          config: Type.Object(
            { internalRate: Type.Number({ default: 1 }) },
            { additionalProperties: false }
          ),
        }),
      ],
    } as const);
    const step = createStep(
      defineStep({
        id: "internal-step",
        requires: [],
        provides: [],
        ops: { privateOp: op },
      }),
      { run: () => {} }
    );
    const stage = createStage({
      id: "foundation",
      knobsSchema: Type.Object({}, { additionalProperties: false }),
      public: Type.Object(
        { productRate: Type.Number({ default: 1 }) },
        { additionalProperties: false }
      ),
      compile: ({ config }) => ({
        "internal-step": {
          privateOp: { strategy: "internal", config: { internalRate: config.productRate } },
        },
      }),
      steps: [step],
    });

    const schema = deriveRecipeConfigSchema([stage]);
    expect(Value.Check(schema, { foundation: { knobs: {}, productRate: 1 } })).toBe(true);
    expect(
      Value.Check(schema, {
        foundation: {
          knobs: {},
          productRate: 1,
          "internal-step": { privateOp: { strategy: "internal", config: {} } },
        },
      })
    ).toBe(false);
  });
});

import { describe, expect, it } from "bun:test";
import { createStep, defineOp, defineStep, Type } from "@mapgen/authoring/index.js";
import { EmptyStepConfigSchema } from "@mapgen/engine/step-config.js";
import { Value } from "typebox/value";

describe("step authoring", () => {
  const makeContract = (id: string) =>
    defineStep({
      id,
      requires: [],
      provides: [],
      schema: EmptyStepConfigSchema,
    });

  it("createStep rejects missing schema", () => {
    const contractWithoutSchema = {
      id: "alpha",
      requires: [],
      provides: [],
    } as unknown as Parameters<typeof createStep>[0];

    expect(() => createStep(contractWithoutSchema, { run: () => {} })).toThrow(/schema/);
  });

  it("createStep accepts explicit empty schema", () => {
    expect(() => createStep(makeContract("alpha"), { run: () => {} })).not.toThrow();
  });

  it("createStep keeps the supplied contract authoritative over implementation object extras", () => {
    const alpha = makeContract("alpha");
    const implementation = { contract: makeContract("beta"), debugAlias: true, run: () => {} };
    const step = createStep(alpha, implementation);

    expect(step.contract).toBe(alpha);
    expect(Object.prototype.hasOwnProperty.call(step, "debugAlias")).toBe(false);
  });

  it("rejects spread stage-identity aliases at both step authoring boundaries", () => {
    const contractInput = {
      id: "aliased-contract",
      requires: [],
      provides: [],
      schema: EmptyStepConfigSchema,
    };

    expect(() => defineStep({ ...contractInput, ...{ phase: "foundation" } } as never)).toThrow(
      "recipe composition owns stage identity"
    );
    expect(() =>
      createStep(makeContract("aliased-implementation"), {
        run: () => {},
        ...{ stageId: "foundation" },
      } as never)
    ).toThrow("recipe composition owns stage identity");
  });

  it("materializes an explicit step default without mutating the operation contract", () => {
    const operation = defineOp({
      kind: "compute",
      id: "test/step-default-authority",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      defaultStrategy: "balanced",
      strategies: {
        balanced: Type.Object(
          { plateauCount: Type.Integer({ default: 3 }) },
          { additionalProperties: false }
        ),
        fast: Type.Object(
          { turbo: Type.Boolean({ default: true }) },
          { additionalProperties: false }
        ),
      },
    });
    const step = defineStep({
      id: "fast-step",
      requires: [],
      provides: [],
      schema: EmptyStepConfigSchema,
      ops: { calculation: { contract: operation, defaultStrategy: "fast" } },
    });

    expect(step.ops?.calculation.defaultStrategy).toBe("fast");
    expect(step.ops?.calculation.defaultConfig).toEqual({
      strategy: "fast",
      config: { turbo: true },
    });
    expect(Value.Create(step.schema)).toEqual({
      calculation: { strategy: "fast", config: { turbo: true } },
    });
    expect(operation.defaultStrategy).toBe("balanced");
    expect(operation.defaultConfig).toEqual({
      strategy: "balanced",
      config: { plateauCount: 3 },
    });

    expect(() =>
      defineStep({
        id: "invalid-empty-default-step",
        requires: [],
        provides: [],
        schema: EmptyStepConfigSchema,
        ops: {
          calculation: {
            contract: operation,
            defaultStrategy: "" as "fast",
          },
        },
      })
    ).toThrow("requires an explicit default strategy");

    expect(() =>
      defineStep({
        id: "missing-default-override-step",
        requires: [],
        provides: [],
        schema: EmptyStepConfigSchema,
        ops: {
          calculation: { contract: operation } as never,
        },
      })
    ).toThrow("requires an explicit default strategy");
  });

  it("defineStep rejects non-kebab step ids", () => {
    expect(() =>
      defineStep({
        id: "BadId",
        requires: [],
        provides: [],
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/BadId/);
  });
});

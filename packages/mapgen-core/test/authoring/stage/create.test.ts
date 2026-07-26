import { describe, expect, it } from "bun:test";
import {
  createStage,
  createStep,
  defineStep,
  deriveRecipeConfigSchema,
} from "@mapgen/authoring/index.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
import { EmptyStepConfigSchema } from "@mapgen/engine/step-config.js";
import { IsObject, ObjectOptions, type TObject, Type } from "typebox";
import { Value } from "typebox/value";

const TEST_SETUP = admitMapSetup({
  mapSeed: 1,
  dimensions: { width: 2, height: 2 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
});

describe("authoring SDK", () => {
  const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false });

  const makeContract = <
    const Id extends string,
    const Schema extends TObject = typeof EmptyStepConfigSchema,
  >(
    id: Id,
    schema: Schema = EmptyStepConfigSchema as Schema
  ) =>
    defineStep({
      id,
      requires: [],
      provides: [],
      schema,
    });

  it("createStage rejects steps without explicit schemas", () => {
    expect(() =>
      createStage({
        id: "foundation",
        knobsSchema: EmptyKnobsSchema,
        steps: [
          {
            contract: {
              id: "alpha",
              requires: [],
              provides: [],
            } as unknown as ReturnType<typeof makeContract>,
            run: () => {},
          },
        ],
      } as unknown as Parameters<typeof createStage>[0])
    ).toThrow(/schema/);
  });

  it("createStage rejects non-kebab step ids with stage context", () => {
    let error: Error | null = null;
    try {
      createStage({
        id: "foundation",
        knobsSchema: EmptyKnobsSchema,
        steps: [
          {
            contract: {
              id: "BadId",
              requires: [],
              provides: [],
              schema: EmptyStepConfigSchema,
            },
            run: () => {},
          },
        ],
      } as unknown as Parameters<typeof createStage>[0]);
    } catch (err) {
      error = err as Error;
    }
    expect(error?.message).toContain("foundation");
    expect(error?.message).toContain("BadId");
  });

  it("createStage rejects stage ids that cannot safely compose into execution identities", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });

    expect(() =>
      createStage({ id: "Map.Hydrology", knobsSchema: EmptyKnobsSchema, steps: [step] })
    ).toThrow('stage id "Map.Hydrology" must be kebab-case');
  });

  it("createStage computes surfaceSchema for internal stages", () => {
    const stepSchema = Type.Object(
      { value: Type.Number({ minimum: 1, default: 1 }) },
      { additionalProperties: false }
    );
    const step = createStep(makeContract("step-a", stepSchema), { run: () => {} });
    const stage = createStage({
      id: "stage-a",
      knobsSchema: Type.Object({}, { additionalProperties: false }),
      steps: [step],
    });
    const schema = deriveRecipeConfigSchema([stage]);
    const created = Value.Create(schema);
    expect(() => Value.Assert(schema, created)).not.toThrow();
    expect(created).toEqual({ "stage-a": { knobs: {}, "step-a": { value: 1 } } });
    expect(ObjectOptions(stage.surfaceSchema).description).toBe(
      'Author-facing configuration for the "stage-a" recipe stage.'
    );
    const stepSurface = stage.surfaceSchema.properties["step-a"];
    if (!IsObject(stepSurface)) throw new Error("Expected an object step surface.");
    expect(ObjectOptions(stepSurface).description).toBe(
      'Author-facing configuration for the "step-a" step in the "stage-a" recipe stage.'
    );
  });

  it("preserves a semantic description authored by an internal step", () => {
    const stepSchema = Type.Object(
      { amount: Type.Number({ default: 1 }) },
      {
        additionalProperties: false,
        description: "Controls the amount of material deposited by this step.",
      }
    );
    const step = createStep(makeContract("deposit-material", stepSchema), { run: () => {} });
    const stage = createStage({ id: "morphology", steps: [step] });
    const stepSurface = stage.surfaceSchema.properties["deposit-material"];
    if (!IsObject(stepSurface)) throw new Error("Expected an object step surface.");

    expect(stepSurface).not.toBe(step.contract.schema);
    expect(ObjectOptions(stepSurface).description).toBe(
      "Controls the amount of material deposited by this step."
    );
  });

  it("represents configurationless compiled stages as one closed empty authored object", () => {
    const stepSchema = Type.Object(
      { amount: Type.Number({ default: 1 }) },
      { additionalProperties: false }
    );
    const step = createStep(makeContract("step-a", stepSchema), { run: () => {} });
    let observedSetup = TEST_SETUP;
    const stage = createStage({
      id: "fixed-stage",
      compile: ({ setup, knobs, config }) => {
        observedSetup = setup;
        expect(knobs).toBe(config);
        expect(Object.isFrozen(knobs)).toBe(true);
        return { "step-a": { amount: setup.dimensions.width } };
      },
      steps: [step],
    });

    const schema = deriveRecipeConfigSchema([stage]);
    expect(Value.Create(schema)).toEqual({ "fixed-stage": {} });
    expect(Value.Check(schema, { "fixed-stage": {} })).toBe(true);
    expect(Value.Check(schema, { "fixed-stage": { knobs: {} } })).toBe(false);
    expect(Value.Check(schema, { "fixed-stage": { "step-a": {} } })).toBe(false);
    expect(stage.authoring.config.layer).toBe("configurationless");
    expect(stage.authoring.config.focusPathsByStepId).toEqual({ "step-a": [] });
    expect(stage.toInternal({ setup: TEST_SETUP, stageConfig: {} }).rawSteps).toEqual({
      "step-a": { amount: TEST_SETUP.dimensions.width },
    });
    expect(observedSetup).toBe(TEST_SETUP);
  });

  it("infers configurationless stage surfaces from closed empty step schemas", () => {
    const stepA = createStep(makeContract("step-a"), { run: () => {} });
    const stepB = createStep(makeContract("step-b"), { run: () => {} });
    const stage = createStage({
      id: "fixed-stage",
      steps: [stepA, stepB] as const,
    });

    expect(Value.Create(stage.surfaceSchema)).toEqual({});
    expect(Value.Check(stage.surfaceSchema, {})).toBe(true);
    expect(Value.Check(stage.surfaceSchema, { "step-a": {} })).toBe(false);
    expect(stage.authoring.config.layer).toBe("configurationless");
    expect(stage.authoring.config.focusPathsByStepId).toEqual({ "step-a": [], "step-b": [] });
    expect(stage.toInternal({ setup: TEST_SETUP, stageConfig: {} })).toEqual({
      knobs: {},
      rawSteps: {},
    });
  });

  it("keeps real knobs while inferring empty step configuration", () => {
    const step = createStep(makeContract("step-a"), { run: () => {} });
    const stage = createStage({
      id: "knobs-only",
      knobsSchema: Type.Object(
        { enabled: Type.Boolean({ default: true }) },
        { additionalProperties: false }
      ),
      steps: [step] as const,
    });

    expect(Value.Create(stage.surfaceSchema)).toEqual({ knobs: { enabled: true } });
    expect(Value.Check(stage.surfaceSchema, { knobs: { enabled: false } })).toBe(true);
    expect(Value.Check(stage.surfaceSchema, { knobs: { enabled: false }, "step-a": {} })).toBe(
      false
    );
    expect(
      stage.toInternal({ setup: TEST_SETUP, stageConfig: { knobs: { enabled: false } } })
    ).toEqual({ knobs: { enabled: false }, rawSteps: {} });
  });

  it("keeps only nonempty step config on mixed internal stages", () => {
    const emptyStep = createStep(makeContract("empty-step"), { run: () => {} });
    const configuredStep = createStep(
      makeContract(
        "configured-step",
        Type.Object({ amount: Type.Number({ default: 2 }) }, { additionalProperties: false })
      ),
      { run: () => {} }
    );
    const stage = createStage({
      id: "mixed-stage",
      steps: [emptyStep, configuredStep] as const,
    });

    expect(Value.Create(stage.surfaceSchema)).toEqual({ "configured-step": { amount: 2 } });
    expect(Value.Check(stage.surfaceSchema, { "configured-step": { amount: 3 } })).toBe(true);
    expect(
      Value.Check(stage.surfaceSchema, { "empty-step": {}, "configured-step": { amount: 3 } })
    ).toBe(false);
    expect(stage.authoring.config.layer).toBe("internal-step-config");
    expect(stage.authoring.config.focusPathsByStepId).toEqual({
      "empty-step": [],
      "configured-step": ["configured-step"],
    });
  });

  it("rejects dynamically keyed step config before empty-surface inference", () => {
    const dynamicStep = createStep(
      makeContract(
        "dynamic-step",
        Type.Object(
          {},
          {
            additionalProperties: false,
            patternProperties: { "^x-": Type.Number() },
          }
        )
      ),
      { run: () => {} }
    );

    expect(() => createStage({ id: "dynamic-stage", steps: [dynamicStep] })).toThrow(
      'Complete authored config object at "stage/dynamic-stage/dynamic-step" must use statically named properties'
    );
  });

  it("keeps real knobs as the only authored field on knobs-only compiled stages", () => {
    const step = createStep(makeContract("step-a"), { run: () => {} });
    const stage = createStage({
      id: "knobs-only",
      knobsSchema: Type.Object(
        { enabled: Type.Boolean({ default: true }) },
        { additionalProperties: false }
      ),
      compile: ({ knobs, config }) => {
        expect(knobs).toEqual({ enabled: false });
        expect(Object.isFrozen(config)).toBe(true);
        return { "step-a": {} };
      },
      steps: [step],
    });

    expect(Value.Create(stage.surfaceSchema)).toEqual({ knobs: { enabled: true } });
    expect(Value.Check(stage.surfaceSchema, { knobs: { enabled: false } })).toBe(true);
    expect(Value.Check(stage.surfaceSchema, { knobs: { enabled: false }, "step-a": {} })).toBe(
      false
    );
    expect(
      stage.toInternal({ setup: TEST_SETUP, stageConfig: { knobs: { enabled: false } } }).rawSteps
    ).toEqual({ "step-a": {} });
  });

  it("derives required recipe objects and preserves only composable annotations", () => {
    const step = createStep(
      makeContract(
        "step-a",
        Type.Object({ amount: Type.Number({ default: 3 }) }, { additionalProperties: false })
      ),
      { run: () => {} }
    );
    const publicSchema = Type.Object(
      {
        requiredValue: Type.Number({ default: 1 }),
        label: Type.Union(
          [
            Type.Object({ mode: Type.Literal("default") }, { additionalProperties: false }),
            Type.Object(
              { mode: Type.Literal("custom"), value: Type.String({ default: "Custom" }) },
              { additionalProperties: false }
            ),
          ],
          { default: { mode: "default" } }
        ),
      },
      {
        $id: "test-stage-schema",
        title: "Test stage",
        description: "Metadata survives composition",
        default: { requiredValue: 99, label: { mode: "default" } },
        minProperties: 2,
        additionalProperties: false,
        gs: { group: "test" },
      }
    );
    const stage = createStage({
      id: "stage-a",
      knobsSchema: Type.Object(
        { enabled: Type.Boolean({ default: true }) },
        { additionalProperties: false }
      ),
      public: publicSchema,
      compile: ({ config }) => ({ "step-a": { amount: config.requiredValue } }),
      steps: [step],
    });
    const schema = deriveRecipeConfigSchema([stage]);
    const created = Value.Create(schema);

    expect(() => Value.Assert(schema, created)).not.toThrow();
    expect(created).toEqual({
      "stage-a": { knobs: { enabled: true }, requiredValue: 1, label: { mode: "default" } },
    });
    expect(Value.Check(schema, { "stage-a": { knobs: { enabled: true } } })).toBe(false);
    expect(stage.surfaceSchema).toMatchObject({
      title: "Test stage",
      description: "Metadata survives composition",
      gs: { group: "test" },
    });
    expect(stage.surfaceSchema).not.toHaveProperty("$id");
    expect(stage.surfaceSchema).not.toHaveProperty("default");
    expect(stage.surfaceSchema).not.toHaveProperty("minProperties");
  });

  it("rejects optional properties on internal stage surfaces", () => {
    const step = createStep(
      makeContract(
        "alpha",
        Type.Object(
          { nested: Type.Object({ amount: Type.Optional(Type.Number()) }) },
          { additionalProperties: false }
        )
      ),
      { run: () => {} }
    );

    expect(() =>
      createStage({ id: "internal-stage", knobsSchema: EmptyKnobsSchema, steps: [step] })
    ).toThrow(/stage\/internal-stage\/alpha\/nested\/amount.*optional/);
  });

  it("createStage supports public schema with compile mapping", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const beta = createStep(makeContract("beta"), { run: () => {} });
    const publicSchema = Type.Object(
      {
        climate: Type.Number({ default: 0 }),
        beta: Type.Object({}, { additionalProperties: false }),
      },
      { additionalProperties: false }
    );
    const stage = createStage({
      id: "foundation",
      knobsSchema: EmptyKnobsSchema,
      public: publicSchema,
      compile: ({ config }) => ({ alpha: { value: config.climate } }),
      steps: [step, beta],
    });
    expect(Value.Check(stage.surfaceSchema, { knobs: {}, climate: 2, beta: {} })).toBe(true);
    expect(Value.Check(stage.surfaceSchema, { knobs: {}, climate: 2, alpha: {} })).toBe(false);
    expect(stage.authoring.config.layer).toBe("semantic-public-config");
    expect(stage.authoring.config.schema).toBe(stage.surfaceSchema);
    expect(stage.authoring.config.focusPathsByStepId).toEqual({
      alpha: [],
      beta: ["beta"],
    });
    expect(stage.authoring.runtime.steps).toEqual([{ stepId: "alpha" }, { stepId: "beta" }]);

    const internal = stage.toInternal({
      setup: TEST_SETUP,
      stageConfig: { knobs: {}, climate: 2 },
    });
    expect(internal.rawSteps).toEqual({ alpha: { value: 2 } });
  });

  it("createStage rejects reserved knobs key in steps or public schema", () => {
    const knobsStep = createStep(
      defineStep({
        id: "knobs",
        requires: [],
        provides: [],
        schema: EmptyStepConfigSchema,
      }),
      { run: () => {} }
    );
    expect(() =>
      createStage({
        id: "foundation",
        knobsSchema: EmptyKnobsSchema,
        steps: [knobsStep],
      })
    ).toThrow(/knobs/);

    const publicSchema = Type.Object(
      {
        knobs: Type.String(),
      },
      { additionalProperties: false }
    );
    expect(() =>
      createStage({
        id: "foundation",
        knobsSchema: EmptyKnobsSchema,
        public: publicSchema,
        compile: () => ({ alpha: {} }),
        steps: [createStep(makeContract("alpha"), { run: () => {} })],
      })
    ).toThrow(/knobs/);
  });

  it("createStage rejects compile output with reserved knobs key", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const publicSchema = Type.Object(
      {
        climate: Type.Number({ default: 0 }),
      },
      { additionalProperties: false }
    );
    const stage = createStage({
      id: "foundation",
      knobsSchema: EmptyKnobsSchema,
      public: publicSchema,
      compile: () => ({ knobs: {} }) as unknown as { alpha?: unknown },
      steps: [step],
    });
    expect(() => stage.toInternal({ setup: TEST_SETUP, stageConfig: { climate: 1 } })).toThrow(
      /knobs/
    );
  });

  it("createStage rejects undefined and non-object public compile results", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const publicSchema = Type.Object(
      { climate: Type.Number({ default: 0 }) },
      { additionalProperties: false }
    );

    for (const invalidResult of [undefined, "not-an-object"]) {
      const compile = new Proxy(() => ({ alpha: {} }), {
        apply: () => invalidResult,
      });
      const stage = createStage({
        id: "foundation",
        knobsSchema: EmptyKnobsSchema,
        public: publicSchema,
        compile,
        steps: [step],
      });

      expect(() =>
        stage.toInternal({ setup: TEST_SETUP, stageConfig: { knobs: {}, climate: 1 } })
      ).toThrow(/must return an object/);
    }
  });
});

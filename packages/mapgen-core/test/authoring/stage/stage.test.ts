import { describe, expect, it } from "bun:test";
import {
  createStage,
  createStep,
  defineOp,
  defineStep,
  deriveRecipeConfigSchema,
} from "@mapgen/authoring/index.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
import { EmptyStepConfigSchema } from "@mapgen/engine/step-config.js";
import { type TObject, type TSchema, Type } from "typebox";
import { Value } from "typebox/value";

const TEST_SETUP = admitMapSetup({
  mapSeed: 1,
  dimensions: { width: 2, height: 2 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
});

describe("authoring SDK", () => {
  const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false });

  const makeContract = (id: string, schema = EmptyStepConfigSchema) =>
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
        label: Type.Union([
          Type.Object({ mode: Type.Literal("default") }, { additionalProperties: false }),
          Type.Object(
            { mode: Type.Literal("custom"), value: Type.String({ default: "Custom" }) },
            { additionalProperties: false }
          ),
        ]),
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

  it("rejects direct and nested optional properties across public surface algebra", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const optional = () => Type.Optional(Type.Number({ default: 1 }));
    const cases: ReadonlyArray<readonly [string, TObject]> = [
      ["direct", Type.Object({ amount: optional() }, { additionalProperties: false })],
      [
        "object",
        Type.Object(
          {
            nested: Type.Object({ amount: optional() }, { additionalProperties: false }),
          },
          { additionalProperties: false }
        ),
      ],
      [
        "union",
        Type.Object(
          {
            nested: Type.Union([
              Type.Object({ amount: optional() }, { additionalProperties: false }),
              Type.Object({ amount: Type.Number() }, { additionalProperties: false }),
            ]),
          },
          { additionalProperties: false }
        ),
      ],
      [
        "array",
        Type.Object(
          {
            nested: Type.Array(
              Type.Object({ amount: optional() }, { additionalProperties: false })
            ),
          },
          { additionalProperties: false }
        ),
      ],
      [
        "tuple",
        Type.Object(
          {
            nested: Type.Tuple([
              Type.Object({ amount: optional() }, { additionalProperties: false }),
            ]),
          },
          { additionalProperties: false }
        ),
      ],
      [
        "intersect",
        Type.Object(
          {
            nested: Type.Intersect([
              Type.Object({ amount: optional() }, { additionalProperties: false }),
            ]),
          },
          { additionalProperties: false }
        ),
      ],
      [
        "record",
        Type.Object(
          {
            nested: Type.Record(
              Type.String(),
              Type.Object({ amount: optional() }, { additionalProperties: false })
            ),
          },
          { additionalProperties: false }
        ),
      ],
    ];

    for (const [label, publicSchema] of cases) {
      expect(() =>
        createStage({
          id: `public-${label}`,
          knobsSchema: EmptyKnobsSchema,
          public: publicSchema,
          compile: () => ({ alpha: {} }),
          steps: [step],
        })
      ).toThrow(new RegExp(`stage/public-${label}/.*amount.*optional`));
    }
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

  it("rejects optional properties at the final recipe schema boundary", () => {
    const legacySurface = Type.Object(
      { amount: Type.Optional(Type.Number()) },
      { additionalProperties: false }
    );

    expect(() =>
      deriveRecipeConfigSchema([
        {
          id: "legacy-stage",
          public: true,
          surfaceSchema: legacySurface,
          knobsSchema: EmptyKnobsSchema,
          steps: [],
        },
      ])
    ).toThrow(/recipe\/legacy-stage\/amount.*optional/);
  });

  it("rejects open objects and empty structural object defaults", () => {
    const cases: ReadonlyArray<readonly [string, TObject]> = [
      ["open", Type.Object({ value: Type.Number({ default: 1 }) })],
      [
        "structural-default",
        Type.Object(
          { value: Type.Number({ default: 1 }) },
          { additionalProperties: false, default: {} }
        ),
      ],
    ];

    for (const [label, surfaceSchema] of cases) {
      expect(() =>
        deriveRecipeConfigSchema([
          {
            id: label,
            public: true,
            surfaceSchema,
            knobsSchema: EmptyKnobsSchema,
            steps: [],
          },
        ])
      ).toThrow(
        new RegExp(`recipe/${label}.*${label === "open" ? "closed" : "structural default"}`)
      );
    }
  });

  it("rejects non-portable TypeBox kinds from complete config schemas", () => {
    const cases: ReadonlyArray<readonly [string, TSchema]> = [
      ["bigint", Type.BigInt()],
      ["bigint-literal", Type.Literal(1n)],
      ["symbol", Type.Symbol()],
      ["undefined", Type.Undefined()],
      ["void", Type.Void()],
    ];

    for (const [label, nonPortable] of cases) {
      expect(() =>
        deriveRecipeConfigSchema([
          {
            id: label,
            public: true,
            surfaceSchema: Type.Object({ nonPortable }, { additionalProperties: false }),
            knobsSchema: EmptyKnobsSchema,
            steps: [],
          },
        ])
      ).toThrow(/non-portable/);
    }
  });

  it("fails closed for unresolved TypeBox schema kinds", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const cases: ReadonlyArray<readonly [string, TSchema]> = [
      ["Ref", Type.Ref("Missing")],
      [
        "Cyclic",
        Type.Cyclic(
          { Node: Type.Object({ value: Type.Number() }, { additionalProperties: false }) },
          "Node"
        ),
      ],
      ["Deferred", Type.Partial(Type.Ref("Missing"))],
    ];

    for (const [kind, unresolved] of cases) {
      expect(() =>
        createStage({
          id: `unresolved-${kind.toLowerCase()}`,
          knobsSchema: EmptyKnobsSchema,
          public: Type.Object({ unresolved }, { additionalProperties: false }),
          compile: () => ({ alpha: {} }),
          steps: [step],
        })
      ).toThrow(new RegExp(`unresolved.*${kind}`));
    }

    expect(() =>
      createStage({
        id: "unsupported-unknown",
        knobsSchema: EmptyKnobsSchema,
        public: Type.Object({ unresolved: Type.Unknown() }, { additionalProperties: false }),
        compile: () => ({ alpha: {} }),
        steps: [step],
      })
    ).toThrow(/unsupported, unresolved, or non-portable TypeBox kind/);
  });

  it("createStage supports public schema with compile mapping", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const beta = createStep(makeContract("beta"), { run: () => {} });
    const publicSchema = Type.Object(
      {
        climate: Type.Number(),
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

  it("derives recipe schemas from explicit stage public surfaces, not internal op envelopes", () => {
    const op = defineOp({
      kind: "compute",
      id: "test/op/private-envelope",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Object({}, { additionalProperties: false }),
      defaultStrategy: "default",
      strategies: {
        default: Type.Object(
          { internalRate: Type.Number({ default: 1 }) },
          { additionalProperties: false }
        ),
      },
    } as const);
    const step = createStep(
      defineStep({
        id: "internal-step",
        requires: [],
        provides: [],
        ops: { privateOp: op },
        schema: Type.Object({}, { additionalProperties: false }),
      }),
      { run: () => {} }
    );
    const stage = createStage({
      id: "foundation",
      knobsSchema: EmptyKnobsSchema,
      public: Type.Object(
        { productRate: Type.Number({ default: 1 }) },
        { additionalProperties: false }
      ),
      compile: ({ config }) => ({
        "internal-step": {
          privateOp: { strategy: "default", config: { internalRate: config.productRate } },
        },
      }),
      steps: [step],
    });

    const recipeSchema = deriveRecipeConfigSchema([stage]);
    expect(Value.Check(recipeSchema, { foundation: { knobs: {}, productRate: 1 } })).toBe(true);
    expect(
      Value.Check(recipeSchema, {
        foundation: {
          knobs: {},
          productRate: 1,
          "internal-step": { privateOp: { strategy: "default", config: {} } },
        },
      })
    ).toBe(false);
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
        climate: Type.Number(),
      },
      { additionalProperties: false }
    );
    const stage = createStage({
      id: "foundation",
      knobsSchema: EmptyKnobsSchema,
      public: publicSchema,
      compile: () => ({ knobs: {} }),
      steps: [step],
    });
    expect(() => stage.toInternal({ setup: TEST_SETUP, stageConfig: { climate: 1 } })).toThrow(
      /knobs/
    );
  });

  it("createStage rejects undefined and non-object public compile results", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const publicSchema = Type.Object({ climate: Type.Number() }, { additionalProperties: false });

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

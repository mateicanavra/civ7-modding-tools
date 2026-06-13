import { describe, expect, it } from "bun:test";
import { Type } from "typebox";

import { createMockAdapter } from "@civ7/adapter";
import { EmptyStepConfigSchema } from "@mapgen/engine/step-config.js";
import { RecipeCompileError } from "@mapgen/compiler/recipe-compile.js";
import { createExtendedMapContext } from "@mapgen/core/types.js";
import {
  ArtifactDoublePublishError,
  ArtifactMissingError,
  ArtifactValidationError,
  createOp,
  bindCompileOps,
  bindRuntimeOps,
  createRecipe,
  createStage,
  createStrategy,
  createStep,
  defineArtifact,
  defineOp,
  defineStep,
  deriveRecipeConfigSchema,
  implementArtifacts,
  runtimeOp,
} from "@mapgen/authoring/index.js";
import type { DomainOpCompileAny } from "@mapgen/authoring/index.js";

describe("authoring SDK", () => {
  const baseSettings = {
    seed: 42,
    dimensions: { width: 2, height: 2 },
    latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
  };
  const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false, default: {} });

  const makeContract = (id: string, schema = EmptyStepConfigSchema) =>
    defineStep({
      id,
      phase: "foundation",
      requires: [],
      provides: [],
      schema,
    });

  it("createStep rejects missing schema", () => {
    expect(() =>
      createStep(
        {
          id: "alpha",
          phase: "foundation",
          requires: [],
          provides: [],
        } as any,
        { run: () => {} }
      )
    ).toThrow(/schema/);
  });

  it("createStep accepts explicit empty schema", () => {
    expect(() => createStep(makeContract("alpha"), { run: () => {} })).not.toThrow();
  });

  it("defineStep rejects non-kebab step ids", () => {
    expect(() =>
      defineStep({
        id: "BadId",
        phase: "foundation",
        requires: [],
        provides: [],
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/BadId/);
  });

  it("defineStep merges artifact contracts into requires/provides", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.foo",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const contract = defineStep({
      id: "alpha",
      phase: "foundation",
      requires: ["field:test.bar"],
      provides: [],
      artifacts: { requires: [artifact], provides: [] },
      schema: EmptyStepConfigSchema,
    });

    expect(contract.requires).toContain("field:test.bar");
    expect(contract.requires).toContain("artifact:test.foo");
  });

  it("defineStep rejects mixing artifact ids with artifacts block", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.foo",
      schema: Type.Object({}, { additionalProperties: false }),
    });

    expect(() =>
      defineStep({
        id: "alpha",
        phase: "foundation",
        requires: ["artifact:test.foo"],
        provides: [],
        artifacts: { requires: [artifact], provides: [] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/mixes artifact ids/i);
  });

  it("defineStep rejects duplicate artifacts across requires/provides", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.foo",
      schema: Type.Object({}, { additionalProperties: false }),
    });

    expect(() =>
      defineStep({
        id: "alpha",
        phase: "foundation",
        requires: [],
        provides: [],
        artifacts: { requires: [artifact], provides: [artifact] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/artifacts\.requires/);
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
              phase: "foundation",
              requires: [],
              provides: [],
            } as any,
            run: () => {},
          },
        ],
      } as any)
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
              phase: "foundation",
              requires: [],
              provides: [],
              schema: EmptyStepConfigSchema,
            },
            run: () => {},
          },
        ],
      } as any);
    } catch (err) {
      error = err as Error;
    }
    expect(error?.message).toContain("foundation");
    expect(error?.message).toContain("BadId");
  });

  it("createStage computes surfaceSchema for internal stages", () => {
    const stepSchema = Type.Object(
      { value: Type.Number({ minimum: 1 }) },
      { additionalProperties: false }
    );
    const step = createStep(makeContract("alpha", stepSchema), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });
    const props = (stage.surfaceSchema as any).properties as Record<string, unknown>;
    expect(props).toHaveProperty("knobs");
    expect(props).toHaveProperty("alpha");
    expect((props.alpha as any).properties).toHaveProperty("value");
  });

  it("createStage supports public schema with compile mapping", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const beta = createStep(makeContract("beta"), { run: () => {} });
    const publicSchema = Type.Object(
      {
        climate: Type.Number(),
        beta: Type.Object({}, { additionalProperties: false }),
      },
      { additionalProperties: false, default: {} }
    );
    const stage = createStage({
      id: "foundation",
      knobsSchema: EmptyKnobsSchema,
      public: publicSchema,
      compile: ({ config }) => ({ alpha: { value: config.climate } }),
      steps: [step, beta],
    });
    const props = (stage.surfaceSchema as any).properties as Record<string, unknown>;
    expect(props).toHaveProperty("knobs");
    expect(props).toHaveProperty("climate");
    expect(props).not.toHaveProperty("alpha");
    expect(stage.authoring.config.layer).toBe("semantic-public-config");
    expect(stage.authoring.config.schema).toBe(stage.surfaceSchema);
    expect(stage.authoring.config.focusPathsByStepId).toEqual({
      alpha: [],
      beta: ["beta"],
    });
    expect(stage.authoring.runtime.steps).toEqual([{ stepId: "alpha" }, { stepId: "beta" }]);

    const internal = stage.toInternal({ env: {}, stageConfig: { knobs: {}, climate: 2 } });
    expect(internal.rawSteps).toEqual({ alpha: { value: 2 } });
  });

  it("derives recipe schemas from explicit stage public surfaces, not internal op envelopes", () => {
    const op = defineOp({
      kind: "compute",
      id: "test/op/private-envelope",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Object({}, { additionalProperties: false }),
      strategies: {
        default: Type.Object(
          { internalRate: Type.Number({ default: 1 }) },
          { additionalProperties: false, default: {} }
        ),
      },
    } as const);
    const step = createStep(
      defineStep({
        id: "internal-step",
        phase: "foundation",
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
        { additionalProperties: false, default: {} }
      ),
      compile: ({ config }) => ({
        "internal-step": {
          privateOp: { strategy: "default", config: { internalRate: config.productRate } },
        },
      }),
      steps: [step],
    });

    const stageProps = ((deriveRecipeConfigSchema([stage]) as any).properties.foundation as any)
      .properties as Record<string, unknown>;

    expect(stageProps).toHaveProperty("knobs");
    expect(stageProps).toHaveProperty("productRate");
    expect(stageProps).not.toHaveProperty("internal-step");
    expect(JSON.stringify(stageProps)).not.toContain("privateOp");
    expect(JSON.stringify(stageProps)).not.toContain("strategy");
  });

  it("createStage rejects reserved knobs key in steps or public schema", () => {
    const knobsStep = createStep(
      defineStep({
        id: "knobs",
        phase: "foundation",
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
      { additionalProperties: false, default: {} }
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
      { additionalProperties: false, default: {} }
    );
    const stage = createStage({
      id: "foundation",
      knobsSchema: EmptyKnobsSchema,
      public: publicSchema,
      compile: () => ({ knobs: {} }),
      steps: [step],
    });
    expect(() => stage.toInternal({ env: {}, stageConfig: { climate: 1 } })).toThrow(/knobs/);
  });

  it("createRecipe rejects missing tagDefinitions", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });

    expect(() =>
      createRecipe({
        id: "core.base",
        stages: [stage],
        compileOpsById: {},
      } as any)
    ).toThrow(/tagDefinitions/);
  });

  it("binds compile/runtime ops by contract ids", () => {
    const decl = { trees: { id: "ecology/trees" } } as const;
    const compileOp = {
      id: "ecology/trees",
      kind: "plan",
      run: () => "ok",
    } as DomainOpCompileAny;

    const compileOps = bindCompileOps(decl, { [compileOp.id]: compileOp });
    expect(compileOps.trees).toBe(compileOp);

    const runtimeOps = bindRuntimeOps(decl, { [compileOp.id]: runtimeOp(compileOp) });
    expect(runtimeOps.trees.id).toBe(compileOp.id);
  });

  it("bindCompileOps throws when registry is missing an op id", () => {
    const decl = { trees: { id: "missing" } } as const;
    expect(() => bindCompileOps(decl, {} as Record<string, DomainOpCompileAny>)).toThrow(
      /missing/i
    );
  });

  it("createRecipe produces Recipe schema v2 (no instance ids)", () => {
    const stepA = createStep(makeContract("alpha"), { run: () => {} });
    const stepB = createStep(makeContract("beta"), { run: () => {} });
    const stage = createStage({
      id: "foundation",
      knobsSchema: EmptyKnobsSchema,
      steps: [stepA, stepB],
    });

    const recipe = createRecipe({
      id: "core.base",
      tagDefinitions: [],
      stages: [stage],
      compileOpsById: {},
    });

    expect(recipe.recipe.schemaVersion).toBe(2);
    expect(recipe.recipe.steps[0]).toHaveProperty("id");
    expect(recipe.recipe.steps[0]).not.toHaveProperty("instanceId");
  });

  it("createRecipe derives deterministic step ids", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });
    const recipe = createRecipe({
      id: "core.base",
      tagDefinitions: [],
      stages: [stage],
      compileOpsById: {},
    });

    expect(recipe.recipe.steps[0]?.id).toBe("core.base.foundation.alpha");
  });

  it("createRecipe rejects invalid tag prefixes", () => {
    const step = createStep(
      defineStep({
        id: "alpha",
        phase: "foundation",
        requires: ["bad:tag"],
        provides: [],
        schema: EmptyStepConfigSchema,
      }),
      { run: () => {} }
    );
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });

    expect(() =>
      createRecipe({ id: "core.base", tagDefinitions: [], stages: [stage], compileOpsById: {} })
    ).toThrow(/Invalid dependency tag/);
  });

  it("createRecipe rejects duplicates against legacy artifact providers", () => {
    const contract = defineArtifact({
      name: "alphaArtifact",
      id: "artifact:test/alpha",
      schema: Type.Object({}, { additionalProperties: false }),
    });

    const stepA = createStep(
      defineStep({
        id: "alpha",
        phase: "foundation",
        requires: [],
        provides: [],
        artifacts: { provides: [contract] as const },
        schema: EmptyStepConfigSchema,
      }),
      {
        artifacts: implementArtifacts([contract] as const, { alphaArtifact: {} }),
        run: () => {},
      }
    );

    const stepB = createStep(
      defineStep({
        id: "beta",
        phase: "foundation",
        requires: [],
        provides: [contract.id],
        schema: EmptyStepConfigSchema,
      }),
      { run: () => {} }
    );

    const stage = createStage({
      id: "foundation",
      knobsSchema: EmptyKnobsSchema,
      steps: [stepA, stepB],
    });

    expect(() =>
      createRecipe({
        id: "core.base",
        tagDefinitions: [],
        stages: [stage],
        compileOpsById: {},
      })
    ).toThrow(/provided by multiple steps/i);
  });

  it("compile applies schema defaults and rejects unknown keys", () => {
    const schema = Type.Object(
      {
        count: Type.Number({ default: 2 }),
      },
      { additionalProperties: false }
    );
    const step = createStep(makeContract("alpha", schema), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });
    const recipe = createRecipe({
      id: "core.base",
      tagDefinitions: [],
      stages: [stage],
      compileOpsById: {},
    });

    const plan = recipe.compile(baseSettings);
    expect(plan.nodes[0]?.config).toEqual({ count: 2 });

    expect(() =>
      recipe.compile(baseSettings, {
        foundation: { alpha: { count: 1, extra: "nope" } },
      })
    ).toThrow(RecipeCompileError);
  });

  it("createRecipe rejects missing runtime op implementations for step-declared ops", () => {
    const contract = defineOp({
      kind: "plan",
      id: "test/ops/missing-runtime",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Object({}, { additionalProperties: false }),
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    const op = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", {
          run: () => ({}),
        }),
      },
    });

    const step = createStep(
      defineStep({
        id: "alpha",
        phase: "foundation",
        requires: [],
        provides: [],
        ops: { trees: contract },
        schema: Type.Object({}, { additionalProperties: false }),
      }),
      { run: () => {} }
    );
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });

    expect(() =>
      createRecipe({
        id: "core.base",
        tagDefinitions: [],
        stages: [stage],
        compileOpsById: { [op.id]: op },
        runtimeOpsById: {},
      })
    ).toThrow(/Missing op implementation/i);
  });

  it("artifact runtimes enforce missing/double publish/validation errors", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.foo",
      schema: Type.Object(
        {
          value: Type.Number(),
        },
        { additionalProperties: false }
      ),
    });

    const runtimes = implementArtifacts([artifact], {
      artifactFoo: {
        validate: (value) => (value.value > 0 ? [] : [{ message: "value must be positive" }]),
      },
    });

    const adapter = createMockAdapter({ width: 1, height: 1 });
    const env = { ...baseSettings, dimensions: { width: 1, height: 1 } };
    const ctx = createExtendedMapContext({ width: 1, height: 1 }, adapter, env);

    expect(() => runtimes.artifactFoo.read(ctx)).toThrow(ArtifactMissingError);
    expect(runtimes.artifactFoo.tryRead(ctx)).toBeNull();
    expect(() => runtimes.artifactFoo.publish(ctx, { value: 0 })).toThrow(ArtifactValidationError);

    runtimes.artifactFoo.publish(ctx, { value: 1 });
    expect(() => runtimes.artifactFoo.publish(ctx, { value: 2 })).toThrow(
      ArtifactDoublePublishError
    );
  });
});

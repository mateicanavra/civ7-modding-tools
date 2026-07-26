import { describe, expect, it } from "bun:test";
import {
  createRecipe,
  createStage,
  createStep,
  defineArtifact,
  defineArtifactValidator,
  defineStep,
  deriveRecipeConfigSchema,
} from "@mapgen/authoring/index.js";
import { RecipeCompileError } from "@mapgen/compiler/recipe-compile.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
import type { DependencyTagDefinition } from "@mapgen/engine/index.js";
import { EmptyStepConfigSchema } from "@mapgen/engine/step-config.js";
import { type TObject, Type } from "typebox";
import { Value } from "typebox/value";

const baseSetup = admitMapSetup({
  mapSeed: 42,
  dimensions: { width: 2, height: 2 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
});
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

describe("recipe authoring", () => {
  it("createRecipe rejects missing tagDefinitions", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });
    const recipeWithoutTags = {
      id: "core.base",
      stages: [stage],
      compileOpsById: {},
    } as unknown as Parameters<typeof createRecipe>[0];

    expect(() => createRecipe(recipeWithoutTags)).toThrow(/tagDefinitions/);
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

  it("createRecipe rejects duplicate stage identities before compiling indexed surfaces", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });

    expect(() =>
      createRecipe({
        id: "core.base",
        tagDefinitions: [],
        stages: [stage, stage],
        compileOpsById: {},
      })
    ).toThrow('duplicate stage id "foundation"');
  });

  it("createRecipe rejects invalid tag prefixes", () => {
    const step = createStep(
      defineStep({
        id: "alpha",
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

  it("reserves generated artifact postconditions for their artifact modules", () => {
    const artifact = defineArtifact({
      name: "recipeOutput",
      id: "artifact:test.recipe-output",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const module = {
      artifact,
      validate: defineArtifactValidator(artifact),
    };
    const step = createStep(
      defineStep({
        id: "alpha",
        requires: [],
        provides: [],
        artifacts: { provides: [module] },
        schema: EmptyStepConfigSchema,
      }),
      { run: () => {} }
    );
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });

    expect(() =>
      createRecipe({
        id: "core.base",
        tagDefinitions: [
          {
            id: artifact.id,
            kind: "artifact",
            satisfies: () => true,
          },
        ] as never,
        stages: [stage],
        compileOpsById: {},
      })
    ).toThrow(`Dependency tag "${artifact.id}" is already registered.`);
  });

  it("rejects same-id provider and consumer artifacts with different contract identities", () => {
    const providedArtifact = defineArtifact({
      name: "providedIdentity",
      id: "artifact:test.recipe-exact-identity",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const requiredArtifact = defineArtifact({
      name: "requiredIdentity",
      id: providedArtifact.id,
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const provider = createStep(
      defineStep({
        id: "provider",
        requires: [],
        provides: [],
        artifacts: {
          provides: [
            {
              artifact: providedArtifact,
              validate: defineArtifactValidator(providedArtifact),
            },
          ],
        },
        schema: EmptyStepConfigSchema,
      }),
      { run: () => undefined }
    );
    const consumer = createStep(
      defineStep({
        id: "consumer",
        requires: [],
        provides: [],
        artifacts: { requires: [requiredArtifact] },
        schema: EmptyStepConfigSchema,
      }),
      { run: () => undefined }
    );
    const stage = createStage({
      id: "foundation",
      knobsSchema: EmptyKnobsSchema,
      steps: [provider, consumer],
    });

    expect(() =>
      createRecipe({
        id: "core.base",
        tagDefinitions: [],
        stages: [stage],
        compileOpsById: {},
      })
    ).toThrow(
      'artifact "artifact:test.recipe-exact-identity" must use one exact contract identity'
    );
  });

  it("rejects required artifacts without an exact recipe provider", () => {
    const externalArtifact = defineArtifact({
      name: "externalArtifact",
      id: "artifact:test.recipe-external",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const consumer = createStep(
      defineStep({
        id: "consumer",
        requires: [],
        provides: [],
        artifacts: { requires: [externalArtifact] },
        schema: EmptyStepConfigSchema,
      }),
      { run: () => undefined }
    );
    const stage = createStage({
      id: "foundation",
      knobsSchema: EmptyKnobsSchema,
      steps: [consumer],
    });

    expect(() =>
      createRecipe({
        id: "core.base",
        tagDefinitions: [],
        stages: [stage],
        compileOpsById: {},
      })
    ).toThrow(
      'artifact "artifact:test.recipe-external" required by core.base.foundation.consumer has no recipe provider'
    );
  });

  it("rejects structurally forged steps before raw artifact tags can enter the recipe graph", () => {
    const forged = Object.freeze({
      contract: Object.freeze({
        id: "forged-provider",
        requires: Object.freeze([]),
        provides: Object.freeze(["artifact:test.forged-provider"]),
        schema: EmptyStepConfigSchema,
      }),
      run: () => undefined,
    });
    const stage = createStage({
      id: "foundation",
      knobsSchema: EmptyKnobsSchema,
      steps: [forged] as never,
    });

    expect(() =>
      createRecipe({
        id: "core.base",
        tagDefinitions: [],
        stages: [stage],
        compileOpsById: {},
      })
    ).toThrow(
      'stage "foundation" contains noncanonical step "forged-provider"; author steps through createStep'
    );
  });

  it("rejects duplicate explicit dependency-tag definitions", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });
    const definition: DependencyTagDefinition = {
      id: "effect:test.ready",
      kind: "effect",
    };

    expect(() =>
      createRecipe({
        id: "core.base",
        tagDefinitions: [definition, { ...definition, satisfies: () => true }],
        stages: [stage],
        compileOpsById: {},
      })
    ).toThrow(`Dependency tag "${definition.id}" is already registered.`);
  });

  it("reserves all artifact dependency tags for canonical modules", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });

    expect(() =>
      createRecipe({
        id: "core.base",
        tagDefinitions: [{ id: "artifact:test.unbound", kind: "artifact" }] as never,
        stages: [stage],
        compileOpsById: {},
      })
    ).toThrow(/Explicit artifact dependency tag.*not admitted/);
  });

  it("compiles recipe-created complete config and rejects unknown keys", () => {
    const schema = Type.Object(
      { count: Type.Number({ default: 2 }) },
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

    const configSchema = Type.Object(
      {
        foundation: Type.Object(
          { knobs: EmptyKnobsSchema, alpha: schema },
          { additionalProperties: false }
        ),
      },
      { additionalProperties: false }
    );
    expect(deriveRecipeConfigSchema([stage])).toEqual(configSchema);
    const config = Value.Create(configSchema);
    const plan = recipe.compile(baseSetup, config);
    expect(plan.nodes[0]?.config).toEqual({ count: 2 });

    expect(() =>
      recipe.compile(baseSetup, {
        foundation: {
          knobs: {},
          alpha: {
            count: 1,
            // @ts-expect-error Runtime admission independently rejects unknown step config keys.
            extra: "nope",
          },
        },
      })
    ).toThrow(RecipeCompileError);
  });

  it("retains one immutable admitted setup identity through recipe compilation", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });
    const recipe = createRecipe({
      id: "core.base",
      tagDefinitions: [],
      stages: [stage],
      compileOpsById: {},
    });
    const config = { foundation: { knobs: {} } };
    const admittedSetup = admitMapSetup({
      mapSeed: 42,
      dimensions: { width: 2, height: 2 },
      latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
    });

    const plan = recipe.compile(admittedSetup, config);
    expect(plan.setup).toBe(admittedSetup);
    expect(Object.isFrozen(plan.setup)).toBe(true);

    expect(recipe.compile(baseSetup, config).setup).toBe(baseSetup);
  });

  it("snapshots recipe authorship before caller aliases or public structure can mutate", () => {
    const schema = Type.Object(
      { count: Type.Number({ default: 2 }) },
      { additionalProperties: false }
    );
    const step = createStep(makeContract("alpha", schema), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });
    const stages = [stage];
    const recipe = createRecipe({
      id: "core.base",
      tagDefinitions: [],
      stages,
      compileOpsById: {},
    });

    Reflect.set(schema.properties.count, "minimum", 100);
    stages.length = 0;

    expect(Reflect.set(recipe.recipe.steps[0]!, "id", "forged")).toBe(false);
    expect(() => (recipe.recipe.steps as unknown[]).push({ id: "forged" })).toThrow();

    const plan = recipe.compile(baseSetup, { foundation: { knobs: {}, alpha: { count: 2 } } });
    expect(plan.nodes).toHaveLength(1);
    expect(plan.nodes[0]?.stepId).toBe("core.base.foundation.alpha");
    expect(plan.nodes[0]?.config).toEqual({ count: 2 });
  });

  it("reads authored array lengths through descriptors without invoking property access", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });
    let lengthReads = 0;
    let lengthDescriptorReads = 0;
    const stages = new Proxy([stage], {
      get: (target, key, receiver) => {
        if (key === "length") {
          lengthReads += 1;
          throw new Error("array length property access is forbidden");
        }
        return Reflect.get(target, key, receiver);
      },
      getOwnPropertyDescriptor: (target, key) => {
        if (key === "length") lengthDescriptorReads += 1;
        return Reflect.getOwnPropertyDescriptor(target, key);
      },
    });

    const recipe = createRecipe({
      id: "core.descriptor-length",
      tagDefinitions: [],
      stages,
      compileOpsById: {},
    });

    expect(recipe.recipe.steps).toHaveLength(1);
    expect(lengthReads).toBe(0);
    expect(lengthDescriptorReads).toBe(1);
  });

  it("fails closed when an authored array length descriptor cannot be inspected", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });
    const stages = new Proxy([stage], {
      getOwnPropertyDescriptor: (target, key) => {
        if (key === "length") throw new Error("descriptor inspection refused");
        return Reflect.getOwnPropertyDescriptor(target, key);
      },
    });

    expect(() =>
      createRecipe({
        id: "core.opaque-length",
        tagDefinitions: [],
        stages,
        compileOpsById: {},
      })
    ).toThrow("Recipe authorship array length must be inspectable");
  });
});

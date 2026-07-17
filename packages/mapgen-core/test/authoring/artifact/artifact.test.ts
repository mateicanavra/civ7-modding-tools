import { describe, expect, it } from "bun:test";
import { runInNewContext } from "node:vm";
import { createMockAdapter } from "@civ7/adapter";
import {
  ArtifactDoublePublishError,
  ArtifactMissingError,
  ArtifactValidationError,
  createRecipe,
  createStage,
  createStep,
  createStepFor,
  defineArtifact,
  defineArtifactCatalog,
  defineStep,
  implementArtifactModules,
  readValidatedArtifact,
  validateArtifactSchema,
} from "@mapgen/authoring/index.js";
import { createExtendedMapContext } from "@mapgen/core/types.js";
import { EmptyStepConfigSchema } from "@mapgen/engine/step-config.js";
import { Type } from "typebox";

const baseSettings = {
  seed: 42,
  dimensions: { width: 2, height: 2 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
};
const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false });

function schemaModule<C extends ReturnType<typeof defineArtifact>>(artifact: C) {
  return {
    artifact,
    validate: (value: unknown) => validateArtifactSchema(artifact.schema, value),
  };
}

describe("artifact authoring", () => {
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

  it("snapshots artifact declarations before deriving step dependencies", () => {
    const required = defineArtifact({
      name: "requiredArtifact",
      id: "artifact:test.snapshot.required",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const provided = defineArtifact({
      name: "providedArtifact",
      id: "artifact:test.snapshot.provided",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const replacement = defineArtifact({
      name: "replacementArtifact",
      id: "artifact:test.snapshot.replacement",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const requires: Array<ReturnType<typeof defineArtifact>> = [required];
    const provides: Array<ReturnType<typeof defineArtifact>> = [provided];
    const contract = defineStep({
      id: "artifact-snapshot",
      phase: "foundation",
      requires: [],
      provides: [],
      artifacts: { requires, provides },
      schema: EmptyStepConfigSchema,
    });

    requires[0] = replacement;
    provides.length = 0;

    expect(contract.artifacts?.requires).toEqual([required]);
    expect(contract.artifacts?.provides).toEqual([provided]);
    expect(contract.requires).toEqual([required.id]);
    expect(contract.provides).toEqual([provided.id]);
    expect(Object.isFrozen(contract)).toBe(true);
    expect(Object.isFrozen(contract.requires)).toBe(true);
    expect(Object.isFrozen(contract.provides)).toBe(true);
    expect(Object.isFrozen(contract.artifacts)).toBe(true);
    expect(Object.isFrozen(contract.artifacts?.requires)).toBe(true);
    expect(Object.isFrozen(contract.artifacts?.provides)).toBe(true);
    expect(() =>
      (contract.artifacts!.provides! as Array<ReturnType<typeof defineArtifact>>).push(replacement)
    ).toThrow();
    expect(() =>
      Object.defineProperty(contract, "artifacts", {
        value: Object.freeze({ provides: Object.freeze([replacement]) }),
      })
    ).toThrow();
    expect(contract.artifacts).toEqual({ requires: [required], provides: [provided] });
    expect(contract.requires).toEqual([required.id]);
    expect(contract.provides).toEqual([provided.id]);
  });

  it("rejects authored modules when the contract declares an empty provider set", () => {
    const contract = defineStep({
      id: "empty-artifact-provider",
      phase: "foundation",
      requires: [],
      provides: [],
      artifacts: { provides: [] },
      schema: EmptyStepConfigSchema,
    });

    expect(() =>
      createStep(contract, {
        artifacts: [] as never,
        run: () => {},
      })
    ).toThrow(/declares no artifact providers but received modules/);

    const step = createStep(contract, { run: () => {} });
    expect(Object.prototype.hasOwnProperty.call(step, "artifacts")).toBe(false);
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
        artifacts: [schemaModule(contract)],
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

  it("artifact runtimes enforce missing/double publish/validation errors", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.foo",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const module = {
      artifact,
      validate: (value: unknown) => {
        const schemaIssues = validateArtifactSchema(artifact.schema, value);
        if (schemaIssues.length > 0) return schemaIssues;
        return (value as { value: number }).value > 0
          ? []
          : [{ message: "value must be positive" }];
      },
    };
    const runtimes = implementArtifactModules([module]);
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

  it("validates stored artifacts before exposing their typed observation", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.observation",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const adapter = createMockAdapter({ width: 1, height: 1 });
    const env = { ...baseSettings, dimensions: { width: 1, height: 1 } };
    const context = createExtendedMapContext({ width: 1, height: 1 }, adapter, env);
    const source = {
      artifact,
      validate: (value: unknown) => validateArtifactSchema(artifact.schema, value),
    };

    expect(() => readValidatedArtifact(context, source)).toThrow("Missing required artifact");
    context.artifacts.set(artifact.id, {});
    expect(() => readValidatedArtifact(context, source)).toThrow("Invalid artifact");
    context.artifacts.set(artifact.id, { value: "not-a-number" });
    expect(() => readValidatedArtifact(context, source)).toThrow("Invalid artifact");
    context.artifacts.set(artifact.id, { value: 7 });
    expect(readValidatedArtifact(context, source)).toEqual({ value: 7 });
  });

  it("derives exact handles and artifact-name runtimes from one module catalog", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.catalog",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const module = schemaModule(artifact);
    const catalog = defineArtifactCatalog({ consumerLookup: module });
    const runtimes = implementArtifactModules([catalog.modules.consumerLookup]);

    expect(catalog.artifacts.consumerLookup).toBe(artifact);
    expect(Object.isFrozen(catalog.modules)).toBe(true);
    expect(Object.isFrozen(catalog.artifacts)).toBe(true);
    expect(Object.isFrozen(runtimes)).toBe(true);
    expect(runtimes.artifactFoo.contract).toBe(artifact);

    if (false) {
      const exactArtifact: typeof artifact = catalog.artifacts.consumerLookup;
      void exactArtifact;
      // @ts-expect-error Runtime keys come from artifact names, not catalog lookup keys.
      void runtimes.consumerLookup;
      // @ts-expect-error The artifact schema requires a numeric value.
      runtimes.artifactFoo.publish({} as never, { value: "invalid" });
    }
  });

  it("refuses catalog objects whose keys cannot survive runtime materialization", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.catalog-keys",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const module = schemaModule(artifact);
    const symbolKey = Symbol("artifactFoo");
    const symbolCatalog = { [symbolKey]: module };
    const inheritedCatalog = { __proto__: { inherited: module } };
    const reservedCatalog: Record<string, typeof module> = Object.assign(Object.create(null), {
      constructor: module,
    });
    const hiddenCatalog: Record<string, typeof module> = Object.create(null);
    Object.defineProperty(hiddenCatalog, "hidden", { enumerable: false, value: module });

    expect(() => defineArtifactCatalog(symbolCatalog as never)).toThrow(/keys must be strings/);
    expect(() => defineArtifactCatalog(inheritedCatalog as never)).toThrow(
      /plain or null-prototype/
    );
    expect(() => defineArtifactCatalog(reservedCatalog)).toThrow(/key "constructor" is reserved/);
    expect(() => defineArtifactCatalog(hiddenCatalog)).toThrow(/key "hidden" must be enumerable/);

    if (false) {
      // @ts-expect-error Artifact catalogs expose only materializable string keys.
      defineArtifactCatalog(symbolCatalog);
    }
  });

  it("rejects accessor catalog entries without evaluating them", () => {
    const first = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.catalog-snapshot.first",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    let reads = 0;
    const modules = Object.defineProperty({}, "slot", {
      enumerable: true,
      get: () => {
        reads += 1;
        return schemaModule(first);
      },
    }) as Readonly<{ slot: ReturnType<typeof schemaModule> }>;

    expect(() => defineArtifactCatalog(modules)).toThrow(/data property/);
    expect(reads).toBe(0);
  });

  it("snapshots the minimal frozen module authority", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.catalog-snapshot",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const originalValidate = (value: unknown) => validateArtifactSchema(artifact.schema, value);
    const source = {
      artifact,
      validate: originalValidate,
      Schema: artifact.schema,
    };

    const catalog = defineArtifactCatalog({ slot: source });
    source.validate = () => [{ message: "mutated validator" }];

    expect(catalog.modules.slot).toEqual({ artifact, validate: originalValidate });
    expect(catalog.modules.slot.validate).toBe(originalValidate);
    expect(Object.isFrozen(catalog.modules.slot)).toBe(true);

    if (false) {
      // @ts-expect-error Catalog modules expose authority only, not arbitrary namespace exports.
      void catalog.modules.slot.Schema;
    }
  });

  it("requires producer runtimes to exactly own the contracts declared by the step", () => {
    const declared = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.exact-runtime.declared",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const extra = defineArtifact({
      name: "artifactBar",
      id: "artifact:test.exact-runtime.extra",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const replacement = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.exact-runtime.replacement",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const contract = defineStep({
      id: "exact-runtime-provider",
      phase: "foundation",
      requires: [],
      provides: [],
      artifacts: { provides: [declared] },
      schema: EmptyStepConfigSchema,
    });

    expect(() =>
      createStep(contract, {
        // Untyped JavaScript callers cannot smuggle an additional module past the runtime guard.
        artifacts: [schemaModule(declared), schemaModule(extra)] as never,
        run: () => {},
      })
    ).toThrow(/do not match declared providers/);
    expect(() =>
      createStep(contract, {
        // Untyped JavaScript callers still receive the runtime contract-identity guard.
        artifacts: [schemaModule(replacement)] as never,
        run: () => {},
      })
    ).toThrow(/do not match declared providers/);

    const step = createStep(contract, {
      artifacts: [schemaModule(declared)],
      run: () => {},
    });
    expect(step.artifacts.artifactFoo.contract).toBe(declared);
  });

  it("admits only own module-array data without depending on prototypes or realms", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.module-array-shape",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const contract = defineStep({
      id: "module-array-provider",
      phase: "foundation",
      requires: [],
      provides: [],
      artifacts: { provides: [artifact] },
      schema: EmptyStepConfigSchema,
    });
    const module = schemaModule(artifact);
    const crossRealm = runInNewContext("[]") as Array<typeof module>;
    crossRealm.push(module);
    const inheritedEntry = [module];
    Object.setPrototypeOf(
      inheritedEntry,
      Object.assign(Object.create(Array.prototype), { 1: module })
    );
    const inheritedOnlyModule = Object.create(module) as typeof module;
    let reads = 0;
    const accessorEntry = [module];
    Object.defineProperty(accessorEntry, "0", {
      enumerable: true,
      get: () => {
        reads += 1;
        return schemaModule(artifact);
      },
    });

    expect(() => createStep(contract, { artifacts: crossRealm, run: () => {} })).not.toThrow();
    expect(() => createStep(contract, { artifacts: inheritedEntry, run: () => {} })).not.toThrow();
    expect(() => createStep(contract, { artifacts: [inheritedOnlyModule], run: () => {} })).toThrow(
      /must own artifact data properties/
    );
    expect(() => createStep(contract, { artifacts: accessorEntry, run: () => {} })).toThrow(
      /data property/
    );
    expect(reads).toBe(0);
  });

  it("rejects duplicate artifact ids and names in catalogs and runtime module lists", () => {
    const first = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.duplicate",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const duplicateName = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.other",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const duplicateId = defineArtifact({
      name: "artifactBar",
      id: "artifact:test.duplicate",
      schema: Type.Object({}, { additionalProperties: false }),
    });

    expect(() =>
      defineArtifactCatalog({
        first: schemaModule(first),
        duplicateName: schemaModule(duplicateName),
      })
    ).toThrow(/duplicate artifact name/);
    expect(() =>
      defineArtifactCatalog({ first: schemaModule(first), duplicateId: schemaModule(duplicateId) })
    ).toThrow(/duplicate artifact id/);
    expect(() =>
      implementArtifactModules([schemaModule(first), schemaModule(duplicateName)])
    ).toThrow(/duplicate artifact name/);
  });

  it("uses the complete module validator for publish, satisfaction, and validated reads", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.single-admission",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    let admissions = 0;
    const module = {
      artifact,
      validate: (value: unknown) => {
        admissions += 1;
        return validateArtifactSchema(artifact.schema, value);
      },
    };
    const runtime = implementArtifactModules([module]).artifactFoo;
    const adapter = createMockAdapter({ width: 1, height: 1 });
    const env = { ...baseSettings, dimensions: { width: 1, height: 1 } };
    const context = createExtendedMapContext({ width: 1, height: 1 }, adapter, env);

    expect(() => runtime.publish(context, { value: 1 })).not.toThrow();
    expect(admissions).toBe(1);
    expect(runtime.satisfies?.(context, { satisfied: new Set([artifact.id]) })).toBe(true);
    expect(admissions).toBe(2);
    expect(readValidatedArtifact(context, module)).toEqual({ value: 1 });
    expect(admissions).toBe(3);
  });
});

if (false) {
  const artifact = defineArtifact({
    name: "artifactFoo",
    id: "artifact:test.type-contract",
    schema: Type.Object({}, { additionalProperties: false }),
  });
  const module = schemaModule(artifact);
  const providesArtifact = defineStep({
    id: "type-provider",
    phase: "foundation",
    requires: [],
    provides: [],
    artifacts: { provides: [artifact] },
    schema: EmptyStepConfigSchema,
  });
  const requiresArtifact = defineStep({
    id: "type-consumer",
    phase: "foundation",
    requires: [],
    provides: [],
    artifacts: { requires: [artifact] },
    schema: EmptyStepConfigSchema,
  });
  const emptyArtifacts = defineStep({
    id: "type-empty",
    phase: "foundation",
    requires: [],
    provides: [],
    artifacts: { provides: [] },
    schema: EmptyStepConfigSchema,
  });
  const widenedProvides: readonly (typeof artifact)[] = [artifact];
  const widenedArtifacts = defineStep({
    id: "type-widened-provider",
    phase: "foundation",
    requires: [],
    provides: [],
    artifacts: { provides: widenedProvides },
    schema: EmptyStepConfigSchema,
  });

  // @ts-expect-error A known nonempty provides tuple requires artifact runtimes.
  createStep(providesArtifact, { run: () => {} });
  createStep(providesArtifact, {
    artifacts: [module],
    run: () => {},
  });
  // @ts-expect-error Requires-only steps cannot declare publication modules.
  createStep(requiresArtifact, { artifacts: [module], run: () => {} });
  // @ts-expect-error Empty provides cannot declare publication modules.
  createStep(emptyArtifacts, { artifacts: [module], run: () => {} });
  // @ts-expect-error Widened provider arrays remain runtime-bearing even when cardinality is unknown.
  createStep(widenedArtifacts, { run: () => {} });

  const createTestStep = createStepFor<ReturnType<typeof createExtendedMapContext>>();
  // @ts-expect-error createStepFor enforces the same nonempty publication requirement.
  createTestStep(providesArtifact, { run: () => {} });
}

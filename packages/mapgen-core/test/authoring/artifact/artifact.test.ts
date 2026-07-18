import { describe, expect, it } from "bun:test";
import { runInNewContext } from "node:vm";
import { createMockAdapter } from "@civ7/adapter";
import {
  ArtifactDoublePublishError,
  ArtifactMissingError,
  ArtifactValidationError,
  appendArtifactTypedArrayIssues,
  createRecipe,
  createStage,
  createStep,
  defineArtifact,
  defineArtifactCatalog,
  defineStep,
  implementArtifactModules,
  readValidatedArtifact,
  validateArtifactSchema,
} from "@mapgen/authoring/index.js";
import { createMapContext, type MapContext } from "@mapgen/core/map-context.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
import { compileExecutionPlan, PipelineExecutor, StepRegistry } from "@mapgen/engine/index.js";
import { EmptyStepConfigSchema } from "@mapgen/engine/step-config.js";
import type { IsEqual } from "type-fest";
import { Type } from "typebox";

const baseSetup = {
  mapSeed: 42,
  dimensions: { width: 2, height: 2 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
};
const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false });
type Expect<T extends true> = T;

function schemaModule<C extends ReturnType<typeof defineArtifact>>(artifact: C) {
  return {
    artifact,
    validate: (value: unknown) => validateArtifactSchema(artifact.schema, value),
  };
}

function executeContextStep(context: MapContext, run: (context: MapContext) => void): void {
  const registry = new StepRegistry();
  registry.register({
    id: "artifact-test-step",
    phase: "foundation",
    requires: [],
    provides: [],
    run,
  });
  const plan = compileExecutionPlan(
    {
      recipe: { schemaVersion: 2, steps: [{ id: "artifact-test-step" }] },
      setup: context.setup,
    },
    registry
  );
  new PipelineExecutor(registry).executePlan(context, plan);
}

describe("artifact authoring", () => {
  it("reports exact typed-array constructors and cardinality through one admission primitive", () => {
    const issues: Array<{ message: string }> = [];

    expect(appendArtifactTypedArrayIssues(issues, "field", new Int16Array(4), Int16Array, 4)).toBe(
      true
    );
    expect(
      appendArtifactTypedArrayIssues(issues, "wrongConstructor", new Uint16Array(4), Int16Array, 4)
    ).toBe(false);
    expect(
      appendArtifactTypedArrayIssues(issues, "wrongLength", new Int16Array(3), Int16Array, 4)
    ).toBe(true);
    expect(
      appendArtifactTypedArrayIssues(issues, "unsignedField", new Uint32Array(2), Uint32Array)
    ).toBe(true);
    expect(issues).toEqual([
      { message: "Expected wrongConstructor to be Int16Array." },
      { message: "Expected wrongLength length 4 (received 3)." },
    ]);
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
      requires: ["effect:test.engineReady"],
      provides: [],
      artifacts: { requires: [artifact], provides: [] },
      schema: EmptyStepConfigSchema,
    });

    expect(contract.requires).toContain("effect:test.engineReady");
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
        artifacts: { requires: [artifact], provides: [schemaModule(artifact)] },
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
    const providedModule = schemaModule(provided);
    const replacementModule = schemaModule(replacement);
    const provides: Array<typeof providedModule> = [providedModule];
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
    expect(contract.artifacts?.provides).toEqual([providedModule]);
    expect(contract.requires).toEqual([required.id]);
    expect(contract.provides).toEqual([provided.id]);
    expect(Object.isFrozen(contract)).toBe(true);
    expect(Object.isFrozen(contract.requires)).toBe(true);
    expect(Object.isFrozen(contract.provides)).toBe(true);
    expect(Object.isFrozen(contract.artifacts)).toBe(true);
    expect(Object.isFrozen(contract.artifacts?.requires)).toBe(true);
    expect(Object.isFrozen(contract.artifacts?.provides)).toBe(true);
    expect(() =>
      (contract.artifacts!.provides! as Array<typeof providedModule>).push(providedModule)
    ).toThrow();
    expect(() =>
      Object.defineProperty(contract, "artifacts", {
        value: Object.freeze({ provides: Object.freeze([replacementModule]) }),
      })
    ).toThrow();
    expect(contract.artifacts).toEqual({ requires: [required], provides: [providedModule] });
    expect(contract.requires).toEqual([required.id]);
    expect(contract.provides).toEqual([provided.id]);
  });

  it("retains only canonical frozen artifact contract identities", () => {
    const schema = Type.Object({}, { additionalProperties: false });
    const mutableArtifact = {
      name: "mutableArtifact",
      id: "artifact:test.mutable",
      schema,
    };
    let accessorReads = 0;
    const accessorArtifact = Object.freeze({
      get name() {
        accessorReads += 1;
        return "accessorArtifact";
      },
      id: "artifact:test.accessor",
      schema,
    });
    const malformedArtifact = Object.freeze({
      name: "constructor",
      id: "not-artifact",
      schema,
    });

    expect(() =>
      defineStep({
        id: "mutable-artifact-contract",
        phase: "foundation",
        requires: [],
        provides: [],
        artifacts: { requires: [mutableArtifact] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/artifact contract must be a frozen object/);
    expect(() =>
      defineStep({
        id: "accessor-artifact-contract",
        phase: "foundation",
        requires: [],
        provides: [],
        artifacts: { provides: [schemaModule(accessorArtifact)] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/own enumerable data properties/);
    expect(() =>
      defineStep({
        id: "malformed-artifact-contract",
        phase: "foundation",
        requires: [],
        provides: [],
        artifacts: { provides: [schemaModule(malformedArtifact)] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/artifact name "constructor" is reserved/);
    expect(accessorReads).toBe(0);
  });

  it("materializes canonical artifact contracts from structurally wider definitions", () => {
    const schema = Type.Object({}, { additionalProperties: false });
    const definition: Readonly<{
      name: "exactArtifact";
      id: "artifact:test.exact";
      schema: typeof schema;
      accidentalState: string;
    }> = {
      name: "exactArtifact",
      id: "artifact:test.exact",
      schema,
      accidentalState: "must not escape",
    };

    const artifact = defineArtifact(definition);
    const contract = defineStep({
      id: "exact-artifact-contract",
      phase: "foundation",
      requires: [],
      provides: [],
      artifacts: { provides: [schemaModule(artifact)] },
      schema: EmptyStepConfigSchema,
    });

    expect(Reflect.ownKeys(artifact)).toEqual(["name", "id", "schema"]);
    expect(contract.artifacts?.provides?.[0]?.artifact).toBe(artifact);
  });

  it("omits artifact runtimes when the contract declares an empty provider set", () => {
    const contract = defineStep({
      id: "empty-artifact-provider",
      phase: "foundation",
      requires: [],
      provides: [],
      artifacts: { provides: [] },
      schema: EmptyStepConfigSchema,
    });

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
        artifacts: { provides: [schemaModule(contract)] as const },
        schema: EmptyStepConfigSchema,
      }),
      { run: () => {} }
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
    const setup = admitMapSetup({ ...baseSetup, dimensions: { width: 1, height: 1 } });
    const ctx = createMapContext({ setup: setup, adapter });

    expect(() => runtimes.artifactFoo.read(ctx)).toThrow(ArtifactMissingError);
    executeContextStep(ctx, (activeContext) => {
      expect(() => runtimes.artifactFoo.publish(activeContext, { value: 0 })).toThrow(
        ArtifactValidationError
      );
      runtimes.artifactFoo.publish(activeContext, { value: 1 });
      expect(() => runtimes.artifactFoo.publish(activeContext, { value: 2 })).toThrow(
        ArtifactDoublePublishError
      );
    });
  });

  it("admits artifact publication only during active execution", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.execution-only",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const runtimes = implementArtifactModules([schemaModule(artifact)]);
    const setup = admitMapSetup({ ...baseSetup, dimensions: { width: 1, height: 1 } });
    const createContext = () =>
      createMapContext({ setup, adapter: createMockAdapter({ width: 1, height: 1 }) });
    const freshContext = createContext();
    const terminalContext = createContext();

    expect(() => runtimes.artifactFoo.publish(freshContext, { value: 1 })).toThrow(
      "active execution"
    );
    executeContextStep(terminalContext, () => undefined);
    expect(() => runtimes.artifactFoo.publish(terminalContext, { value: 1 })).toThrow(
      "active execution"
    );
  });

  it("revalidates stored artifacts before exposing their typed observation", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.observation",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const adapter = createMockAdapter({ width: 1, height: 1 });
    const setup = admitMapSetup({ ...baseSetup, dimensions: { width: 1, height: 1 } });
    const context = createMapContext({ setup: setup, adapter });
    let observationIsValid = true;
    const source = {
      artifact,
      validate: (value: unknown) => {
        const issues = validateArtifactSchema(artifact.schema, value);
        return issues.length > 0 || observationIsValid
          ? issues
          : [{ message: "observation is no longer valid" }];
      },
    };
    const runtimes = implementArtifactModules([source]);

    expect(() => readValidatedArtifact(context, source)).toThrow("Missing required artifact");
    executeContextStep(context, (activeContext) => {
      runtimes.artifactFoo.publish(activeContext, { value: 7 });
    });
    observationIsValid = false;
    expect(() => readValidatedArtifact(context, source)).toThrow("Invalid artifact");
    observationIsValid = true;
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

  it("derives producer runtimes from the modules admitted by the step contract", () => {
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
    const declaredModule = schemaModule(declared);
    const contract = defineStep({
      id: "exact-runtime-provider",
      phase: "foundation",
      requires: [],
      provides: [],
      artifacts: { provides: [declaredModule] },
      schema: EmptyStepConfigSchema,
    });

    const step = createStep(contract, { run: () => {} });
    expect(step.artifacts.artifactFoo.contract).toBe(declared);
    expect(contract.artifacts?.provides?.[0]).not.toBe(declaredModule);
    expect(contract.artifacts?.provides?.[0]).toEqual(declaredModule);

    expect(() =>
      createStep(contract, { artifacts: [schemaModule(extra)], run: () => {} } as never)
    ).toThrow(/implementation cannot declare artifact modules/);
    expect(() =>
      createStep(contract, { artifacts: [schemaModule(replacement)], run: () => {} } as never)
    ).toThrow(/implementation cannot declare artifact modules/);
  });

  it("admits only own module-array data without depending on prototypes or realms", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.module-array-shape",
      schema: Type.Object({}, { additionalProperties: false }),
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
    const sparse = new Array<typeof module>(1);
    const extraKey = [module];
    Object.defineProperty(extraKey, "metadata", { enumerable: true, value: "unexpected" });

    expect(() =>
      defineStep({
        id: "cross-realm-modules",
        phase: "foundation",
        requires: [],
        provides: [],
        artifacts: { provides: crossRealm },
        schema: EmptyStepConfigSchema,
      })
    ).not.toThrow();
    expect(() =>
      defineStep({
        id: "inherited-array-entry",
        phase: "foundation",
        requires: [],
        provides: [],
        artifacts: { provides: inheritedEntry },
        schema: EmptyStepConfigSchema,
      })
    ).not.toThrow();
    expect(() =>
      defineStep({
        id: "inherited-module",
        phase: "foundation",
        requires: [],
        provides: [],
        artifacts: { provides: [inheritedOnlyModule] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/must own artifact data properties/);
    expect(() =>
      defineStep({
        id: "accessor-array-entry",
        phase: "foundation",
        requires: [],
        provides: [],
        artifacts: { provides: accessorEntry },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/data property/);
    expect(() =>
      defineStep({
        id: "sparse-module-array",
        phase: "foundation",
        requires: [],
        provides: [],
        artifacts: { provides: sparse },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/dense array without extra keys/);
    expect(() =>
      defineStep({
        id: "extra-key-module-array",
        phase: "foundation",
        requires: [],
        provides: [],
        artifacts: { provides: extraKey },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/dense array without extra keys/);
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
    expect(() =>
      defineStep({
        id: "duplicate-module-name",
        phase: "foundation",
        requires: [],
        provides: [],
        artifacts: { provides: [schemaModule(first), schemaModule(duplicateName)] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/duplicate artifact name/);
    expect(() =>
      defineStep({
        id: "duplicate-module-id",
        phase: "foundation",
        requires: [],
        provides: [],
        artifacts: { provides: [schemaModule(first), schemaModule(duplicateId)] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/duplicate artifact id/);
  });

  it("uses the complete module validator for publish, satisfaction, and validated reads", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.single-admission",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const admissions: Array<
      Readonly<{
        value: unknown;
        dimensions: Readonly<{ width: number; height: number }> | undefined;
      }>
    > = [];
    const module = {
      artifact,
      validate: (
        value: unknown,
        context?: Readonly<{
          dimensions?: Readonly<{ width: number; height: number }>;
        }>
      ) => {
        admissions.push({ value, dimensions: context?.dimensions });
        return validateArtifactSchema(artifact.schema, value);
      },
    };
    const contract = defineStep({
      id: "single-artifact-admission",
      phase: "foundation",
      requires: [],
      provides: [],
      artifacts: { provides: [module] },
      schema: EmptyStepConfigSchema,
    });
    const step = createStep(contract, { run: () => {} });
    const runtime = step.artifacts.artifactFoo;
    const admittedModule = contract.artifacts?.provides?.[0];
    if (!admittedModule)
      throw new Error("Expected the step contract to retain its provider module.");
    const adapter = createMockAdapter({ width: 1, height: 1 });
    const setup = admitMapSetup({ ...baseSetup, dimensions: { width: 1, height: 1 } });
    const context = createMapContext({ setup: setup, adapter });
    const expectedAdmission = {
      value: { value: 1 },
      dimensions: { width: 1, height: 1 },
    };

    executeContextStep(context, (activeContext) => {
      expect(() => runtime.publish(activeContext, { value: 1 })).not.toThrow();
    });
    expect(admissions).toEqual([expectedAdmission]);
    expect(runtime.satisfies?.(context, { satisfied: new Set([artifact.id]) })).toBe(true);
    expect(admissions).toEqual([expectedAdmission, expectedAdmission]);
    expect(readValidatedArtifact(context, admittedModule)).toEqual({ value: 1 });
    expect(admissions).toEqual([expectedAdmission, expectedAdmission, expectedAdmission]);
  });
});

if (false) {
  const artifact = defineArtifact({
    name: "artifactFoo",
    id: "artifact:test.type-contract",
    schema: Type.Object({}, { additionalProperties: false }),
  });
  const module = schemaModule(artifact);
  const moduleWithExtraState = { ...module, Schema: artifact.schema };
  const providesArtifact = defineStep({
    id: "type-provider",
    phase: "foundation",
    requires: [],
    provides: [],
    artifacts: { provides: [module] },
    schema: EmptyStepConfigSchema,
  });
  const normalizedProviderContract = defineStep({
    id: "type-provider-normalized",
    phase: "foundation",
    requires: [],
    provides: [],
    artifacts: { provides: [moduleWithExtraState] },
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
  const widenedProvides: readonly (typeof module)[] = [module];
  const widenedArtifacts = defineStep({
    id: "type-widened-provider",
    phase: "foundation",
    requires: [],
    provides: [],
    artifacts: { provides: widenedProvides },
    schema: EmptyStepConfigSchema,
  });

  const tupleProviderStep = createStep(providesArtifact, { run: () => {} });
  // @ts-expect-error Requires-only steps cannot declare publication modules.
  createStep(requiresArtifact, { artifacts: [module], run: () => {} });
  // @ts-expect-error Empty provides cannot declare publication modules.
  createStep(emptyArtifacts, { artifacts: [module], run: () => {} });
  const widenedProviderStep = createStep(widenedArtifacts, { run: () => {} });

  type NormalizedProvider = NonNullable<
    NonNullable<(typeof normalizedProviderContract)["artifacts"]>["provides"]
  >[0];
  type ProviderExtraStateIsStripped = Expect<
    IsEqual<"Schema" extends keyof NormalizedProvider ? true : false, false>
  >;
  type TupleProviderRuntimeIsRequired = Expect<
    IsEqual<undefined extends typeof tupleProviderStep.artifacts ? true : false, false>
  >;
  type WidenedProviderRuntimeIsOptional = Expect<
    IsEqual<undefined extends typeof widenedProviderStep.artifacts ? true : false, true>
  >;
  const typeAssertions: readonly [
    ProviderExtraStateIsStripped,
    TupleProviderRuntimeIsRequired,
    WidenedProviderRuntimeIsOptional,
  ] = [true, true, true];
  void typeAssertions;

  const createTestStep = createStep;
  createTestStep(providesArtifact, { run: () => {} });
}

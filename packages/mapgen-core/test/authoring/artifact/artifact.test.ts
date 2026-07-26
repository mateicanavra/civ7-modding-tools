import { describe, expect, it } from "bun:test";
import { runInNewContext } from "node:vm";
import { createMockAdapter } from "@civ7/adapter";
import { implementArtifactModules } from "@mapgen/authoring/artifact/runtime.js";
import {
  type ArtifactContract,
  ArtifactDoublePublishError,
  ArtifactMissingError,
  ArtifactValidationError,
  appendArtifactTypedArrayIssues,
  createRecipe,
  createStage,
  createStep,
  defineArtifact,
  defineArtifactCatalog,
  defineArtifactValidator,
  defineStep,
  observeValidatedArtifact,
  readValidatedArtifact,
} from "@mapgen/authoring/index.js";
import { createMapContext, type MapContext } from "@mapgen/core/map-context.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
import { compileExecutionPlan, PipelineExecutor, StepRegistry } from "@mapgen/engine/index.js";
import { EmptyStepConfigSchema } from "@mapgen/engine/step-config.js";
import type { IsEqual } from "type-fest";
import { Type } from "typebox";
import { buildDeclaredStepDependencies } from "../../../src/authoring/step/dependencies.js";

const baseSetup = {
  mapSeed: 42,
  dimensions: { width: 2, height: 2 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
};
const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false });
type Expect<T extends true> = T;

function schemaModule<C extends ArtifactContract>(artifact: C) {
  const Schema: C["schema"] = artifact.schema;
  return {
    Schema,
    artifact,
    validate: defineArtifactValidator(artifact),
  };
}

function executeContextStep(
  context: MapContext,
  run: (context: MapContext) => void,
  stepId = "artifact-test-step"
): void {
  const registry = new StepRegistry();
  registry.register({
    id: stepId,
    stageId: "artifact-test",
    requires: [],
    provides: [],
    run,
  });
  const plan = compileExecutionPlan(
    {
      recipe: { schemaVersion: 2, steps: [{ id: stepId }] },
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
      requires: ["effect:test.engineReady"],
      provides: [],
      artifacts: { requires: [artifact], provides: [] },
      schema: EmptyStepConfigSchema,
    });

    expect(contract.requires).toContain("effect:test.engineReady");
    expect(contract.requires).toContain("artifact:test.foo");
  });

  it("defineStep rejects raw artifact ids in favor of module-owned declarations", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.foo",
      schema: Type.Object({}, { additionalProperties: false }),
    });

    expect(() =>
      defineStep({
        id: "alpha",
        requires: ["artifact:test.foo"],
        provides: [],
        artifacts: { requires: [artifact], provides: [] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/cannot declare artifact ids.*artifacts\.requires\/provides/i);

    expect(() =>
      defineStep({
        id: "beta",
        requires: [],
        provides: ["artifact:test.foo"],
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/cannot declare artifact ids.*artifacts\.requires\/provides/i);
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
        requires: [],
        provides: [],
        artifacts: { requires: [artifact], provides: [schemaModule(artifact)] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/artifacts\.requires/);
  });

  it("defineStep rejects artifact names that would alias one dependency binding", () => {
    const required = defineArtifact({
      name: "sharedValue",
      id: "artifact:test.shared-value.required",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const provided = defineArtifact({
      name: "sharedValue",
      id: "artifact:test.shared-value.provided",
      schema: Type.Object({}, { additionalProperties: false }),
    });

    expect(() =>
      defineStep({
        id: "artifact-name-alias",
        requires: [],
        provides: [],
        artifacts: { requires: [required], provides: [schemaModule(provided)] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow('declares duplicate artifact name "sharedValue"');
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
      requires: [],
      provides: [],
      artifacts: { requires, provides },
      schema: EmptyStepConfigSchema,
    });

    requires[0] = replacement;
    provides.length = 0;

    expect(contract.artifacts?.requires).toEqual([required]);
    expect(contract.artifacts?.provides).toEqual([
      { artifact: providedModule.artifact, validate: providedModule.validate },
    ]);
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
    expect(contract.artifacts).toEqual({
      requires: [required],
      provides: [{ artifact: providedModule.artifact, validate: providedModule.validate }],
    });
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
        requires: [],
        provides: [],
        artifacts: { requires: [mutableArtifact] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/artifact contract must be a frozen object/);
    expect(() =>
      defineStep({
        id: "accessor-artifact-contract",
        requires: [],
        provides: [],
        artifacts: { provides: [schemaModule(accessorArtifact)] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/own enumerable data properties/);
    expect(() =>
      defineStep({
        id: "malformed-artifact-contract",
        requires: [],
        provides: [],
        artifacts: { provides: [schemaModule(malformedArtifact)] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/artifact name "constructor" is reserved/);
    expect(accessorReads).toBe(0);
  });

  it("admits required artifacts from dense own entries instead of caller collection methods", () => {
    const canonical = defineArtifact({
      name: "canonicalRequiredArtifact",
      id: "artifact:test.required.canonical",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const forged = Object.freeze({
      name: "forgedRequiredArtifact",
      id: "artifact:test.required.forged",
      schema: canonical.schema,
    });
    const requires = [canonical];
    let mapCalls = 0;
    Object.setPrototypeOf(requires, {
      map: () => {
        mapCalls += 1;
        return [forged];
      },
    });

    const contract = defineStep({
      id: "required-artifact-own-entry-admission",
      requires: [],
      provides: [],
      artifacts: { requires },
      schema: EmptyStepConfigSchema,
    });

    expect(mapCalls).toBe(0);
    expect(contract.artifacts?.requires).toEqual([canonical]);
    expect(contract.requires).toEqual([canonical.id]);
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
      requires: [],
      provides: [],
      artifacts: { provides: [schemaModule(artifact)] },
      schema: EmptyStepConfigSchema,
    });

    expect(Reflect.ownKeys(artifact)).toEqual(["name", "id", "schema"]);
    expect(contract.artifacts?.provides?.[0]?.artifact).toBe(artifact);
  });

  it("admits artifact identity once from own data descriptors without evaluating accessors", () => {
    const schema = Type.Object({ value: Type.Number() }, { additionalProperties: false });
    let accessorReads = 0;
    const accessorDefinition = {
      get name() {
        accessorReads += 1;
        return "accessorArtifact";
      },
      id: "artifact:test.accessor-definition",
      schema,
    };

    expect(() => defineArtifact(accessorDefinition)).toThrow(
      "artifact definition name must be an own enumerable data property"
    );
    expect(accessorReads).toBe(0);

    const descriptorReads = new Map<PropertyKey, number>();
    const values: Readonly<Record<"name" | "id" | "schema", unknown>> = {
      name: "singleReadArtifact",
      id: "artifact:test.single-read-definition",
      schema,
    };
    const definition = new Proxy(
      {},
      {
        getOwnPropertyDescriptor: (_target, key) => {
          descriptorReads.set(key, (descriptorReads.get(key) ?? 0) + 1);
          if (key !== "name" && key !== "id" && key !== "schema") return undefined;
          return {
            configurable: true,
            enumerable: true,
            writable: true,
            value:
              descriptorReads.get(key) === 1
                ? values[key]
                : key === "schema"
                  ? Type.String()
                  : "changed-between-reads",
          };
        },
      }
    ) as {
      name: "singleReadArtifact";
      id: "artifact:test.single-read-definition";
      schema: typeof schema;
    };

    const artifact = defineArtifact(definition);

    expect(artifact).toEqual({
      name: "singleReadArtifact",
      id: "artifact:test.single-read-definition",
      schema,
    });
    expect(descriptorReads).toEqual(
      new Map<PropertyKey, number>([
        ["name", 1],
        ["id", 1],
        ["schema", 1],
      ])
    );
  });

  it("omits artifact runtimes when the contract declares an empty provider set", () => {
    const contract = defineStep({
      id: "empty-artifact-provider",
      requires: [],
      provides: [],
      artifacts: { provides: [] },
      schema: EmptyStepConfigSchema,
    });

    const step = createStep(contract, { run: () => {} });
    expect(Object.prototype.hasOwnProperty.call(step, "artifacts")).toBe(false);
  });

  it("defineStep refuses raw artifact providers before recipe assembly", () => {
    const contract = defineArtifact({
      name: "alphaArtifact",
      id: "artifact:test/alpha",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    expect(() =>
      defineStep({
        id: "beta",
        requires: [],
        provides: [contract.id],
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/cannot declare artifact ids/i);
  });

  it("artifact runtimes enforce missing/double publish/validation errors", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.foo",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const module = {
      artifact,
      validate: defineArtifactValidator(artifact, (value: unknown) => {
        return (value as { value: number }).value > 0
          ? []
          : [{ message: "value must be positive" }];
      }),
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

  it("snapshots artifact module authority before constructing runtimes", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.runtime-snapshot",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const replacement = defineArtifact({
      name: "artifactBar",
      id: "artifact:test.runtime-snapshot.replacement",
      schema: artifact.schema,
    });
    const validate = defineArtifactValidator(artifact);
    const admittedModule = { artifact, validate };
    const source = { artifact, validate };
    const runtimes = implementArtifactModules([source]);
    Reflect.set(source, "artifact", replacement);
    Reflect.set(
      source,
      "validate",
      defineArtifactValidator(replacement, () => [{ message: "mutated validator must not run" }])
    );

    const setup = admitMapSetup({ ...baseSetup, dimensions: { width: 1, height: 1 } });
    const context = createMapContext({
      setup,
      adapter: createMockAdapter({ width: 1, height: 1 }),
    });

    expect(runtimes.artifactFoo.contract).toBe(artifact);
    executeContextStep(context, (activeContext) => {
      expect(() => runtimes.artifactFoo.publish(activeContext, { value: 1 })).not.toThrow();
    });
    expect(readValidatedArtifact(context, admittedModule)).toEqual({ value: 1 });
    expect(() => readValidatedArtifact(context, source)).toThrow("Missing required artifact");
    expect(() => readValidatedArtifact(context, schemaModule(replacement))).toThrow(
      "Missing required artifact"
    );
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
      "active step context"
    );
    executeContextStep(terminalContext, () => undefined);
    expect(() => runtimes.artifactFoo.publish(terminalContext, { value: 1 })).toThrow(
      "active step context"
    );
  });

  it("admits public validated observation only through the completed root context", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.terminal-observation",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const module = schemaModule(artifact);
    const runtimes = implementArtifactModules([module]);
    const setup = admitMapSetup({ ...baseSetup, dimensions: { width: 1, height: 1 } });
    const context = createMapContext({
      setup,
      adapter: createMockAdapter({ width: 1, height: 1 }),
    });
    let retainedStepContext: MapContext | undefined;

    expect(() => readValidatedArtifact(context, module)).toThrow("after execution has completed");
    expect(() => observeValidatedArtifact(context, module)).toThrow(
      "after execution has completed"
    );

    executeContextStep(context, (stepContext) => {
      retainedStepContext = stepContext;
      expect(() => readValidatedArtifact(context, module)).toThrow("after execution has completed");
      expect(() => observeValidatedArtifact(context, module)).toThrow(
        "after execution has completed"
      );
      expect(() => readValidatedArtifact(stepContext, module)).toThrow(
        "after execution has completed"
      );
      expect(() => observeValidatedArtifact(stepContext, module)).toThrow(
        "after execution has completed"
      );
      runtimes.artifactFoo.publish(stepContext, { value: 1 });
    });

    expect(readValidatedArtifact(context, module)).toEqual({ value: 1 });
    expect(observeValidatedArtifact(context, module)).toEqual({
      found: true,
      value: { value: 1 },
    });
    expect(() => readValidatedArtifact(retainedStepContext!, module)).toThrow(
      "context returned by createMapContext"
    );
    expect(() => observeValidatedArtifact(retainedStepContext!, module)).toThrow(
      "context returned by createMapContext"
    );
  });

  it("keys required reads and terminal observation by exact artifact contract identity", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.exact-storage-identity",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const sameIdArtifact = defineArtifact({
      name: "artifactBar",
      id: "artifact:test.exact-storage-identity",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const module = schemaModule(artifact);
    let sameIdValidationCalls = 0;
    const sameIdModule = {
      artifact: sameIdArtifact,
      validate: defineArtifactValidator(sameIdArtifact, () => {
        sameIdValidationCalls += 1;
        return [];
      }),
    };
    const runtimes = implementArtifactModules([module]);
    const exactReader = createStep(
      defineStep({
        id: "exact-storage-reader",
        requires: [],
        provides: [],
        artifacts: { requires: [artifact] },
        schema: EmptyStepConfigSchema,
      }),
      { run: () => undefined }
    );
    const sameIdReader = createStep(
      defineStep({
        id: "exact-storage-reader",
        requires: [],
        provides: [],
        artifacts: { requires: [sameIdArtifact] },
        schema: EmptyStepConfigSchema,
      }),
      { run: () => undefined }
    );
    const exactDependencies = buildDeclaredStepDependencies(exactReader, {
      consumerStepId: "exact-storage-reader",
      owner: "artifact-authoring-test",
    });
    const sameIdDependencies = buildDeclaredStepDependencies(sameIdReader, {
      consumerStepId: "exact-storage-reader",
      owner: "artifact-authoring-test",
    });
    const setup = admitMapSetup({ ...baseSetup, dimensions: { width: 1, height: 1 } });
    const context = createMapContext({
      setup,
      adapter: createMockAdapter({ width: 1, height: 1 }),
    });

    executeContextStep(
      context,
      (stepContext) => {
        runtimes.artifactFoo.publish(stepContext, { value: 7 });
        expect(exactDependencies.artifacts.artifactFoo.read(stepContext)).toEqual({ value: 7 });
        expect(() => sameIdDependencies.artifacts.artifactBar.read(stepContext)).toThrow(
          ArtifactMissingError
        );
      },
      "exact-storage-reader"
    );

    expect(readValidatedArtifact(context, module)).toEqual({ value: 7 });
    expect(observeValidatedArtifact(context, sameIdModule)).toEqual({ found: false });
    expect(() => readValidatedArtifact(context, sameIdModule)).toThrow(
      "Missing required artifact artifact:test.exact-storage-identity"
    );
    expect(sameIdValidationCalls).toBe(0);
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
      validate: defineArtifactValidator(artifact, () =>
        observationIsValid ? [] : [{ message: "observation is no longer valid" }]
      ),
    };
    const runtimes = implementArtifactModules([source]);

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
    const originalValidate = defineArtifactValidator(artifact);
    const source = {
      artifact,
      validate: originalValidate,
      Schema: artifact.schema,
    };

    const catalog = defineArtifactCatalog({ slot: source });
    source.validate = defineArtifactValidator(artifact, () => [{ message: "mutated validator" }]);

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
      requires: [],
      provides: [],
      artifacts: { provides: [declaredModule] },
      schema: EmptyStepConfigSchema,
    });

    const step = createStep(contract, { run: () => {} });
    expect(Reflect.has(step, "artifacts")).toBe(false);
    const deps = buildDeclaredStepDependencies(step, {
      consumerStepId: contract.id,
      owner: "artifact-authoring-test",
    });
    expect(Object.isFrozen(deps)).toBe(true);
    expect(Object.isFrozen(deps.artifacts)).toBe(true);
    expect(Object.keys(deps.artifacts.artifactFoo)).toEqual(["publish"]);
    expect(() =>
      Object.defineProperty(deps.artifacts, "artifactFoo", {
        value: Object.freeze({ publish: () => ({}) }),
      })
    ).toThrow();
    expect(contract.artifacts?.provides?.[0]).not.toBe(declaredModule);
    expect(contract.artifacts?.provides?.[0]).toEqual({
      artifact: declaredModule.artifact,
      validate: declaredModule.validate,
    });

    expect(() =>
      createStep(contract, { artifacts: [schemaModule(extra)], run: () => {} } as never)
    ).toThrow(/implementation cannot declare artifact modules/);
    expect(() =>
      createStep(contract, { artifacts: [schemaModule(replacement)], run: () => {} } as never)
    ).toThrow(/implementation cannot declare artifact modules/);
  });

  it("binds declared readers and publishers to their exact active step occurrence", () => {
    const inputArtifact = defineArtifact({
      name: "inputValue",
      id: "artifact:test.capability-owner.input",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const outputArtifact = defineArtifact({
      name: "outputValue",
      id: "artifact:test.capability-owner.output",
      schema: inputArtifact.schema,
    });
    const inputModule = schemaModule(inputArtifact);
    const outputModule = schemaModule(outputArtifact);
    const inputRuntimes = implementArtifactModules([inputModule]);
    const reader = createStep(
      defineStep({
        id: "reader",
        requires: [],
        provides: [],
        artifacts: { requires: [inputArtifact] },
        schema: EmptyStepConfigSchema,
      }),
      { run: () => undefined }
    );
    const provider = createStep(
      defineStep({
        id: "provider",
        requires: [],
        provides: [],
        artifacts: { provides: [outputModule] },
        schema: EmptyStepConfigSchema,
      }),
      { run: () => undefined }
    );
    const readerDeps = buildDeclaredStepDependencies(reader, {
      consumerStepId: "reader",
      owner: "artifact-authoring-test",
    });
    const providerDeps = buildDeclaredStepDependencies(provider, {
      consumerStepId: "provider",
      owner: "artifact-authoring-test",
    });
    const registry = new StepRegistry();
    registry.register({
      id: "seed",
      stageId: "artifact-test",
      requires: [],
      provides: [],
      run: (context) => inputRuntimes.inputValue.publish(context, { value: 3 }),
    });
    registry.register({
      id: "reader",
      stageId: "artifact-test",
      requires: [],
      provides: [],
      run: (context) => expect(readerDeps.artifacts.inputValue.read(context)).toEqual({ value: 3 }),
    });
    registry.register({
      id: "provider",
      stageId: "artifact-test",
      requires: [],
      provides: [],
      run: (context) => providerDeps.artifacts.outputValue.publish(context, { value: 6 }),
    });
    registry.register({
      id: "borrower",
      stageId: "artifact-test",
      requires: [],
      provides: [],
      run: (context) => {
        expect(() => readerDeps.artifacts.inputValue.read(context)).toThrow(
          'Artifact capability for step "reader" requires that step\'s exact active context.'
        );
        expect(() => providerDeps.artifacts.outputValue.publish(context, { value: 9 })).toThrow(
          'Artifact capability for step "provider" requires that step\'s exact active context.'
        );
      },
    });
    const setup = admitMapSetup(baseSetup);
    const context = createMapContext({
      setup,
      adapter: createMockAdapter({ width: 2, height: 2 }),
    });
    const plan = compileExecutionPlan(
      {
        recipe: {
          schemaVersion: 2,
          steps: ["seed", "reader", "provider", "borrower"].map((id) => ({ id })),
        },
        setup: context.setup,
      },
      registry
    );

    new PipelineExecutor(registry).executePlan(context, plan);

    expect(readValidatedArtifact(context, outputModule)).toEqual({ value: 6 });
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
        requires: [],
        provides: [],
        artifacts: { provides: crossRealm },
        schema: EmptyStepConfigSchema,
      })
    ).not.toThrow();
    expect(() =>
      defineStep({
        id: "inherited-array-entry",
        requires: [],
        provides: [],
        artifacts: { provides: inheritedEntry },
        schema: EmptyStepConfigSchema,
      })
    ).not.toThrow();
    expect(() =>
      defineStep({
        id: "inherited-module",
        requires: [],
        provides: [],
        artifacts: { provides: [inheritedOnlyModule] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/must own an artifact data property/);
    expect(() =>
      defineStep({
        id: "accessor-array-entry",
        requires: [],
        provides: [],
        artifacts: { provides: accessorEntry },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/data property/);
    expect(() =>
      defineStep({
        id: "sparse-module-array",
        requires: [],
        provides: [],
        artifacts: { provides: sparse },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/dense array without extra keys/);
    expect(() =>
      defineStep({
        id: "extra-key-module-array",
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
        requires: [],
        provides: [],
        artifacts: { provides: [schemaModule(first), schemaModule(duplicateName)] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/duplicate artifact name/);
    expect(() =>
      defineStep({
        id: "duplicate-module-id",
        requires: [],
        provides: [],
        artifacts: { provides: [schemaModule(first), schemaModule(duplicateId)] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/duplicate artifact id/);
  });

  it("uses the complete module validator for publication and validated observation", () => {
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
      validate: defineArtifactValidator(artifact, (value, context) => {
        admissions.push({ value, dimensions: context?.dimensions });
        return [];
      }),
    };
    const contract = defineStep({
      id: "single-artifact-admission",
      requires: [],
      provides: [],
      artifacts: { provides: [module] },
      schema: EmptyStepConfigSchema,
    });
    const step = createStep(contract, { run: () => {} });
    const runtime = buildDeclaredStepDependencies(step, {
      consumerStepId: contract.id,
      owner: "artifact-authoring-test",
    }).artifacts.artifactFoo;
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

    executeContextStep(
      context,
      (activeContext) => {
        expect(() => runtime.publish(activeContext, { value: 1 })).not.toThrow();
      },
      contract.id
    );
    expect(admissions).toEqual([expectedAdmission]);
    expect(readValidatedArtifact(context, admittedModule)).toEqual({ value: 1 });
    expect(admissions).toEqual([expectedAdmission, expectedAdmission]);
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
    requires: [],
    provides: [],
    artifacts: { provides: [module] },
    schema: EmptyStepConfigSchema,
  });
  const normalizedProviderContract = defineStep({
    id: "type-provider-normalized",
    requires: [],
    provides: [],
    artifacts: { provides: [moduleWithExtraState] },
    schema: EmptyStepConfigSchema,
  });
  const requiresArtifact = defineStep({
    id: "type-consumer",
    requires: [],
    provides: [],
    artifacts: { requires: [artifact] },
    schema: EmptyStepConfigSchema,
  });
  const emptyArtifacts = defineStep({
    id: "type-empty",
    requires: [],
    provides: [],
    artifacts: { provides: [] },
    schema: EmptyStepConfigSchema,
  });
  const widenedProvides: readonly (typeof module)[] = [module];
  const widenedArtifacts = defineStep({
    id: "type-widened-provider",
    requires: [],
    provides: [],
    artifacts: { provides: widenedProvides },
    schema: EmptyStepConfigSchema,
  });

  const tupleProviderStep = createStep(providesArtifact, { run: () => {} });
  // @ts-expect-error Provider storage is not part of the public step module.
  tupleProviderStep.artifacts;
  createStep(providesArtifact, {
    run: (_context, _config, _ops, deps) => {
      const artifactFooProvider = deps.artifacts.artifactFoo;
      // @ts-expect-error Declared capability bindings are immutable across recipe executions.
      deps.artifacts.artifactFoo = artifactFooProvider;
      // @ts-expect-error Providers publish their own artifact; only declared consumers may read it.
      deps.artifacts.artifactFoo.read;
      // @ts-expect-error Authored dependencies expose publication, not executor postconditions.
      deps.artifacts.artifactFoo.satisfies;
      // @ts-expect-error Artifact identity remains in the contract declaration, not the runtime.
      deps.artifacts.artifactFoo.contract;
    },
  });
  // @ts-expect-error Requires-only steps cannot declare publication modules.
  createStep(requiresArtifact, { artifacts: [module], run: () => {} });
  // @ts-expect-error Empty provides cannot declare publication modules.
  createStep(emptyArtifacts, { artifacts: [module], run: () => {} });
  const widenedProviderStep = createStep(widenedArtifacts, { run: () => {} });
  // @ts-expect-error Widened provider declarations still expose no provider storage on the step.
  widenedProviderStep.artifacts;

  type NormalizedProvider = NonNullable<
    NonNullable<(typeof normalizedProviderContract)["artifacts"]>["provides"]
  >[0];
  type ProviderExtraStateIsStripped = Expect<
    IsEqual<"Schema" extends keyof NormalizedProvider ? true : false, false>
  >;
  type ProviderStepHasNoArtifactStash = Expect<
    IsEqual<"artifacts" extends keyof typeof tupleProviderStep ? true : false, false>
  >;
  const typeAssertions: readonly [ProviderExtraStateIsStripped, ProviderStepHasNoArtifactStash] = [
    true,
    true,
  ];
  void typeAssertions;

  const createTestStep = createStep;
  createTestStep(providesArtifact, { run: () => {} });
}

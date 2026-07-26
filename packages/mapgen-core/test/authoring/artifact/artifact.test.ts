import { describe, expect, it } from "bun:test";
import { runInNewContext } from "node:vm";
import { createMockAdapter } from "@civ7/adapter";
import { implementArtifacts } from "@mapgen/authoring/artifact/runtime.js";
import {
  ArtifactDoublePublishError,
  ArtifactMissingError,
  ArtifactValidationError,
  createStep,
  defineArtifact,
  defineStep,
  observeValidatedArtifact,
  readValidatedArtifact,
} from "@mapgen/authoring/index.js";
import { createMapContext, type MapContext } from "@mapgen/core/map-context.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
import { compileExecutionPlan, PipelineExecutor, StepRegistry } from "@mapgen/engine/index.js";
import { EmptyStepConfigSchema } from "@mapgen/engine/step-config.js";
import { Type } from "typebox";
import { buildDeclaredStepDependencies } from "../../../src/authoring/step/dependencies.js";

const baseSetup = {
  mapSeed: 42,
  dimensions: { width: 2, height: 2 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
};

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
  it("retains the same artifact authorities for requirements and providers", () => {
    const required = defineArtifact({
      name: "requiredArtifact",
      id: "artifact:test.step.required",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const provided = defineArtifact({
      name: "providedArtifact",
      id: "artifact:test.step.provided",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const requires = [required];
    const provides = [provided];
    const contract = defineStep({
      id: "artifact-authority",
      requires: ["effect:test.ready"],
      provides: [],
      artifacts: { requires, provides },
      schema: EmptyStepConfigSchema,
    });

    requires.length = 0;
    provides.length = 0;
    expect(contract.artifacts).toEqual({ requires: [required], provides: [provided] });
    expect(contract.artifacts?.requires?.[0]).toBe(required);
    expect(contract.artifacts?.provides?.[0]).toBe(provided);
    expect(contract.requires).toEqual(["effect:test.ready", required.id]);
    expect(contract.provides).toEqual([provided.id]);
    expect(Object.isFrozen(contract.artifacts)).toBe(true);
    expect(Object.isFrozen(contract.artifacts?.requires)).toBe(true);
    expect(Object.isFrozen(contract.artifacts?.provides)).toBe(true);
  });

  it("rejects raw artifact ids, duplicate bindings, and mutable lookalikes", () => {
    const first = defineArtifact({
      name: "sharedArtifact",
      id: "artifact:test.step.first",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const duplicateName = defineArtifact({
      name: first.name,
      id: "artifact:test.step.second",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const duplicateId = defineArtifact({
      name: "otherArtifact",
      id: first.id,
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const mutable = {
      name: "forgedArtifact",
      id: "artifact:test.step.forged",
      schema: first.schema,
      validate: first.validate,
    };

    expect(() =>
      defineStep({
        id: "raw-artifact",
        requires: [first.id],
        provides: [],
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/cannot declare artifact ids.*artifacts\.requires\/provides/i);
    expect(() =>
      defineStep({
        id: "duplicate-reference",
        requires: [],
        provides: [],
        artifacts: { requires: [first], provides: [first] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/artifacts\.requires/);
    expect(() =>
      defineStep({
        id: "duplicate-name",
        requires: [],
        provides: [],
        artifacts: { requires: [first], provides: [duplicateName] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow('declares duplicate artifact name "sharedArtifact"');
    expect(() =>
      defineStep({
        id: "duplicate-id",
        requires: [],
        provides: [],
        artifacts: { requires: [first], provides: [duplicateId] },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(`declares artifact "${first.id}" in both artifacts.requires and artifacts.provides`);
    expect(() =>
      defineStep({
        id: "forged-artifact",
        requires: [],
        provides: [],
        artifacts: { provides: [mutable] },
        schema: EmptyStepConfigSchema,
      } as never)
    ).toThrow("must be a canonical artifact");
  });

  it("admits only dense own artifact entries without invoking accessors", () => {
    const artifact = defineArtifact({
      name: "arrayArtifact",
      id: "artifact:test.step.array",
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const crossRealm = runInNewContext("[]") as Array<typeof artifact>;
    crossRealm.push(artifact);
    const sparse = new Array<typeof artifact>(1);
    const extraKey = [artifact];
    Object.defineProperty(extraKey, "metadata", { enumerable: true, value: "unexpected" });
    let reads = 0;
    const accessorEntry = [artifact];
    Object.defineProperty(accessorEntry, "0", {
      enumerable: true,
      get: () => {
        reads += 1;
        return artifact;
      },
    });

    expect(() =>
      defineStep({
        id: "cross-realm-artifacts",
        requires: [],
        provides: [],
        artifacts: { provides: crossRealm },
        schema: EmptyStepConfigSchema,
      })
    ).not.toThrow();
    expect(() =>
      defineStep({
        id: "sparse-artifacts",
        requires: [],
        provides: [],
        artifacts: { provides: sparse },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/dense array without extra keys/);
    expect(() =>
      defineStep({
        id: "extra-key-artifacts",
        requires: [],
        provides: [],
        artifacts: { provides: extraKey },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/dense array without extra keys/);
    expect(() =>
      defineStep({
        id: "accessor-artifacts",
        requires: [],
        provides: [],
        artifacts: { provides: accessorEntry },
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/data property/);
    expect(reads).toBe(0);
  });

  it("omits provider dependencies when a step declares no artifacts", () => {
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

  it("enforces missing, validation, write-once, and active-execution laws", () => {
    const artifact = defineArtifact({
      name: "runtimeArtifact",
      id: "artifact:test.runtime",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
      refine: (value, { issues }) => {
        if (value.value <= 0) issues.add("value must be positive");
        return undefined;
      },
    });
    const runtimes = implementArtifacts([artifact]);
    const setup = admitMapSetup({ ...baseSetup, dimensions: { width: 1, height: 1 } });
    const context = createMapContext({
      setup,
      adapter: createMockAdapter({ width: 1, height: 1 }),
    });

    expect(() => runtimes.runtimeArtifact.read(context)).toThrow(ArtifactMissingError);
    expect(() => runtimes.runtimeArtifact.publish(context, { value: 1 })).toThrow(
      "active step context"
    );
    executeContextStep(context, (activeContext) => {
      expect(() => runtimes.runtimeArtifact.publish(activeContext, { value: 0 })).toThrow(
        expect.objectContaining({
          issues: [{ message: "value must be positive" }],
        })
      );
      expect(() =>
        runtimes.runtimeArtifact.publish(activeContext, { value: "invalid" } as never)
      ).toThrow(ArtifactValidationError);
      runtimes.runtimeArtifact.publish(activeContext, { value: 1 });
      expect(() => runtimes.runtimeArtifact.publish(activeContext, { value: 2 })).toThrow(
        ArtifactDoublePublishError
      );
    });
    expect(readValidatedArtifact(context, artifact)).toEqual({ value: 1 });
  });

  it("admits public validated observation only through the completed root context", () => {
    const artifact = defineArtifact({
      name: "observedArtifact",
      id: "artifact:test.observation",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const runtimes = implementArtifacts([artifact]);
    const setup = admitMapSetup({ ...baseSetup, dimensions: { width: 1, height: 1 } });
    const context = createMapContext({
      setup,
      adapter: createMockAdapter({ width: 1, height: 1 }),
    });
    let retainedStepContext: MapContext | undefined;

    expect(() => readValidatedArtifact(context, artifact)).toThrow("after execution has completed");
    executeContextStep(context, (stepContext) => {
      retainedStepContext = stepContext;
      expect(() => observeValidatedArtifact(context, artifact)).toThrow(
        "after execution has completed"
      );
      runtimes.observedArtifact.publish(stepContext, { value: 1 });
    });

    expect(readValidatedArtifact(context, artifact)).toEqual({ value: 1 });
    expect(observeValidatedArtifact(context, artifact)).toEqual({
      found: true,
      value: { value: 1 },
    });
    expect(() => readValidatedArtifact(retainedStepContext!, artifact)).toThrow(
      "context returned by createMapContext"
    );
  });

  it("keys storage and validation by exact artifact identity rather than id text", () => {
    let secondValidationCalls = 0;
    const first = defineArtifact({
      name: "firstIdentity",
      id: "artifact:test.exact-identity",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const second = defineArtifact({
      name: "secondIdentity",
      id: first.id,
      schema: first.schema,
      refine: () => {
        secondValidationCalls += 1;
        return undefined;
      },
    });
    const runtimes = implementArtifacts([first]);
    const setup = admitMapSetup({ ...baseSetup, dimensions: { width: 1, height: 1 } });
    const context = createMapContext({
      setup,
      adapter: createMockAdapter({ width: 1, height: 1 }),
    });

    executeContextStep(context, (stepContext) => {
      runtimes.firstIdentity.publish(stepContext, { value: 7 });
    });

    expect(readValidatedArtifact(context, first)).toEqual({ value: 7 });
    expect(observeValidatedArtifact(context, second)).toEqual({ found: false });
    expect(secondValidationCalls).toBe(0);
  });

  it("revalidates stored evidence with the same artifact authority before observation", () => {
    let valid = true;
    const artifact = defineArtifact({
      name: "changingAdmission",
      id: "artifact:test.changing-admission",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
      refine: (_value, { issues }) => {
        if (!valid) issues.add("observation is no longer valid");
        return undefined;
      },
    });
    const runtimes = implementArtifacts([artifact]);
    const setup = admitMapSetup({ ...baseSetup, dimensions: { width: 1, height: 1 } });
    const context = createMapContext({
      setup,
      adapter: createMockAdapter({ width: 1, height: 1 }),
    });

    executeContextStep(context, (stepContext) => {
      runtimes.changingAdmission.publish(stepContext, { value: 7 });
    });
    valid = false;
    expect(() => readValidatedArtifact(context, artifact)).toThrow("Invalid artifact");
    valid = true;
    expect(readValidatedArtifact(context, artifact)).toEqual({ value: 7 });
  });

  it("binds declared readers and publishers to their exact active step occurrence", () => {
    const inputArtifact = defineArtifact({
      name: "inputValue",
      id: "artifact:test.capability.input",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const outputArtifact = defineArtifact({
      name: "outputValue",
      id: "artifact:test.capability.output",
      schema: inputArtifact.schema,
    });
    const inputRuntimes = implementArtifacts([inputArtifact]);
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
        artifacts: { provides: [outputArtifact] },
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
    const context = createMapContext({
      setup: admitMapSetup(baseSetup),
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
    expect(readValidatedArtifact(context, outputArtifact)).toEqual({ value: 6 });
  });
});

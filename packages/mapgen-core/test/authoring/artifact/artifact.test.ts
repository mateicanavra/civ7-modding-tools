import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
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
import {
  compileExecutionPlan,
  PipelineExecutor,
  StepExecutionError,
  StepRegistry,
} from "@mapgen/engine/index.js";
import { publishTestArtifact } from "@mapgen/testing/index.js";
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
      })
    ).toThrow(/cannot declare artifact ids.*artifacts\.requires\/provides/i);
    expect(() =>
      defineStep({
        id: "duplicate-reference",
        requires: [],
        provides: [],
        artifacts: { requires: [first], provides: [first] },
      })
    ).toThrow(/artifacts\.requires/);
    expect(() =>
      defineStep({
        id: "duplicate-name",
        requires: [],
        provides: [],
        artifacts: { requires: [first], provides: [duplicateName] },
      })
    ).toThrow('declares duplicate artifact name "sharedArtifact"');
    expect(() =>
      defineStep({
        id: "duplicate-id",
        requires: [],
        provides: [],
        artifacts: { requires: [first], provides: [duplicateId] },
      })
    ).toThrow(`declares artifact "${first.id}" in both artifacts.requires and artifacts.provides`);
    expect(() =>
      defineStep({
        id: "forged-artifact",
        requires: [],
        provides: [],
        artifacts: { provides: [mutable] },
      } as never)
    ).toThrow("must be a canonical artifact");
  });

  it("reports missing evidence through a declared reader", () => {
    const artifact = defineArtifact({
      name: "missingArtifact",
      id: "artifact:test.missing",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
    const reader = createStep(
      defineStep({
        id: "missing-artifact-reader",
        requires: [],
        provides: [],
        artifacts: { requires: [artifact] },
      }),
      {
        run: (_context, _config, _ops, deps) => deps.artifacts.missingArtifact.read(),
      }
    );
    const context = createMapContext({
      setup: admitMapSetup({ ...baseSetup, dimensions: { width: 1, height: 1 } }),
      adapter: createMockAdapter({ width: 1, height: 1 }),
    });

    let thrown: unknown;
    try {
      executeContextStep(
        context,
        (stepContext) =>
          reader.run(
            stepContext,
            {},
            {},
            buildDeclaredStepDependencies(reader, {
              consumerStepId: reader.contract.id,
              owner: "artifact-authoring-test",
              context: stepContext,
            })
          ),
        reader.contract.id
      );
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(StepExecutionError);
    expect(thrown instanceof StepExecutionError && thrown.cause).toBeInstanceOf(
      ArtifactMissingError
    );
  });

  it("enforces validation and write-once publication through a declared provider", () => {
    const artifact = defineArtifact({
      name: "runtimeArtifact",
      id: "artifact:test.runtime",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
      refine: (value, { issues }) => {
        if (value.value <= 0) issues.add("value must be positive");
        return undefined;
      },
    });
    const provider = createStep(
      defineStep({
        id: "runtime-artifact-provider",
        requires: [],
        provides: [],
        artifacts: { provides: [artifact] },
      }),
      {
        run: (_context, _config, _ops, deps) => {
          expect(() => deps.artifacts.runtimeArtifact.publish({ value: 0 })).toThrow(
            expect.objectContaining({
              issues: [{ message: "value must be positive" }],
            })
          );
          expect(() =>
            deps.artifacts.runtimeArtifact.publish({ value: "invalid" } as never)
          ).toThrow(ArtifactValidationError);
          deps.artifacts.runtimeArtifact.publish({ value: 1 });
          expect(() => deps.artifacts.runtimeArtifact.publish({ value: 2 })).toThrow(
            ArtifactDoublePublishError
          );
        },
      }
    );
    const setup = admitMapSetup({ ...baseSetup, dimensions: { width: 1, height: 1 } });
    const context = createMapContext({
      setup,
      adapter: createMockAdapter({ width: 1, height: 1 }),
    });

    executeContextStep(
      context,
      (stepContext) =>
        provider.run(
          stepContext,
          {},
          {},
          buildDeclaredStepDependencies(provider, {
            consumerStepId: provider.contract.id,
            owner: "artifact-authoring-test",
            context: stepContext,
          })
        ),
      provider.contract.id
    );
    expect(readValidatedArtifact(context, artifact)).toEqual({ value: 1 });
  });

  it("admits public validated observation only through the completed root context", () => {
    const artifact = defineArtifact({
      name: "observedArtifact",
      id: "artifact:test.observation",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
    });
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
      publishTestArtifact(stepContext, artifact, { value: 1 });
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
    const setup = admitMapSetup({ ...baseSetup, dimensions: { width: 1, height: 1 } });
    const context = createMapContext({
      setup,
      adapter: createMockAdapter({ width: 1, height: 1 }),
    });

    executeContextStep(context, (stepContext) => {
      publishTestArtifact(stepContext, first, { value: 7 });
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
    const setup = admitMapSetup({ ...baseSetup, dimensions: { width: 1, height: 1 } });
    const context = createMapContext({
      setup,
      adapter: createMockAdapter({ width: 1, height: 1 }),
    });

    executeContextStep(context, (stepContext) => {
      publishTestArtifact(stepContext, artifact, { value: 7 });
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
    const reader = createStep(
      defineStep({
        id: "reader",
        requires: [],
        provides: [],
        artifacts: { requires: [inputArtifact] },
      }),
      { run: () => undefined }
    );
    const provider = createStep(
      defineStep({
        id: "provider",
        requires: [],
        provides: [],
        artifacts: { provides: [outputArtifact] },
      }),
      { run: () => undefined }
    );
    let retainedRead: (() => Readonly<{ value: number }>) | undefined;
    let retainedPublish: ((value: { value: number }) => Readonly<{ value: number }>) | undefined;
    const registry = new StepRegistry();
    registry.register({
      id: "seed",
      stageId: "artifact-test",
      requires: [],
      provides: [],
      run: (context) => publishTestArtifact(context, inputArtifact, { value: 3 }),
    });
    registry.register({
      id: "reader",
      stageId: "artifact-test",
      requires: [],
      provides: [],
      run: (context) => {
        const dependencies = buildDeclaredStepDependencies(reader, {
          consumerStepId: reader.contract.id,
          owner: "artifact-authoring-test",
          context,
        });
        expect(dependencies.artifacts.inputValue.read()).toEqual({ value: 3 });
        retainedRead = dependencies.artifacts.inputValue.read;
      },
    });
    registry.register({
      id: "provider",
      stageId: "artifact-test",
      requires: [],
      provides: [],
      run: (context) => {
        const dependencies = buildDeclaredStepDependencies(provider, {
          consumerStepId: provider.contract.id,
          owner: "artifact-authoring-test",
          context,
        });
        dependencies.artifacts.outputValue.publish({ value: 6 });
        retainedPublish = dependencies.artifacts.outputValue.publish;
      },
    });
    registry.register({
      id: "borrower",
      stageId: "artifact-test",
      requires: [],
      provides: [],
      run: (context) => {
        expect(() => retainedRead?.()).toThrow("context returned by createMapContext");
        expect(() => retainedPublish?.({ value: 9 })).toThrow(
          "context returned by createMapContext"
        );
        const wrongReader = buildDeclaredStepDependencies(reader, {
          consumerStepId: reader.contract.id,
          owner: "artifact-authoring-test",
          context,
        });
        const wrongPublisher = buildDeclaredStepDependencies(provider, {
          consumerStepId: provider.contract.id,
          owner: "artifact-authoring-test",
          context,
        });
        expect(() => wrongReader.artifacts.inputValue.read()).toThrow(
          'Artifact capability for step "reader" requires that step\'s exact active context.'
        );
        expect(() => wrongPublisher.artifacts.outputValue.publish({ value: 9 })).toThrow(
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
    const rootReader = buildDeclaredStepDependencies(reader, {
      consumerStepId: reader.contract.id,
      owner: "artifact-authoring-test",
      context,
    });
    expect(() => rootReader.artifacts.inputValue.read()).toThrow(
      'Artifact capability for step "reader" requires that step\'s exact active context.'
    );
  });
});

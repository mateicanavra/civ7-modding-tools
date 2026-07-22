import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import {
  ArtifactMissingError,
  createStep,
  defineArtifact,
  defineArtifactValidator,
  defineStep,
  readValidatedArtifact,
} from "@mapgen/authoring/index.js";
import { createMapContext, type MapContext } from "@mapgen/core/map-context.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
import { EmptyStepConfigSchema } from "@mapgen/engine/step-config.js";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@mapgen/testing/index.js";
import { Type } from "typebox";

function createSyntheticContext() {
  const syntheticDimensions = { width: 2, height: 2 } as const;
  return createMapContext({
    setup: admitMapSetup({
      mapSeed: 7,
      dimensions: syntheticDimensions,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    }),
    adapter: createMockAdapter(syntheticDimensions),
  });
}

function artifactModule<C extends ReturnType<typeof defineArtifact>>(artifact: C) {
  return {
    artifact,
    validate: defineArtifactValidator(artifact),
  };
}

const inputArtifact = defineArtifact({
  name: "inputValue",
  id: "artifact:test.step-input",
  schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
});
const outputArtifact = defineArtifact({
  name: "outputValue",
  id: "artifact:test.step-output",
  schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
});
const inputModule = artifactModule(inputArtifact);
const outputModule = artifactModule(outputArtifact);
const doubleStep = createStep(
  defineStep({
    id: "double-value",
    requires: [],
    provides: [],
    artifacts: { requires: [inputArtifact], provides: [outputModule] },
    schema: EmptyStepConfigSchema,
  }),
  {
    run: (context, _config, _ops, deps) => {
      const input = deps.artifacts.inputValue.read(context);
      deps.artifacts.outputValue.publish(context, { value: input.value * 2 });
      return input.value * 2;
    },
  }
);

const defineUncheckedStep = (definition: unknown): unknown =>
  Reflect.apply(defineStep, undefined, [definition]);

describe("step testing surface", () => {
  it("binds only declared engine methods to the exact active step occurrence", () => {
    const engineMethods = ["readCurrentMapSurface"] as const;
    const engineStep = createStep(
      defineStep({
        id: "observe-current-surface",
        requires: [],
        provides: [],
        engine: engineMethods,
        schema: EmptyStepConfigSchema,
      }),
      {
        run: (stepContext, _config, _ops, dependencies) =>
          dependencies.engine.readCurrentMapSurface(stepContext),
      }
    );
    const firstRoot = createSyntheticContext();
    let retainedContext: MapContext | undefined;
    let retainedRead: ((context: MapContext) => unknown) | undefined;

    expect(engineStep.contract.engine).toEqual(engineMethods);
    expect(engineStep.contract.engine).not.toBe(engineMethods);
    expect(Object.isFrozen(engineStep.contract.engine)).toBe(true);

    withMapContextExecutionForTest(firstRoot, (stepContext) => {
      const dependencies = buildStepTestDependencies(engineStep, stepContext);
      expect(Object.keys(dependencies.engine)).toEqual(["readCurrentMapSurface"]);
      expect(Reflect.get(dependencies.engine, "verifyEffect")).toBeUndefined();
      expect(Reflect.get(dependencies.engine, "getRandomNumber")).toBeUndefined();
      expect(Reflect.get(stepContext, "adapter")).toBeUndefined();
      expect(dependencies.engine.readCurrentMapSurface(stepContext).width).toBe(2);
      retainedContext = stepContext;
      retainedRead = dependencies.engine.readCurrentMapSurface;
    });

    expect(() => retainedRead?.(retainedContext!)).toThrow("context returned by createMapContext");

    const foreignRoot = createSyntheticContext();
    withMapContextExecutionForTest(foreignRoot, (foreignContext) => {
      expect(() => retainedRead?.(foreignContext)).toThrow("exact active context");
    });
  });

  it("refuses malformed and executor-private engine declarations", () => {
    const base = {
      id: "invalid-engine-declaration",
      requires: [],
      provides: [],
      schema: EmptyStepConfigSchema,
    } as const;

    expect(() =>
      defineStep({
        ...base,
        engine: ["readCurrentMapSurface", "readCurrentMapSurface"] as const,
      })
    ).toThrow("multiple times");
    expect(() => defineUncheckedStep({ ...base, engine: ["verifyEffect"] })).toThrow(
      "unavailable authored engine method"
    );
    expect(() => defineUncheckedStep({ ...base, engine: ["getRandomNumber"] })).toThrow(
      "unavailable authored engine method"
    );
    const sparse: string[] = [];
    sparse.length = 1;
    expect(() => defineUncheckedStep({ ...base, engine: sparse })).toThrow("dense array");
    const decorated = ["readCurrentMapSurface"];
    Object.defineProperty(decorated, Symbol("smuggled"), { value: true });
    expect(() => defineUncheckedStep({ ...base, engine: decorated })).toThrow("without extra keys");
  });

  it("fails closed when a forged declaration names an unknown or concrete-only method", () => {
    const base = {
      id: "forged-engine-method",
      requires: [],
      provides: [],
      schema: EmptyStepConfigSchema,
    } as const;

    expect(() => defineUncheckedStep({ ...base, engine: ["notAnEngineMethod"] })).toThrow(
      "unavailable authored engine method"
    );
    expect(() => defineUncheckedStep({ ...base, engine: ["reset"] })).toThrow(
      "unavailable authored engine method"
    );
  });

  it("uses declared production dependencies inside one terminal execution", () => {
    const context = createSyntheticContext();
    let result: number | Promise<number> | undefined;
    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, inputModule, { value: 3 });
      result = doubleStep.run(stepContext, {}, {}, buildStepTestDependencies(doubleStep));
    });

    expect(result).toBe(6);
    expect(readValidatedArtifact(context, outputModule)).toEqual({ value: 6 });
    expect(() =>
      withMapContextExecutionForTest(context, (stepContext) => {
        doubleStep.run(stepContext, {}, {}, buildStepTestDependencies(doubleStep));
      })
    ).toThrow("MapGen context has already completed an execution.");
  });

  it("preserves missing-artifact attribution from the shared dependency binder", () => {
    const context = createSyntheticContext();
    expect(() =>
      withMapContextExecutionForTest(context, (stepContext) => {
        doubleStep.run(stepContext, {}, {}, buildStepTestDependencies(doubleStep));
      })
    ).toThrow(ArtifactMissingError);
  });

  it("rejects structural steps that lack private provider authority", () => {
    const forgedStep = {
      contract: doubleStep.contract,
      artifacts: {
        outputValue: {
          contract: inputArtifact,
          read: () => ({ value: 1 }),
          publish: () => ({ value: 1 }),
          satisfies: () => true,
        },
      },
      run: () => {},
    };

    expect(() => buildStepTestDependencies(forgedStep as never, undefined as never)).toThrow(
      'missing artifact runtime for "outputValue"'
    );
  });
});

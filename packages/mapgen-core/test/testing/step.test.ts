import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import {
  ArtifactMissingError,
  createStep,
  defineArtifact,
  defineStep,
  readArtifact,
} from "@mapgen/authoring/index.js";
import { createMapContext, type MapContext } from "@mapgen/core/map-context.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
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
const doubleStep = createStep(
  defineStep({
    id: "double-value",
    requires: [],
    provides: [],
    artifacts: { requires: [inputArtifact], provides: [outputArtifact] },
  }),
  {
    run: (_context, _config, _ops, deps) => {
      const input = deps.artifacts.inputValue.read();
      deps.artifacts.outputValue.publish({ value: input.value * 2 });
      return input.value * 2;
    },
  }
);

const defineUncheckedStep = (definition: unknown): unknown =>
  Reflect.apply(defineStep, undefined, [definition]);

describe("step testing surface", () => {
  it("binds only declared engine methods to the exact active step occurrence", () => {
    const engineMethods = ["readCurrentMapWaterMask"] as const;
    const engineStep = createStep(
      defineStep({
        id: "observe-current-surface",
        requires: [],
        provides: [],
        engine: engineMethods,
      }),
      {
        run: (stepContext, _config, _ops, dependencies) =>
          dependencies.engine.readCurrentMapWaterMask(stepContext),
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
      expect(Object.keys(dependencies.engine)).toEqual(["readCurrentMapWaterMask"]);
      expect(Reflect.get(dependencies.engine, "verifyEffect")).toBeUndefined();
      expect(Reflect.get(dependencies.engine, "getRandomNumber")).toBeUndefined();
      expect(Reflect.get(stepContext, "adapter")).toBeUndefined();
      expect(Array.from(dependencies.engine.readCurrentMapWaterMask(stepContext))).toEqual([
        0, 0, 0, 0,
      ]);
      retainedContext = stepContext;
      retainedRead = dependencies.engine.readCurrentMapWaterMask;
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
    } as const;

    expect(() =>
      defineStep({
        ...base,
        engine: ["readCurrentMapWaterMask", "readCurrentMapWaterMask"] as const,
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
    const decorated = ["readCurrentMapWaterMask"];
    Object.defineProperty(decorated, Symbol("smuggled"), { value: true });
    expect(() => defineUncheckedStep({ ...base, engine: decorated })).toThrow("without extra keys");
  });

  it("fails closed when a forged declaration names an unknown or concrete-only method", () => {
    const base = {
      id: "forged-engine-method",
      requires: [],
      provides: [],
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
      publishTestArtifact(stepContext, inputArtifact, { value: 3 });
      result = doubleStep.run(
        stepContext,
        {},
        {},
        buildStepTestDependencies(doubleStep, stepContext)
      );
    });

    expect(result).toBe(6);
    expect(readArtifact(context, outputArtifact)).toEqual({ value: 6 });
    expect(() =>
      withMapContextExecutionForTest(context, (stepContext) => {
        doubleStep.run(stepContext, {}, {}, buildStepTestDependencies(doubleStep, stepContext));
      })
    ).toThrow("MapGen context has already completed an execution.");
  });

  it("preserves missing-artifact attribution from the shared dependency binder", () => {
    const context = createSyntheticContext();
    expect(() =>
      withMapContextExecutionForTest(context, (stepContext) => {
        doubleStep.run(stepContext, {}, {}, buildStepTestDependencies(doubleStep, stepContext));
      })
    ).toThrow(ArtifactMissingError);
  });
});

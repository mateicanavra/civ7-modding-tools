import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import {
  ArtifactMissingError,
  createStep,
  defineArtifact,
  defineStep,
  validateArtifactSchema,
} from "@mapgen/authoring/index.js";
import { createMapContext } from "@mapgen/core/map-context.js";
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
    validate: (value: unknown) => validateArtifactSchema(artifact.schema, value),
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

describe("step testing surface", () => {
  it("uses declared production dependencies inside one terminal execution", () => {
    const context = createSyntheticContext();
    let result: number | Promise<number> | undefined;
    withMapContextExecutionForTest(context, () => {
      publishTestArtifact(context, inputModule, { value: 3 });
      result = doubleStep.run(context, {}, {}, buildStepTestDependencies(doubleStep));
    });

    expect(result).toBe(6);
    expect(context.artifacts.get(outputArtifact.id)).toEqual({ value: 6 });
    expect(() =>
      withMapContextExecutionForTest(context, () => {
        doubleStep.run(context, {}, {}, buildStepTestDependencies(doubleStep));
      })
    ).toThrow("MapGen context has already completed an execution.");
  });

  it("preserves missing-artifact attribution from the shared dependency binder", () => {
    const context = createSyntheticContext();
    expect(() =>
      withMapContextExecutionForTest(context, () => {
        doubleStep.run(context, {}, {}, buildStepTestDependencies(doubleStep));
      })
    ).toThrow(ArtifactMissingError);
  });

  it("rejects provider runtimes that do not implement their declared artifact contract", () => {
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

    expect(() => buildStepTestDependencies(forgedStep as never)).toThrow(
      'has invalid artifact runtime for "outputValue"'
    );
  });
});

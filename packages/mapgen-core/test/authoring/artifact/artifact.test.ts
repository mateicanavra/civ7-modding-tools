import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import {
  ArtifactDoublePublishError,
  ArtifactMissingError,
  ArtifactValidationError,
  createRecipe,
  createStage,
  createStep,
  defineArtifact,
  defineStep,
  implementArtifacts,
  readValidatedArtifact,
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

  it("artifact runtimes enforce missing/double publish/validation errors", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.foo",
      schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
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
      validate: (value: unknown) =>
        typeof value === "object" && value !== null && "value" in value
          ? []
          : [{ message: "value is required" }],
    };

    expect(() => readValidatedArtifact(context, source)).toThrow("Missing required artifact");
    context.artifacts.set(artifact.id, {});
    expect(() => readValidatedArtifact(context, source)).toThrow("Invalid artifact");
    context.artifacts.set(artifact.id, { value: "not-a-number" });
    expect(() => readValidatedArtifact(context, source)).toThrow("Invalid artifact");
    context.artifacts.set(artifact.id, { value: 7 });
    expect(readValidatedArtifact(context, source)).toEqual({ value: 7 });
  });
});

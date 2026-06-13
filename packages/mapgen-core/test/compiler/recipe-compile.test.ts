import { describe, expect, it } from "bun:test";
import { Type } from "typebox";

import { defineOp } from "@mapgen/authoring/index.js";
import type { DomainOpCompileAny } from "@mapgen/authoring/index.js";
import { compileRecipeConfig, RecipeCompileError } from "@mapgen/compiler/recipe-compile.js";

describe("compileRecipeConfig", () => {
  it("applies canonicalization ordering and op defaults", () => {
    const calls: string[] = [];

    const op = defineOp({
      kind: "plan",
      id: "test/op",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Object({}, { additionalProperties: false }),
      strategies: {
        default: Type.Object(
          { tag: Type.Optional(Type.String()) },
          { additionalProperties: false, default: {} }
        ),
      },
    } as const);

    const stepSchema = Type.Object(
      {
        value: Type.String({ default: "base" }),
        trees: Type.Object(
          {
            strategy: Type.String(),
            config: Type.Object(
              { tag: Type.Optional(Type.String()) },
              { additionalProperties: false, default: {} }
            ),
          },
          { additionalProperties: false }
        ),
      },
      { additionalProperties: false, default: {} }
    );

    const step = {
      contract: {
        id: "alpha",
        schema: stepSchema,
        ops: {
          trees: op,
        },
      },
      normalize: (config: unknown) => {
        calls.push("step.normalize");
        const value = config as {
          value?: string;
          trees?: { strategy?: string; config?: Record<string, unknown> };
        };
        expect(value.value).toBe("base");
        expect(value.trees).toEqual({ strategy: "default", config: {} });
        return { ...value, value: "step" };
      },
    };

    const stage = {
      id: "stage",
      surfaceSchema: Type.Object(
        {
          knobs: Type.Optional(Type.Object({}, { additionalProperties: false, default: {} })),
          alpha: Type.Optional(Type.Object({}, { additionalProperties: false, default: {} })),
        },
        { additionalProperties: false, default: {} }
      ),
      toInternal: ({
        stageConfig,
      }: {
        stageConfig: { knobs?: Record<string, unknown>; alpha?: unknown };
      }) => {
        const { knobs = {}, ...rest } = stageConfig ?? {};
        return { knobs, rawSteps: { alpha: rest.alpha ?? {} } };
      },
      steps: [step],
    };

    const compileOpsById: Record<string, DomainOpCompileAny> = {
      [op.id]: {
        id: op.id,
        normalize: (envelope: { config?: Record<string, unknown> }) => {
          calls.push("op.normalize");
          return { ...envelope, config: { ...(envelope.config ?? {}), tag: "op" } };
        },
      } as DomainOpCompileAny,
    };

    const result = compileRecipeConfig({
      env: {},
      recipe: { stages: [stage] },
      config: { stage: { alpha: {} } },
      compileOpsById,
    });

    expect(calls).toEqual(["step.normalize", "op.normalize"]);
    expect(result).toEqual({
      stage: {
        alpha: {
          value: "step",
          trees: { strategy: "default", config: { tag: "op" } },
        },
      },
    });
  });

  it("compiles public stage config into internal step op envelopes", () => {
    const op = defineOp({
      kind: "plan",
      id: "test/public-boundary-op",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Object({}, { additionalProperties: false }),
      strategies: {
        default: Type.Object(
          { internalRate: Type.Number({ default: 1 }) },
          { additionalProperties: false, default: {} }
        ),
      },
    } as const);

    const stage = {
      id: "stage",
      surfaceSchema: Type.Object(
        {
          knobs: Type.Optional(Type.Object({}, { additionalProperties: false, default: {} })),
          productRate: Type.Optional(Type.Number({ default: 2 })),
        },
        { additionalProperties: false, default: {} }
      ),
      toInternal: ({ stageConfig }: { stageConfig: { productRate?: number } }) => ({
        knobs: {},
        rawSteps: {
          alpha: {
            terrain: {
              strategy: "default",
              config: { internalRate: stageConfig.productRate ?? 2 },
            },
          },
        },
      }),
      steps: [
        {
          contract: {
            id: "alpha",
            schema: Type.Object(
              { terrain: op.config },
              { additionalProperties: false, default: {} }
            ),
            ops: { terrain: op },
          },
        },
      ],
    };

    const result = compileRecipeConfig({
      env: {},
      recipe: { stages: [stage] },
      config: { stage: { productRate: 4 } },
      compileOpsById: {
        [op.id]: {
          id: op.id,
          normalize: (envelope: unknown) => envelope,
        } as DomainOpCompileAny,
      },
    });

    expect(result).toEqual({
      stage: {
        alpha: {
          terrain: {
            strategy: "default",
            config: { internalRate: 4 },
          },
        },
      },
    });
  });

  it("rejects unknown step ids returned by stage compilation", () => {
    const stage = {
      id: "stage",
      surfaceSchema: Type.Object({}, { additionalProperties: false, default: {} }),
      toInternal: () => ({ knobs: {}, rawSteps: { bogus: {} } }),
      steps: [
        {
          contract: {
            id: "alpha",
            schema: Type.Object({}, { additionalProperties: false, default: {} }),
          },
        },
      ],
    };

    let error: RecipeCompileError | null = null;
    try {
      compileRecipeConfig({
        env: {},
        recipe: { stages: [stage] },
        config: { stage: {} },
        compileOpsById: {},
      });
    } catch (err) {
      error = err as RecipeCompileError;
    }

    expect(error).toBeInstanceOf(RecipeCompileError);
    expect(error?.errors[0]?.code).toBe("stage.unknown-step-id");
    expect(error?.errors[0]?.path).toBe("/config/stage/bogus");
    expect(error?.errors[0]?.stageId).toBe("stage");
    expect(error?.errors[0]?.stepId).toBe("bogus");
  });
});

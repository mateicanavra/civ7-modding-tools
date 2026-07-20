import { describe, expect, it } from "bun:test";

import {
  createOp,
  createStrategy,
  defineOp,
  OperationInputAdmissionError,
  TypedArraySchemas,
} from "@mapgen/authoring/index.js";
import {
  normalizeOperationSelectionForTest,
  runAdmittedOperationForTest,
  TestCompileError,
} from "@mapgen/testing/index.js";
import { Type } from "typebox";

function createTestingOperation() {
  const contract = defineOp({
    kind: "compute",
    id: "test/testing-operation",
    input: Type.Object(
      {
        width: Type.Integer({ minimum: 1 }),
        height: Type.Integer({ minimum: 1 }),
        values: TypedArraySchemas.u8(),
      },
      { additionalProperties: false }
    ),
    output: Type.Object(
      {
        label: Type.String(),
        observedLength: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false }
    ),
    defaultStrategy: "named",
    strategies: {
      named: Type.Object({ label: Type.String() }, { additionalProperties: false }),
    },
  });
  let normalizations = 0;
  let runs = 0;
  const operation = createOp(contract, {
    strategies: {
      named: createStrategy(contract, "named", {
        normalize: (config) => {
          normalizations += 1;
          if (config.label === "throw") throw new Error("strategy normalization exploded");
          return config.label === "invalidate"
            ? ({ label: 42 } as never)
            : { label: config.label.trim() };
        },
        run: (input, config) => {
          runs += 1;
          return { label: config.label, observedLength: input.values.length };
        },
      }),
    },
  });
  return {
    operation,
    counts: () => ({ normalizations, runs }),
  };
}

describe("operation testing surface", () => {
  it("reports strict pre-normalize and post-normalize configuration diagnostics", () => {
    const { operation, counts } = createTestingOperation();

    let initialRefusal: unknown;
    try {
      normalizeOperationSelectionForTest(
        operation,
        {
          strategy: "named",
          config: { label: "valid", extra: true },
        },
        { path: "/test/operation" }
      );
    } catch (error) {
      initialRefusal = error;
    }
    expect(initialRefusal).toBeInstanceOf(TestCompileError);
    expect((initialRefusal as TestCompileError).errors).toEqual([
      {
        code: "config.invalid",
        path: "/test/operation/config/extra",
        message: "Unknown key",
      },
      {
        code: "config.invalid",
        path: "/test/operation",
        message: "must match a schema in anyOf",
      },
    ]);
    expect(counts()).toEqual({ normalizations: 0, runs: 0 });

    expect(() =>
      normalizeOperationSelectionForTest(
        operation,
        { strategy: "named", config: { label: "invalidate" } },
        { path: "/test/operation" }
      )
    ).toThrow("post-normalize revalidation failed at /test/operation");
    expect(counts()).toEqual({ normalizations: 1, runs: 0 });

    let normalizeRefusal: unknown;
    try {
      normalizeOperationSelectionForTest(
        operation,
        { strategy: "named", config: { label: "throw" } },
        { path: "/test/operation" }
      );
    } catch (error) {
      normalizeRefusal = error;
    }
    expect(normalizeRefusal).toBeInstanceOf(TestCompileError);
    expect((normalizeRefusal as TestCompileError).errors).toEqual([
      {
        code: "op.normalize.failed",
        path: "/test/operation",
        message: "strategy normalization exploded",
        opId: "test/testing-operation",
      },
    ]);
    expect(counts()).toEqual({ normalizations: 2, runs: 0 });

    expect(
      normalizeOperationSelectionForTest(
        operation,
        { strategy: "named", config: { label: "  admitted  " } },
        { path: "/test/operation" }
      )
    ).toEqual({ strategy: "named", config: { label: "admitted" } });
    expect(counts()).toEqual({ normalizations: 3, runs: 0 });
  });

  it("runs production input admission before strategy behavior and passes its output through", () => {
    const { operation, counts } = createTestingOperation();
    const syntheticDimensions = { width: 2, height: 2 } as const;

    expect(() =>
      runAdmittedOperationForTest(
        operation,
        { ...syntheticDimensions, values: new Uint8Array(3) },
        { strategy: "named", config: { label: "invalid input" } }
      )
    ).toThrow(OperationInputAdmissionError);
    expect(counts()).toEqual({ normalizations: 1, runs: 0 });

    const result = runAdmittedOperationForTest(
      operation,
      { ...syntheticDimensions, values: new Uint8Array(4) },
      { strategy: "named", config: { label: "  admitted input  " } }
    );

    // The helper owns configuration and input admission; output validation is not its contract.
    expect(result).toEqual({ label: "admitted input", observedLength: 4 });
    expect(counts()).toEqual({ normalizations: 2, runs: 1 });
  });
});

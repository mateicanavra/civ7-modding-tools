import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext, ctxRandom } from "@mapgen/core/index.js";
import { withMapContextExecutionForTest } from "@mapgen/testing/index.js";

function createTestContext() {
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

describe("MapContext test execution", () => {
  it("returns a synchronous test action result", () => {
    const context = createTestContext();

    const draw = withMapContextExecutionForTest(context, () =>
      ctxRandom(context, "test-execution", 100)
    );

    expect(draw).toBeGreaterThanOrEqual(0);
    expect(draw).toBeLessThan(100);
  });

  it("terminalizes the context when the test action throws", () => {
    const context = createTestContext();

    expect(() =>
      withMapContextExecutionForTest(context, () => {
        throw new Error("test failure");
      })
    ).toThrow("test failure");
    expect(() => withMapContextExecutionForTest(context, () => undefined)).toThrow(
      "MapGen context has already completed an execution."
    );
  });

  it("refuses a second test execution after success", () => {
    const context = createTestContext();
    withMapContextExecutionForTest(context, () => undefined);

    expect(() => withMapContextExecutionForTest(context, () => undefined)).toThrow(
      "MapGen context has already completed an execution."
    );
  });

  it("contains and rejects a thenable result before terminalizing the context", () => {
    const context = createTestContext();
    let rejectionContained = false;
    const rejectedThenable = {
      then: (_onFulfilled: unknown, onRejected: ((reason: unknown) => unknown) | undefined) => {
        rejectionContained = typeof onRejected === "function";
        onRejected?.(new Error("rejected test action"));
        return rejectedThenable;
      },
    } as unknown as PromiseLike<never>;
    const returnRejectedThenable = (() => rejectedThenable) as unknown as () => never;

    expect(() => withMapContextExecutionForTest(context, returnRejectedThenable)).toThrow(
      "MapContext test executions must be synchronous."
    );
    expect(rejectionContained).toBeTrue();
    expect(() => withMapContextExecutionForTest(context, () => undefined)).toThrow(
      "MapGen context has already completed an execution."
    );
  });
});

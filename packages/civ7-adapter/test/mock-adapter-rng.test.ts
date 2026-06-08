import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "../src/mock-adapter.js";

describe("MockAdapter RNG", () => {
  it("uses deterministic label RNG by default", () => {
    const first = createMockAdapter();
    const second = createMockAdapter();

    expect([
      first.getRandomNumber(10_000, "foundation/compute-mesh"),
      first.getRandomNumber(10_000, "foundation/compute-mesh"),
      first.getRandomNumber(10_000, "morphology/compute-base-topography"),
    ]).toEqual([
      second.getRandomNumber(10_000, "foundation/compute-mesh"),
      second.getRandomNumber(10_000, "foundation/compute-mesh"),
      second.getRandomNumber(10_000, "morphology/compute-base-topography"),
    ]);
  });

  it("keeps explicit adapter RNG overrides available for adapter-boundary tests", () => {
    let callCount = 0;
    const adapter = createMockAdapter({
      rng: (max) => {
        callCount++;
        return callCount % max;
      },
    });

    expect(adapter.getRandomNumber(10, "test")).toBe(1);
    expect(adapter.getRandomNumber(10, "test")).toBe(2);
    expect(adapter.getRandomNumber(10, "test")).toBe(3);
  });
});

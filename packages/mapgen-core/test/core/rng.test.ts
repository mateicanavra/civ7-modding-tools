import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";

import { createExtendedMapContext, ctxRandom } from "@mapgen/core/index.js";

const dimensions = { width: 8, height: 6 } as const;
const latitudeBounds = { topLatitude: 60, bottomLatitude: -60 } as const;

function createContext(seed: number, adapterRoll: number) {
  const adapter = createMockAdapter({
    width: dimensions.width,
    height: dimensions.height,
    rng: (max) => adapterRoll % Math.max(1, max | 0),
  });
  return createExtendedMapContext(dimensions, adapter, {
    seed,
    dimensions,
    latitudeBounds,
  });
}

describe("core rng authority", () => {
  it("derives ctxRandom values from env.seed, not adapter RNG", () => {
    const contextA = createContext(123456, 0);
    const contextB = createContext(123456, 999999);

    const sequenceA = [
      ctxRandom(contextA, "foundation/compute-mesh", 2_147_483_647),
      ctxRandom(contextA, "foundation/compute-mesh", 2_147_483_647),
      ctxRandom(contextA, "morphology/compute-base-topography", 2_147_483_647),
    ];
    const sequenceB = [
      ctxRandom(contextB, "foundation/compute-mesh", 2_147_483_647),
      ctxRandom(contextB, "foundation/compute-mesh", 2_147_483_647),
      ctxRandom(contextB, "morphology/compute-base-topography", 2_147_483_647),
    ];

    expect(sequenceB).toEqual(sequenceA);
  });

  it("does not call adapter RNG for authored context randomness", () => {
    const adapter = createMockAdapter({
      width: dimensions.width,
      height: dimensions.height,
      rng: () => {
        throw new Error("adapter RNG should not be used by ctxRandom");
      },
    });
    const context = createExtendedMapContext(dimensions, adapter, {
      seed: 42,
      dimensions,
      latitudeBounds,
    });

    expect(ctxRandom(context, "authored-seed", 10_000)).toBeGreaterThanOrEqual(0);
  });
});

import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";

import { createMapContext, ctxRandom } from "@mapgen/core/index.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
import { compileExecutionPlan, PipelineExecutor, StepRegistry } from "@mapgen/engine/index.js";

const dimensions = { width: 8, height: 6 } as const;
const latitudeBounds = { topLatitude: 60, bottomLatitude: -60 } as const;

function createContext(seed: number, adapterRoll: number) {
  const adapter = createMockAdapter({
    width: dimensions.width,
    height: dimensions.height,
    rng: (max) => adapterRoll % Math.max(1, max | 0),
  });
  return createMapContext({
    setup: admitMapSetup({ mapSeed: seed, dimensions, latitudeBounds }),
    adapter,
  });
}

function executeRandomSequence(seed: number, adapterRoll: number): readonly number[] {
  const context = createContext(seed, adapterRoll);
  const sequence: number[] = [];
  const registry = new StepRegistry();
  registry.register({
    id: "draw-authored-randomness",
    stageId: "foundation",
    requires: [],
    provides: [],
    run: (activeContext) => {
      sequence.push(
        ctxRandom(activeContext, "foundation/compute-mesh", 2_147_483_647),
        ctxRandom(activeContext, "foundation/compute-mesh", 2_147_483_647),
        ctxRandom(activeContext, "morphology/compute-base-topography", 2_147_483_647)
      );
    },
  });
  const plan = compileExecutionPlan(
    {
      recipe: { schemaVersion: 2, steps: [{ id: "draw-authored-randomness" }] },
      setup: context.setup,
    },
    registry
  );
  new PipelineExecutor(registry).executePlan(context, plan);
  return sequence;
}

describe("core rng authority", () => {
  it("derives ctxRandom values from setup.mapSeed, not adapter RNG", () => {
    const sequenceA = executeRandomSequence(123456, 0);
    const sequenceB = executeRandomSequence(123456, 999999);

    expect(sequenceB).toEqual(sequenceA);
  });

  it("admits authored randomness only during execution and never calls adapter RNG", () => {
    const adapter = createMockAdapter({
      width: dimensions.width,
      height: dimensions.height,
      rng: () => {
        throw new Error("adapter RNG should not be used by ctxRandom");
      },
    });
    const context = createMapContext({
      setup: admitMapSetup({ mapSeed: 42, dimensions, latitudeBounds }),
      adapter,
    });
    const registry = new StepRegistry();
    let value: number | undefined;
    registry.register({
      id: "draw-authored-randomness",
      stageId: "foundation",
      requires: [],
      provides: [],
      run: (activeContext) => {
        value = ctxRandom(activeContext, "authored-seed", 10_000);
      },
    });
    const plan = compileExecutionPlan(
      {
        recipe: { schemaVersion: 2, steps: [{ id: "draw-authored-randomness" }] },
        setup: context.setup,
      },
      registry
    );

    expect(() => ctxRandom(context, "before-run", 10_000)).toThrow("active execution");
    new PipelineExecutor(registry).executePlan(context, plan);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(() => ctxRandom(context, "after-run", 10_000)).toThrow("active execution");
  });
});

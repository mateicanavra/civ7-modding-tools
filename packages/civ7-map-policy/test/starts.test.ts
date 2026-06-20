import { describe, expect, it } from "bun:test";

import {
  apportionStartsByCapacity,
  balancedHemisphereMeridian,
  CIV7_START_PLACEMENT_POLICY_V0,
  dispersionTerm,
  feasibleStartCeiling,
  HOMELAND_REGION_EAST,
  HOMELAND_REGION_WEST,
  hemisphereSlotForColumn,
  startFootprintTiles,
} from "../src/index.js";

describe("start-placement policy facts", () => {
  it("carries the official fixed spacing buffers and the 2-homeland model", () => {
    expect(CIV7_START_PLACEMENT_POLICY_V0.requiredSpacingTiles).toBe(6);
    expect(CIV7_START_PLACEMENT_POLICY_V0.desiredSpacingTiles).toBe(12);
    expect(CIV7_START_PLACEMENT_POLICY_V0.homelandRegionCount).toBe(2);
  });
});

describe("feasibleStartCeiling", () => {
  it("is 0 for no settleable land", () => {
    expect(feasibleStartCeiling(0, 6)).toBe(0);
    expect(feasibleStartCeiling(-50, 6)).toBe(0);
  });

  it("scales with area and shrinks as the spacing floor grows", () => {
    const footprint6 = startFootprintTiles(6);
    expect(feasibleStartCeiling(footprint6 * 5, 6)).toBe(5);
    // Larger floor → larger footprint → fewer feasible starts for the same area.
    expect(feasibleStartCeiling(1000, 12)).toBeLessThan(feasibleStartCeiling(1000, 6));
  });

  it("yields at least one start for a small but non-empty region", () => {
    // A single start needs no mutual spacing, so a sub-footprint region still
    // hosts one (must not zero out a small-but-real homeland).
    expect(feasibleStartCeiling(12, 6)).toBe(1);
    expect(feasibleStartCeiling(1, 6)).toBe(1);
  });
});

describe("balancedHemisphereMeridian", () => {
  it("halves uniform land near the fixed midline", () => {
    const width = 40;
    const uniform = new Array<number>(width).fill(3);
    const { imbalance } = balancedHemisphereMeridian(uniform, width);
    expect(imbalance).toBeLessThan(0.02);
  });

  it("rotates the meridian so each homeland holds ~half the land when land is one-sided", () => {
    // All land in columns [0,10) of a width-40 map; fixed width/2 midline would
    // put 100% west. The balanced meridian must split that block ~evenly.
    const width = 40;
    const weights = new Array<number>(width).fill(0);
    for (let x = 0; x < 10; x++) weights[x] = 10;
    const { meridianOffset, westWeight, imbalance } = balancedHemisphereMeridian(weights, width);
    const total = 100;
    expect(Math.abs(westWeight - total / 2)).toBeLessThanOrEqual(total * 0.1);
    expect(imbalance).toBeLessThanOrEqual(0.1);
    // The chosen band must actually contain part of the land block.
    expect(meridianOffset).toBeGreaterThanOrEqual(0);
    expect(meridianOffset).toBeLessThan(width);
  });

  it("reports high residual imbalance when a single column dominates (>half the land)", () => {
    const width = 20;
    const weights = new Array<number>(width).fill(1);
    weights[5] = 1000; // one column holds far more than half — cannot be halved
    const { imbalance } = balancedHemisphereMeridian(weights, width);
    expect(imbalance).toBeGreaterThan(0.3);
  });

  it("is deterministic", () => {
    const width = 32;
    const weights = Array.from({ length: width }, (_, x) => (x * 7) % 5);
    const a = balancedHemisphereMeridian(weights, width);
    const b = balancedHemisphereMeridian(weights, width);
    expect(a).toEqual(b);
  });
});

describe("hemisphereSlotForColumn", () => {
  it("splits the half-width band starting at the meridian into west/east", () => {
    const width = 40;
    const offset = 10;
    // [10,30) → west, the rest → east.
    expect(hemisphereSlotForColumn(10, offset, width)).toBe(HOMELAND_REGION_WEST);
    expect(hemisphereSlotForColumn(29, offset, width)).toBe(HOMELAND_REGION_WEST);
    expect(hemisphereSlotForColumn(30, offset, width)).toBe(HOMELAND_REGION_EAST);
    // Wraps across the seam.
    expect(hemisphereSlotForColumn(5, offset, width)).toBe(HOMELAND_REGION_EAST);
    expect(hemisphereSlotForColumn(35, offset, width)).toBe(HOMELAND_REGION_EAST);
  });
});

describe("apportionStartsByCapacity", () => {
  it("returns zeros for zero players", () => {
    expect(apportionStartsByCapacity({ capacities: [10, 5], total: 0 })).toEqual([0, 0]);
  });

  it("splits balanced capacities equally and sums to the total", () => {
    const out = apportionStartsByCapacity({ capacities: [100, 100], total: 8, balanceBias: 0.5 });
    expect(out).toEqual([4, 4]);
  });

  it("allocates proportionally to capacity at balanceBias=0", () => {
    // 90/10 capacity, 10 players → ~9/1.
    const out = apportionStartsByCapacity({ capacities: [900, 100], total: 10, balanceBias: 0 });
    expect(out[0]! + out[1]!).toBe(10);
    expect(out[0]!).toBeGreaterThanOrEqual(8);
    expect(out[1]!).toBeLessThanOrEqual(2);
  });

  it("biases a lopsided map back toward equal at balanceBias=1", () => {
    const out = apportionStartsByCapacity({ capacities: [900, 100], total: 8, balanceBias: 1 });
    expect(out).toEqual([4, 4]);
  });

  it("clamps to ceilings and redistributes overflow to the region with room", () => {
    // East would proportionally get ~4 but can only hold 1 → 3 overflow goes west.
    const out = apportionStartsByCapacity({
      capacities: [100, 100],
      ceilings: [10, 1],
      total: 8,
      balanceBias: 0.5,
    });
    expect(out[1]!).toBe(1);
    expect(out[0]!).toBe(7);
    expect(out[0]! + out[1]!).toBe(8);
  });

  it("leaves a shortfall when total exceeds the sum of ceilings", () => {
    const out = apportionStartsByCapacity({
      capacities: [100, 100],
      ceilings: [2, 3],
      total: 8,
      balanceBias: 0.5,
    });
    // Only 5 can be feasibly placed; the remaining 3 are the caller's shortfall.
    expect(out[0]! + out[1]!).toBe(5);
    expect(out[0]!).toBeLessThanOrEqual(2);
    expect(out[1]!).toBeLessThanOrEqual(3);
  });

  it("is deterministic for fixed inputs", () => {
    const input = { capacities: [37, 61, 5], ceilings: [10, 10, 10], total: 9, balanceBias: 0.3 };
    expect(apportionStartsByCapacity(input)).toEqual(apportionStartsByCapacity(input));
  });
});

describe("dispersionTerm", () => {
  it("is maximal for the first seat (no neighbor yet)", () => {
    expect(dispersionTerm(null)).toBe(1);
  });

  it("is 0 at zero distance and saturates at the desired spacing", () => {
    expect(dispersionTerm(0, 12)).toBe(0);
    expect(dispersionTerm(6, 12)).toBeCloseTo(0.5, 5);
    expect(dispersionTerm(12, 12)).toBe(1);
    expect(dispersionTerm(20, 12)).toBe(1);
  });
});

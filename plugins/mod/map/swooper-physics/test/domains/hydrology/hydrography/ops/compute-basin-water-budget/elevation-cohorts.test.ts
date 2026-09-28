import { describe, expect, it } from "bun:test";

import hydrology from "../../../../../../src/domain/hydrology/router.js";

const { computeBasinWaterBudget } = hydrology.hydrography.ops;
type Input = Parameters<typeof computeBasinWaterBudget.run>[0];
type Result = ReturnType<typeof computeBasinWaterBudget.run>;

function fixture(
  ground: number[],
  localRunoff: number[] = ground.map(() => 1),
  precipitation: number[] = ground.map(() => 1),
  potentialDemand: number[] = ground.map(() => 1),
  overrides: Partial<Pick<Input, "incomingOverflow" | "attainedLevel" | "spillElevation">> = {}
) {
  return {
    cells: ground.map((height, cell) => ({
      cell, ground: height, localRunoff: localRunoff[cell]!,
      precipitation: precipitation[cell]!, potentialDemand: potentialDemand[cell]!,
    })),
    incomingOverflow: 0,
    attainedLevel: Math.min(...ground),
    spillElevation: Math.max(...ground) + 1,
    ...overrides,
  };
}

function run(input: Input): Result {
  return computeBasinWaterBudget.run(input, { strategy: "elevation-cohorts", config: {} });
}

function expectAccounting(input: Input, result: Result): void {
  const wet = new Set(result.wetCells);
  const sum = (select: (cell: Input["cells"][number]) => number) =>
    input.cells.reduce((total, cell) => total + select(cell), 0);
  expect(wet.size).toBe(result.wetCells.length);
  expect(result.wetCells).toEqual([...result.wetCells].sort((a, b) => a - b));
  expect(result.flux.incomingOverflow).toBe(input.incomingOverflow);
  expect(result.flux.dryRunoff).toBeCloseTo(sum((cell) => wet.has(cell.cell) ? 0 : cell.localRunoff), 10);
  expect(result.flux.wetPrecipitation).toBeCloseTo(sum((cell) => wet.has(cell.cell) ? cell.precipitation : 0), 10);
  expect(result.flux.wetDemand).toBeCloseTo(sum((cell) => wet.has(cell.cell) ? cell.potentialDemand : 0), 10);
  const supply = result.flux.incomingOverflow + result.flux.dryRunoff + result.flux.wetPrecipitation;
  expect(result.flux.balance).toBeCloseTo(supply - result.flux.wetDemand, 10);
  if (result.state === "infeasible-attained-state") {
    expect(supply + result.shortfall).toBeCloseTo(result.flux.wetDemand, 10);
    expect(result.flux.balance).toBeLessThan(0);
    return;
  }
  if (result.state === "no-stationary-solution") {
    expect(supply).toBeCloseTo(result.flux.wetDemand + result.unresolvedSurplus, 10);
    expect(result.unresolvedSurplus).toBeGreaterThan(0);
    return;
  }
  expect(supply).toBeCloseTo(result.flux.wetDemand + result.overflow + result.unresolvedResidual, 10);
  if (result.state === "subtile" || (result.state === "closed" && result.resolution === "shoreline-quantization")) {
    expect(result.bracket.before).toEqual(result.flux);
    expect(result.bracket.before.balance).toBeGreaterThan(0);
    expect(result.bracket.after.balance).toBeLessThan(0);
    expect(result.unresolvedResidual).toBe(result.bracket.before.balance);
    expect(result.unresolvedResidual).toBeLessThanOrEqual(result.bracket.jumpMagnitude);
    const cohort = new Set(result.bracket.cohortCells);
    const delta = sum((cell) => cohort.has(cell.cell)
      ? cell.precipitation - cell.potentialDemand - cell.localRunoff : 0);
    expect(result.bracket.after.balance - result.bracket.before.balance).toBeCloseTo(delta, 10);
    expect(result.bracket.jumpMagnitude).toBeCloseTo(-delta, 10);
    expect(result.wetCells).toEqual(input.cells.filter((cell) => cell.ground < result.level).map((cell) => cell.cell).sort((a, b) => a - b));
  }
}

describe("hydrology/compute-basin-water-budget", () => {
  it("registers one semantic strategy without activating a recipe step", () => {
    expect(computeBasinWaterBudget.id).toBe("hydrology/compute-basin-water-budget");
    expect(computeBasinWaterBudget.defaultStrategy).toBe("elevation-cohorts");
  });

  it("exports only sill surplus from a deep open pool, retaining dry upland runoff", () => {
    const input = fixture([-10, -4, 2, 20], [3, 4, 5, 6], [4, 6, 8, 10], [1, 2, 3, 4], {
      incomingOverflow: 7, spillElevation: 5,
    });
    const result = run(input);
    expect(result.state).toBe("open");
    expect(result.wetCells).toEqual([0, 1, 2]);
    expect(result.flux).toEqual({ incomingOverflow: 7, dryRunoff: 6, wetPrecipitation: 18, wetDemand: 6, balance: 25 });
    if (result.state === "open") expect(result.overflow).toBe(25);
    expectAccounting(input, result);
  });

  it("does not inundate or charge demand to the cohort exactly at a finite sill", () => {
    const input = fixture([0, 3], [1, 7], [2, 0], [1, 1000], { spillElevation: 3 });
    const result = run(input);
    expect(result.state).toBe("open");
    expect(result.wetCells).toEqual([0]);
    if (result.state === "open") expect(result.overflow).toBe(8);
    expectAccounting(input, result);
  });

  it("leaves a zero-source catchment dry rather than activating precipitation on imaginary water", () => {
    const input = fixture([0, 2], [0, 0], [50, 50], [5, 5]);
    const result = run(input);
    expect(result).toEqual({
      state: "dry", wetCells: [], overflow: 0, unresolvedResidual: 0,
      flux: { incomingOverflow: 0, dryRunoff: 0, wetPrecipitation: 0, wetDemand: 0, balance: 0 },
    });
    expectAccounting(input, result);
  });

  it("retains positive first-cohort overshoot as subtile residual, not evaporation or discharge", () => {
    const input = fixture([0], [3], [3], [8], { spillElevation: 2 });
    const result = run(input);
    expect(result.state).toBe("subtile");
    expect(result.wetCells).toEqual([]);
    if (result.state !== "subtile") throw new Error("Expected a subtile response.");
    expect(result.level).toBe(0);
    expect(result.unresolvedResidual).toBe(3);
    expect(result.bracket.after.balance).toBe(-5);
    expect(result.bracket.jumpMagnitude).toBe(8);
    expectAccounting(input, result);
  });

  it("stops at the first closed footprint even if a later nonmonotone cohort becomes positive", () => {
    const input = fixture([0, 1, 2], [1, 1, 1], [1, 1, 20], [1, 11, 0]);
    const result = run(input);
    expect(result.state).toBe("closed");
    if (result.state !== "closed" || result.resolution !== "shoreline-quantization") throw new Error("Expected quantized closure.");
    expect(result.level).toBe(1);
    expect(result.wetCells).toEqual([0]);
    expect(result.unresolvedResidual).toBe(2);
    expect(result.bracket.after.balance).toBe(-9);
    // The all-wet balance would be +10; selecting it would violate first-stop closure.
    expect(input.cells.reduce((sum, cell) => sum + cell.precipitation - cell.potentialDemand, 0)).toBe(10);
    expectAccounting(input, result);
  });

  it("reports the first exact-zero level interval rather than inventing a scalar height", () => {
    const input = fixture([0, 2], [1, 1], [1, 1], [2, 1]);
    const result = run(input);
    expect(result.state).toBe("closed");
    if (result.state !== "closed" || result.resolution !== "exact-balance") throw new Error("Expected exact closure.");
    expect(result.levels).toEqual({ lower: 0, lowerInclusive: false, upper: 2, upperInclusive: true });
    expect(result.wetCells).toEqual([0]);
    expect("level" in result).toBe(false);
    expectAccounting(input, result);
  });

  it("includes a known attained level in an already balanced interval, including a singleton", () => {
    for (const attainedLevel of [1, 2]) {
      const input = fixture([0, 2], [1, 1], [1, 1], [2, 1], { attainedLevel });
      const result = run(input);
      if (result.state !== "closed" || result.resolution !== "exact-balance") throw new Error("Expected exact closure.");
      expect(result.levels).toEqual({ lower: attainedLevel, lowerInclusive: true, upper: 2, upperInclusive: true });
      expectAccounting(input, result);
    }
  });

  it("retains an exact-zero interval's sill endpoint without claiming a strictly below-sill height", () => {
    const input = fixture([0, 5], [1, 1], [1, 1], [2, 1], { spillElevation: 3 });
    const result = run(input);
    if (result.state !== "closed" || result.resolution !== "exact-balance") throw new Error("Expected exact closure.");
    expect(result.levels).toEqual({ lower: 0, lowerInclusive: false, upper: 3, upperInclusive: true });
    expectAccounting(input, result);
  });

  it("represents exact zero beyond the last cohort with a JSON-safe unbounded interval", () => {
    const input = fixture([0], [1], [1], [1], { spillElevation: null });
    const result = run(input);
    if (result.state !== "closed" || result.resolution !== "exact-balance") throw new Error("Expected exact closure.");
    expect(result.levels).toEqual({ lower: 0, lowerInclusive: false, upper: null, upperInclusive: false });
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
    expectAccounting(input, result);
  });

  it("processes equal-height cells atomically rather than finding a false within-cohort closure", () => {
    const input = fixture([0, 0], [1, 1], [1, 10], [9, 0]);
    const result = run(input);
    expect(result.state).toBe("open");
    expect(result.wetCells).toEqual([0, 1]);
    expect(result.flux.balance).toBe(2);
    expectAccounting(input, result);
  });

  it("returns the whole tied cohort in a quantization bracket", () => {
    const input = fixture([0, 2, 2], [1, 1, 1], [1, 1, 1], [1, 4, 4]);
    const result = run(input);
    if (result.state !== "closed" || result.resolution !== "shoreline-quantization") throw new Error("Expected quantized closure.");
    expect(result.bracket.cohortCells).toEqual([1, 2]);
    expect(result.wetCells).toEqual([0]);
    expectAccounting(input, result);
  });

  it("uses already wet ground below the attained merge level without charging its land runoff", () => {
    const input = fixture([0, 1, 5], [100, 100, 3], [4, 4, 3], [1, 1, 1], {
      attainedLevel: 2, spillElevation: 4, incomingOverflow: 2,
    });
    const result = run(input);
    expect(result.state).toBe("open");
    expect(result.flux).toEqual({ incomingOverflow: 2, dryRunoff: 3, wetPrecipitation: 8, wetDemand: 2, balance: 11 });
    expectAccounting(input, result);
  });

  it("reports negative attained balance as infeasible even when a later cohort could recover", () => {
    const input = fixture([0, 2], [1, 1], [1, 100], [9, 0], { attainedLevel: 1 });
    const result = run(input);
    expect(result.state).toBe("infeasible-attained-state");
    if (result.state !== "infeasible-attained-state") throw new Error("Expected infeasible attained state.");
    expect(result.shortfall).toBe(7);
    expect(result.attainedLevel).toBe(1);
    expect("overflow" in result).toBe(false);
    expectAccounting(input, result);
  });

  it("treats a supplied attained sill as open for positive or zero balance and infeasible for negative", () => {
    for (const demand of [1, 3, 5]) {
      const input = fixture([0, 2], [1, 1], [2, 2], [demand, 100], { attainedLevel: 2, spillElevation: 2 });
      const result = run(input);
      expect(result.state).toBe(demand <= 3 ? "open" : "infeasible-attained-state");
      expect(result.wetCells).toEqual([0]);
      if (result.state === "open") expect(result.overflow).toBe(3 - demand);
      expectAccounting(input, result);
    }
  });

  it("reports persistent outlet-free surplus without capping the level or exporting water", () => {
    for (const attainedLevel of [0, 4]) {
      const input = fixture([0], [1], [2], [1], { spillElevation: null, attainedLevel });
      const result = run(input);
      expect(result.state).toBe("no-stationary-solution");
      if (result.state !== "no-stationary-solution") throw new Error("Expected no stationary solution.");
      expect(result.evaluatedLevels).toEqual({ lower: attainedLevel, lowerInclusive: attainedLevel > 0, upper: null, upperInclusive: false });
      expect(result.unresolvedSurplus).toBe(1);
      expect("overflow" in result).toBe(false);
      expect(JSON.parse(JSON.stringify(result))).toEqual(result);
      expectAccounting(input, result);
    }
  });

  it("is deterministic for permuted IDs, ties, and floating forcing and leaves input rows untouched", () => {
    const input = fixture([2, 0, 0, 5], [0.7, 0.1, 0.4, 0.2], [0.9, 0.2, 0.1, 0.6], [8.1, 0.1, 0.1, 0.3]);
    input.cells[0]!.cell = 14;
    input.cells[1]!.cell = 7;
    const before = structuredClone(input);
    for (const cell of input.cells) Object.freeze(cell);
    Object.freeze(input.cells);
    Object.freeze(input);
    const first = run(input);
    expect(run({ ...input, cells: [...input.cells].reverse() })).toEqual(first);
    expect(input).toEqual(before);
    expectAccounting(input, first);
  });

  it("matches independent strict-footprint accounting across a varied forcing cohort", () => {
    for (let sample = 0; sample < 80; sample++) {
      const ground = Array.from({ length: 8 }, (_, cell) => (cell * 3 + sample) % 5);
      const input = fixture(
        ground,
        ground.map((_, cell) => (cell + sample) % 4),
        ground.map((_, cell) => (cell * 5 + sample) % 11),
        ground.map((_, cell) => (cell * 7 + sample * 3) % 15),
        { incomingOverflow: sample % 6, attainedLevel: sample % 3, spillElevation: sample % 2 ? 4 : null }
      );
      const result = run(input);
      expectAccounting(input, result);
      if (result.state !== "infeasible-attained-state" && result.state !== "dry") {
        const balance = (level: number, includeEqual: boolean): number => input.incomingOverflow + input.cells.reduce(
          (sum, cell) => sum + (cell.ground < level || (includeEqual && cell.ground === level)
            ? cell.precipitation - cell.potentialDemand : cell.localRunoff), 0
        );
        if (balance(input.attainedLevel, false) > 0) {
          const levels = [...new Set(ground)].sort((a, b) => a - b).filter(
            (level) => level >= input.attainedLevel && (input.spillElevation === null || level < input.spillElevation)
          );
          const firstStop = levels.find((level) => balance(level, true) <= 0);
          if (firstStop === undefined) {
            expect(result.state).toBe(input.spillElevation === null ? "no-stationary-solution" : "open");
          } else if (balance(firstStop, true) === 0) {
            if (result.state !== "closed" || result.resolution !== "exact-balance") throw new Error("Expected first exact closure.");
            expect(result.levels.lower).toBe(firstStop);
            expect(result.levels.lowerInclusive).toBe(false);
          } else {
            if (result.state !== "subtile" && !(result.state === "closed" && result.resolution === "shoreline-quantization")) throw new Error("Expected first quantized closure.");
            expect(result.level).toBe(firstStop);
          }
        }
      }
      if (result.state === "open") {
        expect(result.wetCells).toEqual(input.cells.filter((cell) => cell.ground < result.level).map((cell) => cell.cell));
      }
    }
  });

  it("rejects empty catchments, duplicate cells, and invalid cell identities", () => {
    const input = fixture([0, 1]);
    expect(() => run({ ...input, cells: [] })).toThrow();
    expect(() => run({ ...input, cells: [], incomingOverflow: 4 })).toThrow();
    expect(() => run({ ...input, cells: [input.cells[0]!, input.cells[0]!] })).toThrow("Duplicate");
    for (const cell of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity]) {
      expect(() => run({ ...input, cells: [{ ...input.cells[0]!, cell }] })).toThrow();
    }
  });

  it("rejects nonfinite ground, negative or nonfinite forcing, and invalid level spans", () => {
    const input = fixture([0]);
    for (const field of ["localRunoff", "precipitation", "potentialDemand"] as const) {
      for (const value of [-1, NaN, Infinity, -Infinity]) {
        expect(() => run({ ...input, cells: [{ ...input.cells[0]!, [field]: value }] })).toThrow();
      }
    }
    for (const ground of [NaN, Infinity, -Infinity]) {
      expect(() => run({ ...input, cells: [{ ...input.cells[0]!, ground }] })).toThrow();
    }
    for (const incomingOverflow of [-1, NaN, Infinity, -Infinity]) {
      expect(() => run({ ...input, incomingOverflow })).toThrow();
    }
    for (const attainedLevel of [-1, NaN, Infinity, -Infinity]) {
      expect(() => run({ ...input, attainedLevel })).toThrow();
    }
    for (const spillElevation of [-1, NaN, Infinity, -Infinity]) {
      expect(() => run({ ...input, spillElevation })).toThrow();
    }
  });

  it("rejects overflowing finite aggregates rather than publishing infinite evidence", () => {
    const input = fixture([0, 1], [Number.MAX_VALUE, Number.MAX_VALUE]);
    expect(() => run(input)).toThrow("aggregate basin flux");
    expect(() => run(fixture([0], [Number.MAX_VALUE], [1], [1], { incomingOverflow: Number.MAX_VALUE }))).toThrow("aggregate basin supply");
  });

  it("retains both signed brackets when finite-precision jump subtraction rounds to the residual", () => {
    const input = fixture([0], [1e20], [0], [1e-10]);
    const result = run(input);
    if (result.state !== "subtile") throw new Error("Expected subtile closure.");
    expect(result.bracket.before.balance).toBe(1e20);
    expect(result.bracket.after.balance).toBe(-1e-10);
    expect(result.unresolvedResidual).toBe(result.bracket.jumpMagnitude);
    expectAccounting(input, result);
  });
});

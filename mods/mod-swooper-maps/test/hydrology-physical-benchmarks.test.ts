import { describe, expect, it } from "bun:test";
import hydrologyOpsPublic from "@mapgen/domain/hydrology/ops";
import { HYDROLOGY_LAKEINESS_TERMINAL_BASIN_POLICY } from "@mapgen/domain/hydrology/model/policy/hydrography-knob-policy.js";

const { accumulateDischarge, planLakes, projectRiverNetwork } = hydrologyOpsPublic.ops;
const SIMPLE_DISCHARGE_CONFIG = {
  runoffScale: 1,
  infiltrationFraction: 0,
  humidityDampening: 0,
  minRunoff: 0,
};

function runAccumulateDischarge(
  input: Parameters<typeof accumulateDischarge.run>[0],
  config: (typeof accumulateDischarge.defaultConfig)["config"]
) {
  return accumulateDischarge.run(input, { strategy: "default", config });
}

function runProjectRiverNetwork(
  input: Parameters<typeof projectRiverNetwork.run>[0],
  config: (typeof projectRiverNetwork.defaultConfig)["config"]
) {
  return projectRiverNetwork.run(input, { strategy: "default", config });
}

function runPlanLakes(
  input: Parameters<typeof planLakes.run>[0],
  config: (typeof planLakes.defaultConfig)["config"]
) {
  return planLakes.run(input, { strategy: "default", config });
}

function count(mask: Uint8Array, value = 1): number {
  let total = 0;
  for (const entry of mask) if (entry === value) total += 1;
  return total;
}

function dischargeFor(input: {
  width: number;
  height: number;
  landMask?: Uint8Array;
  flowDir: Int32Array;
  rainfall?: Uint8Array;
}) {
  const size = input.width * input.height;
  return runAccumulateDischarge(
    {
      width: input.width,
      height: input.height,
      landMask: input.landMask ?? new Uint8Array(size).fill(1),
      flowDir: input.flowDir,
      rainfall: input.rainfall ?? new Uint8Array(size).fill(10),
      humidity: new Uint8Array(size),
    },
    SIMPLE_DISCHARGE_CONFIG
  );
}

function assertDrainageInvariants(input: {
  width: number;
  height: number;
  landMask: Uint8Array;
  flowDir: Int32Array;
  discharge: Float32Array;
  sinkMask: Uint8Array;
  outletMask: Uint8Array;
  lakeMask?: Uint8Array;
}) {
  const size = input.width * input.height;
  expect(input.landMask.length).toBe(size);
  expect(input.flowDir.length).toBe(size);
  expect(input.discharge.length).toBe(size);

  for (let start = 0; start < size; start++) {
    if (input.landMask[start] !== 1) continue;

    let current = start;
    const seen = new Set<number>();
    for (let steps = 0; steps <= size; steps++) {
      expect(seen.has(current)).toBe(false);
      seen.add(current);

      if ((input.lakeMask?.[current] ?? 0) === 1) break;
      if (input.sinkMask[current] === 1) break;
      if (input.outletMask[current] === 1) break;

      const receiver = input.flowDir[current] ?? -1;
      expect(receiver).toBeGreaterThanOrEqual(0);
      expect(receiver).toBeLessThan(size);

      if (input.landMask[receiver] !== 1) {
        expect(input.outletMask[current]).toBe(1);
        break;
      }

      expect(input.discharge[receiver]).toBeGreaterThanOrEqual(input.discharge[current] ?? 0);
      current = receiver;
    }

    const terminal = [...seen].at(-1) ?? start;
    const reachedTerminal =
      (input.lakeMask?.[terminal] ?? 0) === 1 ||
      input.sinkMask[terminal] === 1 ||
      input.outletMask[terminal] === 1;
    expect(reachedTerminal).toBe(true);
  }
}

describe("hydrology physical river benchmarks", () => {
  it("routes a tilted island plane to coastal outlets without inventing interior sinks", () => {
    const width = 4;
    const height = 3;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    for (const ocean of [3, 7, 11]) landMask[ocean] = 0;

    const flowDir = new Int32Array(size).fill(-1);
    for (const row of [0, 4, 8]) {
      flowDir[row] = row + 1;
      flowDir[row + 1] = row + 2;
      flowDir[row + 2] = row + 3;
    }

    const accumulated = dischargeFor({ width, height, landMask, flowDir });

    expect(count(accumulated.sinkMask)).toBe(0);
    expect(count(accumulated.outletMask)).toBe(3);
    expect(accumulated.outletMask[2]).toBe(1);
    expect(accumulated.outletMask[6]).toBe(1);
    expect(accumulated.outletMask[10]).toBe(1);
    expect(accumulated.discharge[2]).toBe(30);
    expect(accumulated.discharge[6]).toBe(30);
    expect(accumulated.discharge[10]).toBe(30);
    assertDrainageInvariants({ width, height, landMask, flowDir, ...accumulated });
  });

  it("keeps a central ridge as a basin divide with separate left and right outlets", () => {
    const width = 5;
    const height = 3;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    for (const ocean of [0, 4, 5, 9, 10, 14]) landMask[ocean] = 0;

    const flowDir = new Int32Array(size).fill(-1);
    flowDir[1] = 0;
    flowDir[2] = 1;
    flowDir[3] = 4;
    flowDir[6] = 5;
    flowDir[7] = 8;
    flowDir[8] = 9;
    flowDir[11] = 10;
    flowDir[12] = 11;
    flowDir[13] = 14;

    const accumulated = dischargeFor({ width, height, landMask, flowDir });

    expect(count(accumulated.sinkMask)).toBe(0);
    expect(count(accumulated.outletMask)).toBe(6);
    expect(accumulated.outletMask[1]).toBe(1);
    expect(accumulated.outletMask[3]).toBe(1);
    expect(accumulated.outletMask[6]).toBe(1);
    expect(accumulated.outletMask[8]).toBe(1);
    expect(accumulated.outletMask[11]).toBe(1);
    expect(accumulated.outletMask[13]).toBe(1);
  });

  it("accumulates tributary discharge through a confluence before ocean outlet", () => {
    const width = 5;
    const height = 3;
    const size = width * height;
    const oceanOutlet = 9;
    const confluence = 7;
    const outletLand = 8;
    const landMask = new Uint8Array(size).fill(1);
    landMask[oceanOutlet] = 0;

    const flowDir = new Int32Array(size).fill(-1);
    flowDir[0] = 1;
    flowDir[1] = 2;
    flowDir[2] = confluence;
    flowDir[3] = outletLand;
    flowDir[5] = 6;
    flowDir[6] = confluence;
    flowDir[10] = 11;
    flowDir[11] = 12;
    flowDir[12] = confluence;
    flowDir[13] = outletLand;
    flowDir[confluence] = outletLand;
    flowDir[outletLand] = oceanOutlet;

    const accumulated = runAccumulateDischarge(
      {
        width,
        height,
        landMask,
        flowDir,
        rainfall: new Uint8Array(size).fill(10),
        humidity: new Uint8Array(size),
      },
      SIMPLE_DISCHARGE_CONFIG
    );

    expect(accumulated.sinkMask[confluence]).toBe(0);
    expect(accumulated.outletMask[outletLand]).toBe(1);
    expect(accumulated.discharge[confluence]).toBe(90);
    expect(accumulated.discharge[outletLand]).toBe(120);
    expect(accumulated.discharge[outletLand]).toBeGreaterThan(accumulated.discharge[confluence]);
    assertDrainageInvariants({ width, height, landMask, flowDir, ...accumulated });

    const projected = runProjectRiverNetwork(
      {
        width,
        height,
        landMask,
        discharge: accumulated.discharge,
        flowDir,
      },
      {
        minorPercentile: 0,
        majorPercentile: 0,
        minMinorDischarge: 60,
        minMajorDischarge: 110,
      }
    );

    expect(projected.riverClass[confluence]).toBe(2);
    expect(projected.riverClass[outletLand]).toBe(2);
    expect(projected.riverClass[oceanOutlet]).toBe(0);
    expect(projected.riverClass[2]).toBe(0);
    expect(projected.riverClass[6]).toBe(0);
  });

  it("expresses low-gradient coastal plains as broad minor channels plus a major trunk", () => {
    const width = 6;
    const height = 3;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    landMask[17] = 0;

    const flowDir = new Int32Array(size).fill(-1);
    flowDir[0] = 1;
    flowDir[1] = 2;
    flowDir[2] = 8;
    flowDir[6] = 7;
    flowDir[7] = 8;
    flowDir[8] = 9;
    flowDir[9] = 15;
    flowDir[12] = 13;
    flowDir[13] = 14;
    flowDir[14] = 15;
    flowDir[15] = 16;
    flowDir[16] = 17;

    const accumulated = dischargeFor({ width, height, landMask, flowDir });
    const projected = runProjectRiverNetwork(
      {
        width,
        height,
        landMask,
        discharge: accumulated.discharge,
        flowDir,
      },
      {
        minorPercentile: 0,
        majorPercentile: 0,
        minMinorDischarge: 30,
        minMajorDischarge: 90,
      }
    );

    expect(projected.riverClass[8]).toBe(2);
    expect(projected.riverClass[15]).toBe(2);
    expect(projected.riverClass[16]).toBe(2);
    expect(projected.riverClass[2]).toBe(2);
    expect(projected.riverClass[7]).toBe(0);
    expect(projected.riverClass[14]).toBe(1);
    expect(accumulated.outletMask[16]).toBe(1);
    expect(accumulated.discharge[16]).toBe(120);
  });

  it("keeps closed-basin sinks endorheic and grows lake intent upstream", () => {
    const width = 5;
    const height = 1;
    const size = width * height;
    const sink = 4;
    const landMask = new Uint8Array(size).fill(1);
    const flowDir = new Int32Array([1, 2, 3, sink, -1]);

    const accumulated = runAccumulateDischarge(
      {
        width,
        height,
        landMask,
        flowDir,
        rainfall: new Uint8Array(size).fill(10),
        humidity: new Uint8Array(size),
      },
      SIMPLE_DISCHARGE_CONFIG
    );

    expect(accumulated.sinkMask[sink]).toBe(1);
    expect(count(accumulated.outletMask)).toBe(0);
    expect(accumulated.discharge[sink]).toBe(50);

    const lakes = runPlanLakes(
      {
        width,
        height,
        landMask,
        flowDir,
        discharge: accumulated.discharge,
        sinkMask: accumulated.sinkMask,
      },
      {
        maxUpstreamSteps: 2,
        sinkDischargePercentileMin: 0,
        maxLakeLandFraction: 1,
      }
    );

    expect(lakes.sinkLakeCount).toBe(1);
    expect(lakes.plannedLakeTileCount).toBe(3);
    expect(Array.from(lakes.lakeMask)).toEqual([0, 0, 1, 1, 1]);
    assertDrainageInvariants({
      width,
      height,
      landMask,
      flowDir,
      lakeMask: lakes.lakeMask,
      ...accumulated,
    });
  });

  it("uses saddle spill and lake-chain topology to grow lakes from admitted terminal basins", () => {
    const width = 7;
    const height = 1;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    const flowDir = new Int32Array([1, 2, -1, 4, 5, -1, 5]);
    const rainfall = new Uint8Array([10, 10, 10, 20, 20, 20, 20]);
    const accumulated = dischargeFor({ width, height, landMask, flowDir, rainfall });

    const lakes = runPlanLakes(
      {
        width,
        height,
        landMask,
        flowDir,
        discharge: accumulated.discharge,
        sinkMask: accumulated.sinkMask,
      },
      {
        maxUpstreamSteps: 1,
        sinkDischargePercentileMin: 1,
        maxLakeLandFraction: 1,
      }
    );

    expect(accumulated.sinkMask[2]).toBe(1);
    expect(accumulated.sinkMask[5]).toBe(1);
    expect(accumulated.discharge[5]).toBeGreaterThan(accumulated.discharge[2]);
    expect(lakes.sinkLakeCount).toBe(1);
    expect(Array.from(lakes.lakeMask)).toEqual([0, 0, 0, 0, 1, 1, 1]);
    assertDrainageInvariants({
      width,
      height,
      landMask,
      flowDir,
      lakeMask: lakes.lakeMask,
      ...accumulated,
    });
  });

  it("turns rain-shadow coasts into stronger windward rivers than dry leeward slopes", () => {
    const width = 6;
    const height = 1;
    const size = width * height;
    const flowDir = new Int32Array([1, 2, 3, 4, 5, -1]);
    const rainfall = new Uint8Array([40, 40, 8, 8, 8, 8]);
    const accumulated = dischargeFor({
      width,
      height,
      landMask: new Uint8Array(size).fill(1),
      flowDir,
      rainfall,
    });

    const projected = runProjectRiverNetwork(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        discharge: accumulated.discharge,
        flowDir,
      },
      {
        minorPercentile: 0,
        majorPercentile: 0,
        minMinorDischarge: 40,
        minMajorDischarge: 100,
      }
    );

    expect(accumulated.discharge[1]).toBe(80);
    expect(accumulated.discharge[5]).toBe(112);
    expect(projected.riverClass[1]).toBe(2);
    expect(projected.riverClass[5]).toBe(2);
    expect(projected.riverClass[0]).toBe(2);
    expect(accumulated.runoff[0]).toBeGreaterThan(accumulated.runoff[2]);
    expect(projected.riverClass[2]).toBe(2);
  });

  it("keeps arid interior plateaus below river thresholds even when routing is valid", () => {
    const width = 5;
    const height = 1;
    const size = width * height;
    const flowDir = new Int32Array([1, 2, 3, 4, -1]);
    const accumulated = dischargeFor({
      width,
      height,
      landMask: new Uint8Array(size).fill(1),
      flowDir,
      rainfall: new Uint8Array(size).fill(2),
    });

    const projected = runProjectRiverNetwork(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        discharge: accumulated.discharge,
        flowDir,
      },
      {
        minorPercentile: 0,
        majorPercentile: 0,
        minMinorDischarge: 20,
        minMajorDischarge: 60,
      }
    );

    expect(count(accumulated.sinkMask)).toBe(1);
    expect(accumulated.discharge[4]).toBe(10);
    expect(count(projected.riverClass)).toBe(0);
  });

  it("changes water supply without moving drainage topology", () => {
    const width = 5;
    const height = 1;
    const size = width * height;
    const flowDir = new Int32Array([1, 2, 3, 4, -1]);
    const input = {
      width,
      height,
      landMask: new Uint8Array(size).fill(1),
      flowDir,
      rainfall: new Uint8Array(size).fill(20),
      humidity: new Uint8Array(size),
    };

    const wet = runAccumulateDischarge(input, SIMPLE_DISCHARGE_CONFIG);
    const dry = runAccumulateDischarge(input, {
      ...SIMPLE_DISCHARGE_CONFIG,
      runoffScale: 0.5,
    });

    expect(Array.from(dry.sinkMask)).toEqual(Array.from(wet.sinkMask));
    expect(Array.from(dry.outletMask)).toEqual(Array.from(wet.outletMask));
    expect(dry.discharge[4]).toBeCloseTo(wet.discharge[4] * 0.5, 6);
  });

  it("changes lakeiness without moving drainage divides or river routing", () => {
    const width = 200;
    const height = 1;
    const size = width * height;
    const flowDir = new Int32Array(size).fill(-1);
    for (let i = 0; i < size; i++) {
      if ((i + 1) % 10 !== 0) flowDir[i] = i + 1;
    }

    const accumulated = dischargeFor({ width, height, flowDir });
    const flowBeforeLakePlanning = Array.from(flowDir);
    const sinksBeforeLakePlanning = Array.from(accumulated.sinkMask);
    const outletsBeforeLakePlanning = Array.from(accumulated.outletMask);

    const few = runPlanLakes(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        flowDir,
        discharge: accumulated.discharge,
        sinkMask: accumulated.sinkMask,
      },
      HYDROLOGY_LAKEINESS_TERMINAL_BASIN_POLICY.few
    );
    const many = runPlanLakes(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        flowDir,
        discharge: accumulated.discharge,
        sinkMask: accumulated.sinkMask,
      },
      HYDROLOGY_LAKEINESS_TERMINAL_BASIN_POLICY.many
    );

    expect(count(accumulated.sinkMask)).toBe(20);
    expect(count(accumulated.outletMask)).toBe(0);
    expect(few.sinkLakeCount).toBe(1);
    expect(many.sinkLakeCount).toBe(2);
    expect(many.plannedLakeTileCount).toBeGreaterThan(few.plannedLakeTileCount);
    expect(Array.from(flowDir)).toEqual(flowBeforeLakePlanning);
    expect(Array.from(accumulated.sinkMask)).toEqual(sinksBeforeLakePlanning);
    expect(Array.from(accumulated.outletMask)).toEqual(outletsBeforeLakePlanning);
  });
});

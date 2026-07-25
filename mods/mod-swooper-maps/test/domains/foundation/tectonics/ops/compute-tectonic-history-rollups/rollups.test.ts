import { describe, expect, it } from "bun:test";

import foundation from "@mapgen/domain/foundation/router";

const { computeTectonicHistoryRollups } = foundation.tectonics.ops;
const SYNTHETIC_CELL_COUNT = 2;
const ERA_COUNT = 5;

type CellValues = readonly [number, number];

function era(values?: {
  uplift?: CellValues;
  collision?: CellValues;
  subduction?: CellValues;
  rift?: CellValues;
  shear?: CellValues;
  volcanism?: CellValues;
  fracture?: CellValues;
}) {
  return {
    boundaryType: new Uint8Array(SYNTHETIC_CELL_COUNT),
    boundaryPolarity: new Int8Array(SYNTHETIC_CELL_COUNT),
    boundaryIntensity: new Uint8Array(SYNTHETIC_CELL_COUNT),
    upliftPotential: new Uint8Array(values?.uplift ?? [0, 0]),
    collisionPotential: new Uint8Array(values?.collision ?? [0, 0]),
    subductionPotential: new Uint8Array(values?.subduction ?? [0, 0]),
    riftPotential: new Uint8Array(values?.rift ?? [0, 0]),
    shearStress: new Uint8Array(values?.shear ?? [0, 0]),
    volcanism: new Uint8Array(values?.volcanism ?? [0, 0]),
    fracture: new Uint8Array(values?.fracture ?? [0, 0]),
    riftOriginPlate: new Int16Array(SYNTHETIC_CELL_COUNT).fill(-1),
    volcanismOriginPlate: new Int16Array(SYNTHETIC_CELL_COUNT).fill(-1),
    volcanismEventType: new Uint8Array(SYNTHETIC_CELL_COUNT),
    boundaryDriftU: new Int8Array(SYNTHETIC_CELL_COUNT),
    boundaryDriftV: new Int8Array(SYNTHETIC_CELL_COUNT),
  };
}

function plateMembership() {
  return Array.from({ length: ERA_COUNT }, () => new Int16Array(SYNTHETIC_CELL_COUNT));
}

describe("foundation/compute-tectonic-history-rollups", () => {
  it("saturates cumulative signals and measures the newest-era share", () => {
    const eras = [
      era({ uplift: [10, 100], collision: [1, 0], subduction: [0, 2] }),
      era({ uplift: [20, 100], collision: [2, 0], subduction: [0, 3] }),
      era({ uplift: [30, 100], collision: [3, 0], subduction: [0, 4] }),
      era({ uplift: [40, 100], collision: [4, 0], subduction: [0, 5] }),
      era({ uplift: [50, 100], collision: [5, 0], subduction: [0, 6] }),
    ];

    const history = computeTectonicHistoryRollups.run(
      {
        cellCount: SYNTHETIC_CELL_COUNT,
        eras,
        plateIdByEra: plateMembership(),
      },
      computeTectonicHistoryRollups.defaultConfig
    ).tectonicHistory;

    expect(Array.from(history.upliftTotal)).toEqual([150, 255]);
    expect(Array.from(history.upliftRecentFraction)).toEqual([85, 100]);
    expect(Array.from(history.collisionTotal)).toEqual([15, 0]);
    expect(Array.from(history.subductionTotal)).toEqual([0, 20]);
  });

  it("records the newest signal strictly above the activity threshold", () => {
    const selection = computeTectonicHistoryRollups.normalize({
      strategy: "cumulative-era-rollup",
      config: { activityThreshold: 10 },
    });
    const eras = [
      era(),
      era({ rift: [11, 0] }),
      era({ collision: [11, 0] }),
      era({ subduction: [10, 0], fracture: [10, 0] }),
      era(),
    ];

    const history = computeTectonicHistoryRollups.run(
      {
        cellCount: SYNTHETIC_CELL_COUNT,
        eras,
        plateIdByEra: plateMembership(),
      },
      selection
    ).tectonicHistory;

    expect(Array.from(history.lastActiveEra)).toEqual([1, 255]);
    expect(Array.from(history.lastCollisionEra)).toEqual([2, 255]);
    expect(Array.from(history.lastSubductionEra)).toEqual([255, 255]);
  });
});

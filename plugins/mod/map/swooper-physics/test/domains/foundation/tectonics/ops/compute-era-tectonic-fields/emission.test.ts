import { describe, expect, it } from "bun:test";

import {
  EVENT_TYPE,
  type TectonicEvent,
} from "../../../../../../src/domain/foundation/modules/tectonics/model/atoms/index.js";
import foundation from "../../../../../../src/domain/foundation/router.js";
import { BOUNDARY_TYPE } from "@swooper/mapgen-core/lib/plates";

const { computeEraTectonicFields } = foundation.tectonics.ops;

const SYNTHETIC_LINE_MESH = {
  cellCount: 3,
  wrapWidth: 100,
  siteX: new Float32Array([0, 1, 2]),
  siteY: new Float32Array(3),
  neighborsOffsets: new Int32Array([0, 1, 3, 4]),
  neighbors: new Int32Array([1, 0, 2, 1]),
} as const;

function event(overrides: Partial<TectonicEvent>): TectonicEvent {
  return {
    eventType: EVENT_TYPE.transformShear,
    plateA: 0,
    plateB: 1,
    polarity: 0,
    intensityUplift: 0,
    intensityRift: 0,
    intensityShear: 0,
    intensityVolcanism: 0,
    intensityFracture: 0,
    driftU: 0,
    driftV: 0,
    seedCells: [1],
    originPlateId: -1,
    ...overrides,
  };
}

describe("foundation/compute-era-tectonic-fields", () => {
  it("emits subduction into convergent uplift, arc volcanism, and polarity fields", () => {
    const fields = computeEraTectonicFields.run(
      {
        mesh: SYNTHETIC_LINE_MESH,
        segmentEvents: [
          event({
            eventType: EVENT_TYPE.convergenceSubduction,
            polarity: -1,
            intensityUplift: 100,
            intensityVolcanism: 80,
            intensityFracture: 20,
            driftU: 64,
            originPlateId: 9,
          }),
        ],
        hotspotEvents: [],
        weight: 1,
        eraGain: 1,
      },
      computeEraTectonicFields.defaultConfig
    ).eraFields;

    expect(fields.boundaryType[1]).toBe(BOUNDARY_TYPE.convergent);
    expect(fields.boundaryPolarity[1]).toBe(-1);
    expect(fields.upliftPotential[1]).toBe(100);
    expect(fields.subductionPotential[1]).toBe(100);
    expect(fields.collisionPotential[1]).toBe(0);
    expect(fields.volcanism[1]).toBe(80);
    expect(fields.volcanismOriginPlate[1]).toBe(9);
    expect(fields.volcanismEventType[1]).toBe(EVENT_TYPE.convergenceSubduction);
    expect(fields.boundaryDriftU[1]).toBe(64);
    expect(fields.upliftPotential[0]).toBeLessThan(fields.upliftPotential[1] ?? 0);
  });

  it("emits divergent events into rift fields with their originating plate", () => {
    const fields = computeEraTectonicFields.run(
      {
        mesh: SYNTHETIC_LINE_MESH,
        segmentEvents: [
          event({
            eventType: EVENT_TYPE.divergenceRift,
            intensityRift: 90,
            intensityFracture: 30,
            seedCells: [0],
            originPlateId: 3,
          }),
        ],
        hotspotEvents: [],
        weight: 1,
        eraGain: 1,
      },
      computeEraTectonicFields.defaultConfig
    ).eraFields;

    expect(fields.boundaryType[0]).toBe(BOUNDARY_TYPE.divergent);
    expect(fields.riftPotential[0]).toBe(90);
    expect(fields.riftOriginPlate[0]).toBe(3);
    expect(fields.upliftPotential[0]).toBe(0);
  });
});

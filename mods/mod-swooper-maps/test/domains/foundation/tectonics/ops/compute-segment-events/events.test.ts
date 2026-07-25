import { describe, expect, it } from "bun:test";

import { EVENT_TYPE } from "@mapgen/domain/foundation/modules/tectonics/model/atoms";
import foundation from "@mapgen/domain/foundation/router";
import { BOUNDARY_TYPE } from "@swooper/mapgen-core/lib/plates";

const { computeSegmentEvents } = foundation.tectonics.ops;

type Segment = Readonly<{
  aCell: number;
  bCell: number;
  plateA: number;
  plateB: number;
  regime: number;
  polarity?: number;
  compression?: number;
  extension?: number;
  shear?: number;
  volcanism?: number;
  fracture?: number;
  driftU?: number;
  driftV?: number;
}>;

function segmentTable(records: readonly Segment[]) {
  return {
    segmentCount: records.length,
    aCell: Int32Array.from(records, (record) => record.aCell),
    bCell: Int32Array.from(records, (record) => record.bCell),
    plateA: Int16Array.from(records, (record) => record.plateA),
    plateB: Int16Array.from(records, (record) => record.plateB),
    regime: Uint8Array.from(records, (record) => record.regime),
    polarity: Int8Array.from(records, (record) => record.polarity ?? 0),
    compression: Uint8Array.from(records, (record) => record.compression ?? 0),
    extension: Uint8Array.from(records, (record) => record.extension ?? 0),
    shear: Uint8Array.from(records, (record) => record.shear ?? 0),
    volcanism: Uint8Array.from(records, (record) => record.volcanism ?? 0),
    fracture: Uint8Array.from(records, (record) => record.fracture ?? 0),
    driftU: Int8Array.from(records, (record) => record.driftU ?? 0),
    driftV: Int8Array.from(records, (record) => record.driftV ?? 0),
  };
}

describe("foundation/compute-segment-events", () => {
  it("distinguishes subduction from continental collision and assigns event origins", () => {
    const events = computeSegmentEvents.run(
      {
        mesh: { cellCount: 4 },
        crust: { type: new Uint8Array([0, 1, 1, 1]) },
        segments: segmentTable([
          {
            aCell: 0,
            bCell: 1,
            plateA: 3,
            plateB: 8,
            regime: BOUNDARY_TYPE.convergent,
            polarity: -1,
            compression: 120,
            volcanism: 70,
            fracture: 30,
            driftU: 12,
            driftV: -4,
          },
          {
            aCell: 2,
            bCell: 3,
            plateA: 5,
            plateB: 2,
            regime: BOUNDARY_TYPE.convergent,
            polarity: 1,
            compression: 90,
          },
        ]),
      },
      computeSegmentEvents.defaultConfig
    ).events;

    expect(events[0]).toMatchObject({
      eventType: EVENT_TYPE.convergenceSubduction,
      polarity: -1,
      intensityUplift: 120,
      intensityVolcanism: 70,
      intensityFracture: 30,
      originPlateId: 8,
      seedCells: [0, 1],
      driftU: 12,
      driftV: -4,
    });
    expect(events[1]).toMatchObject({
      eventType: EVENT_TYPE.convergenceCollision,
      polarity: 0,
      intensityUplift: 90,
      originPlateId: 2,
      seedCells: [2, 3],
    });
  });

  it("routes divergent and transform segments into their distinct event channels", () => {
    const events = computeSegmentEvents.run(
      {
        mesh: { cellCount: 4 },
        crust: { type: new Uint8Array(4) },
        segments: segmentTable([
          {
            aCell: 0,
            bCell: 1,
            plateA: 0,
            plateB: 1,
            regime: BOUNDARY_TYPE.divergent,
            extension: 80,
            volcanism: 20,
            fracture: 10,
          },
          {
            aCell: 2,
            bCell: 3,
            plateA: 2,
            plateB: 3,
            regime: BOUNDARY_TYPE.transform,
            shear: 90,
            fracture: 60,
          },
        ]),
      },
      computeSegmentEvents.defaultConfig
    ).events;

    expect(events[0]).toMatchObject({
      eventType: EVENT_TYPE.divergenceRift,
      polarity: 0,
      intensityRift: 80,
      intensityVolcanism: 20,
      intensityFracture: 10,
      originPlateId: 0,
    });
    expect(events[1]).toMatchObject({
      eventType: EVENT_TYPE.transformShear,
      polarity: 0,
      intensityShear: 90,
      intensityFracture: 60,
      originPlateId: -1,
    });
  });
});

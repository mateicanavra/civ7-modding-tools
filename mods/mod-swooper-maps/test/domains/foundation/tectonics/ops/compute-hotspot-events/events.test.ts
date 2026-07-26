import { describe, expect, it } from "bun:test";

import { EVENT_TYPE } from "@mapgen/domain/foundation/modules/tectonics/model/atoms";
import foundation from "@mapgen/domain/foundation/router";

const { computeHotspotEvents } = foundation.tectonics.ops;

describe("foundation/compute-hotspot-events", () => {
  it("emits plate-owned hotspots only where active upwelling has forcing", () => {
    const events = computeHotspotEvents.run(
      {
        mesh: { cellCount: 3 },
        mantleForcing: {
          upwellingClass: new Int8Array([1, 0, 1]),
          forcingMag: new Float32Array([0.5, 1, 0]),
          stress: new Float32Array([0.5, 1, 1]),
          forcingU: new Float32Array([1, 0, 1]),
          forcingV: new Float32Array(3),
        },
        eraPlateId: new Int16Array([7, 8, 9]),
      },
      computeHotspotEvents.defaultConfig
    ).events;

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      eventType: EVENT_TYPE.intraplateHotspot,
      seedCells: [0],
      originPlateId: 7,
      intensityUplift: 46,
      intensityVolcanism: 102,
      intensityFracture: 36,
      driftU: 127,
      driftV: 0,
    });
  });
});

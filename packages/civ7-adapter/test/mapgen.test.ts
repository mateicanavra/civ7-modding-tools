import { describe, expect, it } from "bun:test";
import { snapshotEngineHeightfield } from "../src/mapgen.js";
import { createMockAdapter } from "../src/mock-adapter.js";

describe("MapGen engine observation", () => {
  it("captures detached terrain, elevation, and land-mask evidence", () => {
    const adapter = createMockAdapter({
      width: 2,
      height: 2,
      defaultTerrainType: 7,
      defaultElevation: 19,
    });
    adapter.setWater(1, 0, true);

    const snapshot = snapshotEngineHeightfield(adapter);

    expect(Array.from(snapshot.terrain)).toEqual([7, 7, 7, 7]);
    expect(Array.from(snapshot.elevation)).toEqual([19, 19, 19, 19]);
    expect(Array.from(snapshot.landMask)).toEqual([1, 0, 1, 1]);

    adapter.setTerrainType(0, 0, 9);
    adapter.setWater(0, 0, true);
    expect(Array.from(snapshot.terrain)).toEqual([7, 7, 7, 7]);
    expect(Array.from(snapshot.landMask)).toEqual([1, 0, 1, 1]);
  });
});

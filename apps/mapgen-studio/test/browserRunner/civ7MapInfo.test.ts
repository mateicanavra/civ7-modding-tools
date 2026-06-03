import { describe, expect, it } from "vitest";

import { buildBrowserRunMapInfo } from "../../src/browser-runner/civ7MapInfo";

describe("browser runner Civ7 map info", () => {
  it("uses the Civ7 Standard map row instead of synthesizing player landmasses from UI player count", () => {
    const mapInfo = buildBrowserRunMapInfo({
      mapSizeId: "MAPSIZE_STANDARD",
      dimensions: { width: 84, height: 54 },
      resourcesMode: "balanced",
    });

    expect(mapInfo.GridWidth).toBe(84);
    expect(mapInfo.GridHeight).toBe(54);
    expect(mapInfo.DefaultPlayers).toBe(8);
    expect(mapInfo.PlayersLandmass1).toBe(5);
    expect(mapInfo.PlayersLandmass2).toBe(3);
    expect(mapInfo.StartSectorRows).toBe(4);
    expect(mapInfo.StartSectorCols).toBe(3);
    expect(mapInfo.StudioResourcesMode).toBe("balanced");
  });
});

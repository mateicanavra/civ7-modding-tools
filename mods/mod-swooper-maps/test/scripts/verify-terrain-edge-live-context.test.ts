import { describe, expect, test } from "bun:test";

import { NO_RIVER_TYPE } from "@civ7/map-policy";
import type { FinalSurfaceSnapshot } from "../../scripts/live/live-parity";
import { buildTerrainDeltaEdgeContexts } from "../../scripts/live/surface-delta-context";
import { summarizeTerrainEdgeReadbackCompleteness } from "../../scripts/live/verify-terrain-edge-live-context";

type TerrainRows = Parameters<typeof summarizeTerrainEdgeReadbackCompleteness>[0];
type MapGrid = Parameters<typeof summarizeTerrainEdgeReadbackCompleteness>[1];

const SYNTHETIC_DIMENSIONS = { width: 1, height: 1 } as const;

function terrainRows(): TerrainRows {
  const snapshot = (source: FinalSurfaceSnapshot["source"], terrain: number) => ({
    source,
    ...SYNTHETIC_DIMENSIONS,
    surfaces: {
      terrain: { ...SYNTHETIC_DIMENSIONS, values: [terrain] },
      biome: { ...SYNTHETIC_DIMENSIONS, values: [null] },
      feature: { ...SYNTHETIC_DIMENSIONS, values: [null] },
      resource: { ...SYNTHETIC_DIMENSIONS, values: [null] },
    },
  });
  return buildTerrainDeltaEdgeContexts({
    local: snapshot("local-mapgen", 4),
    live: snapshot("live-civ7", 3),
  });
}

describe("terrain-edge live context verifier", () => {
  test("blocks complete readback when requested row facts are missing or failed", () => {
    const completeness = summarizeTerrainEdgeReadbackCompleteness(terrainRows(), {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "1", name: "Tuner" },
      fields: ["terrain", "hydrology", "areaRegion"],
      plotCount: 1,
      omitted: 0,
      hiddenInfoPolicy: "not-player-scoped",
      plots: [
        {
          location: { x: 0, y: 0, index: { ok: true, value: 0 } },
          hiddenInfoPolicy: "not-player-scoped",
          facts: {
            terrain: { ok: true, value: 3 },
            water: { ok: true, value: true },
            lake: { ok: true, value: false },
            riverType: { ok: true, value: NO_RIVER_TYPE },
            areaId: { ok: false, error: "MapAreas unavailable" },
            regionId: { ok: true, value: -1 },
          },
        },
      ],
    } satisfies MapGrid);

    expect(completeness.status).toBe("blocked");
    expect(completeness.blockedBy).toEqual([
      "live-terrain-readback.areaId.failed",
      "live-terrain-readback.landmassId.missing",
    ]);
    expect(completeness.factIssues).toMatchObject([
      { x: 0, y: 0, plotIndex: 0, field: "areaId", status: "failed" },
      { x: 0, y: 0, plotIndex: 0, field: "landmassId", status: "missing" },
    ]);
  });

  test("blocks complete readback when requested row facts have no value", () => {
    const completeness = summarizeTerrainEdgeReadbackCompleteness(terrainRows(), {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "1", name: "Tuner" },
      fields: ["terrain", "hydrology", "areaRegion"],
      plotCount: 1,
      omitted: 0,
      hiddenInfoPolicy: "not-player-scoped",
      plots: [
        {
          location: { x: 0, y: 0, index: { ok: true, value: 0 } },
          hiddenInfoPolicy: "not-player-scoped",
          facts: {
            terrain: { ok: true, value: 4 },
            water: { ok: true, value: true },
            lake: { ok: true, value: false },
            riverType: { ok: true, value: undefined },
            areaId: { ok: true, value: 7 },
            regionId: { ok: true, value: -1 },
            landmassId: { ok: true, value: -1 },
          },
        },
      ],
    } satisfies MapGrid);

    expect(completeness.status).toBe("blocked");
    expect(completeness.blockedBy).toEqual(["live-terrain-readback.riverType.failed"]);
    expect(completeness.factIssues).toMatchObject([
      { x: 0, y: 0, plotIndex: 0, field: "riverType", status: "failed" },
    ]);
  });
});

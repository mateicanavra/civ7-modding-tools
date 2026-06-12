import { describe, expect, test } from "bun:test";

import { NO_RIVER_TYPE } from "../../packages/civ7-map-policy/src/index.ts";
import { summarizeTerrainEdgeReadbackCompleteness } from "./verify-terrain-edge-live-context";

type TerrainRows = Parameters<typeof summarizeTerrainEdgeReadbackCompleteness>[0];
type MapGrid = Parameters<typeof summarizeTerrainEdgeReadbackCompleteness>[1];

describe("terrain-edge live context verifier", () => {
  test("blocks complete readback when requested row facts are missing or failed", () => {
    const completeness = summarizeTerrainEdgeReadbackCompleteness(
      [
        {
          x: 73,
          y: 36,
          plotIndex: 3889,
        },
      ] as TerrainRows,
      {
        host: "127.0.0.1",
        port: 4318,
        state: { id: "1", name: "Tuner" },
        fields: ["terrain", "hydrology", "areaRegion"],
        plotCount: 1,
        omitted: 0,
        hiddenInfoPolicy: "not-player-scoped",
        plots: [
          {
            location: { x: 73, y: 36, index: { ok: true, value: 3889 } },
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
      } as MapGrid
    );

    expect(completeness.status).toBe("blocked");
    expect(completeness.blockedBy).toEqual([
      "live-terrain-readback.areaId.failed",
      "live-terrain-readback.landmassId.missing",
    ]);
    expect(completeness.factIssues).toMatchObject([
      { x: 73, y: 36, plotIndex: 3889, field: "areaId", status: "failed" },
      { x: 73, y: 36, plotIndex: 3889, field: "landmassId", status: "missing" },
    ]);
  });

  test("blocks complete readback when requested row facts have no value", () => {
    const completeness = summarizeTerrainEdgeReadbackCompleteness(
      [
        {
          x: 65,
          y: 39,
          plotIndex: 4199,
        },
      ] as TerrainRows,
      {
        host: "127.0.0.1",
        port: 4318,
        state: { id: "1", name: "Tuner" },
        fields: ["terrain", "hydrology", "areaRegion"],
        plotCount: 1,
        omitted: 0,
        hiddenInfoPolicy: "not-player-scoped",
        plots: [
          {
            location: { x: 65, y: 39, index: { ok: true, value: 4199 } },
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
      } as MapGrid
    );

    expect(completeness.status).toBe("blocked");
    expect(completeness.blockedBy).toEqual(["live-terrain-readback.riverType.failed"]);
    expect(completeness.factIssues).toMatchObject([
      { x: 65, y: 39, plotIndex: 4199, field: "riverType", status: "failed" },
    ]);
  });
});

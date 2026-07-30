import { describe, expect, test } from "bun:test";
import { CIV7_BROWSER_TABLES_V0, RIVER_TYPE_MINOR } from "@civ7/map-policy";
import {
  projectStandardLiveParityCapture,
  type StandardLiveObservation,
} from "../../../../src/recipes/standard/parity/index.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../setup.js";

const OBSERVATION_DIMENSIONS = TEST_MAP_SIZE.dimensions;
const OBSERVATION_PLOT_COUNT = OBSERVATION_DIMENSIONS.width * OBSERVATION_DIMENSIONS.height;
const TUNER_STATE = { id: "tuner", name: "Tuner" } as const;

describe("Standard live parity observation", () => {
  test("preserves missing cells and projects Civ7 river semantics without coercion", () => {
    const terrain = CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_NAVIGABLE_RIVER;
    const plotsByIndex = new Array<StandardLiveObservation["surface"]["plotsByIndex"][number]>(
      OBSERVATION_PLOT_COUNT
    ).fill(null);
    plotsByIndex[0] = {
      location: {
        x: 0,
        y: 0,
        index: { ok: true, value: 0 },
      },
      hiddenInfoPolicy: "not-player-scoped",
      facts: {
        terrain: { ok: true, value: terrain },
        biome: { ok: true, value: 4 },
        feature: { ok: true, value: 8 },
        resource: { ok: true, value: -1 },
        riverType: { ok: true, value: RIVER_TYPE_MINOR },
        river: { ok: true, value: true },
        navigableRiver: { ok: true, value: false },
      },
    };
    const observation = observationFixture({ plotsByIndex });

    const capture = projectStandardLiveParityCapture(observation);

    expect(capture.identity).toEqual({
      wireConnectionEpoch: 1,
      mapSeed: TEST_MAP_SEED,
      turn: 3,
    });
    expect(capture.surface.grids.terrain.values.slice(0, 2)).toEqual([terrain, null]);
    expect(capture.surface.grids.biome.values.slice(0, 2)).toEqual([4, null]);
    const rivers = capture.hydrology.rivers;
    expect(rivers.terrainNavigableRiver.values.slice(0, 2)).toEqual([1, null]);
    expect(rivers.riverType.values.slice(0, 2)).toEqual([RIVER_TYPE_MINOR, null]);
    expect(rivers.river.values.slice(0, 2)).toEqual([1, null]);
    expect(rivers.navigableRiver.values.slice(0, 2)).toEqual([0, null]);
    expect(rivers.minorRiver.values.slice(0, 2)).toEqual([1, null]);
    expect(rivers.nativeObjects).toEqual({ status: "present", count: 1, sampleCount: 0 });
    expect(capture.fullGrid).toMatchObject({
      plotCount: OBSERVATION_PLOT_COUNT,
      observedPlotCount: 1,
      identityStable: true,
    });
    expect(capture.fullGrid.missingPlotIndices).toHaveLength(OBSERVATION_PLOT_COUNT - 1);
    expect(capture.fullGrid.missingPlotIndices[0]).toBe(1);
  });

  test("keeps unavailable native river objects as an explicit blocked channel", () => {
    const observation = observationFixture({
      nativeRiverObjects: {
        host: "127.0.0.1",
        port: 4318,
        state: TUNER_STATE,
        exists: false,
        numRivers: { ok: false, error: "MapRivers unavailable" },
        samples: [],
        truncated: false,
      },
    });

    const capture = projectStandardLiveParityCapture(observation);

    expect(capture.hydrology.rivers.nativeObjects).toEqual({
      status: "unavailable",
      blockedBy: [
        "live-observation.native-river-objects.exists",
        "live-observation.native-river-objects.num-rivers",
      ],
    });
  });
});

function observationFixture(
  overrides: Readonly<
    Partial<Pick<StandardLiveObservation["surface"], "plotsByIndex" | "missingPlotIndices">> & {
      nativeRiverObjects?: StandardLiveObservation["nativeRiverObjects"];
    }
  >
): StandardLiveObservation {
  const { width, height } = OBSERVATION_DIMENSIONS;
  const plotsByIndex =
    overrides.plotsByIndex ??
    new Array<StandardLiveObservation["surface"]["plotsByIndex"][number]>(
      OBSERVATION_PLOT_COUNT
    ).fill(null);
  const missingPlotIndices =
    overrides.missingPlotIndices ??
    plotsByIndex.flatMap((plot, index) => (plot === null ? [index] : []));
  return {
    identity: {
      stable: true,
      checked: [
        "wire.connectionEpoch",
        "wire.endpoint.host",
        "wire.endpoint.port",
        "wire.tunerState.id",
        "wire.tunerState.name",
        "map.width",
        "map.height",
        "map.plotCount",
        "map.randomSeed",
        "game.turn",
      ],
      wire: {
        connectionEpoch: 1,
        endpoint: {
          host: "127.0.0.1",
          port: 4318,
        },
        tunerState: TUNER_STATE,
      },
      map: {
        width,
        height,
        plotCount: width * height,
        randomSeed: TEST_MAP_SEED,
      },
      game: { turn: 3 },
    },
    surface: {
      width,
      height,
      plotCount: width * height,
      observedPlotCount: plotsByIndex.filter((plot) => plot !== null).length,
      plotsByIndex,
      missingPlotIndices,
    },
    nativeRiverObjects: overrides.nativeRiverObjects ?? {
      host: "127.0.0.1",
      port: 4318,
      state: TUNER_STATE,
      exists: true,
      numRivers: { ok: true, value: 1 },
      samples: [],
      truncated: false,
    },
  };
}

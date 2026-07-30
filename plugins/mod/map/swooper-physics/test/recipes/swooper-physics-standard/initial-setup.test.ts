import { describe, expect, it } from "bun:test";
import type { Civ7SetupOptionEvidence } from "@civ7/adapter";
import {
  BOUNDED_JSON_LOG_MAX_LINE_LENGTH,
  decodeBoundedJsonLogSeries,
  encodeBoundedJsonLogLines,
} from "@swooper/mapgen-core/lib/log";

import {
  admitStandardMapConfig,
  type StandardMapConfigEnvelope,
} from "../../../src/maps/configs/canonical.js";
import swooperEarthlikeRaw from "../../../src/maps/configs/swooper-earthlike.config.json";
import {
  createUnavailableStandardInitialOptionEvidence,
  projectStandardInitialSetup,
  STANDARD_INITIAL_SETUP,
  type StandardCiv7SetupCapture,
} from "../../../src/recipes/standard/initial-setup.js";
import standardRecipe from "../../../src/recipes/standard/recipe.js";
import { TEST_GAME_SEED, TEST_MAP_SEED, TEST_MAP_SIZE } from "../../setup.js";

const standardMapConfig: StandardMapConfigEnvelope = admitStandardMapConfig(swooperEarthlikeRaw);

describe("Standard recipe initial setup", () => {
  it("projects one immutable Standard launch setup", () => {
    const capture = captureFixture();
    const setup = projectStandardInitialSetup(capture);

    expect(setup).toEqual({
      map: {
        mapSeed: TEST_MAP_SEED,
        latitudeBounds: standardMapConfig.latitudeBounds,
        selection: {
          kind: "civ7-preset",
          id: TEST_MAP_SIZE.id,
          dimensions: TEST_MAP_SIZE.dimensions,
          mapInfo: TEST_MAP_SIZE.mapInfo,
          startSlotCapacity: startSlotCapacity(),
        },
      },
      gameSeed: TEST_GAME_SEED,
      aliveMajorPlayerIds: [7, 2, 11],
      options: {
        map: unavailableMapEvidence(),
        game: unavailableGameEvidence(),
        player: unavailablePlayerEvidence([7, 2, 11]),
      },
    });
    expect(Object.isFrozen(setup)).toBe(true);
    expect(Object.isFrozen(setup.map)).toBe(true);
    expect(Object.isFrozen(setup.map.latitudeBounds)).toBe(true);
    expect(Object.isFrozen(setup.map.selection)).toBe(true);
    expect(Object.isFrozen(setup.map.selection.dimensions)).toBe(true);
    expect(Object.isFrozen(setup.map.selection.mapInfo)).toBe(true);
    expect(Object.isFrozen(setup.map.selection.startSlotCapacity)).toBe(true);
    expect(Object.isFrozen(setup.aliveMajorPlayerIds)).toBe(true);
    expect(Object.isFrozen(setup.options.map)).toBe(true);
    expect(Object.isFrozen(setup.options.game)).toBe(true);
    expect(Object.isFrozen(setup.options.player)).toBe(true);

    expect(() => standardRecipe.compileConfig(setup, standardMapConfig.config)).not.toThrow();
  });

  it("preserves exact player order and refuses empty or over-capacity observations", () => {
    const ordered = projectStandardInitialSetup(captureFixture({ aliveMajorPlayerIds: [3, 0, 2] }));
    expect(ordered.aliveMajorPlayerIds).toEqual([3, 0, 2]);

    expect(() =>
      standardRecipe.compileConfig(
        projectStandardInitialSetup(captureFixture({ aliveMajorPlayerIds: [3, 0, 3] })),
        standardMapConfig.config
      )
    ).toThrow();

    expect(() =>
      standardRecipe.compileConfig(
        projectStandardInitialSetup(captureFixture({ aliveMajorPlayerIds: [] })),
        standardMapConfig.config
      )
    ).toThrow();

    expect(() =>
      standardRecipe.compileConfig(
        projectStandardInitialSetup(
          captureFixture({
            aliveMajorPlayerIds: Array.from(
              { length: startSlotCapacity().total + 1 },
              (_, index) => index
            ),
          })
        ),
        standardMapConfig.config
      )
    ).toThrow("alive-major players exceed start-slot capacity");
  });

  it("fails closed when physical dimensions disagree or latitude evidence is unordered", () => {
    expect(() =>
      standardRecipe.compileConfig(
        projectStandardInitialSetup(
          captureFixture({
            dimensions: {
              width: TEST_MAP_SIZE.dimensions.width + 1,
              height: TEST_MAP_SIZE.dimensions.height,
            },
          })
        ),
        standardMapConfig.config
      )
    ).toThrow("map dimensions");

    expect(() =>
      standardRecipe.compileConfig(
        projectStandardInitialSetup(
          captureFixture({
            latitudeBounds: {
              topLatitude: 0,
              bottomLatitude: 0,
            },
          })
        ),
        standardMapConfig.config
      )
    ).toThrow("topLatitude must be greater than bottomLatitude");
  });

  it("fails closed when captured map facts or slot capacity disagree with policy", () => {
    expect(() =>
      standardRecipe.compileConfig(
        projectStandardInitialSetup(
          captureFixture({
            mapInfo: {
              ...TEST_MAP_SIZE.mapInfo,
              NumNaturalWonders: TEST_MAP_SIZE.mapInfo.NumNaturalWonders + 1,
            },
          })
        ),
        standardMapConfig.config
      )
    ).toThrow("mapInfo.NumNaturalWonders");

    expect(() =>
      projectStandardInitialSetup(
        captureFixture({
          mapInfo: {
            ...TEST_MAP_SIZE.mapInfo,
            Name: undefined,
          },
        })
      )
    ).toThrow("Civ7 Standard map info must match the complete generated column schema");

    expect(() =>
      standardRecipe.compileConfig(
        projectStandardInitialSetup(
          captureFixture({
            startSlotCapacity: {
              ...startSlotCapacity(),
              total: startSlotCapacity().total + 1,
            },
          })
        ),
        standardMapConfig.config
      )
    ).toThrow("start-slot capacity");
  });

  it("requires complete option evidence in the exact explicitly requested order", () => {
    expect(() =>
      standardRecipe.compileConfig(
        projectStandardInitialSetup(
          captureFixture({
            options: {
              map: unavailableMapEvidence().slice(1),
              game: unavailableGameEvidence(),
              player: unavailablePlayerEvidence(),
            },
          })
        ),
        standardMapConfig.config
      )
    ).toThrow("map option evidence keys");

    const reversedGameEvidence = [...unavailableGameEvidence()].reverse();
    expect(() =>
      standardRecipe.compileConfig(
        projectStandardInitialSetup(
          captureFixture({
            options: {
              map: unavailableMapEvidence(),
              game: reversedGameEvidence,
              player: unavailablePlayerEvidence(),
            },
          })
        ),
        standardMapConfig.config
      )
    ).toThrow("game option evidence keys");

    expect(() =>
      standardRecipe.compileConfig(
        projectStandardInitialSetup(
          captureFixture({
            options: {
              map: unavailableMapEvidence(),
              game: unavailableGameEvidence(),
              player: [...unavailablePlayerEvidence()].reverse(),
            },
          })
        ),
        standardMapConfig.config
      )
    ).toThrow("player option evidence must preserve exact alive-major player order");
  });

  it("admits available option evidence only against the official schema for its exact key", () => {
    const mapEvidence = unavailableMapEvidence();
    const gameEvidence = unavailableGameEvidence();

    expect(() =>
      standardRecipe.compileConfig(
        projectStandardInitialSetup(
          captureFixture({
            options: {
              map: replaceEvidence(mapEvidence, "MapSeaLevel", {
                status: "available",
                key: "MapSeaLevel",
                value: true,
              }),
              game: gameEvidence,
              player: unavailablePlayerEvidence(),
            },
          })
        ),
        standardMapConfig.config
      )
    ).toThrow();

    expect(() =>
      standardRecipe.compileConfig(
        projectStandardInitialSetup(
          captureFixture({
            options: {
              map: mapEvidence,
              game: replaceEvidence(gameEvidence, "MaxTurns", {
                status: "available",
                key: "MaxTurns",
                value: "unbounded",
              }),
              player: unavailablePlayerEvidence(),
            },
          })
        ),
        standardMapConfig.config
      )
    ).toThrow();

    const admitted = projectStandardInitialSetup(
      captureFixture({
        options: {
          map: replaceEvidence(mapEvidence, "MapSeaLevel", {
            status: "available",
            key: "MapSeaLevel",
            value: "SEA_LEVEL_STANDARD",
          }),
          game: replaceEvidence(gameEvidence, "MaxTurns", {
            status: "available",
            key: "MaxTurns",
            value: 300,
          }),
          player: unavailablePlayerEvidence(),
        },
      })
    );
    expect(() => standardRecipe.compileConfig(admitted, standardMapConfig.config)).not.toThrow();
  });

  it("projects physical setup from map seed rather than gameplay seed", () => {
    const setup = projectStandardInitialSetup(
      captureFixture({
        mapSeed: TEST_MAP_SEED,
        gameSeed: TEST_GAME_SEED,
      })
    );

    expect(TEST_MAP_SEED).not.toBe(TEST_GAME_SEED);
    expect(STANDARD_INITIAL_SETUP.physical(setup)).toEqual({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: standardMapConfig.latitudeBounds,
    });
  });

  it("qualifies Civ7's numeric live lookup key from the captured row identity", () => {
    const setup = projectStandardInitialSetup(captureFixture({ mapSizeId: 4 }));

    expect(setup.map.selection).toMatchObject({
      kind: "civ7-preset",
      id: TEST_MAP_SIZE.id,
      dimensions: TEST_MAP_SIZE.dimensions,
    });
    expect(() => standardRecipe.compileConfig(setup, standardMapConfig.config)).not.toThrow();
  });

  it("admits explicit custom dimensions only with complete internally consistent map facts", () => {
    const custom = customInitialSetup();

    expect(() => standardRecipe.compileConfig(custom, standardMapConfig.config)).not.toThrow();
    expect(custom.map.selection.id).toBe("MAPSIZE_CUSTOM");

    expect(() =>
      standardRecipe.compileConfig(
        {
          ...custom,
          map: {
            ...custom.map,
            selection: { ...custom.map.selection, id: " MAPSIZE_CUSTOM" },
          },
        },
        standardMapConfig.config
      )
    ).toThrow("custom map-size id must be an unpadded string");

    expect(() =>
      standardRecipe.compileConfig(
        {
          ...custom,
          map: {
            ...custom.map,
            selection: {
              ...custom.map.selection,
              mapInfo: {
                ...custom.map.selection.mapInfo,
                GridWidth: custom.map.selection.mapInfo.GridWidth + 1,
              },
            },
          },
        },
        standardMapConfig.config
      )
    ).toThrow("custom map dimensions");

    expect(() =>
      standardRecipe.compileConfig(
        {
          ...custom,
          map: {
            ...custom.map,
            selection: {
              ...custom.map.selection,
              startSlotCapacity: {
                ...custom.map.selection.startSlotCapacity,
                total: custom.map.selection.startSlotCapacity.total + 1,
              },
            },
          },
        },
        standardMapConfig.config
      )
    ).toThrow("custom start-slot capacity");
  });

  it("refuses unknown or contradictory GameInfo.Maps identity before recipe admission", () => {
    expect(() =>
      projectStandardInitialSetup(
        captureFixture({
          mapSizeId: "MAPSIZE_CUSTOM",
          mapInfo: { ...TEST_MAP_SIZE.mapInfo, MapSizeType: "MAPSIZE_CUSTOM" },
        })
      )
    ).toThrow("requires an official GameInfo.Maps MapSizeType");

    const mismatchedDimensions = projectStandardInitialSetup(
      captureFixture({ mapSizeId: 4, dimensions: { width: 1, height: 1 } })
    );
    expect(() =>
      standardRecipe.compileConfig(mismatchedDimensions, standardMapConfig.config)
    ).toThrow("map dimensions");

    expect(() =>
      projectStandardInitialSetup(
        captureFixture({
          mapSizeId: "MAPSIZE_HUGE",
          mapInfo: TEST_MAP_SIZE.mapInfo,
        })
      )
    ).toThrow("disagrees with GameInfo.Maps row identity");
  });

  it("carries a realistic noncontiguous-player setup through Civ7's physical line ceiling", () => {
    const setup = projectStandardInitialSetup(captureFixture({ aliveMajorPlayerIds: [7, 2, 11] }));
    const payload = {
      mapId: "studio-current",
      requestId: "run-standard-exact-setup",
      canonicalConfigDigest: "config-digest",
      launchEnvelopeDigest: "launch-digest",
      seed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      recipePlan: {
        recipeId: standardRecipe.id,
        planFingerprint: "a".repeat(64),
        initialSetup: { definitionId: STANDARD_INITIAL_SETUP.id, value: setup },
      },
    };
    const legacyLine = `[SWOOPER_MOD] [mapgen-evidence] ${JSON.stringify(payload)}`;
    const truncatedLegacyLine = legacyLine.slice(0, 1_022);

    expect(legacyLine.length).toBeGreaterThan(1_022);
    expect(() =>
      JSON.parse(truncatedLegacyLine.slice(truncatedLegacyLine.indexOf("{") || 0))
    ).toThrow();

    const lines = encodeBoundedJsonLogLines({
      prefix: "[SWOOPER_MOD]",
      marker: "[mapgen-evidence]",
      payload,
    });
    const engineObservedLines = lines.map((line) => line.slice(0, 1_022));

    expect(lines.length).toBeGreaterThan(1);
    expect(engineObservedLines).toEqual([...lines]);
    expect(lines.every((line) => line.length <= BOUNDED_JSON_LOG_MAX_LINE_LENGTH)).toBe(true);
    expect(
      decodeBoundedJsonLogSeries(engineObservedLines, "[mapgen-evidence]")[0]?.payload
    ).toEqual(payload);
  });
});

function captureFixture(
  overrides: Partial<StandardCiv7SetupCapture> = {}
): StandardCiv7SetupCapture {
  const aliveMajorPlayerIds = overrides.aliveMajorPlayerIds ?? [7, 2, 11];
  return {
    mapSeed: TEST_MAP_SEED,
    gameSeed: TEST_GAME_SEED,
    dimensions: TEST_MAP_SIZE.dimensions,
    latitudeBounds: standardMapConfig.latitudeBounds,
    mapSizeId: TEST_MAP_SIZE.id,
    mapInfo: TEST_MAP_SIZE.mapInfo,
    aliveMajorPlayerIds,
    startSlotCapacity: startSlotCapacity(),
    options: {
      map: unavailableMapEvidence(),
      game: unavailableGameEvidence(),
      player: unavailablePlayerEvidence(aliveMajorPlayerIds),
    },
    ...overrides,
  };
}

function customInitialSetup() {
  const dimensions = { width: 64, height: 42 } as const;
  const mapInfo = {
    MapSizeType: "MAPSIZE_CUSTOM",
    AllOnLargestLandmass: false,
    Continents: 3,
    DefaultPlayers: 5,
    Description: "LOC_MAPSIZE_CUSTOM_DESCRIPTION",
    GridWidth: dimensions.width,
    GridHeight: dimensions.height,
    LakeGenerationFrequency: 25,
    LakeSizeCutoff: 8,
    Name: "LOC_MAPSIZE_CUSTOM_NAME",
    NumNaturalWonders: 4,
    OceanWidth: 4,
    PlayersLandmass1: 3,
    PlayersLandmass2: 2,
    StartSectorRows: 3,
    StartSectorCols: 2,
  } as const;
  return {
    map: {
      mapSeed: TEST_MAP_SEED,
      latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
      selection: {
        kind: "custom" as const,
        id: "MAPSIZE_CUSTOM",
        dimensions,
        mapInfo,
        startSlotCapacity: {
          west: mapInfo.PlayersLandmass1,
          east: mapInfo.PlayersLandmass2,
          total: mapInfo.PlayersLandmass1 + mapInfo.PlayersLandmass2,
        },
      },
    },
    gameSeed: TEST_GAME_SEED,
    aliveMajorPlayerIds: [0, 1, 2],
    options: {
      map: unavailableMapEvidence(),
      game: unavailableGameEvidence(),
      player: unavailablePlayerEvidence([0, 1, 2]),
    },
  };
}

function startSlotCapacity(): StandardCiv7SetupCapture["startSlotCapacity"] {
  const west = TEST_MAP_SIZE.mapInfo.PlayersLandmass1;
  const east = TEST_MAP_SIZE.mapInfo.PlayersLandmass2;
  return { west, east, total: west + east };
}

function unavailableMapEvidence() {
  return createUnavailableStandardInitialOptionEvidence("value-unavailable", [0, 1, 2]).map;
}

function unavailableGameEvidence() {
  return createUnavailableStandardInitialOptionEvidence("value-unavailable", [0, 1, 2]).game;
}

function unavailablePlayerEvidence(playerIds: readonly number[] = [7, 2, 11]) {
  return createUnavailableStandardInitialOptionEvidence("value-unavailable", playerIds).player;
}

function replaceEvidence<
  const Evidence extends readonly Civ7SetupOptionEvidence[],
  const Key extends Evidence[number]["key"],
>(evidence: Evidence, key: Key, replacement: unknown): Evidence {
  return evidence.map((entry) => (entry.key === key ? replacement : entry)) as unknown as Evidence;
}

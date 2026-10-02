import { describe, expect, it } from "bun:test";
import { runInNewContext } from "node:vm";
import { createMockAdapter } from "@civ7/adapter";
import {
  CIV7_MAP_INFO_KEYS,
  type Civ7StandardMapSizeId,
  getCiv7StandardMapSizePreset,
} from "@civ7/map-policy";
import { createMapContext } from "@swooper/mapgen-core";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import {
  BOUNDED_JSON_LOG_MAX_LINE_LENGTH,
  decodeBoundedJsonLogSeries,
} from "@swooper/mapgen-core/lib/log";
import { sha256Hex, stableStringify } from "@swooper/mapgen-core/trace";
import standardRecipe, {
  createUnavailableStandardInitialOptionEvidence,
  projectStandardInitialSetup,
  STANDARD_STAGES,
} from "@swooper/swooper-physics/standard";
import {
  canonicalMapConfigContentDigest,
  canonicalMapConfigDigest,
} from "@swooper/swooper-physics/standard/map-config";
import { loadSwooperMapConfigCatalog } from "@swooper/swooper-physics/tooling/catalog-source";
import ts from "typescript";
import {
  RIVER_AUTHORED_FINALIZATION_VARIANTS,
  RIVER_AUTHORED_WRITE_ORDER_VARIANT,
  RIVER_DIRECTIONS,
  RIVER_PROBE_VARIANTS,
  riverProbeExpectedReceiver,
} from "./river-contract-map.fixture.js";
import {
  buildRiverProbePlan,
  riverProbeMapScript,
  type WaterHeightDiagnosticSelection,
} from "./river-contract-probe.fixture.js";
import {
  APP_UI_NAV_CLIFF_MAX_SOURCE_CELLS,
  buildAppUiNavWaterCliffDiagnosticScript,
  DIRECTIONAL_CLIFF_MAX_SHORE_EDGES,
  DIRECTIONAL_CLIFF_WAYPOINTS,
  type DirectionalCliffBindings,
  type DirectionalCliffStudy,
  installWaterHeightMaintenanceProbe,
  observeWaterHeightPhysicalLakes,
  projectLakeCutoffInitialSetup,
  readDirectionalCliffStudy,
  WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_ATLAS,
  WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE,
  WATER_HEIGHT_CLIFF_OBSERVATION_REVISION,
  WATER_HEIGHT_DRY_RETENTION_REPLAY_ATLAS,
  WATER_HEIGHT_DRY_RETENTION_REPLAY_PROBE,
  WATER_HEIGHT_LAKE_CUTOFF_PROBE,
  WATER_HEIGHT_MAINTENANCE_PROBE,
  WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE,
  WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_ATLAS,
  WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_PROBE,
  WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_ATLAS,
  WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_PROBE,
} from "./water-height-maintenance.fixture.js";

const appUiCliffInput = {
  proofId: "normal-huge-seed2-nav-cliffs",
  expected: { width: 106, height: 66, mapSeed: 2 },
  navSources: [
    { x: 105, y: 0 },
    { x: 1, y: 1 },
  ],
};
function appUiCliffFixture() {
  const nativeIds = [11, 17, 23, 29, 31, 37];
  const offsets = [
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, 0],
    [0, 1],
    [1, 1],
  ];
  const flagCalls: Array<{ x: number; y: number; direction: number }> = [];
  const pointCalls: Array<{ x: number; y: number }> = [];
  const sources = new Set(appUiCliffInput.navSources.map(({ x, y }) => `${x},${y}`));
  const bindings = {
    UI: { isInGame: () => true, isInShell: () => false, isInLoading: () => false },
    Game: { turn: 0 },
    Configuration: { getMap: () => ({ mapSeed: 2 }) },
    RiverTypes: { RIVER_NAVIGABLE: 7 },
    DirectionTypes: Object.fromEntries(
      ["EAST", "NORTHEAST", "NORTHWEST", "WEST", "SOUTHWEST", "SOUTHEAST"].map((symbol, index) => [
        `DIRECTION_${symbol}`,
        nativeIds[index],
      ])
    ) as Record<string, unknown>,
    GameplayMap: {
      getGridWidth: () => 106,
      getGridHeight: () => 66,
      getRandomSeed: () => 2,
      getAdjacentPlotLocation: ({ x, y }: { x: number; y: number }, direction: number) => {
        const offset = offsets[nativeIds.indexOf(direction)]!;
        return { x: x + offset[0]!, y: y + offset[1]! };
      },
      getElevation: (x: number, y: number) => {
        pointCalls.push({ x, y });
        return 100;
      },
      getTerrainType: () => 3,
      getRiverType: (x: number, y: number) => (sources.has(`${x},${y}`) ? 7 : -1),
      isWater: (x: number) => x === 0 || x === 2,
      isLake: (x: number) => x === 2,
      isCliffCrossing: function (x: number, y: number, direction: number) {
        expect(this).toBe(bindings.GameplayMap);
        flagCalls.push({ x, y, direction });
        return direction === 11;
      },
    } as Record<string, unknown>,
  };
  const observe = () =>
    JSON.parse(runInNewContext(buildAppUiNavWaterCliffDiagnosticScript(appUiCliffInput), bindings));
  return { bindings, flagCalls, pointCalls, observe };
}
describe("app-owned running AppUI NAV water cliff diagnostic", () => {
  it("admits only bounded unique finite source cells and exact integer identity before generating a command", () => {
    const navSources = Array.from({ length: APP_UI_NAV_CLIFF_MAX_SOURCE_CELLS }, (_, cell) => ({
      x: cell % 106,
      y: Math.floor(cell / 106),
    }));
    expect(buildAppUiNavWaterCliffDiagnosticScript({ ...appUiCliffInput, navSources })).toContain(
      "JSON.stringify("
    );
    const invalid: unknown[] = [
      null,
      { ...appUiCliffInput, extra: true },
      { ...appUiCliffInput, proofId: "bad proof" },
      ...[0, -1, 1.5, null, Number.NaN, Number.POSITIVE_INFINITY, 10001].map((width) => ({
        ...appUiCliffInput,
        expected: { ...appUiCliffInput.expected, width },
      })),
      ...[null, Number.NaN, Number.POSITIVE_INFINITY, 2.5, 0x8000_0000, -0x8000_0001].map(
        (mapSeed) => ({
          ...appUiCliffInput,
          expected: { ...appUiCliffInput.expected, mapSeed },
        })
      ),
      ...[
        { x: -1, y: 0 },
        { x: 106, y: 0 },
        { x: 1, y: 66 },
        { x: 1.5, y: 0 },
        { x: null, y: 0 },
        { x: 1, y: Number.NaN },
      ].map((point) => ({ ...appUiCliffInput, navSources: [point] })),
      { ...appUiCliffInput, navSources: [] },
      {
        ...appUiCliffInput,
        navSources: [appUiCliffInput.navSources[0], appUiCliffInput.navSources[0]],
      },
      { ...appUiCliffInput, navSources: [...navSources, { x: 0, y: 4 }] },
    ];
    for (const value of invalid)
      expect(() => buildAppUiNavWaterCliffDiagnosticScript(value)).toThrow();
  });

  it("reads exact native directions and true/false cliff flags independently of identical endpoint heights", () => {
    const { bindings, flagCalls, observe } = appUiCliffFixture();
    for (const owner of Object.values(bindings)) Object.freeze(owner);
    const result = observe();
    expect(result).toMatchObject({
      status: "observed",
      proofId: appUiCliffInput.proofId,
      directedRecordCount: 12,
    });
    expect(result.identity).toMatchObject({
      realm: "AppUI",
      turn: { source: "Game.turn", status: "available", value: 0 },
      mapSeed: { source: "Configuration.getMap().mapSeed", status: "available", value: 2 },
      width: { source: "GameplayMap.getGridWidth", status: "available", value: 106 },
    });
    expect(result.nativeDirections.map(({ value }: { value: number }) => value)).toEqual([
      11, 17, 23, 29, 31, 37,
    ]);
    const waterEdges = result.records.filter(
      (record: { ordinaryWaterReceiver: boolean }) => record.ordinaryWaterReceiver
    );
    expect(waterEdges.length).toBeGreaterThan(1);
    expect(
      waterEdges.some((record: { cliff: { value: boolean } }) => record.cliff.value === true)
    ).toBe(true);
    expect(
      waterEdges.some((record: { cliff: { value: boolean } }) => record.cliff.value === false)
    ).toBe(true);
    expect(result.records[0]).toMatchObject({
      from: { elevation: { value: 100 }, riverType: { value: 7 } },
      to: { x: 0, y: 0, elevation: { value: 100 }, lake: { value: false }, water: { value: true } },
      nativeAdjacent: {
        source: "GameplayMap.getAdjacentPlotLocation",
        raw: { x: 106, y: 0 },
        location: { x: 0, y: 0 },
      },
      cliff: { source: "GameplayMap.isCliffCrossing", status: "available", value: true },
    });
    expect(result.records[6].to.lake.value).toBe(true);
    expect(flagCalls).toHaveLength(10);
    expect(result.qualification).toContain("no cliff threshold, movement, navigation success");
  });

  it("canonicalizes native negative X and excludes out-of-range native Y before getters or flags", () => {
    const { bindings, pointCalls, flagCalls, observe } = appUiCliffFixture();
    bindings.GameplayMap.getAdjacentPlotLocation = (_point: unknown, direction: number) => ({
      x: direction === 11 ? -1 : 106,
      y: direction === 11 ? 0 : 66,
    });
    const result = observe();
    expect(result.status).toBe("observed");
    expect(result.records[0].to).toMatchObject({ x: 105, y: 0 });
    expect(result.records[1]).toMatchObject({
      nativeAdjacent: { status: "boundary", reason: "y-outside-grid" },
      cliff: { status: "not-read", reason: "y-outside-grid" },
    });
    expect(pointCalls.every(({ x, y }) => x >= 0 && x < 106 && y >= 0 && y < 66)).toBe(true);
    expect(flagCalls).toEqual([
      { x: 105, y: 0, direction: 11 },
      { x: 1, y: 1, direction: 11 },
    ]);
  });

  it.each([
    "missing",
    "duplicate",
    "null",
    "fractional",
    "negative",
    "throws",
  ])("refuses %s native directions without reading edge flags", (kind) => {
    const { bindings, flagCalls, observe } = appUiCliffFixture();
    if (kind === "throws")
      Object.defineProperty(bindings.DirectionTypes, "DIRECTION_EAST", {
        get() {
          throw new Error("enum failed");
        },
      });
    else
      bindings.DirectionTypes.DIRECTION_EAST =
        kind === "missing"
          ? undefined
          : kind === "duplicate"
            ? 29
            : kind === "null"
              ? null
              : kind === "fractional"
                ? 1.5
                : -1;
    const result = observe();
    expect(result.status).toBe("refused");
    expect(result.records).toHaveLength(0);
    expect(flagCalls).toHaveLength(0);
  });

  it.each([
    null,
    { x: null, y: 0 },
    { x: 1.5, y: 0 },
    { x: 0, y: Number.NaN },
  ])("refuses invalid native adjacency %j without a cliff query", (location) => {
    const { bindings, flagCalls, observe } = appUiCliffFixture();
    bindings.GameplayMap.getAdjacentPlotLocation = () => location;
    expect(observe()).toMatchObject({
      status: "refused",
      refusal: {
        source: "GameplayMap.getAdjacentPlotLocation",
        reason: "invalid-native-coordinate",
      },
    });
    expect(flagCalls).toHaveLength(0);
  });

  it.each([
    "seed",
    "native-seed",
    "dimensions",
    "null-turn",
    "not-in-game",
    "source-class",
  ])("refuses %s identity or source mismatch before native edges", (kind) => {
    const { bindings, flagCalls, observe } = appUiCliffFixture();
    if (kind === "seed") bindings.Configuration.getMap = () => ({ mapSeed: 42 });
    if (kind === "native-seed") bindings.GameplayMap.getRandomSeed = () => 42;
    if (kind === "dimensions") bindings.GameplayMap.getGridWidth = () => 105;
    if (kind === "null-turn") Object.assign(bindings.Game, { turn: null });
    if (kind === "not-in-game") bindings.UI.isInGame = () => false;
    if (kind === "source-class") bindings.GameplayMap.getRiverType = () => -1;
    const result = observe();
    expect(result.status).toBe("refused");
    expect(result.records).toHaveLength(0);
    expect(flagCalls).toHaveLength(0);
    if (kind === "null-turn")
      expect(result.identity.turn).toMatchObject({
        status: "unavailable",
        reason: "unexpected-null",
      });
    if (kind === "source-class") expect(result.refusal.reason).toBe("supplied-source-is-not-NAV");
  });

  it.each([
    "missing-cliff",
    "null-cliff",
    "numeric-cliff",
    "null-height",
    "null-water",
    "null-lake",
    "null-class",
  ])("fails closed on %s instead of substituting zero or false", (kind) => {
    const { bindings, observe } = appUiCliffFixture();
    const member = {
      "missing-cliff": "isCliffCrossing",
      "null-cliff": "isCliffCrossing",
      "numeric-cliff": "isCliffCrossing",
      "null-height": "getElevation",
      "null-water": "isWater",
      "null-lake": "isLake",
      "null-class": "getRiverType",
    }[kind]!;
    bindings.GameplayMap[member] =
      kind === "missing-cliff" ? undefined : () => (kind === "numeric-cliff" ? 0 : null);
    const result = observe();
    expect(result.status).toBe("refused");
    expect(result.refusal.source).toBe(`GameplayMap.${member}`);
    expect(result.records).toHaveLength(0);
  });
});

const identity = {
  configHash: "a".repeat(64),
  envelopeHash: "b".repeat(64),
  fixtureSourceSha256: "c".repeat(64),
};
const cliffStudy: DirectionalCliffStudy = {
  studyId: "bounded-cliff-test",
  physicalPayloadSha256: "d".repeat(64),
  dimensions: { width: 106, height: 66 },
  shoreEdges: [
    { from: { x: 1, y: 1 }, to: { x: 2, y: 1 }, role: "finite-shore" },
    { from: { x: 105, y: 0 }, to: { x: 0, y: 0 }, role: "external-shore" },
  ],
  dryControls: [
    { from: { x: 3, y: 3 }, to: { x: 4, y: 3 }, role: "dry-steep" },
    { from: { x: 5, y: 5 }, to: { x: 6, y: 5 }, role: "dry-flat" },
  ],
};
const cliffOptions = {
  ...WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE,
  diagnosticRevision: WATER_HEIGHT_CLIFF_OBSERVATION_REVISION,
  displayLabel: "Water Directional Cliff Observation V23",
  directionalCliffs: cliffStudy,
};

function cliffFixture() {
  const base = fixture(mapInfo(40));
  const flagCalls: Array<{ x: number; y: number; direction: number }> = [];
  const symbols = ["EAST", "NORTHEAST", "NORTHWEST", "WEST", "SOUTHWEST", "SOUTHEAST"];
  const nativeIds = [11, 17, 23, 29, 31, 37];
  const bindings: DirectionalCliffBindings = {
    DirectionTypes: Object.fromEntries(
      symbols.map((symbol, index) => [`DIRECTION_${symbol}`, nativeIds[index]])
    ),
    GameplayMap: {
      getAdjacentPlotLocation: ({ x, y }: { x: number; y: number }, direction: number) => {
        const offsets = [
          [1, 0],
          [1, -1],
          [0, -1],
          [-1, 0],
          [0, 1],
          [1, 1],
        ];
        const offset = offsets[nativeIds.indexOf(direction)];
        if (!offset) throw new Error("unexpected native direction");
        return { x: (x + offset[0]! + 106) % 106, y: y + offset[1]! };
      },
      getElevation: (x: number, y: number) => base.adapter.getElevation(x, y),
      getTerrainType: (x: number, y: number) => base.adapter.getTerrainType(x, y),
      getRiverType: (x: number, y: number) => base.adapter.getRiverType(x, y),
      isWater: (x: number, y: number) => base.adapter.isWater(x, y),
      isLake: (x: number, y: number) => base.adapter.isLake(x, y),
      isCliffCrossing: function (x: number, y: number, direction: number) {
        expect(this).toBe(bindings.GameplayMap);
        flagCalls.push({ x, y, direction });
        return direction === 11;
      },
    },
  };
  const observations = () =>
    decodeBoundedJsonLogSeries(base.lines, "[water-height-maintenance]")
      .map(
        ({ payload }) =>
          payload as {
            stage: string;
            payload: {
              waypoint: string;
              authenticCall: { call: number; method: string; occurrence: number };
              manifestSha256: string;
              observedFlagCount: number;
              directedRecordCount: number;
              records: Array<{
                role: string;
                reverse: boolean;
                cliff: boolean | { status: string; reason: string };
                from: { x: number; y: number; elevation: number };
                to: { x: number; y: number };
                nativeDirection: { symbol?: string; value?: number; reason?: string };
                nativeAdjacent: { x?: number; y?: number; reason?: string };
                directionResolution?: Array<{ adjacent: { reason?: string } }>;
              }>;
            };
          }
      )
      .filter(({ stage }) => stage === "directional-cliffs")
      .map(({ payload }) => payload);
  return { ...base, bindings, flagCalls, observations };
}
describe("opt-in directional cliff observations", () => {
  it("protects a bounded structured manifest without choosing native directions or a cliff threshold", () => {
    const parsed = readDirectionalCliffStudy(cliffStudy, cliffStudy.dimensions);
    expect(parsed).toEqual(cliffStudy);
    expect(parsed).not.toBe(cliffStudy);
    expect(Object.isFrozen(parsed.shoreEdges[0]!.from)).toBe(true);
    const shoreEdges = Array.from({ length: DIRECTIONAL_CLIFF_MAX_SHORE_EDGES }, (_, index) => ({
      from: { x: index % 103, y: 10 + 2 * Math.floor(index / 103) },
      to: { x: (index % 103) + 1, y: 10 + 2 * Math.floor(index / 103) },
      role: "finite-shore",
    }));
    expect(
      readDirectionalCliffStudy({ ...cliffStudy, shoreEdges }, cliffStudy.dimensions).shoreEdges
    ).toHaveLength(206);
    expect(() =>
      readDirectionalCliffStudy(
        { ...cliffStudy, shoreEdges: [...shoreEdges, cliffStudy.shoreEdges[0]] },
        cliffStudy.dimensions
      )
    ).toThrow("manifest");
    const invalid: unknown[] = [
      null,
      { ...cliffStudy, extra: true },
      { ...cliffStudy, physicalPayloadSha256: "not-a-hash" },
      { ...cliffStudy, shoreEdges: [] },
      { ...cliffStudy, shoreEdges: [{ ...cliffStudy.shoreEdges[0], from: { x: 1.5, y: 1 } }] },
      { ...cliffStudy, shoreEdges: [{ ...cliffStudy.shoreEdges[0], from: { x: -1, y: 1 } }] },
      { ...cliffStudy, shoreEdges: [{ ...cliffStudy.shoreEdges[0], from: { x: 106, y: 1 } }] },
      {
        ...cliffStudy,
        shoreEdges: [{ ...cliffStudy.shoreEdges[0], to: cliffStudy.shoreEdges[0]!.from }],
      },
      {
        ...cliffStudy,
        shoreEdges: [
          cliffStudy.shoreEdges[0],
          {
            ...cliffStudy.shoreEdges[0],
            from: cliffStudy.shoreEdges[0]!.to,
            to: cliffStudy.shoreEdges[0]!.from,
          },
        ],
      },
      { ...cliffStudy, dryControls: [cliffStudy.dryControls[0]] },
      {
        ...cliffStudy,
        dryControls: [
          cliffStudy.dryControls[0],
          { ...cliffStudy.dryControls[1], role: "dry-steep" },
        ],
      },
      { ...cliffStudy, dimensions: { width: 60, height: 38 } },
    ];
    for (const value of invalid)
      expect(() => readDirectionalCliffStudy(value, cliffStudy.dimensions)).toThrow();
  });

  it("reads both native directions at five authentic waypoints with unchanged calls, arguments and complete bounded transport", () => {
    const { adapter, calls, bindings, flagCalls, lines, observations } = cliffFixture();
    const finish = installWaterHeightMaintenanceProbe(
      adapter,
      "cliff-five-slots",
      identity,
      cliffOptions,
      (line) => lines.push(line),
      bindings
    );
    const values = Array(6996).fill(20),
      laterValues = Array(6996).fill(30);
    const args = [false, 25, 2, 2] as const;
    adapter.validateAndFixTerrain();
    adapter.recalculateAreas();
    adapter.recalculateAreas();
    adapter.storeWaterData();
    adapter.recalculateAreas();
    adapter.setElevation(values);
    adapter.recalculateAreas();
    adapter.finalizeRivers(args);
    adapter.validateAndFixTerrain();
    adapter.generateCliffsFromElevation();
    adapter.recalculateAreas();
    adapter.storeWaterData();
    adapter.validateAndFixTerrain();
    adapter.recalculateAreas();
    adapter.validateAndFixTerrain();
    adapter.setElevation(laterValues);
    adapter.recalculateAreas();
    adapter.storeWaterData();
    finish();
    expect(calls.map(({ method }) => method)).toEqual([
      "validateAndFixTerrain",
      "recalculateAreas",
      "recalculateAreas",
      "storeWaterData",
      "recalculateAreas",
      "setElevation",
      "recalculateAreas",
      "finalizeRivers",
      "validateAndFixTerrain",
      "generateCliffsFromElevation",
      "recalculateAreas",
      "storeWaterData",
      "validateAndFixTerrain",
      "recalculateAreas",
      "validateAndFixTerrain",
      "setElevation",
      "recalculateAreas",
      "storeWaterData",
    ]);
    expect(calls[5]!.arg).toBe(values);
    expect(calls[7]!.arg).toBe(args);
    expect(calls[15]!.arg).toBe(laterValues);
    const observed = observations();
    expect(observed.map(({ waypoint }) => waypoint)).toEqual([...DIRECTIONAL_CLIFF_WAYPOINTS]);
    expect(observed.map(({ authenticCall }) => authenticCall)).toEqual([
      { call: 6, method: "setElevation", occurrence: 1 },
      { call: 10, method: "generateCliffsFromElevation", occurrence: 1 },
      { call: 10, method: "generateCliffsFromElevation", occurrence: 1 },
      { call: 16, method: "setElevation", occurrence: 2 },
      { call: 18, method: "storeWaterData", occurrence: 3 },
    ]);
    for (const payload of observed) {
      expect(payload.manifestSha256).toBe(sha256Hex(stableStringify(cliffStudy)));
      expect(payload.directedRecordCount).toBe(8);
      expect(payload.observedFlagCount).toBe(8);
      expect(payload.records).toHaveLength(8);
      expect(payload.records.filter(({ cliff }) => cliff === true)).toHaveLength(4);
      expect(payload.records.filter(({ cliff }) => cliff === false)).toHaveLength(4);
      expect(
        payload.records.every(
          ({ nativeDirection }) => nativeDirection.value === 11 || nativeDirection.value === 29
        )
      ).toBe(true);
      const seam = payload.records.filter(({ role }) => role === "external-shore");
      expect(seam.map(({ nativeAdjacent }) => nativeAdjacent)).toEqual([
        { x: 0, y: 0 },
        { x: 105, y: 0 },
      ]);
    }
    expect(
      observed[0]!.records[2]!.directionResolution?.some(
        ({ adjacent }) => adjacent.reason === "outside-selected-grid"
      )
    ).toBe(true);
    expect(flagCalls).toHaveLength(40);
    expect(lines.every((line) => line.length <= BOUNDED_JSON_LOG_MAX_LINE_LENGTH)).toBe(true);
    const firstSeries = decodeBoundedJsonLogSeries(lines, "[water-height-maintenance]").find(
      ({ payload }) => (payload as { stage: string }).stage === "directional-cliffs"
    )!;
    expect(firstSeries.partCount).toBeGreaterThan(1);
    const incomplete = decodeBoundedJsonLogSeries(
      lines.filter((_, index) => index !== firstSeries.startIndex),
      "[water-height-maintenance]"
    );
    expect(
      incomplete.filter(
        ({ payload }) => (payload as { stage: string }).stage === "directional-cliffs"
      )
    ).toHaveLength(4);
  });

  it.each([
    "missing",
    "throws",
    "number",
    "object",
  ])("preserves %s cliff getter evidence instead of substituting false", (kind) => {
    const { adapter, bindings, flagCalls, lines, observations } = cliffFixture();
    bindings.GameplayMap.isCliffCrossing =
      kind === "missing"
        ? undefined
        : () => {
            if (kind === "throws") throw new Error("cliff getter unavailable in realm");
            return kind === "number" ? 0 : { status: "looks-supported" };
          };
    installWaterHeightMaintenanceProbe(
      adapter,
      "cliff-unavailable",
      identity,
      cliffOptions,
      (line) => lines.push(line),
      bindings
    );
    adapter.setElevation(Array(6996).fill(20));
    const observed = observations()[0]!;
    expect(observed.observedFlagCount).toBe(0);
    expect(
      observed.records.every(
        ({ cliff }) => typeof cliff === "object" && cliff.status === "unavailable"
      )
    ).toBe(true);
    expect(observed.records[0]!.cliff).toMatchObject({
      reason:
        kind === "missing"
          ? "missing-callable"
          : kind === "throws"
            ? "threw: Error: cliff getter unavailable in realm"
            : `unexpected-${kind}`,
    });
    expect(flagCalls).toHaveLength(0);
  });

  it.each([
    "missing-enum",
    "thrown-enum",
    "duplicate-enum",
    "missing-adjacency",
    "thrown-adjacency",
    "wrong-adjacency",
  ])("does not query flags when %s prevents native edge confirmation", (kind) => {
    const { adapter, bindings, flagCalls, lines, observations } = cliffFixture();
    if (kind === "missing-enum") bindings.DirectionTypes.DIRECTION_EAST = undefined;
    if (kind === "thrown-enum")
      Object.defineProperty(bindings.DirectionTypes, "DIRECTION_EAST", {
        get() {
          throw new Error("enum getter failed");
        },
      });
    if (kind === "duplicate-enum")
      bindings.DirectionTypes.DIRECTION_EAST = bindings.DirectionTypes.DIRECTION_WEST;
    if (kind === "missing-adjacency") bindings.GameplayMap.getAdjacentPlotLocation = undefined;
    if (kind === "thrown-adjacency")
      bindings.GameplayMap.getAdjacentPlotLocation = () => {
        throw new Error("adjacency failed");
      };
    if (kind === "wrong-adjacency")
      bindings.GameplayMap.getAdjacentPlotLocation = () => ({ x: 50, y: 50 });
    installWaterHeightMaintenanceProbe(
      adapter,
      "cliff-adjacency",
      identity,
      cliffOptions,
      (line) => lines.push(line),
      bindings
    );
    adapter.setElevation(Array(6996).fill(20));
    const observed = observations()[0]!;
    expect(observed.observedFlagCount).toBe(0);
    expect(
      observed.records.every(
        ({ cliff }) => typeof cliff === "object" && cliff.status === "unavailable"
      )
    ).toBe(true);
    expect(flagCalls).toHaveLength(0);
    if (kind === "thrown-adjacency")
      expect(observed.records[0]!.directionResolution?.[0]!.adjacent.reason).toBe(
        "threw: Error: adjacency failed"
      );
  });

  it("refuses non-V23 study installation before mutation and reads no cliff bindings without opt-in", () => {
    for (const options of [
      { ...cliffOptions, diagnosticRevision: 22 },
      { ...cliffOptions, atlasKind: "full-map-maintenance" },
    ]) {
      const { adapter, calls } = fixture(mapInfo(40));
      const original = adapter.setElevation;
      expect(() =>
        installWaterHeightMaintenanceProbe(adapter, "bad-cliff-arm", identity, options)
      ).toThrow("explicitly selected bounded V23");
      expect(adapter.setElevation).toBe(original);
      expect(calls).toHaveLength(0);
    }
    const { adapter, lines, decode } = fixture(mapInfo(40));
    const forbidden = new Proxy(
      {},
      {
        get() {
          throw new Error("unselected cliff getter read");
        },
      }
    );
    installWaterHeightMaintenanceProbe(
      adapter,
      "no-cliff-opt-in",
      identity,
      WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE,
      (line) => lines.push(line),
      { GameplayMap: forbidden, DirectionTypes: forbidden }
    );
    adapter.setElevation(Array(6996).fill(20));
    expect(decode().some(({ stage }) => stage === "directional-cliffs")).toBe(false);
  });

  it("does not invent an after-cliffs observation when the authentic native mutation throws", () => {
    const { adapter, lines, bindings, observations } = cliffFixture();
    adapter.generateCliffsFromElevation = () => {
      throw new Error("authentic cliff generation failed");
    };
    installWaterHeightMaintenanceProbe(
      adapter,
      "cliff-native-failure",
      identity,
      cliffOptions,
      (line) => lines.push(line),
      bindings
    );
    adapter.setElevation(Array(6996).fill(20));
    expect(() => adapter.generateCliffsFromElevation()).toThrow(
      "authentic cliff generation failed"
    );
    expect(observations().map(({ waypoint }) => waypoint)).toEqual(
      DIRECTIONAL_CLIFF_WAYPOINTS.slice(0, 2)
    );
  });
});

const selectedSizes = ["MAPSIZE_TINY", "MAPSIZE_STANDARD", "MAPSIZE_HUGE"] as const;
type Adapter = Parameters<typeof installWaterHeightMaintenanceProbe>[0];
type MapInfo = ReturnType<Adapter["lookupMapInfo"]>;
const mapInfo = (cutoff: number, mapSize: Civ7StandardMapSizeId = "MAPSIZE_HUGE"): MapInfo => {
  const preset = getCiv7StandardMapSizePreset(mapSize);
  return {
    MapSizeType: preset.id,
    LakeSizeCutoff: cutoff,
    GridWidth: preset.dimensions.width,
    GridHeight: preset.dimensions.height,
  };
};
function cutoffCapture(
  cutoff = 20,
  mapSize: Civ7StandardMapSizeId = "MAPSIZE_HUGE"
): Parameters<typeof projectLakeCutoffInitialSetup>[0] {
  const preset = getCiv7StandardMapSizePreset(mapSize);
  const aliveMajorPlayerIds = [7, 2, 11];
  return {
    mapSeed: 1018,
    gameSeed: 1018,
    dimensions: preset.dimensions,
    latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
    mapSizeId: preset.id,
    mapInfo: { ...preset.mapInfo, LakeSizeCutoff: cutoff },
    aliveMajorPlayerIds,
    startSlotCapacity: {
      west: preset.mapInfo.PlayersLandmass1,
      east: preset.mapInfo.PlayersLandmass2,
      total: preset.mapInfo.PlayersLandmass1 + preset.mapInfo.PlayersLandmass2,
    },
    options: createUnavailableStandardInitialOptionEvidence(
      "value-unavailable",
      aliveMajorPlayerIds
    ),
  };
}
function fixture(info: MapInfo = mapInfo(10)) {
  const calls: Array<{ method: string; arg?: unknown }> = [];
  const metadataCalls: Array<{ method: string; arg?: unknown }> = [];
  const observedCoordinates: Array<{ x: number; y: number }> = [];
  const lines: string[] = [];
  let height = 10;
  const adapter: Adapter = {
    getMapSizeId: () => {
      metadataCalls.push({ method: "getMapSizeId" });
      return typeof info?.MapSizeType === "string" ? info.MapSizeType : "MAPSIZE_HUGE";
    },
    lookupMapInfo: (id) => {
      metadataCalls.push({ method: "lookupMapInfo", arg: id });
      return info;
    },
    getElevation: (x, y) => {
      observedCoordinates.push({ x, y });
      return height;
    },
    readCurrentMapElevationSnapshot: () => ({
      source: "native",
      status: "available",
      width: info?.GridWidth ?? 106,
      height: info?.GridHeight ?? 66,
      values: new Float64Array((info?.GridWidth ?? 106) * (info?.GridHeight ?? 66)).fill(height),
    }),
    getTerrainType: () => 3,
    getFeatureType: () => -1,
    getRiverType: () => -1,
    isWater: (x) => x === 93,
    isLake: () => false,
    setElevation: (values) => {
      calls.push({ method: "setElevation", arg: values });
      height = 20;
    },
    setRiverInfo: (intent) => {
      calls.push({ method: "setRiverInfo", arg: intent });
    },
    finalizeRivers: (args) => {
      calls.push({ method: "finalizeRivers", arg: args });
      height = 30;
    },
    validateAndFixTerrain: () => {
      calls.push({ method: "validateAndFixTerrain" });
      height++;
    },
    generateCliffsFromElevation: () => {
      calls.push({ method: "generateCliffsFromElevation" });
    },
    recalculateAreas: () => {
      calls.push({ method: "recalculateAreas" });
    },
    storeWaterData: () => {
      calls.push({ method: "storeWaterData" });
    },
  };
  const decode = () =>
    decodeBoundedJsonLogSeries(lines, "[water-height-maintenance]").map(
      (entry) =>
        entry.payload as {
          stage: string;
          proofId: string;
          diagnosticRevision: number;
          atlasKind: string;
          payload: {
            method?: string;
            finalizationTuple?: unknown;
            finalizationIntervention?: unknown;
            riverWriteOrderIntervention?: {
              appliedOrdinals: number[];
              receiverCells: number[];
              includedWetWriteCount: number;
            };
            occurrence?: number;
            points?: Array<{
              elevation: number;
              lake: boolean;
              body?: number;
              role: string;
              x: number;
              y: number;
            }>;
            riverSourceRows?: Array<{
              x: number;
              y: number;
              intendedClass: "MINOR" | "NAVIGABLE";
              observedClass: number | { status: "unavailable"; member: string; reason: string };
              terrain: number | { status: "unavailable"; member: string; reason: string };
            }>;
            focus?: Array<{ body?: number; role: string; x: number; y: number }>;
            writes?: Array<{ wet: boolean; intent: unknown }>;
            elevations?: Array<{ count: number; sha256: string }>;
            mapSizeId?: string;
            mapInfo?: MapInfo;
            expectedLakeSizeCutoff?: number;
            observedLakeSizeCutoff?: unknown;
            activation?: string;
            checkpoint?: string;
            row?: number;
            startCell?: number;
            values?: number[];
            elevation?: number[];
            nativeElevation?: number[];
            terrain?: number[];
            feature?: number[];
            riverType?: number[];
            water?: boolean[];
            lake?: boolean[];
            count?: number;
            sha256?: string;
            phase?: string;
            action?: string;
            cellCount?: number;
            rowCount?: number;
            originalInputSha256?: string;
            selection?: string;
          };
        }
    );
  return { adapter, calls, metadataCalls, observedCoordinates, lines, decode };
}

function writeOrderBindings(width = 106): DirectionalCliffBindings {
  const values = [11, 17, 23, 29, 31, 37];
  return {
    DirectionTypes: Object.fromEntries(
      RIVER_DIRECTIONS.map((symbol, index) => [`DIRECTION_${symbol}`, values[index]])
    ),
    GameplayMap: {
      getAdjacentPlotLocation(from: { x: number; y: number }, native: number) {
        const symbol = RIVER_DIRECTIONS[values.indexOf(native)];
        if (!symbol) throw new Error("Unexpected native test direction.");
        const to = riverProbeExpectedReceiver(from, symbol, false);
        return { x: (to.x + width) % width, y: to.y };
      },
    },
  };
}
const writeOrderIntervention = {
  variant: RIVER_AUTHORED_WRITE_ORDER_VARIANT,
  qualification: "Diagnostic-only downstream-first native delivery permutation",
};

function generatedMaintenanceExecute(
  script: string,
  delegate: typeof standardRecipe.execute,
  observe: typeof observeWaterHeightPhysicalLakes,
  finish?: () => void
): typeof standardRecipe.execute {
  const source = ts.createSourceFile(
    "diagnostic.js",
    script,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS
  );
  const matches: ts.ArrowFunction[] = [];
  const visit = (node: ts.Node) => {
    if (
      ts.isPropertyAssignment(node) &&
      node.name.getText(source) === "execute" &&
      ts.isArrowFunction(node.initializer) &&
      ts.isBlock(node.initializer.body)
    ) {
      const second = node.initializer.body.statements.at(-1);
      if (
        second &&
        ts.isExpressionStatement(second) &&
        ts.isCallExpression(second.expression) &&
        second.expression.expression.getText(source) === "observeWaterHeightPhysicalLakes"
      )
        matches.push(node.initializer);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  expect(matches).toHaveLength(1);
  const arrow = matches[0]!;
  if (!ts.isBlock(arrow.body)) throw new Error("Expected a generated execute body.");
  expect(arrow.body.statements).toHaveLength(finish ? 3 : 2);
  const first = arrow.body.statements[0]!,
    second = arrow.body.statements.at(-1)!;
  if (
    !ts.isExpressionStatement(first) ||
    !ts.isCallExpression(first.expression) ||
    !ts.isPropertyAccessExpression(first.expression.expression) ||
    !ts.isIdentifier(first.expression.expression.expression) ||
    !ts.isExpressionStatement(second) ||
    !ts.isCallExpression(second.expression) ||
    !ts.isIdentifier(second.expression.expression)
  )
    throw new Error("Unexpected generated diagnostic delegation.");
  expect(first.expression.expression.name.text).toBe("execute");
  expect(first.expression.arguments.map((arg) => arg.getText(source))).toEqual(
    arrow.parameters.map((parameter) => parameter.name.getText(source))
  );
  expect(arrow.parameters).toHaveLength(3);
  let finishingName = "unusedFinishingCallback";
  if (finish) {
    const finishing = arrow.body.statements[1]!;
    if (
      !ts.isExpressionStatement(finishing) ||
      !ts.isCallExpression(finishing.expression) ||
      !ts.isIdentifier(finishing.expression.expression)
    )
      throw new Error("Unexpected generated finishing callback.");
    expect(finishing.expression.arguments).toHaveLength(0);
    finishingName = finishing.expression.expression.text;
  }
  return new Function(
    first.expression.expression.expression.text,
    second.expression.expression.text,
    finishingName,
    `return (${arrow.getText(source)});`
  )({ execute: delegate }, observe, finish);
}

async function physicalLakeRun(
  sourceConfigId = "swooper-earthlike",
  mapSize: Civ7StandardMapSizeId = "MAPSIZE_TINY",
  mapSeed = 42,
  gameSeed = 7331,
  cutoff = getCiv7StandardMapSizePreset(mapSize).mapInfo.LakeSizeCutoff
) {
  const preset = getCiv7StandardMapSizePreset(mapSize);
  const capture = { ...cutoffCapture(cutoff, mapSize), mapSeed, gameSeed };
  const setup = projectLakeCutoffInitialSetup(capture, cutoff, mapSize);
  const [config] = await loadSwooperMapConfigCatalog({ catalogConfigIds: [sourceConfigId] });
  if (!config) throw new Error("Missing selected physical lake test config.");
  const plan = standardRecipe.compile(setup, config.canonicalConfig.config);
  const adapter = createMockAdapter({
    ...preset.dimensions,
    mapSizeId: preset.id,
    mapInfo: capture.mapInfo,
    aliveMajorPlayerIds: capture.aliveMajorPlayerIds,
    rngSeed: mapSeed,
  });
  const context = createMapContext({ setup: plan.setup, adapter });
  const options = {
    ...WATER_HEIGHT_MAINTENANCE_PROBE,
    ...preset.dimensions,
    mapSize,
    sourceConfigId,
    mapSeed,
    gameSeed,
    playerCount: capture.aliveMajorPlayerIds.length,
    expectedLakeSizeCutoff: cutoff,
  };
  const lakePlanDefinition = (() => {
    for (const stage of STANDARD_STAGES)
      for (const step of stage.steps)
        for (const provided of step.contract.provides)
          if (typeof provided !== "string" && provided.id === "artifact:hydrology.lakePlan")
            return provided;
    throw new Error("Missing public lakePlan provider.");
  })();
  const projectedLakesDefinition = (() => {
    for (const stage of STANDARD_STAGES)
      for (const step of stage.steps)
        for (const provided of step.contract.provides)
          if (
            typeof provided !== "string" &&
            provided.id === "artifact:map.hydrology.projectedLakes"
          )
            return provided;
    throw new Error("Missing public projectedLakes provider.");
  })();
  const topographyDefinition = (() => {
    for (const stage of STANDARD_STAGES)
      for (const step of stage.steps)
        for (const provided of step.contract.provides)
          if (typeof provided !== "string" && provided.id === "artifact:morphology.topography")
            return provided;
    throw new Error("Missing public topography provider.");
  })();
  const hydrographyDefinition = (() => {
    for (const stage of STANDARD_STAGES)
      for (const step of stage.steps)
        for (const provided of step.contract.provides)
          if (typeof provided !== "string" && provided.id === "artifact:hydrology.hydrography")
            return provided;
    throw new Error("Missing public hydrography provider.");
  })();
  return {
    plan,
    adapter,
    context,
    options,
    lakes: () => readArtifact(context, lakePlanDefinition),
    accepted: () => readArtifact(context, projectedLakesDefinition),
    topography: () => readArtifact(context, topographyDefinition),
    hydrography: () => readArtifact(context, hydrographyDefinition),
  };
}

describe("post-recipe physical lake maintenance evidence", () => {
  it.each([
    ["full-map-maintenance", "stock", "authored"],
    ["full-map-maintenance", 40, "authored"],
    ["full-map-bounded-lake-cutoff", "stock", "authored"],
    ["full-map-bounded-lake-cutoff", 40, "authored"],
    ["full-map-maintenance", "stock", "authored-upstream"],
    ["full-map-maintenance", "stock", "authored-length"],
    ["full-map-maintenance", "stock", "authored-minima"],
    ["full-map-maintenance", "stock", RIVER_AUTHORED_WRITE_ORDER_VARIANT],
  ] as const)(
    "decorates the actual %s/%s/%s generated execute once with complete terminal evidence",
    async (atlasKind, cutoff, variant) => {
      const selection = {
        sourceConfigId: "swooper-earthlike",
        mapSize: "MAPSIZE_TINY",
        mapSeed: 42,
        gameSeed: 7331,
        playerCount: 3,
        lakeSizeCutoff: cutoff,
      } as const;
      const built = await buildRiverProbePlan("physical-lakes-test", variant, atlasKind, selection);
      const script = String(
        built.files.find((file) => file.relativePath === "maps/river-contract.js")!.content
      );
      const proof = JSON.parse(
        String(built.files.find((file) => file.relativePath === "proof.json")!.content)
      );
      const run = await physicalLakeRun(
        selection.sourceConfigId,
        selection.mapSize,
        selection.mapSeed,
        selection.gameSeed,
        proof.expectedLakeSizeCutoff
      );
      const lines: string[] = [],
        events: string[] = [];
      const finalizationCalls: Array<Parameters<Adapter["finalizeRivers"]>[0]> = [];
      if (variant !== "authored" && variant !== RIVER_AUTHORED_WRITE_ORDER_VARIANT) {
        const finalizationIntervention = {
          variant,
          requestedTuple: RIVER_PROBE_VARIANTS.authored,
          appliedTuple: RIVER_AUTHORED_FINALIZATION_VARIANTS[variant],
          qualification: proof.finalizationIntervention.qualification,
        };
        expect(proof.finalizationIntervention).toEqual(finalizationIntervention);
        const nativeFinalize = run.adapter.finalizeRivers;
        run.adapter.finalizeRivers = (args) => {
          finalizationCalls.push([...args]);
          return nativeFinalize.call(run.adapter, args);
        };
        installWaterHeightMaintenanceProbe(
          run.adapter,
          proof.proofId,
          {
            configHash: proof.configHash,
            envelopeHash: proof.envelopeHash,
            fixtureSourceSha256: proof.fixtureSourceSha256,
          },
          { ...run.options, finalizationIntervention },
          () => {}
        );
      }
      if (variant === RIVER_AUTHORED_WRITE_ORDER_VARIANT) {
        expect(proof.riverWriteOrderIntervention.variant).toBe(variant);
        installWaterHeightMaintenanceProbe(
          run.adapter,
          proof.proofId,
          {
            configHash: proof.configHash,
            envelopeHash: proof.envelopeHash,
            fixtureSourceSha256: proof.fixtureSourceSha256,
          },
          { ...run.options, riverWriteOrderIntervention: proof.riverWriteOrderIntervention },
          () => {},
          writeOrderBindings(run.context.setup.dimensions.width)
        );
      }
      const executionOptions = { log: () => {} };
      let delegationCount = 0,
        observationCount = 0,
        finishingCount = 0;
      const execute = generatedMaintenanceExecute(
        script,
        (context, plan, options) => {
          delegationCount++;
          expect(context).toBe(run.context);
          expect(plan).toBe(run.plan);
          expect(options).toBe(executionOptions);
          standardRecipe.execute(context, plan, options);
          events.push("recipe-returned");
        },
        (context, plan, proofId, identity, options) => {
          observationCount++;
          const before = stableStringify([run.lakes(), run.topography(), run.hydrography()]);
          expect(context).toBe(run.context);
          expect(plan).toBe(run.plan);
          observeWaterHeightPhysicalLakes(context, plan, proofId, identity, options, (line) =>
            lines.push(line)
          );
          expect(stableStringify([run.lakes(), run.topography(), run.hydrography()])).toBe(before);
          events.push("physical-lakes");
        },
        atlasKind === "full-map-bounded-lake-cutoff"
          ? () => {
              finishingCount++;
            }
          : undefined
      );
      const originalLog = console.log;
      try {
        console.log = () => {};
        execute(run.context, run.plan, executionOptions);
      } finally {
        console.log = originalLog;
      }
      events.push("execute-returned");
      expect(delegationCount).toBe(1);
      expect(observationCount).toBe(1);
      expect(finishingCount).toBe(atlasKind === "full-map-bounded-lake-cutoff" ? 1 : 0);
      if (variant !== "authored" && variant !== RIVER_AUTHORED_WRITE_ORDER_VARIANT)
        expect(finalizationCalls).toEqual([RIVER_AUTHORED_FINALIZATION_VARIANTS[variant]]);
      expect(events).toEqual(["recipe-returned", "physical-lakes", "execute-returned"]);
      expect(lines.every((line) => line.length <= BOUNDED_JSON_LOG_MAX_LINE_LENGTH)).toBe(true);
      const records = decodeBoundedJsonLogSeries(lines, "[water-height-maintenance]");
      expect(records).toHaveLength(1);
      expect(records[0]!.partCount).toBeGreaterThan(1);
      const lakes = run.lakes(),
        accepted = run.accepted();
      const cells = Array.from(accepted.lakeMask).flatMap((wet, cell) =>
        wet === 1 ? [[cell, lakes.bodyId[cell]!, lakes.waterSurface[cell]!]] : []
      );
      expect(cells.length).toBeGreaterThan(0);
      const currentCensus = atlasKind === "full-map-bounded-lake-cutoff";
      expect(records[0]!.payload).toEqual({
        proofId: proof.proofId,
        stage: "physical-lakes",
        diagnosticRevision: proof.diagnosticRevision,
        atlasKind: proof.atlasKind,
        configHash: proof.configHash,
        envelopeHash: proof.envelopeHash,
        fixtureSourceSha256: proof.fixtureSourceSha256,
        payload: {
          phase: "post-recipe",
          mapSeed: 42,
          gameSeed: 7331,
          dimensions: run.context.setup.dimensions,
          ...(currentCensus
            ? {
                seaLevel: run.topography().seaLevel,
                ground: Array.from(run.topography().elevation),
                externalWaterMask: Array.from(run.topography().externalWaterMask),
                exposedLandMask: Array.from(run.hydrography().exposedLandMask),
              }
            : {}),
          plannedLakeTileCount: lakes.plannedLakeTileCount,
          columns: ["cell", "body", "head"],
          cells,
          bodies: lakes.bodies
            .map((body) => ({
              bodyId: body.bodyId,
              componentId: body.componentId,
              poolId: body.poolId,
              level: body.level,
              wetCells: [...body.wetCells],
            }))
            .sort((a, b) => a.bodyId - b.bodyId),
          components: lakes.components
            .map((component) => ({
              componentId: component.componentId,
              poolId: component.poolId,
              state: component.state,
              level: component.level,
              bodyIds: [...component.bodyIds],
              memberCells: [...component.memberCells],
            }))
            .sort((a, b) => a.componentId - b.componentId),
          pools: lakes.pools
            .map((pool) => ({
              poolId: pool.poolId,
              componentId: pool.componentId,
              state: pool.state,
              level: pool.level,
              leafIds: [...pool.leafIds],
              wetCells: [...pool.wetCells],
              ...(currentCensus ? { closure: pool.closure ?? null } : {}),
            }))
            .sort((a, b) => a.poolId - b.poolId),
        },
      });
    },
    30_000
  );

  it("preserves an actual native-boundary failure and emits no physical observation", async () => {
    const built = await buildRiverProbePlan(
      "physical-failure-test",
      "authored",
      "full-map-maintenance",
      { mapSize: "MAPSIZE_TINY", mapSeed: 42, gameSeed: 7331, playerCount: 3 }
    );
    const script = String(
      built.files.find((file) => file.relativePath === "maps/river-contract.js")!.content
    );
    const run = await physicalLakeRun();
    const failure = new Error("test elevation write failure");
    let calls = 0,
      delegations = 0,
      observations = 0;
    let delegatedFailure: unknown, observedFailure: unknown;
    run.adapter.setElevation = () => {
      calls++;
      throw failure;
    };
    const execute = generatedMaintenanceExecute(
      script,
      (context, plan, options) => {
        delegations++;
        try {
          standardRecipe.execute(context, plan, options);
        } catch (error) {
          delegatedFailure = error;
          throw error;
        }
      },
      () => {
        observations++;
      }
    );
    const originalLog = console.log;
    try {
      console.log = () => {};
      try {
        execute(run.context, run.plan, { log: () => {} });
      } catch (error) {
        observedFailure = error;
      }
    } finally {
      console.log = originalLog;
    }
    expect(observedFailure).toBeInstanceOf(Error);
    expect(observedFailure).toBe(delegatedFailure);
    expect((observedFailure as Error & { cause: unknown }).cause).toBe(failure);
    expect(calls).toBe(1);
    expect(delegations).toBe(1);
    expect(observations).toBe(0);
  }, 30_000);

  it("retains an authentic empty Archipelago footprint and its physical pool/component records", async () => {
    const run = await physicalLakeRun("sundered-archipelago", "MAPSIZE_HUGE", 1018, 1018);
    const originalLog = console.log;
    try {
      console.log = () => {};
      standardRecipe.execute(run.context, run.plan, { log: () => {} });
    } finally {
      console.log = originalLog;
    }
    const lines: string[] = [];
    observeWaterHeightPhysicalLakes(
      run.context,
      run.plan,
      "empty-physical-lakes",
      identity,
      run.options,
      (line) => lines.push(line)
    );
    const lakes = run.lakes();
    expect(lakes.plannedLakeTileCount).toBe(0);
    const record = decodeBoundedJsonLogSeries(lines, "[water-height-maintenance]")[0]!;
    expect(record.payload).toMatchObject({
      stage: "physical-lakes",
      payload: {
        phase: "post-recipe",
        plannedLakeTileCount: 0,
        cells: [],
        bodies: [],
        components: lakes.components
          .map((component) => ({
            componentId: component.componentId,
            poolId: component.poolId,
            state: component.state,
            level: component.level,
            bodyIds: [...component.bodyIds],
            memberCells: [...component.memberCells],
          }))
          .sort((a, b) => a.componentId - b.componentId),
        pools: lakes.pools
          .map((pool) => ({
            poolId: pool.poolId,
            componentId: pool.componentId,
            state: pool.state,
            level: pool.level,
            leafIds: [...pool.leafIds],
            wetCells: [...pool.wetCells],
          }))
          .sort((a, b) => a.poolId - b.poolId),
      },
    });
  }, 30_000);

  it("refuses a fresh context or mismatched diagnostic selection without success evidence", async () => {
    const run = await physicalLakeRun();
    const lines: string[] = [];
    const observe = (options = run.options, context = run.context) =>
      observeWaterHeightPhysicalLakes(
        context,
        run.plan,
        "invalid-physical-lakes",
        identity,
        options,
        (line) => lines.push(line)
      );
    expect(() => observe()).toThrow("completed");
    expect(() => observe({ ...run.options, gameSeed: 7332 })).toThrow("exact selected recipe plan");
    expect(() => observe({ ...run.options, mapSeed: 43 })).toThrow("exact selected recipe plan");
    expect(() => observe({ ...run.options, width: run.options.width - 1 })).toThrow(
      "exact selected recipe plan"
    );
    const other = await physicalLakeRun();
    expect(() => observe(run.options, other.context)).toThrow("exact selected recipe plan");
    expect(lines).toEqual([]);
  });
});

describe("private downstream river delivery", () => {
  it("downstream delivery retains all 705 declarations including 39 wet sources exactly once", () => {
    const run = fixture();
    const points = Array.from({ length: 19 }, (_, row) =>
      Array.from({ length: 39 }, (_, column) => ({
        x: row % 2 === 0 ? column + 1 : 39 - column,
        y: row + 1,
      }))
    )
      .flat()
      .slice(0, 706);
    const intents = points.slice(0, 705).map((point, ordinal) => {
      const next = points[ordinal + 1]!;
      const direction = RIVER_DIRECTIONS.find((symbol) => {
        const to = riverProbeExpectedReceiver(point, symbol, false);
        return to.x === next.x && to.y === next.y;
      });
      if (!direction) throw new Error("Invalid test path.");
      return Object.freeze({ ...point, direction, riverClass: "NAVIGABLE" as const });
    });
    const wetCells = new Set(intents.slice(-39).map(({ x, y }) => x + y * 106));
    run.adapter.isWater = (x, y) => wetCells.has(x + y * 106);
    const requested = Object.freeze([false, 25, 2, 2] as const);
    const originalFinalize = run.adapter.finalizeRivers;
    run.adapter.finalizeRivers = (args) => {
      expect(args).toBe(requested);
      originalFinalize(args);
    };
    installWaterHeightMaintenanceProbe(
      run.adapter,
      "downstream-705",
      identity,
      { ...WATER_HEIGHT_MAINTENANCE_PROBE, riverWriteOrderIntervention: writeOrderIntervention },
      (line) => run.lines.push(line),
      writeOrderBindings()
    );
    for (const intent of intents) run.adapter.setRiverInfo(intent);
    expect(run.calls).toEqual([]);
    run.adapter.finalizeRivers(requested);
    expect(
      run.calls.filter(({ method }) => method === "setRiverInfo").map(({ arg }) => arg)
    ).toEqual([...intents].reverse());
    expect(run.calls.map(({ method }) => method)).toEqual([
      ...Array.from({ length: 705 }, () => "setRiverInfo"),
      "finalizeRivers",
    ]);
    const inputs = run.decode().find(({ stage }) => stage === "inputs")!.payload;
    expect(inputs.writes).toEqual(
      intents.map((intent) => ({
        wet: wetCells.has(intent.x + intent.y * 106),
        intent,
      }))
    );
    expect(inputs.riverWriteOrderIntervention).toMatchObject({
      appliedOrdinals: Array.from({ length: 705 }, (_, ordinal) => 704 - ordinal),
      receiverCells: points.slice(1).map(({ x, y }) => x + y * 106),
      includedWetWriteCount: 39,
    });
    expect(inputs.finalizationTuple).toEqual(requested);
    expect(
      run.decode().filter(({ stage }) => stage === "before")[0]!.payload.riverSourceRows
    ).toHaveLength(705);
    expect(run.lines.every((line) => line.length <= BOUNDED_JSON_LOG_MAX_LINE_LENGTH)).toBe(true);
    expect(() => run.adapter.finalizeRivers(requested)).toThrow("already attempted");
    expect(() => run.adapter.setRiverInfo(intents[0]!)).toThrow("single delivery attempt");
    expect(run.calls).toHaveLength(706);
  });

  it("downstream delivery uses original ordinals for every ready-node tie", () => {
    const run = fixture();
    installWaterHeightMaintenanceProbe(
      run.adapter,
      "downstream-ties",
      identity,
      { ...WATER_HEIGHT_MAINTENANCE_PROBE, riverWriteOrderIntervention: writeOrderIntervention },
      (line) => run.lines.push(line),
      writeOrderBindings()
    );
    const intents = [10, 20, 11].map((x) => ({
      x,
      y: 10,
      direction: "EAST" as const,
      riverClass: "MINOR" as const,
    }));
    for (const intent of intents) run.adapter.setRiverInfo(intent);
    run.adapter.finalizeRivers(RIVER_PROBE_VARIANTS.authored);
    expect(run.calls.slice(0, 3).map(({ arg }) => arg)).toEqual([
      intents[1],
      intents[2],
      intents[0],
    ]);
    expect(
      run.decode().find(({ stage }) => stage === "inputs")!.payload.riverWriteOrderIntervention
        ?.appliedOrdinals
    ).toEqual([1, 2, 0]);
  });

  it.each([
    "west",
    "east",
  ] as const)("downstream delivery admits one bounded native %s seam step", (side) => {
    const run = fixture(),
      bindings = writeOrderBindings();
    bindings.GameplayMap.getAdjacentPlotLocation = () => ({ x: side === "west" ? -1 : 106, y: 10 });
    installWaterHeightMaintenanceProbe(
      run.adapter,
      "downstream-seam",
      identity,
      { ...WATER_HEIGHT_MAINTENANCE_PROBE, riverWriteOrderIntervention: writeOrderIntervention },
      (line) => run.lines.push(line),
      bindings
    );
    run.adapter.setRiverInfo({
      x: side === "west" ? 0 : 105,
      y: 10,
      direction: side === "west" ? "WEST" : "EAST",
      riverClass: "NAVIGABLE",
    });
    run.adapter.finalizeRivers(RIVER_PROBE_VARIANTS.authored);
    expect(
      run.decode().find(({ stage }) => stage === "inputs")!.payload.riverWriteOrderIntervention
        ?.receiverCells
    ).toEqual([(side === "west" ? 105 : 0) + 10 * 106]);
    expect(run.calls.map(({ method }) => method)).toEqual(["setRiverInfo", "finalizeRivers"]);
  });

  it.each([
    "cycle",
    "duplicate",
    "coordinates",
    "direction",
    "class",
    "adjacent",
    "far-adjacent",
    "far-wrap",
    "y-wrap",
    "self",
    "getter",
    "enum",
    "empty",
    "tuple",
  ] as const)("downstream delivery refuses %s before any native river mutation", (invalid) => {
    const run = fixture(),
      bindings = writeOrderBindings();
    const first = { x: 10, y: 10, direction: "EAST" as const, riverClass: "NAVIGABLE" as const };
    if (invalid === "coordinates") Reflect.set(first, "x", 106);
    if (invalid === "direction") Reflect.set(first, "direction", "UNKNOWN");
    if (invalid === "class") Reflect.set(first, "riverClass", "UNKNOWN");
    if (invalid === "adjacent")
      bindings.GameplayMap.getAdjacentPlotLocation = () => ({ x: 106, y: 10 });
    if (invalid === "far-adjacent")
      bindings.GameplayMap.getAdjacentPlotLocation = () => ({ x: 20, y: 10 });
    if (invalid === "far-wrap")
      bindings.GameplayMap.getAdjacentPlotLocation = () => ({ x: -107, y: 10 });
    if (invalid === "y-wrap")
      bindings.GameplayMap.getAdjacentPlotLocation = () => ({ x: 10, y: -1 });
    if (invalid === "self") bindings.GameplayMap.getAdjacentPlotLocation = () => ({ x: 10, y: 10 });
    if (invalid === "getter")
      Reflect.deleteProperty(bindings.GameplayMap, "getAdjacentPlotLocation");
    if (invalid === "enum") Reflect.set(bindings.DirectionTypes, "DIRECTION_EAST", Number.NaN);
    installWaterHeightMaintenanceProbe(
      run.adapter,
      "downstream-refusal",
      identity,
      { ...WATER_HEIGHT_MAINTENANCE_PROBE, riverWriteOrderIntervention: writeOrderIntervention },
      (line) => run.lines.push(line),
      bindings
    );
    if (invalid !== "empty") run.adapter.setRiverInfo(first);
    if (invalid === "duplicate") run.adapter.setRiverInfo({ ...first });
    if (invalid === "cycle") run.adapter.setRiverInfo({ ...first, x: 11, direction: "WEST" });
    expect(() =>
      run.adapter.finalizeRivers(
        invalid === "tuple" ? [true, 25, 2, 2] : RIVER_PROBE_VARIANTS.authored
      )
    ).toThrow();
    expect(run.calls).toEqual([]);
    expect(
      run.decode().filter(({ stage }) => ["inputs", "before", "after"].includes(stage))
    ).toEqual([]);
  });

  it.each([
    "validateAndFixTerrain",
    "generateCliffsFromElevation",
    "recalculateAreas",
    "storeWaterData",
    "setElevation",
  ] as const)("downstream delivery refuses pending-batch interleaving by %s", (method) => {
    const run = fixture();
    installWaterHeightMaintenanceProbe(
      run.adapter,
      "downstream-interleaving",
      identity,
      { ...WATER_HEIGHT_MAINTENANCE_PROBE, riverWriteOrderIntervention: writeOrderIntervention },
      (line) => run.lines.push(line),
      writeOrderBindings()
    );
    run.adapter.setRiverInfo({ x: 10, y: 10, direction: "EAST", riverClass: "MINOR" });
    expect(() =>
      method === "setElevation" ? run.adapter.setElevation([1]) : run.adapter[method]()
    ).toThrow("interleaved authentic mutation");
    expect(run.calls).toEqual([]);
    run.adapter.finalizeRivers(RIVER_PROBE_VARIANTS.authored);
    run.adapter.storeWaterData();
    expect(run.calls.map(({ method }) => method)).toEqual([
      "setRiverInfo",
      "finalizeRivers",
      "storeWaterData",
    ]);
  });

  it("downstream delivery preserves one native writer failure without replay or finalization", () => {
    const run = fixture(),
      sentinel = new Error("native writer failure");
    const delivered: number[] = [];
    run.adapter.setRiverInfo = (intent) => {
      delivered.push(intent.x);
      if (delivered.length === 2) throw sentinel;
    };
    installWaterHeightMaintenanceProbe(
      run.adapter,
      "downstream-writer-failure",
      identity,
      { ...WATER_HEIGHT_MAINTENANCE_PROBE, riverWriteOrderIntervention: writeOrderIntervention },
      (line) => run.lines.push(line),
      writeOrderBindings()
    );
    for (const x of [10, 11, 12])
      run.adapter.setRiverInfo({ x, y: 10, direction: "EAST", riverClass: "MINOR" });
    let caught: unknown;
    try {
      run.adapter.finalizeRivers(RIVER_PROBE_VARIANTS.authored);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBe(sentinel);
    expect(delivered).toEqual([12, 11]);
    expect(run.calls).toEqual([]);
    const inputs = run.decode().find(({ stage }) => stage === "inputs")!.payload;
    expect(inputs.writes).toEqual(
      [10, 11, 12].map((x) => ({
        wet: false,
        intent: { x, y: 10, direction: "EAST", riverClass: "MINOR" },
      }))
    );
    expect(inputs.riverWriteOrderIntervention!.appliedOrdinals).toEqual([2, 1, 0]);
    expect(run.decode().at(-1)!.stage).toBe("failed");
    expect(() => run.adapter.finalizeRivers(RIVER_PROBE_VARIANTS.authored)).toThrow(
      "already attempted"
    );
    expect(() => run.adapter.storeWaterData()).toThrow("interleaved authentic mutation");
    expect(delivered).toEqual([12, 11]);
  });

  it("downstream delivery guards interleaving during native delivery and never retries a finalizer error", () => {
    for (const failureKind of ["interleaving", "finalizer"] as const) {
      const run = fixture(),
        sentinel = new Error("native finalizer failure");
      let writerCalls = 0,
        finalizerCalls = 0;
      run.adapter.setRiverInfo = () => {
        writerCalls++;
        if (failureKind === "interleaving") run.adapter.validateAndFixTerrain();
      };
      run.adapter.finalizeRivers = () => {
        finalizerCalls++;
        throw sentinel;
      };
      installWaterHeightMaintenanceProbe(
        run.adapter,
        "downstream-delivery-error",
        identity,
        { ...WATER_HEIGHT_MAINTENANCE_PROBE, riverWriteOrderIntervention: writeOrderIntervention },
        (line) => run.lines.push(line),
        writeOrderBindings()
      );
      run.adapter.setRiverInfo({ x: 10, y: 10, direction: "EAST", riverClass: "MINOR" });
      let caught: unknown;
      try {
        run.adapter.finalizeRivers(RIVER_PROBE_VARIANTS.authored);
      } catch (error) {
        caught = error;
      }
      if (failureKind === "interleaving")
        expect(String(caught)).toContain("interleaved authentic mutation");
      else expect(caught).toBe(sentinel);
      expect(writerCalls).toBe(1);
      expect(finalizerCalls).toBe(failureKind === "finalizer" ? 1 : 0);
      expect(run.calls).toEqual([]);
      expect(() => run.adapter.finalizeRivers(RIVER_PROBE_VARIANTS.authored)).toThrow(
        "already attempted"
      );
      expect(writerCalls).toBe(1);
    }
  });

  it.each([
    "atlas",
    "variant",
    "qualification",
    "both",
  ] as const)("downstream delivery rejects invalid %s selection before installing", (invalid) => {
    const run = fixture();
    const options = {
      ...WATER_HEIGHT_MAINTENANCE_PROBE,
      riverWriteOrderIntervention: { ...writeOrderIntervention },
    };
    if (invalid === "atlas") Reflect.set(options, "atlasKind", "full-map-lake-cutoff");
    if (invalid === "variant")
      Reflect.set(options.riverWriteOrderIntervention, "variant", "aesthetic");
    if (invalid === "qualification")
      Reflect.set(options.riverWriteOrderIntervention, "qualification", "");
    if (invalid === "both")
      Reflect.set(options, "finalizationIntervention", {
        variant: "authored-upstream",
        requestedTuple: RIVER_PROBE_VARIANTS.authored,
        appliedTuple: RIVER_AUTHORED_FINALIZATION_VARIANTS["authored-upstream"],
        qualification: "test",
      });
    expect(() =>
      installWaterHeightMaintenanceProbe(
        run.adapter,
        "downstream-invalid",
        identity,
        options,
        (line) => run.lines.push(line),
        writeOrderBindings()
      )
    ).toThrow("Invalid downstream delivery");
    expect(run.calls).toEqual([]);
    expect(run.metadataCalls).toEqual([]);
    expect(run.lines).toEqual([]);
  });

  it("downstream delivery preserves a native adjacency failure before the first write", () => {
    const run = fixture(),
      bindings = writeOrderBindings(),
      sentinel = new Error("native adjacency failure");
    bindings.GameplayMap.getAdjacentPlotLocation = () => {
      throw sentinel;
    };
    installWaterHeightMaintenanceProbe(
      run.adapter,
      "downstream-adjacency-error",
      identity,
      { ...WATER_HEIGHT_MAINTENANCE_PROBE, riverWriteOrderIntervention: writeOrderIntervention },
      (line) => run.lines.push(line),
      bindings
    );
    run.adapter.setRiverInfo({ x: 10, y: 10, direction: "EAST", riverClass: "MINOR" });
    let caught: unknown;
    try {
      run.adapter.finalizeRivers(RIVER_PROBE_VARIANTS.authored);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBe(sentinel);
    expect(run.calls).toEqual([]);
  });
});

describe("post-recipe input transport and bounded-cutoff observation (not native preservation)", () => {
  const preset = getCiv7StandardMapSizePreset("MAPSIZE_TINY");
  const selection = {
    ...preset.dimensions,
    mapSize: preset.id,
    playerCount: preset.defaultPlayers,
    expectedLakeSizeCutoff: preset.mapInfo.LakeSizeCutoff,
  };

  it.each([
    { ...WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_PROBE, ...selection },
    { ...WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_PROBE, ...selection },
    { ...WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE, ...selection },
    { ...WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE, ...selection, expectedLakeSizeCutoff: 40 },
  ])("protects first-setter Number requests and observes both slots for $atlasKind/cutoff$expectedLakeSizeCutoff", (probe) => {
    const options = probe;
    const replay = probe.atlasKind === WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_ATLAS;
    const run = fixture(mapInfo(options.expectedLakeSizeCutoff, options.mapSize));
    const requests = Array.from({ length: options.width * options.height }, () => 638);
    requests[1] = Math.PI;
    const original = [...requests];
    let native = [...requests];
    const supplied: Array<Parameters<Adapter["setElevation"]>[0]> = [];
    const suppliedCopies: number[][] = [];
    run.adapter.readCurrentMapElevationSnapshot = () => {
      throw new Error("V18/V19 must not read the V20 input snapshot.");
    };
    run.adapter.getElevation = (x, y) => native[x + y * options.width]!;
    run.adapter.getFeatureType = (x, y) => (x === 0 && y === 0 ? 77 : -1);
    run.adapter.setElevation = (values) => {
      run.calls.push({ method: "setElevation", arg: values });
      supplied.push(values);
      suppliedCopies.push([...values]);
      native = [...values];
      if (supplied.length === 1) native[0] = 598;
      Reflect.set(values, 0, -999);
    };
    const finish = installWaterHeightMaintenanceProbe(
      run.adapter,
      "original-input-test",
      identity,
      options,
      (line) => run.lines.push(line)
    );
    run.adapter.setElevation(requests);
    run.adapter.validateAndFixTerrain();
    const genuineCalls = [...run.calls];
    finish();
    expect(supplied).toHaveLength(replay ? 2 : 1);
    expect(supplied[0]).toBe(requests);
    if (replay) {
      expect(supplied[1]).not.toBe(requests);
      expect(suppliedCopies[1]).toEqual(original);
    }
    expect(run.calls.slice(0, genuineCalls.length)).toEqual(genuineCalls);
    expect(run.calls.slice(genuineCalls.length).map((call) => call.method)).toEqual(
      replay ? ["setElevation"] : []
    );
    const records = run.decode();
    const inputs = records.filter((record) => record.stage === "original-elevation-input-grid");
    expect(inputs).toHaveLength(options.height);
    expect(inputs.flatMap((record) => record.payload.values ?? [])).toEqual(original);
    expect(records.filter((record) => record.stage.startsWith("dry-retention-input"))).toEqual([]);
    expect(
      records.find((record) => record.stage === "original-elevation-input")?.payload
    ).toMatchObject({
      count: original.length,
      sha256: sha256Hex(stableStringify(original)),
    });
    for (const checkpoint of ["before-original-replay", "after-original-replay"]) {
      const rows = records.filter(
        (record) =>
          record.stage === "original-replay-grid" && record.payload.checkpoint === checkpoint
      );
      expect(rows).toHaveLength(options.height);
      rows.forEach((record, row) => {
        expect(record.payload.row).toBe(row);
        expect(record.payload.startCell).toBe(row * options.width);
        for (const field of [
          "elevation",
          "terrain",
          "feature",
          "riverType",
          "water",
          "lake",
        ] as const)
          expect(record.payload[field]).toHaveLength(options.width);
      });
      expect(rows[0]?.payload.elevation?.slice(0, 2)).toEqual([
        checkpoint === "after-original-replay" && replay ? 638 : 598,
        Math.PI,
      ]);
      expect(rows[0]?.payload.feature?.[0]).toBe(77);
      expect(records.find((record) => record.stage === checkpoint)?.payload).toMatchObject({
        phase: "post-authentic-recipe",
        action: replay ? "replay-original-requests" : "none",
        cellCount: original.length,
        rowCount: options.height,
        originalInputSha256: sha256Hex(stableStringify(original)),
      });
    }
    expect(run.lines.every((line) => line.length <= BOUNDED_JSON_LOG_MAX_LINE_LENGTH)).toBe(true);
    const callCount = run.calls.length;
    expect(() => finish()).toThrow("already attempted");
    expect(run.calls).toHaveLength(callCount);
  });

  it("observes the two authentic setters without replay in the bounded cutoff arm", () => {
    const options = {
      ...WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE,
      ...selection,
      expectedLakeSizeCutoff: 40,
    };
    const run = fixture(mapInfo(options.expectedLakeSizeCutoff, options.mapSize));
    const first = Array<number>(options.width * options.height).fill(638);
    const second = Array<number>(first.length).fill(788);
    let native = first;
    run.adapter.getElevation = (x, y) => native[x + y * options.width]!;
    run.adapter.setElevation = (values) => {
      run.calls.push({ method: "setElevation", arg: values });
      native = [...values];
    };
    const finish = installWaterHeightMaintenanceProbe(
      run.adapter,
      "bounded-two-setters",
      identity,
      options,
      (line) => run.lines.push(line)
    );
    run.adapter.setElevation(first);
    run.adapter.validateAndFixTerrain();
    run.adapter.setElevation(second);
    run.adapter.recalculateAreas();
    run.adapter.storeWaterData();
    const calls = [...run.calls];
    finish();
    expect(run.calls).toEqual(calls);
    const records = run.decode();
    expect(
      records
        .filter((record) => record.stage === "original-elevation-input-grid")
        .flatMap((record) => record.payload.values ?? [])
    ).toEqual(first);
    for (const checkpoint of ["before-original-replay", "after-original-replay"])
      expect(
        records
          .filter(
            (record) =>
              record.stage === "original-replay-grid" && record.payload.checkpoint === checkpoint
          )
          .flatMap((record) => record.payload.elevation ?? [])
      ).toEqual(second);
  });

  it("constructs detached V20 requests from exact dry heights and only original wet inputs", () => {
    const options = { ...WATER_HEIGHT_DRY_RETENTION_REPLAY_PROBE, ...selection };
    const run = fixture(mapInfo(options.expectedLakeSizeCutoff, options.mapSize));
    const requests = Array<number>(options.width * options.height).fill(638);
    requests.splice(0, 8, 638, 228, 129, 1, 0, 777.25, -4.125, 300);
    const original = [...requests];
    let native = Float64Array.from(requests);
    const supplied: Array<Parameters<Adapter["setElevation"]>[0]> = [];
    const suppliedCopies: number[][] = [];
    let snapshotReads = 0;
    run.adapter.getElevation = (x, y) => native[x + y * options.width]!;
    run.adapter.getFeatureType = (x, y) => (x === 0 && y === 0 ? 77 : -1);
    run.adapter.getRiverType = (x, y) => (x === 1 && y === 0 ? 9 : -1);
    run.adapter.isWater = (x, y) => y === 0 && x >= 4 && x <= 6;
    // A contradictory dry lake flag proves that isLake cannot choose setter inputs.
    run.adapter.isLake = (x, y) => y === 0 && (x === 0 || x === 5);
    run.adapter.readCurrentMapElevationSnapshot = () => {
      snapshotReads++;
      return {
        source: "native",
        status: "available",
        width: options.width,
        height: options.height,
        values: native,
      };
    };
    run.adapter.setElevation = (values) => {
      run.calls.push({ method: "setElevation", arg: values });
      supplied.push(values);
      suppliedCopies.push([...values]);
      native = Float64Array.from(values);
      Reflect.set(values, 0, -999);
    };
    const finish = installWaterHeightMaintenanceProbe(
      run.adapter,
      "dry-retention-input",
      identity,
      options,
      (line) => run.lines.push(line)
    );
    run.adapter.setElevation(requests);
    native.set([598, -7.5, 127.25, 0, 17, 43, 0, Math.PI]);
    const retainedSnapshotValues = native;
    const before = Array.from(native);
    const expected = [...before];
    for (const cell of [4, 5, 6]) expected[cell] = original[cell]!;
    finish();
    expect(snapshotReads).toBe(1);
    expect(run.calls.map((call) => call.method)).toEqual(["setElevation", "setElevation"]);
    expect(supplied).toHaveLength(2);
    expect(supplied[0]).toBe(requests);
    expect(supplied[1]).not.toBe(requests);
    expect(supplied[1]).not.toBe(retainedSnapshotValues);
    expect(Array.isArray(supplied[1])).toBe(true);
    expect(suppliedCopies[1]).toEqual(expected);
    expect(Array.from(retainedSnapshotValues)).toEqual(before);
    expect(Array.from(native)).toEqual(expected);
    const records = run.decode();
    expect(
      records
        .filter((record) => record.stage === "original-elevation-input-grid")
        .flatMap((record) => record.payload.values ?? [])
    ).toEqual(original);
    const inputRows = records.filter((record) => record.stage === "dry-retention-input-grid");
    expect(inputRows).toHaveLength(options.height);
    inputRows.forEach((record, row) => {
      expect(record.payload.row).toBe(row);
      expect(record.payload.startCell).toBe(row * options.width);
      for (const field of ["values", "nativeElevation", "water"] as const)
        expect(record.payload[field]).toHaveLength(options.width);
    });
    expect(inputRows.flatMap((record) => record.payload.values ?? [])).toEqual(expected);
    expect(inputRows.flatMap((record) => record.payload.nativeElevation ?? [])).toEqual(before);
    expect(inputRows.flatMap((record) => record.payload.water ?? [])).toEqual(
      original.map((_, cell) => cell >= 4 && cell <= 6)
    );
    expect(records.find((record) => record.stage === "dry-retention-input")?.payload).toMatchObject(
      {
        phase: "post-authentic-recipe",
        source: "native",
        dimensions: preset.dimensions,
        count: original.length,
        rowCount: options.height,
        sha256: sha256Hex(stableStringify(expected)),
        originalInputSha256: sha256Hex(stableStringify(original)),
        selection:
          "isWater=true: protected original request; isWater=false: exact current native elevation; isLake is not a selector",
      }
    );
    for (const checkpoint of ["before-original-replay", "after-original-replay"]) {
      const rows = records.filter(
        (record) =>
          record.stage === "original-replay-grid" && record.payload.checkpoint === checkpoint
      );
      expect(rows).toHaveLength(options.height);
      expect(rows.flatMap((record) => record.payload.elevation ?? [])).toEqual(
        checkpoint === "before-original-replay" ? before : expected
      );
      expect(rows[0]?.payload.feature?.[0]).toBe(77);
      expect(rows[0]?.payload.riverType?.[1]).toBe(9);
      expect(records.find((record) => record.stage === checkpoint)?.payload.action).toBe(
        "replay-original-wet-retain-native-dry"
      );
    }
    const addedBefore = records.findIndex(
      (record) =>
        record.stage === "before" && record.payload.method === "setElevation-dry-retention-replay"
    );
    expect(addedBefore).toBeGreaterThan(
      records.findIndex((record) => record.stage === "dry-retention-input")
    );
    expect(addedBefore).toBeGreaterThan(
      records.findIndex((record) => record.stage === "before-original-replay")
    );
    expect(run.lines.every((line) => line.length <= BOUNDED_JSON_LOG_MAX_LINE_LENGTH)).toBe(true);
    expect(() => finish()).toThrow("already attempted");
    expect(supplied).toHaveLength(2);
  });

  it.each([
    "unavailable",
    "mock",
    "unknown-source",
    "unknown-status",
    "missing-snapshot",
    "missing-method",
    "non-finite",
    "infinite",
    "truncated",
    "overlong",
    "width",
    "height",
    "non-exact-storage",
  ])("refuses V20 %s snapshot before the added setter without original fallback", (invalid) => {
    const options = { ...WATER_HEIGHT_DRY_RETENTION_REPLAY_PROBE, ...selection };
    const run = fixture(mapInfo(options.expectedLakeSizeCutoff, options.mapSize));
    const current = {
      source: "native" as const,
      status: "available" as const,
      width: options.width,
      height: options.height,
      values: new Float64Array(options.width * options.height).fill(598),
    };
    if (invalid === "unavailable") Reflect.set(current, "status", "unavailable");
    if (invalid === "mock") Reflect.set(current, "source", "mock");
    if (invalid === "unknown-source") Reflect.set(current, "source", "unknown");
    if (invalid === "unknown-status") Reflect.set(current, "status", "partial");
    if (invalid === "non-finite") current.values[current.values.length - 1] = Number.NaN;
    if (invalid === "infinite")
      current.values[current.values.length - 1] = Number.POSITIVE_INFINITY;
    if (invalid === "truncated") current.values = current.values.slice(0, -1);
    if (invalid === "overlong") current.values = new Float64Array(current.values.length + 1);
    if (invalid === "width") current.width++;
    if (invalid === "height") current.height++;
    if (invalid === "non-exact-storage") Reflect.set(current, "values", Array.from(current.values));
    run.adapter.readCurrentMapElevationSnapshot = () => current;
    if (invalid === "missing-snapshot")
      Reflect.set(run.adapter, "readCurrentMapElevationSnapshot", () => undefined);
    if (invalid === "missing-method")
      Reflect.set(run.adapter, "readCurrentMapElevationSnapshot", undefined);
    const finish = installWaterHeightMaintenanceProbe(
      run.adapter,
      "dry-retention-refused",
      identity,
      options,
      (line) => run.lines.push(line)
    );
    run.adapter.setElevation(Array(options.width * options.height).fill(638));
    expect(() => finish()).toThrow("Dry retention requires");
    expect(run.calls.map((call) => call.method)).toEqual(["setElevation"]);
    expect(run.decode().filter((record) => record.stage === "dry-retention-input")).toEqual([]);
    expect(run.decode().filter((record) => record.stage === "after-original-replay")).toEqual([]);
    expect(() => finish()).toThrow("already attempted");
    expect(run.calls).toHaveLength(1);
  });

  it.each([
    0,
    1,
    undefined,
    null,
    {},
    "false",
  ])("refuses V20 nonboolean water %j across the complete grid", (invalid) => {
    const options = { ...WATER_HEIGHT_DRY_RETENTION_REPLAY_PROBE, ...selection };
    const run = fixture(mapInfo(options.expectedLakeSizeCutoff, options.mapSize));
    Reflect.set(run.adapter, "isWater", (x: number, y: number) =>
      x === options.width - 1 && y === options.height - 1 ? invalid : false
    );
    const finish = installWaterHeightMaintenanceProbe(
      run.adapter,
      "dry-retention-water-refused",
      identity,
      options,
      (line) => run.lines.push(line)
    );
    run.adapter.setElevation(Array(options.width * options.height).fill(638));
    expect(() => finish()).toThrow(
      `native boolean water observation at cell ${options.width * options.height - 1}`
    );
    expect(run.calls.map((call) => call.method)).toEqual(["setElevation"]);
    expect(run.decode().filter((record) => record.stage === "dry-retention-input-grid")).toEqual(
      []
    );
    expect(run.decode().filter((record) => record.stage === "after-original-replay")).toEqual([]);
    expect(() => finish()).toThrow("already attempted");
    expect(run.calls).toHaveLength(1);
  });

  it("preserves a V20 snapshot failure without fallback, retry or added maintenance", () => {
    const options = { ...WATER_HEIGHT_DRY_RETENTION_REPLAY_PROBE, ...selection };
    const run = fixture(mapInfo(options.expectedLakeSizeCutoff, options.mapSize));
    const failure = new Error("native elevation snapshot failed");
    run.adapter.readCurrentMapElevationSnapshot = () => {
      throw failure;
    };
    const finish = installWaterHeightMaintenanceProbe(
      run.adapter,
      "dry-retention-snapshot-failed",
      identity,
      options,
      (line) => run.lines.push(line)
    );
    run.adapter.setElevation(Array(options.width * options.height).fill(638));
    let observed: unknown;
    try {
      finish();
    } catch (error) {
      observed = error;
    }
    expect(observed).toBe(failure);
    expect(run.calls.map((call) => call.method)).toEqual(["setElevation"]);
    expect(run.decode().filter((record) => record.stage === "after-original-replay")).toEqual([]);
    expect(() => finish()).toThrow("already attempted");
  });

  it.each([
    WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_PROBE,
    WATER_HEIGHT_DRY_RETENTION_REPLAY_PROBE,
  ])("preserves V%s replay setter failure without retries, after evidence or extra maintenance", (probe) => {
    const options = { ...probe, ...selection };
    const run = fixture(mapInfo(options.expectedLakeSizeCutoff, options.mapSize));
    const failure = new Error("replay setter failure");
    let calls = 0;
    run.adapter.setElevation = () => {
      calls++;
      if (calls === 2) throw failure;
    };
    const finish = installWaterHeightMaintenanceProbe(
      run.adapter,
      "failed-replay",
      identity,
      options,
      (line) => run.lines.push(line)
    );
    run.adapter.setElevation(Array(options.width * options.height).fill(638));
    let observedFailure: unknown;
    try {
      finish();
    } catch (error) {
      observedFailure = error;
    }
    expect(observedFailure).toBe(failure);
    expect(calls).toBe(2);
    expect(run.decode().filter((record) => record.stage === "after-original-replay")).toEqual([]);
    expect(run.decode().filter((record) => record.stage === "original-replay-failed")).toHaveLength(
      1
    );
    expect(() => finish()).toThrow("already attempted");
    expect(calls).toBe(2);
    expect(run.calls).toEqual([]);
  });

  it.each([
    WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_PROBE,
    WATER_HEIGHT_DRY_RETENTION_REPLAY_PROBE,
  ])("requires a successful authentic setter and preserves V%s first-setter failure", (probe) => {
    const options = { ...probe, ...selection };
    const run = fixture(mapInfo(options.expectedLakeSizeCutoff, options.mapSize));
    const failure = new Error("authentic setter failure");
    let calls = 0;
    run.adapter.setElevation = () => {
      calls++;
      throw failure;
    };
    const finish = installWaterHeightMaintenanceProbe(
      run.adapter,
      "failed-authentic",
      identity,
      options,
      (line) => run.lines.push(line)
    );
    expect(() => finish()).toThrow("successful authentic elevation setter");
    expect(() => run.adapter.setElevation(Array(options.width * options.height).fill(638))).toThrow(
      failure
    );
    expect(() => finish()).toThrow("successful authentic elevation setter");
    expect(calls).toBe(1);
    expect(run.decode().filter((record) => record.stage === "original-replay-grid")).toEqual([]);
  });

  it("refuses incomplete native finishing observations without replaying", () => {
    const options = { ...WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_PROBE, ...selection };
    const run = fixture(mapInfo(options.expectedLakeSizeCutoff, options.mapSize));
    const failure = new Error("feature observation unavailable");
    run.adapter.getFeatureType = () => {
      throw failure;
    };
    const finish = installWaterHeightMaintenanceProbe(
      run.adapter,
      "failed-observation",
      identity,
      options,
      (line) => run.lines.push(line)
    );
    run.adapter.setElevation(Array(options.width * options.height).fill(638));
    let observedFailure: unknown;
    try {
      finish();
    } catch (error) {
      observedFailure = error;
    }
    expect(observedFailure).toBe(failure);
    expect(run.calls.map((call) => call.method)).toEqual(["setElevation"]);
    expect(run.decode().filter((record) => record.stage === "after-original-replay")).toEqual([]);
  });

  it.each([
    WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_ATLAS,
    WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_ATLAS,
    WATER_HEIGHT_DRY_RETENTION_REPLAY_ATLAS,
    WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_ATLAS,
  ] as const)("finishes only after authentic generated recipe success for %s", async (atlas) => {
    const built = await buildRiverProbePlan("original-execute", "authored", atlas, {
      mapSize: "MAPSIZE_TINY",
      mapSeed: 42,
      gameSeed: 7331,
      playerCount: 3,
    });
    const script = String(
      built.files.find((file) => file.relativePath === "maps/river-contract.js")!.content
    );
    const run = await physicalLakeRun();
    const events: string[] = [];
    const execute = generatedMaintenanceExecute(
      script,
      (context, plan, options) => {
        standardRecipe.execute(context, plan, options);
        events.push("authentic-returned");
      },
      () => {
        events.push("physical-lakes");
      },
      () => {
        events.push("finishing-slot");
      }
    );
    const originalLog = console.log;
    try {
      console.log = () => {};
      execute(run.context, run.plan, { log: () => {} });
    } finally {
      console.log = originalLog;
    }
    expect(events).toEqual(["authentic-returned", "finishing-slot", "physical-lakes"]);

    const failedRun = await physicalLakeRun();
    const failure = new Error("authentic native boundary failure");
    failedRun.adapter.setElevation = () => {
      throw failure;
    };
    let delegatedFailure: unknown;
    let finishingCalls = 0,
      observations = 0;
    const failing = generatedMaintenanceExecute(
      script,
      (context, plan, options) => {
        try {
          standardRecipe.execute(context, plan, options);
        } catch (error) {
          delegatedFailure = error;
          throw error;
        }
      },
      () => {
        observations++;
      },
      () => {
        finishingCalls++;
      }
    );
    let observedFailure: unknown;
    try {
      console.log = () => {};
      try {
        failing(failedRun.context, failedRun.plan, { log: () => {} });
      } catch (error) {
        observedFailure = error;
      }
    } finally {
      console.log = originalLog;
    }
    expect(observedFailure).toBe(delegatedFailure);
    expect(observedFailure).toHaveProperty("cause", failure);
    expect(finishingCalls).toBe(0);
    expect(observations).toBe(0);
  }, 30_000);
});

describe("water height maintenance observation (not native semantics)", () => {
  it.each([
    20, 6996, 40,
  ])("admits the actual cutoff %s through custom selection without weakening official preset admission", async (cutoff) => {
    const capture = cutoffCapture(cutoff);
    const before = structuredClone(capture);
    const official = projectStandardInitialSetup(capture);
    const diagnostic = projectLakeCutoffInitialSetup(capture, cutoff);
    expect(diagnostic).toEqual({
      ...official,
      map: { ...official.map, selection: { ...official.map.selection, kind: "custom" } },
    });
    expect(diagnostic.map.selection.mapInfo.LakeSizeCutoff).toBe(cutoff);
    expect(capture.mapInfo).toEqual(diagnostic.map.selection.mapInfo);
    expect(capture).toEqual(before);
    const [config] = await loadSwooperMapConfigCatalog({ catalogConfigIds: ["swooper-earthlike"] });
    expect(() => standardRecipe.compileConfig(official, config!.canonicalConfig.config)).toThrow(
      "mapInfo.LakeSizeCutoff"
    );
    expect(() =>
      standardRecipe.compileConfig(diagnostic, config!.canonicalConfig.config)
    ).not.toThrow();
  });

  it.each([
    20, 6996, 40,
  ])("refuses every other official static field drift and non-Huge capture for cutoff %s", (cutoff) => {
    for (const key of CIV7_MAP_INFO_KEYS) {
      const capture = cutoffCapture(cutoff);
      const value = capture.mapInfo[key];
      const changed =
        typeof value === "number"
          ? value + 1
          : typeof value === "boolean"
            ? !value
            : `${String(value)}-drift`;
      expect(() =>
        projectLakeCutoffInitialSetup(
          { ...capture, mapInfo: { ...capture.mapInfo, [key]: changed } },
          cutoff
        )
      ).toThrow();
    }
    const capture = cutoffCapture(cutoff);
    expect(() =>
      projectLakeCutoffInitialSetup(
        { ...capture, dimensions: { ...capture.dimensions, width: 105 } },
        cutoff
      )
    ).toThrow("Huge selection");
    expect(() =>
      projectLakeCutoffInitialSetup(
        { ...capture, startSlotCapacity: { ...capture.startSlotCapacity, total: 11 } },
        cutoff
      )
    ).toThrow("Huge start-slot capacity");
    expect(() =>
      projectLakeCutoffInitialSetup({ ...capture, mapSizeId: "MAPSIZE_STANDARD" }, cutoff)
    ).toThrow("disagrees");
    expect(() =>
      projectLakeCutoffInitialSetup(
        { ...capture, mapInfo: { ...capture.mapInfo, LakeSizeCutoff: 10 } },
        cutoff
      )
    ).toThrow(`LakeSizeCutoff=${cutoff}`);
    expect(() => projectLakeCutoffInitialSetup(capture, 100)).toThrow("LakeSizeCutoff=100");
  });

  it("keeps the V11 projector default at 20 and defines V12 from the Huge cell count", () => {
    expect(
      projectLakeCutoffInitialSetup(cutoffCapture()).map.selection.mapInfo.LakeSizeCutoff
    ).toBe(20);
    expect(() => projectLakeCutoffInitialSetup(cutoffCapture(6996))).toThrow("LakeSizeCutoff=20");
    expect(WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE.expectedLakeSizeCutoff).toBe(106 * 66);
    expect(() => projectLakeCutoffInitialSetup(cutoffCapture(40))).toThrow("LakeSizeCutoff=20");
    expect(WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE).toEqual({
      ...WATER_HEIGHT_MAINTENANCE_PROBE,
      diagnosticRevision: 22,
      displayLabel: "Water Bounded Lake Cutoff V22",
      atlasKind: "full-map-bounded-lake-cutoff",
      expectedLakeSizeCutoff: 40,
    });
  });

  it.each([
    ...selectedSizes,
  ])("preserves the complete %s capture and changes only the treatment kind", (mapSize) => {
    const preset = getCiv7StandardMapSizePreset(mapSize);
    const capture = { ...cutoffCapture(100, mapSize), mapSeed: -42, gameSeed: 7331 };
    const before = structuredClone(capture);
    const official = projectStandardInitialSetup(capture);
    const diagnostic = projectLakeCutoffInitialSetup(capture, 100, mapSize);
    expect(diagnostic).toEqual({
      ...official,
      map: { ...official.map, selection: { ...official.map.selection, kind: "custom" } },
    });
    expect(capture).toEqual(before);
    expect(
      CIV7_MAP_INFO_KEYS.filter(
        (key) => diagnostic.map.selection.mapInfo[key] !== preset.mapInfo[key]
      )
    ).toEqual(["LakeSizeCutoff"]);
    const stock = cutoffCapture(preset.mapInfo.LakeSizeCutoff, mapSize);
    expect(projectLakeCutoffInitialSetup(stock, preset.mapInfo.LakeSizeCutoff, mapSize)).toEqual(
      projectStandardInitialSetup(stock)
    );
    expect(
      projectLakeCutoffInitialSetup(stock, preset.mapInfo.LakeSizeCutoff, mapSize).map.selection
        .kind
    ).toBe("civ7-preset");
    const cells = preset.dimensions.width * preset.dimensions.height;
    expect(
      projectLakeCutoffInitialSetup(cutoffCapture(cells, mapSize), cells, mapSize).map.selection
        .mapInfo.LakeSizeCutoff
    ).toBe(cells);
    for (const cutoff of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, cells + 1])
      expect(() => projectLakeCutoffInitialSetup(capture, cutoff, mapSize)).toThrow(
        "positive integer"
      );
    for (const key of CIV7_MAP_INFO_KEYS) {
      const value = capture.mapInfo[key];
      const changed =
        typeof value === "number"
          ? value + 1
          : typeof value === "boolean"
            ? !value
            : `${String(value)}-drift`;
      expect(() =>
        projectLakeCutoffInitialSetup(
          { ...capture, mapInfo: { ...capture.mapInfo, [key]: changed } },
          100,
          mapSize
        )
      ).toThrow();
    }
    expect(() => projectLakeCutoffInitialSetup(capture, 99, mapSize)).toThrow("LakeSizeCutoff=99");
    expect(() =>
      projectLakeCutoffInitialSetup(
        { ...capture, dimensions: { ...preset.dimensions, width: preset.dimensions.width - 1 } },
        100,
        mapSize
      )
    ).toThrow("selection and dimensions");
    for (const key of ["west", "east", "total"] as const)
      expect(() =>
        projectLakeCutoffInitialSetup(
          {
            ...capture,
            startSlotCapacity: {
              ...capture.startSlotCapacity,
              [key]: capture.startSlotCapacity[key] + 1,
            },
          },
          100,
          mapSize
        )
      ).toThrow("start-slot capacity");
    const otherSize = mapSize === "MAPSIZE_HUGE" ? "MAPSIZE_TINY" : "MAPSIZE_HUGE";
    expect(() => projectLakeCutoffInitialSetup(capture, 100, otherSize)).toThrow(
      "selection and dimensions"
    );
  });

  it.each([
    42, 1018, 1234,
  ])("admits cutoff40 unchanged for seed %s without a per-seed gate", (seed) => {
    const capture = { ...cutoffCapture(40), mapSeed: seed, gameSeed: seed };
    const setup = projectLakeCutoffInitialSetup(capture, 40);
    expect(setup.map.selection.kind).toBe("custom");
    expect(setup.map.selection.mapInfo.LakeSizeCutoff).toBe(40);
    expect(capture.mapSeed).toBe(seed);
    expect(capture.gameSeed).toBe(seed);
  });

  it.each([
    WATER_HEIGHT_MAINTENANCE_PROBE,
    WATER_HEIGHT_LAKE_CUTOFF_PROBE,
    WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE,
    WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE,
  ])("preserves admitted call order, arguments and count for $atlasKind", (options) => {
    const info = mapInfo(options.expectedLakeSizeCutoff);
    const { adapter, calls, metadataCalls, lines, decode } = fixture(info);
    installWaterHeightMaintenanceProbe(adapter, "maintenance-test", identity, options, (line) =>
      lines.push(line)
    );
    expect(metadataCalls).toHaveLength(0);
    const values = Array(6996).fill(20);
    const dry = { x: 92, y: 34, direction: "WEST", riverClass: "NAVIGABLE" } as const;
    const wet = { ...dry, x: 93 };
    const args = [false, 25, 2, 2] as const;
    adapter.setElevation(values);
    adapter.setRiverInfo(dry);
    adapter.setRiverInfo(wet);
    adapter.finalizeRivers(args);
    adapter.validateAndFixTerrain();
    adapter.generateCliffsFromElevation();
    adapter.recalculateAreas();
    adapter.storeWaterData();
    adapter.validateAndFixTerrain();
    expect(calls.map((call) => call.method)).toEqual([
      "setElevation",
      "setRiverInfo",
      "setRiverInfo",
      "finalizeRivers",
      "validateAndFixTerrain",
      "generateCliffsFromElevation",
      "recalculateAreas",
      "storeWaterData",
      "validateAndFixTerrain",
    ]);
    expect(calls[0]!.arg).toBe(values);
    expect(calls[1]!.arg).toBe(dry);
    expect(calls[2]!.arg).toBe(wet);
    expect(calls[3]!.arg).toBe(args);
    const records = decode();
    expect(records.every((record) => record.proofId === "maintenance-test")).toBe(true);
    expect(
      records.every(
        (record) =>
          record.diagnosticRevision === options.diagnosticRevision &&
          record.atlasKind === options.atlasKind
      )
    ).toBe(true);
    expect(metadataCalls).toEqual([
      { method: "getMapSizeId" },
      { method: "lookupMapInfo", arg: "MAPSIZE_HUGE" },
    ]);
    expect(
      records.filter((record) => record.stage === "map-info").map((record) => record.payload)
    ).toEqual([
      {
        mapSizeId: "MAPSIZE_HUGE",
        mapInfo: info,
        expectedLakeSizeCutoff: options.expectedLakeSizeCutoff,
        observedLakeSizeCutoff: options.expectedLakeSizeCutoff,
        activation: "accepted",
      },
    ]);
    const validations = records.filter(
      (record) => record.payload.method === "validateAndFixTerrain"
    );
    expect(
      validations.map((record) => [
        record.stage,
        record.payload.occurrence,
        record.payload.points?.[0]?.elevation,
      ])
    ).toEqual([
      ["before", 1, 30],
      ["after", 1, 31],
      ["before", 2, 31],
      ["after", 2, 32],
    ]);
    const inputs = records.find((record) => record.stage === "inputs")!.payload;
    expect(inputs.writes).toEqual([
      { wet: false, intent: dry },
      { wet: true, intent: wet },
    ]);
    expect(inputs.elevations?.[0]).toMatchObject({ count: 6996 });
    expect(inputs.elevations?.[0]?.sha256).toMatch(/^[a-f0-9]{64}$/);
    const legacyLogDigests: Record<string, string> = {
      "full-map-maintenance": "0120dd662a7f6502bf78ce291b292f6c1d4cc1ca188840a53c9102217e2b7bf4",
      "full-map-lake-cutoff": "678067441c3d8db02518d486e461d1592a3adc00f7f0fd744ea45d2725da8e49",
      "full-map-max-lake-cutoff":
        "379f3e3aa6147464702457d60776aae3ab38f67bd7fa4d1d95c00bf6a2f9957c",
      "full-map-bounded-lake-cutoff":
        "4c5355d38b1cce1821ebe862eb305df9ed03ea3adca22afc0abec4921b77b697",
    };
    if (legacyLogDigests[options.atlasKind]) {
      // The source rows are additive; retain exact historical evidence for every existing field.
      const historicalRecords = records.map(({ payload, ...record }) => {
        const { riverSourceRows: _sourceRows, ...historicalPayload } = payload;
        return { ...record, payload: historicalPayload };
      });
      expect(sha256Hex(stableStringify(historicalRecords))).toBe(
        legacyLogDigests[options.atlasKind]
      );
    }
  });

  it.each([
    "authored-upstream",
    "authored-length",
    "authored-minima",
  ] as const)("authored finalizer %s changes only its declared tuple, with immutable arguments and one authentic call", (variant) => {
    const run = fixture();
    const intervention = {
      variant,
      requestedTuple: RIVER_PROBE_VARIANTS.authored,
      appliedTuple: RIVER_AUTHORED_FINALIZATION_VARIANTS[variant],
      qualification: "Diagnostic-only authored finalizer minima ablation",
    };
    const untouched = structuredClone(intervention);
    const requested = Object.freeze([false, 25, 2, 2] as const);
    const nativeReturn = { authentic: "return" };
    const original = run.adapter.finalizeRivers;
    let nativeCalls = 0;
    run.adapter.finalizeRivers = (args) => {
      nativeCalls++;
      expect(args).toEqual(intervention.appliedTuple);
      expect(args).not.toBe(requested);
      original(args);
      Reflect.set(args, 2, 99);
      return nativeReturn;
    };
    installWaterHeightMaintenanceProbe(
      run.adapter,
      "authored-finalizer-arm",
      identity,
      { ...WATER_HEIGHT_MAINTENANCE_PROBE, finalizationIntervention: intervention },
      (line) => run.lines.push(line)
    );
    const intent = { x: 92, y: 34, direction: "WEST", riverClass: "NAVIGABLE" } as const;
    run.adapter.setRiverInfo(intent);
    const result: unknown = run.adapter.finalizeRivers(requested);
    run.adapter.validateAndFixTerrain();
    run.adapter.storeWaterData();
    expect(result).toBe(nativeReturn);
    expect(nativeCalls).toBe(1);
    expect(requested).toEqual([false, 25, 2, 2]);
    expect(intervention).toEqual(untouched);
    expect(run.calls.map(({ method }) => method)).toEqual([
      "setRiverInfo",
      "finalizeRivers",
      "validateAndFixTerrain",
      "storeWaterData",
    ]);
    expect(run.calls[0]!.arg).toBe(intent);
    const records = run.decode();
    expect(
      records.find(({ stage }) => stage === "installed")!.payload.finalizationIntervention
    ).toEqual(untouched);
    const inputs = records.find(({ stage }) => stage === "inputs")!.payload;
    expect(inputs.finalizationTuple).toEqual(requested);
    expect(inputs.finalizationIntervention).toEqual(untouched);
    expect(inputs.writes).toEqual([{ wet: false, intent }]);
  });

  it.each([
    "authored-upstream",
    "authored-length",
    "authored-minima",
  ] as const)("authored finalizer %s preserves native error identity without retry or successful after record", (variant) => {
    const run = fixture();
    const sentinel = new Error("authentic finalizer failure");
    let nativeCalls = 0;
    run.adapter.finalizeRivers = (args) => {
      nativeCalls++;
      expect(args).toEqual(RIVER_AUTHORED_FINALIZATION_VARIANTS[variant]);
      throw sentinel;
    };
    installWaterHeightMaintenanceProbe(
      run.adapter,
      "authored-finalizer-error",
      identity,
      {
        ...WATER_HEIGHT_MAINTENANCE_PROBE,
        finalizationIntervention: {
          variant,
          requestedTuple: RIVER_PROBE_VARIANTS.authored,
          appliedTuple: RIVER_AUTHORED_FINALIZATION_VARIANTS[variant],
          qualification: "Diagnostic-only authored finalizer minima ablation",
        },
      },
      (line) => run.lines.push(line)
    );
    const requested = Object.freeze([false, 25, 2, 2] as const);
    let thrown: unknown;
    try {
      run.adapter.finalizeRivers(requested);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBe(sentinel);
    expect(nativeCalls).toBe(1);
    expect(requested).toEqual([false, 25, 2, 2]);
    expect(run.decode().filter(({ stage }) => stage === "after")).toHaveLength(0);
    expect(run.decode().at(-1)!.stage).toBe("failed");
  });

  it.each([
    "atlas",
    "variant",
    "requested",
    "applied",
    "qualification",
  ] as const)("authored finalizer refuses invalid %s selection before adapter calls or installation", (invalid) => {
    const run = fixture();
    const options = {
      ...WATER_HEIGHT_MAINTENANCE_PROBE,
      finalizationIntervention: {
        variant: "authored-upstream" as const,
        requestedTuple: RIVER_PROBE_VARIANTS.authored,
        appliedTuple: RIVER_AUTHORED_FINALIZATION_VARIANTS["authored-upstream"],
        qualification: "Diagnostic-only authored finalizer minima ablation",
      },
    };
    if (invalid === "atlas") Reflect.set(options, "atlasKind", "full-map-lake-cutoff");
    if (invalid === "variant")
      Reflect.set(options.finalizationIntervention, "variant", "aesthetic");
    if (invalid === "requested")
      Reflect.set(options.finalizationIntervention, "requestedTuple", [true, 25, 2, 2]);
    if (invalid === "applied")
      Reflect.set(options.finalizationIntervention, "appliedTuple", [false, 25, 0, 0]);
    if (invalid === "qualification")
      Reflect.set(options.finalizationIntervention, "qualification", "");
    expect(() =>
      installWaterHeightMaintenanceProbe(
        run.adapter,
        "refused-finalizer-arm",
        identity,
        options,
        (line) => run.lines.push(line)
      )
    ).toThrow("Invalid authored finalizer ablation");
    expect(run.calls).toHaveLength(0);
    expect(run.metadataCalls).toHaveLength(0);
    expect(run.lines).toHaveLength(0);
  });

  it("authored finalizer refuses changed authentic arguments before native finalization", () => {
    for (const requested of [
      [true, 25, 2, 2],
      [false, 25, 4, 2],
      [false, 0, 2, 2],
    ] as const) {
      const run = fixture();
      installWaterHeightMaintenanceProbe(
        run.adapter,
        "refused-authentic-tuple",
        identity,
        {
          ...WATER_HEIGHT_MAINTENANCE_PROBE,
          finalizationIntervention: {
            variant: "authored-upstream",
            requestedTuple: RIVER_PROBE_VARIANTS.authored,
            appliedTuple: RIVER_AUTHORED_FINALIZATION_VARIANTS["authored-upstream"],
            qualification: "Diagnostic-only authored finalizer minima ablation",
          },
        },
        (line) => run.lines.push(line)
      );
      expect(() => run.adapter.finalizeRivers(requested)).toThrow("authentic requested tuple");
      expect(run.calls).toHaveLength(0);
      expect(run.metadataCalls).toHaveLength(0);
      expect(
        run.decode().filter(({ stage }) => ["inputs", "before", "after"].includes(stage))
      ).toHaveLength(0);
    }
  });

  it("observes all 666 dry and 39 wet river source rows at authentic coercion boundaries", () => {
    const run = fixture();
    const states = new Map<string, { riverClass: number; terrain: number }>();
    const key = (x: number, y: number) => `${x},${y}`;
    const nav = 11,
      minor = 7;
    run.adapter.isWater = (_x, y) => y === 65;
    run.adapter.getRiverType = (x, y) => states.get(key(x, y))?.riverClass ?? -1;
    run.adapter.getTerrainType = (x, y) => states.get(key(x, y))?.terrain ?? 1;
    const originalWrite = run.adapter.setRiverInfo;
    run.adapter.setRiverInfo = (intent) => {
      originalWrite(intent);
      states.set(key(intent.x, intent.y), {
        riverClass: intent.riverClass === "NAVIGABLE" ? nav : minor,
        terrain: intent.y === 65 ? 3 : intent.riverClass === "NAVIGABLE" ? 5 : 1,
      });
    };
    const receipt = { authentic: "finalization-return" };
    const originalFinalize = run.adapter.finalizeRivers;
    run.adapter.finalizeRivers = (args) => {
      originalFinalize(args);
      states.set(key(0, 0), { riverClass: minor, terrain: 1 });
      return receipt;
    };
    const originalValidate = run.adapter.validateAndFixTerrain;
    run.adapter.validateAndFixTerrain = () => {
      originalValidate();
      states.set(key(2, 0), { riverClass: minor, terrain: 1 });
    };
    installWaterHeightMaintenanceProbe(
      run.adapter,
      "river-source-boundaries",
      identity,
      { ...WATER_HEIGHT_MAINTENANCE_PROBE, playerCount: 12 },
      (line) => run.lines.push(line)
    );
    const dry = Array.from({ length: 666 }, (_, cell) => ({
      x: cell % 106,
      y: Math.floor(cell / 106),
      direction: "EAST" as const,
      riverClass: cell % 2 === 0 ? ("NAVIGABLE" as const) : ("MINOR" as const),
    }));
    const wet = Array.from({ length: 39 }, (_, x) => ({
      x,
      y: 65,
      direction: "NORTHWEST" as const,
      riverClass: "NAVIGABLE" as const,
    }));
    const intents = [...dry, ...wet];
    const before = structuredClone(intents);
    for (const intent of intents) run.adapter.setRiverInfo(intent);
    const args = [false, 25, 2, 2] as const;
    const observedReturn: unknown = run.adapter.finalizeRivers(args);
    expect(observedReturn).toBe(receipt);
    run.adapter.validateAndFixTerrain();
    run.adapter.storeWaterData();
    expect(run.calls.map(({ method }) => method)).toEqual([
      ...intents.map(() => "setRiverInfo"),
      "finalizeRivers",
      "validateAndFixTerrain",
      "storeWaterData",
    ]);
    for (let index = 0; index < intents.length; index++)
      expect(run.calls[index]!.arg).toBe(intents[index]);
    expect(run.calls[intents.length]!.arg).toBe(args);
    expect(intents).toEqual(before);
    const records = run.decode();
    const input = records.find(({ stage }) => stage === "inputs")!.payload;
    expect(input.writes).toEqual([
      ...dry.map((intent) => ({ wet: false, intent })),
      ...wet.map((intent) => ({ wet: true, intent })),
    ]);
    const checkpoints = records.filter(({ stage }) => stage === "before" || stage === "after");
    expect(checkpoints).toHaveLength(6);
    for (const checkpoint of checkpoints) {
      expect(checkpoint.payload.riverSourceRows).toHaveLength(705);
      expect(
        checkpoint.payload.riverSourceRows!.map(({ x, y, intendedClass }) => ({
          x,
          y,
          intendedClass,
        }))
      ).toEqual(intents.map(({ x, y, riverClass }) => ({ x, y, intendedClass: riverClass })));
      expect(checkpoint.payload.riverSourceRows!.at(-1)).toEqual({
        x: 38,
        y: 65,
        intendedClass: "NAVIGABLE",
        observedClass: nav,
        terrain: 3,
      });
    }
    expect(
      checkpoints.map(({ stage, payload }) => [
        stage,
        payload.method,
        payload.riverSourceRows![0]!.observedClass,
        payload.riverSourceRows![2]!.observedClass,
      ])
    ).toEqual([
      ["before", "finalizeRivers", nav, nav],
      ["after", "finalizeRivers", minor, nav],
      ["before", "validateAndFixTerrain", minor, nav],
      ["after", "validateAndFixTerrain", minor, minor],
      ["before", "storeWaterData", minor, minor],
      ["after", "storeWaterData", minor, minor],
    ]);
    expect(run.lines.every((line) => line.length <= BOUNDED_JSON_LOG_MAX_LINE_LENGTH)).toBe(true);
  });

  it("records unavailable river source reads without replacing authentic returns or errors", () => {
    const run = fixture();
    const source = { x: 1, y: 1, direction: "WEST", riverClass: "NAVIGABLE" } as const;
    run.adapter.getRiverType = (x, y) => {
      if (x === source.x && y === source.y) throw new Error("source class unavailable");
      return -1;
    };
    run.adapter.getTerrainType = (x, y) => (x === source.x && y === source.y ? NaN : 3);
    const sentinel = new Error("authentic native failure");
    let attempts = 0;
    run.adapter.finalizeRivers = (args) => {
      run.calls.push({ method: "finalizeRivers", arg: args });
      attempts++;
      throw sentinel;
    };
    installWaterHeightMaintenanceProbe(
      run.adapter,
      "river-source-unavailable",
      identity,
      WATER_HEIGHT_MAINTENANCE_PROBE,
      (line) => run.lines.push(line)
    );
    run.adapter.setRiverInfo(source);
    const args = [false, 25, 2, 2] as const;
    let thrown: unknown;
    try {
      run.adapter.finalizeRivers(args);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBe(sentinel);
    expect(attempts).toBe(1);
    expect(run.calls).toEqual([
      { method: "setRiverInfo", arg: source },
      { method: "finalizeRivers", arg: args },
    ]);
    expect(run.calls[0]!.arg).toBe(source);
    expect(run.calls[1]!.arg).toBe(args);
    const records = run.decode();
    expect(records.find(({ stage }) => stage === "before")!.payload.riverSourceRows).toEqual([
      {
        x: 1,
        y: 1,
        intendedClass: "NAVIGABLE",
        observedClass: {
          status: "unavailable",
          member: "getRiverType",
          reason: "threw: Error: source class unavailable",
        },
        terrain: { status: "unavailable", member: "getTerrainType", reason: "not-a-safe-integer" },
      },
    ]);
    expect(records.filter(({ stage }) => stage === "after")).toHaveLength(0);
    expect(records.at(-1)!.stage).toBe("failed");
  });

  it("never queries off-map river source readbacks after an authentic invalid write", () => {
    const run = fixture();
    const queried: { x: number; y: number }[] = [];
    for (const member of ["getRiverType", "getTerrainType"] as const) {
      const original = run.adapter[member];
      run.adapter[member] = (x, y) => {
        queried.push({ x, y });
        return original(x, y);
      };
    }
    installWaterHeightMaintenanceProbe(
      run.adapter,
      "river-source-bounds",
      identity,
      WATER_HEIGHT_MAINTENANCE_PROBE,
      (line) => run.lines.push(line)
    );
    run.adapter.setRiverInfo({ x: 106, y: 65, direction: "WEST", riverClass: "NAVIGABLE" });
    run.adapter.storeWaterData();
    expect(queried.every(({ x, y }) => x >= 0 && y >= 0 && x < 106 && y < 66)).toBe(true);
    expect(run.calls.map(({ method }) => method)).toEqual(["setRiverInfo", "storeWaterData"]);
    const row = run.decode().find(({ stage }) => stage === "before")!.payload.riverSourceRows![0]!;
    expect(row.observedClass).toEqual({
      status: "unavailable",
      member: "getRiverType",
      reason: "source-coordinates-out-of-bounds",
    });
    expect(row.terrain).toEqual({
      status: "unavailable",
      member: "getTerrainType",
      reason: "source-coordinates-out-of-bounds",
    });
  });

  it("observes changed lake identity without refusing or changing repeated maintenance calls in V12", () => {
    const { adapter, calls, lines, decode } = fixture(mapInfo(6996));
    adapter.isLake = () => true;
    installWaterHeightMaintenanceProbe(
      adapter,
      "marine-discriminator",
      identity,
      WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE,
      (line) => lines.push(line)
    );
    for (let call = 0; call < 17; call++) adapter.validateAndFixTerrain();
    expect(calls).toEqual(Array.from({ length: 17 }, () => ({ method: "validateAndFixTerrain" })));
    const observations = decode().filter(
      (record) => record.stage === "before" || record.stage === "after"
    );
    expect(observations).toHaveLength(34);
    expect(
      observations.every((record) => record.payload.points?.every((point) => point.lake))
    ).toBe(true);
    expect(decode().find((record) => record.stage === "map-info")!.payload.activation).toBe(
      "accepted"
    );
  });

  it.each([
    { mapSeed: 42, gameSeed: 42 },
    { mapSeed: 1018, gameSeed: 42 },
  ])("uses fixed-coordinate controls without seed1018 hydraulic claims for $mapSeed/$gameSeed", (seeds) => {
    const reference = fixture(mapInfo(40));
    installWaterHeightMaintenanceProbe(
      reference.adapter,
      "reference-focus",
      identity,
      WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE,
      (line) => reference.lines.push(line)
    );
    const referenceFocus = reference.decode()[0]!.payload.focus!;
    const expectedFocus = referenceFocus.map(({ x, y }) => ({
      role: "fixed-coordinate-control",
      x,
      y,
    }));
    const observed = fixture(mapInfo(40));
    installWaterHeightMaintenanceProbe(
      observed.adapter,
      "seeded-focus",
      identity,
      { ...WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE, ...seeds },
      (line) => observed.lines.push(line)
    );
    expect(observed.decode()[0]!.payload.focus).toEqual(expectedFocus);
    observed.adapter.validateAndFixTerrain();
    expect(observed.calls).toEqual([{ method: "validateAndFixTerrain" }]);
    const snapshots = observed
      .decode()
      .filter((record) => record.stage === "before" || record.stage === "after");
    expect(snapshots).toHaveLength(2);
    for (const record of snapshots) {
      const points = record.payload.points!;
      expect(points.map(({ role, x, y }) => ({ role, x, y }))).toEqual(expectedFocus);
      expect(points.every((point) => !Object.hasOwn(point, "body"))).toBe(true);
    }
  });

  it.each([
    ...selectedSizes,
  ])("bounds all %s observer coordinates while preserving original calls and failures", (mapSize) => {
    const preset = getCiv7StandardMapSizePreset(mapSize);
    const options = {
      ...WATER_HEIGHT_MAINTENANCE_PROBE,
      mapSize,
      ...preset.dimensions,
      mapSeed: -42,
      gameSeed: 7331,
      playerCount: preset.defaultPlayers,
      expectedLakeSizeCutoff: preset.mapInfo.LakeSizeCutoff,
    };
    const observed = fixture(mapInfo(options.expectedLakeSizeCutoff, mapSize));
    installWaterHeightMaintenanceProbe(
      observed.adapter,
      "bounded-observer",
      identity,
      options,
      (line) => observed.lines.push(line)
    );
    const points = observed.decode()[0]!.payload.focus!;
    expect(points.length).toBeGreaterThan(0);
    expect(
      points.every(
        (point) => point.role === "fixed-coordinate-control" && !Object.hasOwn(point, "body")
      )
    ).toBe(true);
    const values = Array(preset.dimensions.width * preset.dimensions.height).fill(20);
    const intent = { x: 10, y: 10, direction: "WEST", riverClass: "NAVIGABLE" } as const;
    const args = [false, 25, 2, 2] as const;
    observed.adapter.setElevation(values);
    observed.adapter.setRiverInfo(intent);
    observed.adapter.finalizeRivers(args);
    observed.adapter.validateAndFixTerrain();
    observed.adapter.generateCliffsFromElevation();
    observed.adapter.recalculateAreas();
    observed.adapter.storeWaterData();
    expect(observed.calls.map(({ method }) => method)).toEqual([
      "setElevation",
      "setRiverInfo",
      "finalizeRivers",
      "validateAndFixTerrain",
      "generateCliffsFromElevation",
      "recalculateAreas",
      "storeWaterData",
    ]);
    expect(observed.calls[0]!.arg).toBe(values);
    expect(observed.calls[1]!.arg).toBe(intent);
    expect(observed.calls[2]!.arg).toBe(args);
    expect(
      observed.observedCoordinates.every(
        ({ x, y }) =>
          x >= 0 && y >= 0 && x < preset.dimensions.width && y < preset.dimensions.height
      )
    ).toBe(true);
    expect(
      observed.decode().find((record) => record.stage === "map-info")!.payload.activation
    ).toBe("accepted");
    const failure = fixture(mapInfo(options.expectedLakeSizeCutoff, mapSize));
    const sentinel = new Error("original native failure");
    let attempts = 0;
    failure.adapter.finalizeRivers = (received) => {
      expect(received).toBe(args);
      attempts++;
      throw sentinel;
    };
    installWaterHeightMaintenanceProbe(
      failure.adapter,
      "bounded-failure",
      identity,
      options,
      (line) => failure.lines.push(line)
    );
    let thrown: unknown;
    try {
      failure.adapter.finalizeRivers(args);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBe(sentinel);
    expect(attempts).toBe(1);
    expect(failure.decode().map(({ stage }) => stage)).toEqual([
      "installed",
      "map-info",
      "inputs",
      "before",
      "failed",
    ]);
  });

  it.each([
    { sourceConfigId: "sundered-archipelago" },
    { playerCount: 2 },
  ])("uses no body identities outside the exact historical profile/player selection %j", (selection) => {
    const observed = fixture();
    installWaterHeightMaintenanceProbe(
      observed.adapter,
      "different-selection",
      identity,
      { ...WATER_HEIGHT_MAINTENANCE_PROBE, ...selection },
      (line) => observed.lines.push(line)
    );
    expect(
      observed
        .decode()[0]!
        .payload.focus!.every(
          (point) => point.role === "fixed-coordinate-control" && !Object.hasOwn(point, "body")
        )
    ).toBe(true);
  });

  it("preserves an original failure without retries or a successful after observation", () => {
    const { adapter, lines, decode } = fixture();
    const error = new Error("native failure");
    let calls = 0;
    adapter.validateAndFixTerrain = () => {
      calls++;
      throw error;
    };
    installWaterHeightMaintenanceProbe(
      adapter,
      "maintenance-test",
      identity,
      WATER_HEIGHT_MAINTENANCE_PROBE,
      (line) => lines.push(line)
    );
    expect(() => adapter.validateAndFixTerrain()).toThrow(error);
    expect(calls).toBe(1);
    expect(decode().map((record) => record.stage)).toEqual([
      "installed",
      "map-info",
      "before",
      "failed",
    ]);
  });

  it("refuses invalid activation before any first original call, without converting retries into success", () => {
    const firstCalls: Array<(adapter: Adapter) => void> = [
      (adapter) => adapter.setElevation([20]),
      (adapter) =>
        adapter.setRiverInfo({ x: 93, y: 34, direction: "WEST", riverClass: "NAVIGABLE" }),
      (adapter) => adapter.finalizeRivers([false, 25, 2, 2]),
      (adapter) => adapter.validateAndFixTerrain(),
      (adapter) => adapter.generateCliffsFromElevation(),
      (adapter) => adapter.recalculateAreas(),
      (adapter) => adapter.storeWaterData(),
    ];
    const invalid: Array<{
      options: NonNullable<Parameters<typeof installWaterHeightMaintenanceProbe>[3]>;
      info: MapInfo;
    }> = [
      { options: WATER_HEIGHT_MAINTENANCE_PROBE, info: mapInfo(20) },
      ...[
        mapInfo(10),
        { ...mapInfo(20), LakeSizeCutoff: "20" },
        { MapSizeType: "MAPSIZE_HUGE" },
        null,
        mapInfo(Number.NaN),
        { ...mapInfo(20), MapSizeType: "MAPSIZE_STANDARD" },
        { ...mapInfo(20), GridWidth: 105 },
        { ...mapInfo(20), GridHeight: 65 },
      ].map((info) => ({ options: WATER_HEIGHT_LAKE_CUTOFF_PROBE, info: info as MapInfo })),
      ...[
        mapInfo(10),
        mapInfo(20),
        { ...mapInfo(6996), LakeSizeCutoff: "6996" },
        { MapSizeType: "MAPSIZE_HUGE" },
        null,
        mapInfo(Number.NaN),
        { ...mapInfo(6996), MapSizeType: "MAPSIZE_STANDARD" },
      ].map((info) => ({ options: WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE, info: info as MapInfo })),
      ...[
        mapInfo(10),
        mapInfo(20),
        mapInfo(6996),
        { ...mapInfo(40), LakeSizeCutoff: "40" },
        { MapSizeType: "MAPSIZE_HUGE" },
        null,
        mapInfo(Number.NaN),
        { ...mapInfo(40), MapSizeType: "MAPSIZE_STANDARD" },
      ].map((info) => ({ options: WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE, info: info as MapInfo })),
    ];
    for (const { options, info } of invalid) {
      for (const firstCall of firstCalls) {
        const { adapter, calls, metadataCalls, lines, decode } = fixture(info);
        installWaterHeightMaintenanceProbe(
          adapter,
          "invalid-activation",
          identity,
          options,
          (line) => lines.push(line)
        );
        expect(() => firstCall(adapter)).toThrow(
          `numeric LakeSizeCutoff=${options.expectedLakeSizeCutoff}`
        );
        adapter.lookupMapInfo = () => mapInfo(options.expectedLakeSizeCutoff);
        expect(() => adapter.validateAndFixTerrain()).toThrow(
          `numeric LakeSizeCutoff=${options.expectedLakeSizeCutoff}`
        );
        expect(calls).toHaveLength(0);
        expect(metadataCalls).toHaveLength(2);
        expect(decode().map((record) => record.stage)).toEqual(["installed", "map-info"]);
        expect(decode()[1]!.payload).toMatchObject({
          activation: "refused",
          expectedLakeSizeCutoff: options.expectedLakeSizeCutoff,
        });
      }
    }
  });

  it("rejects missing identity and duplicate instrumentation without native calls", () => {
    const { adapter, lines, calls } = fixture();
    expect(() =>
      installWaterHeightMaintenanceProbe(adapter, "test", { ...identity, fixtureSourceSha256: "" })
    ).toThrow();
    installWaterHeightMaintenanceProbe(
      adapter,
      "test",
      identity,
      WATER_HEIGHT_MAINTENANCE_PROBE,
      (line) => lines.push(line)
    );
    expect(() => installWaterHeightMaintenanceProbe(adapter, "test", identity)).toThrow();
    expect(calls).toHaveLength(0);
  });

  it("builds a canonical whole-map observation fixture with its own source identity", async () => {
    const plan = await buildRiverProbePlan("maintenance-test", "authored", "full-map-maintenance");
    const proofContent = plan.files.find((file) => file.relativePath === "proof.json")!.content;
    if (typeof proofContent !== "string") throw new Error("Expected a text proof manifest.");
    const proof = JSON.parse(proofContent);
    expect(proof).toMatchObject({
      diagnosticRevision: 9,
      atlasKind: "full-map-maintenance",
      sourceConfigId: "swooper-earthlike",
      width: 106,
      height: 66,
      playerCount: 10,
      installDirectoryName: "mod-swooper-river-contract-v1",
      expectedLakeSizeCutoff: 10,
    });
    expect(proof.intervention).toBeUndefined();
    expect(proof.fixtureSourceSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(
      plan.files.find((file) => file.relativePath === "maps/river-contract.js")!.content
    ).toContain("[water-height-maintenance]");
    expect(plan.files.some((file) => file.relativePath === "config/lake-cutoff.xml")).toBe(false);
    const modinfo = plan.files.find((file) => file.relativePath.endsWith(".modinfo"))!.content;
    expect(modinfo).not.toContain("MapInUse");
    expect(modinfo).not.toContain("diagnostic-map");
    expect(modinfo).not.toContain("lake-cutoff.xml");
    expect(
      plan.files.find((file) => file.relativePath === "maps/river-contract.js")!.content
    ).not.toContain("Lake cutoff diagnostic requires");
  });

  it.each([
    WATER_HEIGHT_LAKE_CUTOFF_PROBE,
    WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE,
    WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE,
  ])("builds $atlasKind with qualified custom selection scoped to the exact diagnostic map", async (options) => {
    const control = await buildRiverProbePlan(
      "maintenance-control",
      "authored",
      "full-map-maintenance"
    );
    const plan = await buildRiverProbePlan("cutoff-treatment", "authored", options.atlasKind);
    const content = (files: typeof plan.files, path: string) => {
      const value = files.find((file) => file.relativePath === path)!.content;
      if (typeof value !== "string") throw new Error(`Expected text file: ${path}`);
      return value;
    };
    const proof = JSON.parse(content(plan.files, "proof.json"));
    const controlProof = JSON.parse(content(control.files, "proof.json"));
    expect(proof).toMatchObject({
      diagnosticRevision: options.diagnosticRevision,
      atlasKind: options.atlasKind,
      expectedLakeSizeCutoff: options.expectedLakeSizeCutoff,
      sourceConfigId: "swooper-earthlike",
      mapSeed: 1018,
      gameSeed: 1018,
      width: 106,
      height: 66,
      playerCount: 10,
      configHash: controlProof.configHash,
      envelopeHash: controlProof.envelopeHash,
      fixtureSourceSha256: controlProof.fixtureSourceSha256,
      settings: controlProof.settings,
      evidence: "built-only; no native observations",
      intervention: {
        kind: "source-qualified-classification-only",
        scope: "game",
        criterion: { MapInUse: riverProbeMapScript },
        table: "Maps",
        where: { MapSizeType: "MAPSIZE_HUGE" },
        set: { LakeSizeCutoff: options.expectedLakeSizeCutoff },
        setupSelection: `custom; captured Huge metadata differs only at numeric LakeSizeCutoff ${options.expectedLakeSizeCutoff}`,
      },
    });
    expect(proof.intervention.qualification).toContain(
      "no height, visual or navigation success claimed"
    );
    expect(proof.scriptSha256).not.toBe(controlProof.scriptSha256);
    expect(content(plan.files, "config/config.xml")).toBe(
      content(control.files, "config/config.xml")
    );
    expect(content(plan.files, "config/config.xml")).toContain(`File="${riverProbeMapScript}"`);
    expect(content(plan.files, "config/lake-cutoff.xml")).toBe(
      `<?xml version="1.0" encoding="utf-8"?>\n<Database><Maps><Update><Where MapSizeType="MAPSIZE_HUGE"/><Set LakeSizeCutoff="${options.expectedLakeSizeCutoff}"/></Update></Maps></Database>`
    );
    const modinfo = content(plan.files, "swooper-river-contract-v1.modinfo");
    expect(modinfo).toContain(
      `<Criteria id="diagnostic-map"><MapInUse>${riverProbeMapScript}</MapInUse></Criteria>`
    );
    expect(modinfo).toContain(
      '<ActionGroup id="game-lake-cutoff" scope="game" criteria="diagnostic-map"><Actions><UpdateDatabase><Item>config/lake-cutoff.xml</Item></UpdateDatabase></Actions></ActionGroup>'
    );
    expect(modinfo.match(/<Item>config\/lake-cutoff\.xml<\/Item>/g)).toHaveLength(1);
    expect(content(plan.files, "maps/river-contract.js")).toContain("[water-height-maintenance]");
    expect(content(plan.files, "maps/river-contract.js")).toContain(
      "Lake cutoff diagnostic requires"
    );
    if (options.diagnosticRevision === 12) {
      expect(proof.intervention.discriminator).toContain("not a product cutoff");
      expect(proof.intervention.discriminator).toContain(
        "changed marine lake identity is a result"
      );
    } else if (options.atlasKind === WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_ATLAS) {
      expect(proof.intervention.discriminator).toContain(
        "cutoff40 versus stock10 on Huge42, then unchanged on Huge1018"
      );
      expect(proof.intervention.discriminator).toContain("not a product cutoff");
      expect(proof.intervention.discriminator).toContain(
        "changed classifications are results, not activation refusals"
      );
      expect(
        content(plan.files, "maps/river-contract.js").includes(
          'projectLakeCutoffInitialSetup(capture, 40, "MAPSIZE_HUGE")'
        )
      ).toBe(true);
    } else {
      expect(proof.intervention.discriminator).toBeUndefined();
    }
  });

  it.each([
    42, 1018,
  ])("selects truthful seed %s metadata for paired stock10/cutoff40 without changing recipe or install identity", async (seed) => {
    const control = await buildRiverProbePlan(
      "bounded-control",
      "authored",
      "full-map-maintenance",
      { mapSeed: seed, gameSeed: seed }
    );
    const treatment = await buildRiverProbePlan(
      "bounded-treatment",
      "authored",
      "full-map-bounded-lake-cutoff",
      { mapSeed: seed, gameSeed: seed }
    );
    const content = (plan: typeof control, path: string) =>
      String(plan.files.find((file) => file.relativePath === path)!.content);
    const controlProof = JSON.parse(content(control, "proof.json"));
    const treatmentProof = JSON.parse(content(treatment, "proof.json"));
    for (const proof of [controlProof, treatmentProof])
      expect(proof).toMatchObject({
        mapSeed: seed,
        gameSeed: seed,
        sourceConfigId: "swooper-earthlike",
        width: 106,
        height: 66,
        playerCount: 10,
        mapScript: riverProbeMapScript,
        installDirectoryName: "mod-swooper-river-contract-v1",
      });
    expect(controlProof.expectedLakeSizeCutoff).toBe(10);
    expect(treatmentProof.expectedLakeSizeCutoff).toBe(40);
    for (const key of ["configHash", "envelopeHash", "fixtureSourceSha256", "settings"])
      expect(treatmentProof[key]).toEqual(controlProof[key]);
    expect(content(treatment, "config/lake-cutoff.xml")).toContain('<Set LakeSizeCutoff="40"/>');
    expect(content(treatment, "config/config.xml")).toBe(content(control, "config/config.xml"));
    expect(control.files.some((file) => file.relativePath === "config/lake-cutoff.xml")).toBe(
      false
    );
    expect(content(control, "swooper-river-contract-v1.modinfo")).not.toContain("MapInUse");
    for (const plan of [control, treatment]) {
      const source = content(plan, "maps/river-contract.js");
      const registration = source.slice(
        source.lastIndexOf("installWaterHeightMaintenanceProbe(Civ7Adapter.prototype")
      );
      expect(new RegExp(`"mapSeed": ${seed}, "gameSeed": ${seed}`).test(registration)).toBe(true);
    }
  });

  it.each(
    ["swooper-earthlike", "sundered-archipelago"].flatMap((sourceConfigId) =>
      selectedSizes.map((mapSize) => ({ sourceConfigId, mapSize }))
    )
  )("resolves one canonical $sourceConfigId/$mapSize choice for stock and explicit-cutoff receipts", async ({
    sourceConfigId,
    mapSize,
  }) => {
    const preset = getCiv7StandardMapSizePreset(mapSize);
    const selection = {
      sourceConfigId,
      mapSize,
      mapSeed: -42,
      gameSeed: 7331,
      lakeSizeCutoff: "stock",
    } as const;
    const control = await buildRiverProbePlan(
      "selected-control",
      "authored",
      "full-map-bounded-lake-cutoff",
      selection
    );
    const treatment = await buildRiverProbePlan(
      "selected-treatment",
      "authored",
      "full-map-maintenance",
      { ...selection, playerCount: 2, lakeSizeCutoff: 100 }
    );
    const content = (plan: typeof control, path: string) =>
      String(plan.files.find((file) => file.relativePath === path)!.content);
    const controlProof = JSON.parse(content(control, "proof.json"));
    const treatmentProof = JSON.parse(content(treatment, "proof.json"));
    const [config] = await loadSwooperMapConfigCatalog({ catalogConfigIds: [sourceConfigId] });
    for (const [proof, players, cutoff] of [
      [controlProof, preset.defaultPlayers, preset.mapInfo.LakeSizeCutoff],
      [treatmentProof, 2, 100],
    ] as const) {
      expect(proof).toMatchObject({
        sourceConfigId,
        mapSize,
        ...preset.dimensions,
        mapSeed: -42,
        gameSeed: 7331,
        playerCount: players,
        expectedLakeSizeCutoff: cutoff,
        configHash: canonicalMapConfigContentDigest(config!.canonicalConfig),
        envelopeHash: canonicalMapConfigDigest(config!.canonicalConfig),
        evidence: "built-only; no native observations",
      });
      expect(proof.liveVerifierFlags).toEqual([
        "--mutate",
        "--map-script",
        riverProbeMapScript,
        "--map-size",
        mapSize,
        "--seed",
        "-42",
        "--game-seed",
        "7331",
        "--player-count",
        String(players),
      ]);
    }
    for (const key of ["configHash", "envelopeHash", "fixtureSourceSha256", "settings"])
      expect(treatmentProof[key]).toEqual(controlProof[key]);
    expect(controlProof.intervention).toBeUndefined();
    expect(content(control, "config/lake-cutoff.xml")).toBe(
      '<?xml version="1.0" encoding="utf-8"?>\n<Database/>'
    );
    expect(content(control, "swooper-river-contract-v1.modinfo")).toContain(
      `<Criteria id="diagnostic-map"><MapInUse>${riverProbeMapScript}</MapInUse></Criteria>`
    );
    expect(treatmentProof.intervention).toMatchObject({
      criterion: { MapInUse: riverProbeMapScript },
      where: { MapSizeType: mapSize },
      set: { LakeSizeCutoff: 100 },
      setupSelection: `custom; captured ${preset.label} metadata differs only at numeric LakeSizeCutoff 100`,
    });
    expect(content(treatment, "config/lake-cutoff.xml")).toBe(
      `<?xml version="1.0" encoding="utf-8"?>\n<Database><Maps><Update><Where MapSizeType="${mapSize}"/><Set LakeSizeCutoff="100"/></Update></Maps></Database>`
    );
    expect(content(treatment, "swooper-river-contract-v1.modinfo")).toContain(
      `<Criteria id="diagnostic-map"><MapInUse>${riverProbeMapScript}</MapInUse></Criteria>`
    );
    expect(
      content(treatment, "swooper-river-contract-v1.modinfo").match(
        /<Item>config\/lake-cutoff\.xml<\/Item>/g
      )
    ).toHaveLength(1);
    expect(content(treatment, "config/config.xml")).toBe(content(control, "config/config.xml"));
    expect(
      content(treatment, "maps/river-contract.js").includes(
        `projectLakeCutoffInitialSetup(capture, 100, "${mapSize}")`
      )
    ).toBe(true);
  });

  it("uses each public preset's defaults and cell count rather than historical Huge constants", async () => {
    for (const mapSize of ["MAPSIZE_SMALL", "MAPSIZE_LARGE"] as const) {
      const preset = getCiv7StandardMapSizePreset(mapSize);
      const plan = await buildRiverProbePlan(
        "other-preset",
        "authored",
        "full-map-max-lake-cutoff",
        { mapSize }
      );
      const proof = JSON.parse(
        String(plan.files.find((file) => file.relativePath === "proof.json")!.content)
      );
      expect(proof).toMatchObject({
        mapSize,
        ...preset.dimensions,
        playerCount: preset.defaultPlayers,
        expectedLakeSizeCutoff: preset.dimensions.width * preset.dimensions.height,
      });
    }
  });

  it("refuses unknown selectors, inadmissible players, cutoffs and either invalid seed before bundling", async () => {
    const invalid: WaterHeightDiagnosticSelection[] = [
      { sourceConfigId: "not-a-shipped-profile" },
      { mapSize: "MAPSIZE_CUSTOM" },
      ...[0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2281].map((lakeSizeCutoff) => ({
        mapSize: "MAPSIZE_TINY",
        lakeSizeCutoff,
      })),
      ...[0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 5].map((playerCount) => ({
        mapSize: "MAPSIZE_TINY",
        playerCount,
      })),
      ...[Number.NaN, Number.POSITIVE_INFINITY, 1.5, 0x8000_0000, -0x8000_0001].flatMap((seed) => [
        { mapSeed: seed },
        { gameSeed: seed },
      ]),
    ];
    for (const selection of invalid)
      await expect(
        buildRiverProbePlan("bad-selection", "authored", "full-map-maintenance", selection)
      ).rejects.toThrow();
  });

  it("rejects invalid or unrelated explicit seed metadata before bundling", async () => {
    for (const seed of [Number.NaN, Number.POSITIVE_INFINITY, 1.5, 0x8000_0000, -0x8000_0001])
      await expect(
        buildRiverProbePlan("bad-seed", "authored", "full-map-bounded-lake-cutoff", {
          mapSeed: seed,
          gameSeed: seed,
        })
      ).rejects.toThrow("signed 32-bit seed");
    for (const atlas of [
      "synthetic-river-v4",
      "terrain-admission",
      "full-map-observe",
      "water-connectivity-cutoff-10",
    ] as const)
      await expect(
        buildRiverProbePlan("unrelated-seed", "authored", atlas, { mapSeed: 42, gameSeed: 42 })
      ).rejects.toThrow("only for maintenance atlases");
    await expect(
      buildRiverProbePlan("unsupported", "aesthetic", "full-map-bounded-lake-cutoff")
    ).rejects.toThrow("authored finalization tuple");
  });
});

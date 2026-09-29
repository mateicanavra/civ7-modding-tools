import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

import { decodeBoundedJsonLogSeries } from "@swooper/mapgen-core/lib/log";
import { expectCiv7MapScriptCompatibility } from "../runtime/civ7-map-script-compatibility.fixture.js";
import {
  buildRiverProbeAtlas, buildRiverProbeElevation, RIVER_CHECKPOINTS, RIVER_DIRECTIONS, RIVER_ELEVATED_LAKE_CONTROLS, RIVER_LAKE_CASES,
  RIVER_PROBE, RIVER_PROBE_VARIANTS, RIVER_SLOPE_CONTROLS, riverProbeExpectedReceiver, riverProbeTerrainAt,
  buildRiverTerrainAtlas, buildRiverTerrainElevation, RIVER_TERRAIN_CONTROLS, RIVER_TERRAIN_PROBE, riverTerrainProbeTerrainAt,
  buildRiverLakeNavigationAtlas, buildRiverLakeNavigationElevation, riverLakeNavigationTerrainAt,
  RIVER_LAKE_NAVIGATION_CONTROLS, RIVER_LAKE_MARINE_CONTROLS, RIVER_LAKE_NAVIGATION_PROBE,
  type RiverProbeAtlas, type RiverProbeVariant,
} from "./river-contract-map.fixture.js";
import { buildRiverProbePlan, riverProbeDeployFlags, riverProbeInstallDirectoryName, riverProbeMapScript, riverProbeOutputRoot } from "./river-contract-probe.js";
import { WATER_CONNECTIVITY_ATLASES, buildWaterConnectivityWrites } from "./water-connectivity.fixture.js";

type LogEntry = { stage: string; payload: Record<string, any>; proofId: string; variant: string };

async function compiled(variant: RiverProbeVariant = "authored", atlas: RiverProbeAtlas = "legacy") {
  const plan = await buildRiverProbePlan("unit-artifact-only", variant, atlas);
  const script = plan.files.find((file) => file.relativePath === "maps/river-contract.js")!.content;
  if (typeof script !== "string") throw new Error("Expected compiled text map script.");
  return { plan, script };
}

function mockRuntime(script: string, options: {
  wrapX?: boolean; missing?: string[]; throws?: string[]; unexpected?: string[];
  failPhase?: string; failWrite?: boolean; networkCount?: number; badAdjacency?: boolean;
  riverIds?: unknown[]; missingRiverId?: boolean; riverPlotCount?: number;
  elevationReadback?: number; terrainReadback?: number; featureReadback?: number; riverClassReadback?: number;
  invalidNativeEnum?: boolean; failWriteAt?: { x: number; y: number }; repairSetupTerrain?: boolean;
  lakeCutoff?: number | string; waterAreaReadbacks?: boolean;
} = {}) {
  const callbacks = new Map<string, (...args: any[]) => void>();
  const lines: string[] = [];
  const calls: { name: string; args: unknown[] }[] = [];
  const unsafeOceanCalls: string[] = [];
  const elevationInputs: number[][] = [];
  let finalizations = 0;
  let validations = 0;
  const terrain = new Array<number>(2280).fill(0);
  const rivers = new Array<number>(2280).fill(-1);
  const heights = new Array<number>(2280).fill(0);
  const features = new Array<number>(2280).fill(0);
  const terrains = ["OCEAN", "COAST", "FLAT", "MOUNTAIN", "NAVIGABLE_RIVER", "HILL"];
  // Non-slot values ensure no caller accidentally treats array order as the native enum.
  const directions = Object.fromEntries(RIVER_DIRECTIONS.map((name, i) => [`DIRECTION_${name}`, 70 + i * 7]));
  const call = (name: string, args: unknown[] = []) => {
    calls.push({ name, args });
    if (name === options.failPhase) throw new Error(`mock failed ${name}`);
    if (name === "finalizeRivers") finalizations++;
  };
  const gameplayMap: Record<string, unknown> = {
    getGridWidth: () => 60, getGridHeight: () => 38, getRandomSeed: () => 1018,
    getMapSize: () => "MAPSIZE_TINY",
    getIndexFromXY: (x: number, y: number) => x + y * 60,
    getTerrainType: (x: number, y: number) => options.terrainReadback ?? terrain[x + y * 60],
    getRiverType: (x: number, y: number) => options.riverClassReadback ?? rivers[x + y * 60],
    getElevation: (x: number, y: number) => options.elevationReadback ?? heights[x + y * 60],
    getFeatureType: (x: number, y: number) => options.featureReadback ?? features[x + y * 60],
    isWater: () => false, isLake: () => false, isRiver: () => false,
    getAreaId: () => 7, getAreaIsWater: () => options.waterAreaReadbacks ?? false,
    getLandmassRegionId: () => -1,
    isNavigableRiver: () => false, isFreshWater: () => false, isAdjacentToRivers: () => false,
    getAdjacentPlotLocation: ({ x, y }: { x: number; y: number }, direction: number) => {
      const symbol = Object.keys(directions).find((name) => directions[name] === direction);
      const offsets: Record<string, [number, number]> = {
        DIRECTION_EAST: [1, 0], DIRECTION_WEST: [-1, 0],
        DIRECTION_NORTHEAST: [y % 2, 1], DIRECTION_NORTHWEST: [y % 2 - 1, 1],
        DIRECTION_SOUTHEAST: [y % 2, -1], DIRECTION_SOUTHWEST: [y % 2 - 1, -1],
      };
      const [dx, dy] = offsets[symbol!]!;
      return { x: options.badAdjacency ? 999 : options.wrapX ? (x + dx + 60) % 60 : x + dx, y: y + dy };
    },
  };
  for (const name of options.missing ?? []) delete gameplayMap[name];
  for (const name of options.throws ?? []) gameplayMap[name] = () => { throw new Error("getter failure"); };
  for (const name of options.unexpected ?? []) {
    const original = gameplayMap[name] as (...args: number[]) => unknown;
    gameplayMap[name] = (...args: number[]) => name === "getRiverType" && (args[0] !== 0 || args[1] !== 0) ? original(...args) : undefined;
  }
  // The shipped ESM stays unchanged. Only the VM harness stubs unused native module imports;
  // river dispatch below still executes the bundled real adapter against recorded globals.
  runInNewContext(transformSync(script, { format: "cjs" }).code, {
    require: (specifier: string) => {
      if (!specifier.startsWith("/base-standard/")) throw new Error(`Unexpected module: ${specifier}`);
      return new Proxy({}, { get: (_target, member) => {
        if (member === "__esModule") return true;
        return () => { throw new Error(`Unexpected native helper invocation: ${specifier}.${String(member)}`); };
      } });
    },
    console: { log: (line: string) => lines.push(line) },
    engine: { on: (name: string, callback: (...args: any[]) => void) => callbacks.set(name, callback), call: () => {} },
    GameInfo: {
      Maps: { lookup: () => ({ MapSizeType: "MAPSIZE_TINY", GridWidth: 60, GridHeight: 38, LakeSizeCutoff: options.lakeCutoff ?? 5 }) },
      Terrains: terrains.map((name, $index) => ({ TerrainType: `TERRAIN_${name}`, $index })),
      Biomes: ["GRASSLAND", "MARINE"].map((name, $index) => ({ BiomeType: `BIOME_${name}`, $index })),
      Features: [{ FeatureType: "FEATURE_VOLCANO", $index: 10 }],
    },
    GameplayMap: gameplayMap,
    TerrainBuilder: {
      ...Object.fromEntries(["setBiomeType", "setRainfall", "setLandmassRegionId", "stampContinents", "storeWaterData", "finalizeRivers", "addFloodplains"].map((name) => [name, (...args: unknown[]) => call(name, args)])),
      setFeatureType: (x: number, y: number, value: { Feature: number }) => { call("setFeatureType", [x, y, value]); features[x + y * 60] = value.Feature; },
      validateAndFixTerrain: () => {
        call("validateAndFixTerrain");
        // Deliberately arbitrary repair: proves receipt transport, not native terrain rules.
        if (options.repairSetupTerrain && validations === 0) {
          for (const { barrier } of RIVER_TERRAIN_CONTROLS) {
            terrain[barrier.x + barrier.y * 60] = 987;
            features[barrier.x + barrier.y * 60] = 654;
          }
        }
        validations++;
      },
      setTerrainType: (x: number, y: number, value: number) => { call("setTerrainType"); terrain[x + y * 60] = value; },
      setElevation: (values: number[]) => { call("setElevation"); elevationInputs.push([...values]); values.forEach((value, i) => { heights[i] = value; }); },
      setRiverInfo: (x: number, y: number, direction: number, riverClass: number) => {
        call("setRiverInfo", [x, y, direction, riverClass]);
        if (options.failWrite && x === 25 && y === 34) throw new Error("rejected mountain write");
        if (options.failWriteAt?.x === x && options.failWriteAt.y === y) throw new Error("rejected terrain write");
        rivers[x + y * 60] = riverClass;
      },
      modelRivers: () => { throw new Error("Procedural generation is forbidden in this fixture."); },
    },
    DirectionTypes: { ...directions, NO_DIRECTION: -1 },
    RiverTypes: { NO_RIVER: -1, RIVER_MINOR: options.invalidNativeEnum ? 2 ** 32 : 11, RIVER_NAVIGABLE: 23 },
    MapRivers: {
      numRivers: options.networkCount ?? 2,
      getRiverIDByIndex: options.missingRiverId ? undefined : (ordinal: number) => {
        call("getRiverIDByIndex", [ordinal]);
        return options.riverIds ? options.riverIds[ordinal] : 100 + ordinal;
      },
      getRiverPlots: (riverId: number) => {
        call("getRiverPlots", [riverId]);
        if (options.riverPlotCount) return Array.from({ length: options.riverPlotCount }, (_, i) => 366 + i);
        return riverId === 100 ? [366, { x: 14, y: 6 }] : "unexpected";
      },
      isRiverConnectedToOcean: (plotIndex: number) => {
        if (finalizations === 0 || rivers[plotIndex] !== 23) {
          unsafeOceanCalls.push(`${finalizations}/${plotIndex}/${rivers[plotIndex]}`);
          throw new Error("Unsafe ocean connectivity invocation");
        }
        call("oceanConnectivity", [plotIndex]);
        return false;
      },
    },
    AreaBuilder: {
      recalculateAreas: () => call("areas"),
      isAreaConnectedToOcean: (id: number) => {
        if (id !== 7 || !options.waterAreaReadbacks) throw new Error("Unsafe water area connectivity invocation");
        call("areaOceanConnectivity", [id]);
        return false;
      },
    },
    FertilityBuilder: { recalculate: () => call("fertility") },
    Players: { getAliveMajorIds: () => [0, 1, 2, 3] },
    StartPositioner: { setStartPosition: (...args: unknown[]) => call("start", args) },
    LandmassRegion: { LANDMASS_REGION_WEST: 0, LANDMASS_REGION_EAST: 1 },
  });
  return { lines, calls, callbacks, unsafeOceanCalls, elevationInputs,
    run: () => { callbacks.get("RequestMapInitData")!({ width: 60, height: 38, wrapX: options.wrapX }); callbacks.get("GenerateMap")!(); },
    entries: () => decodeBoundedJsonLogSeries(lines, "[river-contract]").map(({ payload }) => payload as LogEntry),
  };
}

describe("V13/V14 water connectivity native-call transport (not native semantics)", () => {
  test.each([...WATER_CONNECTIVITY_ATLASES])("%s observes every cell without deriving native classifications", async (atlas) => {
    const cutoff = atlas === "water-connectivity-cutoff-5" ? 5 : 10;
    const { script, plan } = await compiled("authored", atlas);
    const proof = JSON.parse(String(plan.files.find(({ relativePath }) => relativePath === "proof.json")!.content));
    const runtime = mockRuntime(script, { lakeCutoff: cutoff, waterAreaReadbacks: true, elevationReadback: 1234 });
    runtime.run();
    const entries = runtime.entries();
    expect(entries[0]).toMatchObject({ stage: "map-info", payload: { activation: "accepted", expectedLakeSizeCutoff: cutoff } });
    for (const entry of entries) expect(entry).toMatchObject({ proofId: "unit-artifact-only", diagnosticRevision: cutoff === 5 ? 13 : 14, atlasKind: atlas, fixtureSourceSha256: proof.fixtureSourceSha256 });
    const checkpoints = entries.filter(({ stage }) => RIVER_CHECKPOINTS.includes(stage as typeof RIVER_CHECKPOINTS[number]));
    expect(checkpoints.map(({ stage }) => stage)).toEqual([...RIVER_CHECKPOINTS]);
    for (const { stage, payload } of checkpoints) {
      expect(payload.terrain).toHaveLength(2280);
      expect(payload.riverClass).toHaveLength(2280);
      const observations = payload.waterConnectivity;
      expect(observations).toMatchObject({ cellCount: 2280, rowCount: 38, dataStage: "water-connectivity-grid" });
      const rows = entries.filter((entry) => entry.stage === "water-connectivity-grid" && entry.payload.checkpoint === stage).map(({ payload }) => payload);
      expect(rows.map((row) => row.row)).toEqual(Array.from({ length: 38 }, (_, row) => row));
      for (const row of rows) {
        expect(row.startCell).toBe(row.row * 60);
        for (const field of ["water", "lake", "elevation", "areaId", "areaIsWater", "landmassRegionId"]) expect(row[field]).toHaveLength(60);
        expect(row.water.every((value: unknown) => value === false)).toBe(true);
        expect(row.lake.every((value: unknown) => value === false)).toBe(true);
        expect(row.elevation.every((value: unknown) => value === 1234)).toBe(true);
        expect(row.areaId.every((value: unknown) => value === 7)).toBe(true);
        expect(row.landmassRegionId.every((value: unknown) => value === -1)).toBe(true);
      }
      expect(observations.waterAreaOceanConnectivity).toEqual([{ areaId: 7, connectedToOcean: false }]);
      if (stage === "initialized" || stage === "after-write") {
        expect(observations.riverOceanConnectivityGate).toBe("before-finalization");
        expect(observations.riverOceanConnectivity).toEqual([]);
      } else {
        expect(observations.riverOceanConnectivityGate).toBe("observed-navigable-cells-only");
        expect(observations.riverOceanConnectivity.map((entry: any) => entry.cell)).toEqual(
          payload.riverClass.flatMap((value: number, cell: number) => value === 23 ? [cell] : [])
        );
        expect(observations.riverOceanConnectivity.every((entry: any) => entry.plotIndex === entry.cell && entry.connectedToOcean === false)).toBe(true);
      }
    }
    const writes = entries.filter(({ stage }) => stage === "write");
    expect(writes).toHaveLength(30);
    expect(writes.filter(({ payload }) => payload.role === "qualified-wet-nav-outlet")).toHaveLength(2);
    expect(runtime.calls.filter(({ name }) => name === "setRiverInfo").map(({ args }) => args)).toEqual(
      buildWaterConnectivityWrites().map(({ x, y, riverClass }) => [x, y, 91, riverClass === "MINOR" ? 11 : 23])
    );
    expect(runtime.calls.filter(({ name }) => name === "finalizeRivers").map(({ args }) => args)).toEqual([[false, 25, 2, 2]]);
    const afterFinalize = runtime.calls.slice(runtime.calls.findIndex(({ name }) => name === "finalizeRivers"));
    expect(afterFinalize.some(({ name }) => ["setTerrainType", "setElevation", "setFeatureType", "setRiverInfo"].includes(name))).toBe(false);
    expect(runtime.unsafeOceanCalls).toEqual([]);
    expect(runtime.calls.filter(({ name }) => name === "areaOceanConnectivity")).toHaveLength(RIVER_CHECKPOINTS.length);
    expect(runtime.lines.every((line) => line.length <= 900)).toBe(true);
    expect(decodeBoundedJsonLogSeries(runtime.lines, "[mapgen-complete]")[0]!.payload).toMatchObject({ diagnosticRevision: cutoff === 5 ? 13 : 14, expectedLakeSizeCutoff: cutoff, fixtureSourceSha256: proof.fixtureSourceSha256, writeFailures: 0, observationsOnly: true });
  });

  test("cutoff refusal precedes mutation; missing readbacks stay unavailable and failures receive no retries", async () => {
    const { script } = await compiled("authored", "water-connectivity-cutoff-5");
    for (const cutoff of [10, "5"]) {
      const runtime = mockRuntime(script, { lakeCutoff: cutoff });
      expect(runtime.run).toThrow("numeric LakeSizeCutoff=5");
      expect(runtime.calls).toHaveLength(0);
      expect(runtime.entries()[0]).toMatchObject({ stage: "map-info", payload: { activation: "refused" } });
      expect(decodeBoundedJsonLogSeries(runtime.lines, "[mapgen-complete]")).toHaveLength(0);
    }
    const missing = mockRuntime(script, { missing: ["isLake", "getAreaId", "getLandmassRegionId"], throws: ["getAreaIsWater"] });
    missing.run();
    const missingEntries = missing.entries();
    const checkpoint = missingEntries.find(({ stage }) => stage === "after-water-cache")!.payload.waterConnectivity;
    const rows = missingEntries.filter(({ stage, payload }) => stage === "water-connectivity-grid" && payload.checkpoint === "after-water-cache");
    expect(rows).toHaveLength(38);
    for (const { payload } of rows) {
      for (const field of ["lake", "areaId", "landmassRegionId"]) expect(payload[field].every((value: any) => value.status === "unavailable" && value.reason === "missing-callable")).toBe(true);
      expect(payload.areaIsWater.every((value: any) => value.status === "unavailable" && value.reason === "threw")).toBe(true);
    }
    expect(checkpoint.waterAreaOceanConnectivity).toEqual([]);
    expect(missing.calls.filter(({ name }) => name === "areaOceanConnectivity")).toHaveLength(0);
    expect(missing.lines.every((line) => line.length <= 900)).toBe(true);
    const failed = mockRuntime(script, { failWriteAt: { x: 10, y: 11 } });
    failed.run();
    expect(failed.calls.filter(({ name }) => name === "setRiverInfo")).toHaveLength(30);
    expect(decodeBoundedJsonLogSeries(failed.lines, "[mapgen-complete]")[0]!.payload).toMatchObject({ writeFailures: 1 });
    const failedFinalizer = mockRuntime(script, { failPhase: "finalizeRivers" });
    expect(failedFinalizer.run).toThrow("mock failed finalizeRivers");
    expect(decodeBoundedJsonLogSeries(failedFinalizer.lines, "[mapgen-complete]")).toHaveLength(0);
  });
});

describe("river diagnostic artifact (not native semantics proof)", () => {
  test("bounded atlas covers symbols, parities, classes, reach lengths, both transitions, outlets and lake mismatches", () => {
    const atlas = buildRiverProbeAtlas(false);
    const isolated = atlas.filter((write) => write.caseId.startsWith("isolated"));
    expect(isolated).toHaveLength(24);
    expect(new Set(isolated.map((write) => `${write.directionSymbol}/${write.y % 2}/${write.riverClass}`)).size).toBe(24);
    for (const a of isolated) for (const b of isolated) {
      if (a !== b) expect(Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))).toBeGreaterThanOrEqual(3);
    }
    expect(new Set(atlas.map(({ x, y }) => `${x}/${y}`)).size).toBe(atlas.length);
    for (const riverClass of ["minor", "navigable"]) for (const length of [1, 2, 3])
      expect(atlas.filter(({ caseId }) => caseId === `reach-${riverClass}-${length}`)).toHaveLength(length);
    expect(atlas.filter(({ caseId }) => caseId === "nav-minor-nav-transition").map(({ riverClass }) => riverClass)).toEqual(["NAVIGABLE", "MINOR", "NAVIGABLE", "NAVIGABLE"]);
    for (const id of ["class-transition", "confluence", "marine-mouth", "closed-termination", ...RIVER_LAKE_CASES.map(({ caseId }) => caseId)]) expect(atlas.some(({ caseId }) => caseId === id)).toBe(true);
    const confluence = atlas.filter(({ role }) => role.endsWith("tributary"));
    expect(confluence.map(({ expectedReceiver }) => expectedReceiver)).toEqual([{ x: 46, y: 28 }, { x: 46, y: 28 }]);
    expect(RIVER_LAKE_CASES[1]!.cells.every(({ accepted }) => !accepted)).toBe(true);
    expect(RIVER_LAKE_CASES[2]!.cells.map(({ accepted }) => accepted)).toEqual([true, false]);
    expect(riverProbeTerrainAt(24, 34, false)).toBe("COAST");
    expect(riverProbeTerrainAt(25, 34, false)).toBe("MOUNTAIN");
    expect(buildRiverProbeAtlas(true).length).toBe(atlas.length + 4);
    expect(riverProbeExpectedReceiver({ x: 59, y: 6 }, "EAST", true)).toEqual({ x: 0, y: 6 });
    expect(riverProbeExpectedReceiver({ x: 0, y: 21 }, "WEST", true)).toEqual({ x: 59, y: 21 });
  });

  test("V3 controls have independent receivers, descending marine profiles and no source collisions", () => {
    for (const wrapX of [false, true]) {
      const atlas = buildRiverProbeAtlas(wrapX);
      const heights = buildRiverProbeElevation(wrapX);
      const at = ({ x, y }: { x: number; y: number }) => heights[x + y * 60]!;
      expect(heights).toHaveLength(2280);
      expect(atlas).toHaveLength(wrapX ? 121 : 117);
      expect(new Set(atlas.map(({ x, y }) => `${x}/${y}`)).size).toBe(atlas.length);
      for (const control of RIVER_SLOPE_CONTROLS) {
        const write = atlas.find(({ caseId }) => caseId === control.caseId)!;
        expect(write.expectedReceiver).toEqual({ x: control.x + (control.directionSymbol === "EAST" ? 1 : -1), y: 3 });
        expect(write.riverClass).toBe("MINOR");
        expect(at(write)).toBe(300);
        expect(at(write.expectedReceiver)).toBe(300 + control.receiverDelta);
      }
      const confluence = atlas.filter(({ caseId }) => caseId === "marine-confluence");
      expect(confluence).toHaveLength(10);
      for (const write of confluence) {
        const expected = write.y === 13 ? { x: write.x - 1, y: 13 }
          : write.x === 10 ? { x: 9, y: write.y } : { x: 8, y: 13 };
        expect(write.expectedReceiver).toEqual(expected);
        expect(at(write)).toBeGreaterThan(128);
        expect(at(write.expectedReceiver)).toBeLessThan(at(write));
        if (write.expectedReceiver.x > 2) expect(at(write.expectedReceiver)).toBeGreaterThan(128);
      }
      expect(riverProbeTerrainAt(2, 13, wrapX)).toBe("COAST");
      const mixed = atlas.filter(({ caseId }) => caseId === "marine-nav-minor-nav");
      expect(mixed.map(({ riverClass }) => riverClass)).toEqual(["NAVIGABLE", "NAVIGABLE", "MINOR", "MINOR", "NAVIGABLE", "NAVIGABLE", "NAVIGABLE", "NAVIGABLE"]);
      for (const write of mixed) {
        expect(write.expectedReceiver).toEqual({ x: write.x - 1, y: 8 });
        expect(at(write)).toBeGreaterThan(128);
        expect(at(write.expectedReceiver)).toBeLessThan(at(write));
      }
      expect(riverProbeTerrainAt(2, 8, wrapX)).toBe("COAST");
      const extension = atlas.filter(({ caseId }) => caseId === "lake-marine-extension");
      expect(extension).toHaveLength(11);
      for (const write of extension) expect(write.expectedReceiver).toEqual({ x: write.x + 1, y: 26 });
      expect(extension[extension.length - 1]!.expectedReceiver).toEqual({ x: 53, y: 26 });
      expect(atlas.some((write) => write.caseId === "marine-mouth" && write.x === 53 && write.y === 26)).toBe(true);
      // Keep the old uphill/closed/lake controls unchanged instead of silently fixing them.
      expect(at({ x: 30, y: 6 })).toBe(160);
      expect(at({ x: 29, y: 6 })).toBe(162);
      expect(at({ x: 30, y: 30 })).toBe(160);
      expect(at({ x: 38, y: 27 })).toBe(0);
      expect(at({ x: 39, y: 27 })).toBe(0);
      expect(at({ x: 40, y: 27 })).toBe(140);
      expect(at({ x: 41, y: 27 })).toBe(138);
    }
  });

  test("V4 preserves every V3 write and previously sampled terrain/elevation input", () => {
    // Fingerprints captured from revision 3, including unwritten receivers and freshwater controls.
    const fingerprints = [
      "7b37bea5aa24474fa26a2bb4ea48a848ef035f4722017a56bb23693290967b89",
      "f262eb3d6ae02c095ad805d4f312d9e7bf841e1bb48576c10f08eea2c1405bb9",
    ];
    for (const wrapX of [false, true]) {
      const atlas = buildRiverProbeAtlas(wrapX).filter(({ caseId }) => !caseId.startsWith("elevated-"));
      expect(atlas).toHaveLength(wrapX ? 108 : 104);
      const heights = buildRiverProbeElevation(wrapX);
      const points = new Map<string, { x: number; y: number }>();
      for (const point of [...atlas, ...atlas.map((write) => write.expectedReceiver),
        ...RIVER_LAKE_CASES.filter(({ caseId }) => !caseId.startsWith("elevated-")).flatMap(({ cells }) => cells),
        ...[4, 18, 34, 50].map((x) => ({ x, y: 34 })),
        ...atlas.filter(({ caseId }) => caseId.startsWith("isolated")).map(({ x, y }) => ({ x, y: y + 1 })),
      ]) points.set(`${point.x},${point.y}`, { x: point.x, y: point.y });
      const surfaces = [...points.values()].map((point) => ({ ...point,
        terrain: riverProbeTerrainAt(point.x, point.y, wrapX), elevation: heights[point.x + point.y * 60],
      }));
      expect(surfaces).toHaveLength(wrapX ? 184 : 176);
      expect(createHash("sha256").update(JSON.stringify({ atlas, surfaces })).digest("hex")).toBe(fingerprints[Number(wrapX)]);
    }
  });

  test("V4 authors separated four-cell lakes, supported shores and downhill land-only reaches", () => {
    const layouts = [
      { caseId: "elevated-open-lake", cells: [[50, 18], [51, 18], [50, 19], [51, 19]], inletX: 46, y: 18,
        shore: [[49, 17], [50, 17], [51, 17], [49, 18], [52, 18], [49, 19], [52, 19], [50, 20], [51, 20], [52, 20]],
        outletX: [52, 53, 54, 55, 56], outletHeights: [450, 380, 310, 240, 170] },
      { caseId: "elevated-closed-lake", cells: [[33, 23], [34, 23], [33, 24], [34, 24]], inletX: 29, y: 23,
        shore: [[33, 22], [34, 22], [35, 22], [32, 23], [35, 23], [32, 24], [35, 24], [32, 25], [33, 25], [34, 25]],
        outletX: [], outletHeights: [] },
    ];
    expect(RIVER_ELEVATED_LAKE_CONTROLS.map(({ caseId }) => caseId)).toEqual(layouts.map(({ caseId }) => caseId));
    expect(RIVER_LAKE_CASES).toHaveLength(5);
    for (const wrapX of [false, true]) {
      const atlas = buildRiverProbeAtlas(wrapX);
      const heights = buildRiverProbeElevation(wrapX);
      const at = ({ x, y }: { x: number; y: number }) => heights[x + y * 60]!;
      expect(atlas).toHaveLength(wrapX ? 121 : 117);
      expect(new Set(atlas.map(({ x, y }) => `${x}/${y}`)).size).toBe(atlas.length);
      for (const [i, control] of RIVER_ELEVATED_LAKE_CONTROLS.entries()) {
        const layout = layouts[i]!;
        expect(control.cells.map(({ x, y }) => [x, y])).toEqual(layout.cells);
        expect(control.lakeElevationInput).toBe(572);
        expect(control.shoreElevationInput).toBe(700);
        expect(control.inlet).toEqual([900, 850, 800, 750].map((elevation, j) => ({ x: layout.inletX + j, y: layout.y, elevation })));
        expect(control.outlet).toEqual(layout.outletX.map((x, j) => ({ x, y: layout.y, elevation: layout.outletHeights[j] })));
        expect(RIVER_LAKE_CASES.find(({ caseId }) => caseId === control.caseId)!.cells).toEqual(
          control.cells.map((cell) => ({ ...cell, accepted: true, reason: "admitted" })),
        );
        for (const cell of control.cells) {
          expect(riverProbeTerrainAt(cell.x, cell.y, wrapX)).toBe("COAST");
          expect(at(cell)).toBe(572);
          expect(atlas.filter(({ x, y }) => x === cell.x && y === cell.y)).toHaveLength(0);
        }
        for (const [x, y] of layout.shore) {
          expect(riverProbeTerrainAt(x!, y!, wrapX)).toBe("FLAT");
          const reach = [...control.inlet, ...control.outlet].find((point) => point.x === x && point.y === y);
          expect(at({ x: x!, y: y! })).toBe(reach?.elevation ?? 700);
        }
        const writes = atlas.filter(({ caseId }) => caseId === control.caseId);
        expect(writes).toHaveLength(i === 0 ? 9 : 4);
        expect(writes.filter(({ role }) => role === "inlet")).toHaveLength(4);
        expect(writes.filter(({ role }) => role === "outlet")).toHaveLength(i === 0 ? 5 : 0);
        for (const write of writes) {
          expect(write.riverClass).toBe(write.role === "inlet" ? "MINOR" : "NAVIGABLE");
          expect(write.directionSymbol).toBe("EAST");
          expect(write.expectedReceiver).toEqual({ x: write.x + 1, y: write.y });
          expect(riverProbeTerrainAt(write.x, write.y, wrapX)).toBe("FLAT");
          expect(at(write)).toBeGreaterThan(128);
          expect(at(write.expectedReceiver)).toBeLessThan(at(write));
        }
        expect(writes[3]!.expectedReceiver).toEqual(control.cells[0]);
        if (i === 0) {
          expect(writes[4]).toMatchObject({ x: 52, y: 18, role: "outlet" });
          expect(writes[8]!.expectedReceiver).toEqual({ x: 57, y: 18 });
          expect(riverProbeTerrainAt(57, 18, wrapX)).toBe("COAST");
        }
      }
    }
  });

  test("deployment guidance distinguishes the canonical install directory from the logical mod ID", async () => {
    const { plan } = await compiled();
    const proof = JSON.parse(String(plan.files.find(({ relativePath }) => relativePath === "proof.json")!.content));
    expect(proof.id).toBe("swooper-river-contract-v1");
    expect(proof.installDirectoryName).toBe("mod-swooper-river-contract-v1");
    expect(proof.installDirectoryName).toBe(riverProbeInstallDirectoryName);
    expect(proof.installDirectoryName).not.toBe(proof.id);
    expect([...riverProbeDeployFlags]).toEqual([
      "--input", riverProbeOutputRoot, "--id", "mod-swooper-river-contract-v1",
    ]);
    expect(proof.mapScript).toBe("{swooper-river-contract-v1}/maps/river-contract.js");
    const modinfo = String(plan.files.find(({ relativePath }) => relativePath === "swooper-river-contract-v1.modinfo")!.content);
    expect(modinfo).toContain('<Mod id="swooper-river-contract-v1"');
    expect(modinfo).not.toContain('<Mod id="mod-swooper-river-contract-v1"');
  });

  test("real compiler, isolated mod, SHA manifest, bounded logs, native enums and phase order", async () => {
    const { plan, script } = await compiled();
    await expectCiv7MapScriptCompatibility(script, "river-contract.js");
    const manifest = JSON.parse(String(plan.files.find(({ relativePath }) => relativePath === "proof.json")!.content));
    expect(manifest.scriptSha256).toBe(createHash("sha256").update(script).digest("hex"));
    expect(manifest.settings).toEqual([false, 25, 2, 2]);
    expect(manifest.diagnosticRevision).toBe(4);
    expect(manifest.finalizationPasses).toBe(1);
    expect(manifest.evidence).toContain("no native observations");
    expect(RIVER_PROBE.id).not.toBe("swooper-maps");
    expect(String(plan.files.find(({ relativePath }) => relativePath === "config/config.xml")!.content)).toContain(riverProbeMapScript);
    const runtime = mockRuntime(script, { wrapX: true });
    runtime.run();
    const entries = runtime.entries();
    expect(entries.filter(({ stage }) => RIVER_CHECKPOINTS.includes(stage as any)).map(({ stage }) => stage)).toEqual([...RIVER_CHECKPOINTS]);
    expect(entries.every(({ proofId, variant }) => proofId === "unit-artifact-only" && variant === "authored")).toBe(true);
    const writes = entries.filter(({ stage }) => stage === "write");
    expect(writes).toHaveLength(buildRiverProbeAtlas(true).length);
    expect(writes.every(({ payload }) => payload.nativeDirection >= 70)).toBe(true);
    expect(writes.every(({ payload }) => JSON.stringify(payload.expectedReceiver) === JSON.stringify(payload.gameplayAdjacency))).toBe(true);
    expect(writes[0]!.payload.terrainAdjacency).toBeUndefined();
    expect(script).not.toContain('observe(TerrainBuilder, "TerrainBuilder", "getAdjacentPlotLocation"');
    const finalizations = runtime.calls.filter(({ name }) => name === "finalizeRivers");
    expect(finalizations.map(({ args }) => args)).toEqual([[false, 25, 2, 2]]);
    expect(entries.some(({ stage }) => stage === "after-finalize-repeat-identical")).toBe(false);
    expect(runtime.elevationInputs).toEqual([buildRiverProbeElevation(true)]);
    const initialized = entries.find(({ stage }) => stage === "initialized")!.payload;
    for (const control of RIVER_SLOPE_CONTROLS) {
      const receiver = riverProbeExpectedReceiver(control, control.directionSymbol, true);
      expect(initialized.surfaces.find((surface: any) => surface.x === control.x && surface.y === control.y).elevation).toBe(300);
      expect(initialized.surfaces.find((surface: any) => surface.x === receiver.x && surface.y === receiver.y).elevation).toBe(300 + control.receiverDelta);
    }
    const afterWrite = runtime.calls.slice(runtime.calls.findIndex(({ name }) => name === "finalizeRivers"));
    expect(afterWrite.some(({ name }) => ["setTerrainType", "setElevation", "setRiverInfo"].includes(name))).toBe(false);
    expect(runtime.calls.filter(({ name }) => name === "start")).toHaveLength(4);
    const snapshot = entries.find(({ stage }) => stage === "after-starts")!.payload;
    expect(snapshot.terrain).toHaveLength(2280);
    expect(snapshot.riverClass).toHaveLength(2280);
    expect(snapshot.surfaces).toHaveLength(223);
    expect(snapshot.surfaces[0].freshwater).toBe(false);
    expect(snapshot.surfaces.find((surface: { riverClass: number }) => surface.riverClass === 23).oceanConnectivity).toBe(false);
    expect(snapshot.networks.samples[1].plots.reason).toBe("unexpected-readback");
    expect(snapshot.networks.qualification).toContain("experimental ordinal-to-ID-to-plots");
    expect(runtime.calls.filter(({ name }) => name === "oceanConnectivity").every(({ args }) => Number(args[0]) > 100)).toBe(true);
    expect(entries[0]!.payload.passiveMembers.GameplayMap.names).toContain("getRiverType");
    expect(runtime.lines.every((line) => line.length <= 900)).toBe(true);
    expect(decodeBoundedJsonLogSeries(runtime.lines, "[mapgen-complete]")).toHaveLength(1);
  });

  test("V4 logs inputs separately from unmodified elevation observations, including every shore", async () => {
    // An arbitrary getter result verifies transport only, not Civ lake leveling or river acceptance.
    const runtime = mockRuntime((await compiled()).script, { wrapX: false, elevationReadback: 1234 });
    runtime.run();
    const entries = runtime.entries();
    const metadata = entries[0]!.payload;
    expect(metadata.diagnosticRevision).toBe(4);
    expect(metadata.elevatedLakeEvidence).toContain("native elevation readbacks, not setter inputs");
    expect(metadata.elevatedLakeEvidence).toContain("no river object through water required");
    expect(metadata.elevatedLakeControls).toHaveLength(2);
    const initialized = entries.find(({ stage }) => stage === "initialized")!.payload;
    expect(initialized.surfaces).toHaveLength(215);
    for (const [i, control] of RIVER_ELEVATED_LAKE_CONTROLS.entries()) {
      const logged = metadata.elevatedLakeControls[i];
      expect(logged).toMatchObject(control);
      expect(logged.shore).toHaveLength(10);
      expect(logged.shore.map(({ elevationInput }: { elevationInput: number }) => elevationInput).sort((a: number, b: number) => a - b)).toEqual(
        i === 0 ? [450, 700, 700, 700, 700, 700, 700, 700, 700, 750] : [700, 700, 700, 700, 700, 700, 700, 700, 700, 750],
      );
      for (const point of [...control.cells, ...logged.shore]) {
        expect(initialized.surfaces.filter((surface: any) => surface.x === point.x && surface.y === point.y)).toHaveLength(1);
        expect(initialized.surfaces.find((surface: any) => surface.x === point.x && surface.y === point.y).elevation).toBe(1234);
      }
    }
    expect(runtime.elevationInputs).toEqual([buildRiverProbeElevation(false)]);
    expect(runtime.calls.filter(({ name }) => name === "setRiverInfo")).toHaveLength(117);
    expect(runtime.calls.filter(({ name }) => name === "finalizeRivers")).toHaveLength(1);
    expect(runtime.lines.every((line) => line.length <= 900)).toBe(true);
  });

  test("ocean connectivity is never invoked before finalization or for non-navigable plots", async () => {
    const runtime = mockRuntime((await compiled()).script, { wrapX: false });
    runtime.run();
    expect(runtime.unsafeOceanCalls).toEqual([]);
    expect(runtime.calls.some(({ name }) => name === "oceanConnectivity")).toBe(true);
    const entries = runtime.entries();
    for (const stage of ["initialized", "after-write"]) {
      const surfaces = entries.find((entry) => entry.stage === stage)!.payload.surfaces;
      expect(surfaces.every((surface: any) => surface.oceanConnectivity.status === "skipped" && surface.oceanConnectivity.reason === "before-finalization")).toBe(true);
    }
    const surfaces = entries.find(({ stage }) => stage === "after-finalize-once")!.payload.surfaces;
    expect(surfaces.filter((surface: any) => surface.riverClass !== 23).every((surface: any) => surface.oceanConnectivity.reason === "not-observed-navigable")).toBe(true);
    expect(surfaces.filter((surface: any) => surface.riverClass === 23).every((surface: any) => surface.oceanConnectivity === false)).toBe(true);
  });

  test("each variant changes only the tuple and finalizes exactly once", async () => {
    for (const variant of Object.keys(RIVER_PROBE_VARIANTS) as RiverProbeVariant[]) {
      const runtime = mockRuntime((await compiled(variant)).script, { wrapX: false });
      runtime.run();
      expect(runtime.calls.filter(({ name }) => name === "finalizeRivers").map(({ args }) => args)).toEqual([[...RIVER_PROBE_VARIANTS[variant]]]);
      expect(runtime.entries()[0]!.payload.seam).toEqual({ status: "skipped", reason: "wrapX-false" });
      expect(runtime.calls.filter(({ name }) => name === "setRiverInfo")).toHaveLength(buildRiverProbeAtlas(false).length);
    }
  });

  test("experimental membership enumerates bounded ordinals then uses returned IDs, never ordinals as IDs", async () => {
    const runtime = mockRuntime((await compiled()).script, { networkCount: 99, riverPlotCount: 96 });
    runtime.run();
    const entries = runtime.entries();
    const networks = entries.find(({ stage }) => stage === "after-finalize-once")!.payload.networks;
    expect(networks.samples).toHaveLength(64);
    expect(networks.truncated).toBe(true);
    expect(networks.memberArity).toEqual({ getRiverIDByIndex: 1, getRiverPlots: 1 });
    expect(networks.samples[0]).toMatchObject({ ordinal: 0, riverId: 100 });
    expect(networks.samples[63]).toMatchObject({ ordinal: 63, riverId: 163 });
    expect(networks.samples[0].plots.count).toBe(96);
    expect(networks.samples[0].plots.values).toHaveLength(64);
    expect(networks.samples[0].plots.truncated).toBe(true);
    const beforeFinalization = runtime.calls.slice(0, runtime.calls.findIndex(({ name }) => name === "finalizeRivers"));
    expect(beforeFinalization.some(({ name }) => name === "getRiverIDByIndex" || name === "getRiverPlots")).toBe(false);
    expect(runtime.calls.filter(({ name }) => name === "getRiverIDByIndex").every(({ args }) => Number(args[0]) >= 0 && Number(args[0]) < 64)).toBe(true);
    expect(runtime.calls.filter(({ name }) => name === "getRiverPlots").every(({ args }) => Number(args[0]) >= 100 && Number(args[0]) < 164)).toBe(true);
    expect(entries.find(({ stage }) => stage === "after-write")!.payload.networks.enumeration).toEqual({ status: "skipped", reason: "before-finalization" });
  });

  test("missing or invalid experimental IDs never reach getRiverPlots; object entries remain uninterpreted", async () => {
    const { script } = await compiled();
    const runtime = mockRuntime(script, { networkCount: 7, riverIds: [401, -1, 0.5, NaN, undefined, 0, 100] });
    runtime.run();
    expect([...new Set(runtime.calls.filter(({ name }) => name === "getRiverPlots").map(({ args }) => args[0]))]).toEqual([401, 0, 100]);
    const samples = runtime.entries().find(({ stage }) => stage === "after-finalize-once")!.payload.networks.samples;
    expect(samples.slice(1, 5).every((sample: any) => sample.plots.reason === "river-id-unavailable-or-invalid")).toBe(true);
    expect(samples[6].plots.values[1]).toMatchObject({ status: "unavailable", reason: "unexpected-plot-entry", detail: "object" });
    const missing = mockRuntime(script, { missingRiverId: true });
    missing.run();
    expect(missing.calls.some(({ name }) => name === "getRiverPlots")).toBe(false);
    expect(missing.entries().find(({ stage }) => stage === "after-finalize-once")!.payload.networks.samples[0].riverId).toMatchObject({ status: "unavailable", reason: "missing-callable" });
  });

  test("missing, throwing, unexpected getters and failed writes remain explicit; adjacency mismatch is not repaired", async () => {
    const runtime = mockRuntime((await compiled()).script, {
      missing: ["isFreshWater", "getElevation"], throws: ["isLake"], unexpected: ["isNavigableRiver", "getRiverType"],
      failWrite: true, badAdjacency: true, networkCount: 99,
    });
    runtime.run();
    const entries = runtime.entries();
    expect(entries[0]!.payload.seam.reason).toBe("wrapX-unavailable");
    const snapshot = entries.find(({ stage }) => stage === "after-starts")!.payload;
    expect(snapshot.surfaces[0].freshwater).toMatchObject({ status: "unavailable", reason: "missing-callable" });
    expect(snapshot.surfaces.find((surface: any) => surface.x === 50 && surface.y === 18).elevation).toMatchObject({ status: "unavailable", reason: "missing-callable" });
    expect(snapshot.surfaces[0].lake).toMatchObject({ status: "unavailable", reason: "threw" });
    expect(snapshot.surfaces[0].navigable).toMatchObject({ status: "unavailable", reason: "unexpected-readback" });
    expect(snapshot.riverClass[0]).toMatchObject({ status: "unavailable", reason: "unexpected-readback" });
    expect(snapshot.networks.samples).toHaveLength(64);
    expect(snapshot.networks.truncated).toBe(true);
    expect(entries.find(({ stage }) => stage === "write")!.payload.gameplayAdjacency.x).toBe(999);
    expect(entries.find(({ stage }) => stage === "write")!.payload.expectedReceiver.x).toBe(7);
    const completion = decodeBoundedJsonLogSeries(runtime.lines, "[mapgen-complete]")[0]!.payload as { writeFailures: number; observationsOnly: boolean };
    expect(completion.writeFailures).toBe(1);
    expect(completion.observationsOnly).toBe(true);
  });

  test("failed finalization or later maintenance cannot emit completion", async () => {
    const { script } = await compiled();
    for (const failPhase of ["finalizeRivers", "addFloodplains", "fertility", "start"]) {
      const runtime = mockRuntime(script, { failPhase });
      expect(runtime.run).toThrow(`mock failed ${failPhase}`);
      expect(decodeBoundedJsonLogSeries(runtime.lines, "[mapgen-complete]")).toHaveLength(0);
      expect(decodeBoundedJsonLogSeries(runtime.lines, "[mapgen-failure]")).toHaveLength(1);
    }
  });

  test("invalid builder selectors and unexpected map sizes fail closed", async () => {
    await expect(buildRiverProbePlan("bad/id")).rejects.toThrow("proof ID");
    await expect(buildRiverProbePlan("valid", "unknown" as RiverProbeVariant)).rejects.toThrow("Unknown river probe variant");
    const runtime = mockRuntime((await compiled()).script);
    expect(() => runtime.callbacks.get("RequestMapInitData")!({ width: 44, height: 26 })).toThrow("Tiny 60x38");
  });
});

describe("V6 lake navigation artifact (not native semantics proof)", () => {
  test("four translated class-paired lakes preserve V4 local profiles without wet writes or dry marine gaps", () => {
    expect(RIVER_LAKE_NAVIGATION_CONTROLS).toHaveLength(4);
    expect(RIVER_LAKE_NAVIGATION_CONTROLS.map(({ cells }) => cells[0]!.y)).toEqual([8, 18, 13, 23]);
    for (const wrapX of [false, true]) {
      const writes = buildRiverLakeNavigationAtlas(wrapX);
      const heights = buildRiverLakeNavigationElevation(wrapX);
      const v4Heights = buildRiverProbeElevation(wrapX);
      const at = ({ x, y }: { x: number; y: number }) => heights[x + y * 60]!;
      const water = new Set(RIVER_LAKE_NAVIGATION_CONTROLS.flatMap(({ cells }) => cells.map(({ x, y }) => `${x}/${y}`)));
      expect(heights).toHaveLength(2280);
      expect(water.size).toBe(16);
      expect(writes).toHaveLength(34);
      expect(new Set(writes.map(({ x, y }) => `${x}/${y}`)).size).toBe(34);
      for (const control of RIVER_LAKE_NAVIGATION_CONTROLS) {
        const original = RIVER_ELEVATED_LAKE_CONTROLS.find(({ caseId }) => caseId === control.originalCaseId)!;
        const dy = control.geometryTranslation.y;
        expect(Math.abs(dy) % 2).toBe(0);
        expect(control.lakeElevationInput).toBe(original.lakeElevationInput);
        expect(control.shoreElevationInput).toBe(original.shoreElevationInput);
        expect(control.cells.map((point) => ({ ...point, y: point.y - dy }))).toEqual([...original.cells]);
        expect(control.inlet.map((point) => ({ ...point, y: point.y - dy }))).toEqual([...original.inlet]);
        expect(control.outlet.map((point) => ({ ...point, y: point.y - dy }))).toEqual([...original.outlet]);
        const inlet = writes.filter(({ caseId, role }) => caseId === control.caseId && role === "inlet");
        const outlet = writes.filter(({ caseId, role }) => caseId === control.caseId && role === "outlet");
        expect(inlet).toHaveLength(4);
        expect(inlet.map(at)).toEqual([900, 850, 800, 750]);
        expect(inlet.every(({ riverClass }) => riverClass === control.inletClass)).toBe(true);
        expect(inlet[3]!.expectedReceiver).toEqual(control.cells[0]!);
        expect(outlet).toHaveLength(original.outlet.length);
        expect(outlet.every(({ riverClass }) => riverClass === "NAVIGABLE")).toBe(true);
        for (const point of [...control.cells, ...control.inlet, ...control.outlet])
          expect(at(point)).toBe(v4Heights[point.x + (point.y - dy) * 60]);
        for (const point of control.cells) {
          expect(riverLakeNavigationTerrainAt(point.x, point.y)).toBe("COAST");
          for (const direction of RIVER_DIRECTIONS) {
            const shore = riverProbeExpectedReceiver(point, direction, wrapX);
            if (!water.has(`${shore.x}/${shore.y}`)) {
              expect(riverLakeNavigationTerrainAt(shore.x, shore.y)).toBe("FLAT");
              expect(at(shore)).toBe(v4Heights[shore.x + (shore.y - dy) * 60]);
            }
          }
        }
        if (outlet.length) {
          expect(outlet.map(at)).toEqual([450, 380, 310, 240, 170]);
          expect(outlet[4]!.expectedReceiver).toEqual({ x: 57, y: control.inlet[0]!.y });
          expect(riverLakeNavigationTerrainAt(57, control.inlet[0]!.y)).toBe("COAST");
          expect(riverLakeNavigationTerrainAt(58, control.inlet[0]!.y)).toBe("OCEAN");
          expect(at(outlet[4]!.expectedReceiver)).toBe(0);
        }
      }
      for (const write of writes) {
        expect(water.has(`${write.x}/${write.y}`)).toBe(false);
        expect(riverLakeNavigationTerrainAt(write.x, write.y)).toBe("FLAT");
        expect(write.expectedReceiver).toEqual({ x: write.x + 1, y: write.y });
        expect(at(write.expectedReceiver)).toBeLessThan(at(write));
        expect(at(write)).toBeGreaterThan(128);
        expect(write.y).toBeLessThan(34);
      }
      for (const control of RIVER_LAKE_MARINE_CONTROLS) {
        const reach = writes.filter(({ caseId }) => caseId === control.caseId);
        expect(reach).toHaveLength(4);
        expect(reach.map(at)).toEqual([900, 850, 800, 750]);
        expect(reach.every(({ riverClass }) => riverClass === control.riverClass)).toBe(true);
        expect(reach[3]!.expectedReceiver).toEqual(control.terminalReceiver);
        expect(riverLakeNavigationTerrainAt(control.terminalReceiver.x, control.terminalReceiver.y)).toBe("COAST");
        expect(at(control.terminalReceiver)).toBe(0);
      }
    }
    expect(buildRiverLakeNavigationAtlas(false)).toEqual(buildRiverLakeNavigationAtlas(true));
    expect(buildRiverLakeNavigationElevation(false)).toEqual(buildRiverLakeNavigationElevation(true));
  });

  test("MINOR/NAVIGABLE pairs have identical translated terrain and elevation neighborhoods", () => {
    const heights = buildRiverLakeNavigationElevation(false);
    const neighborhood = (points: readonly { x: number; y: number }[], originY: number) => {
      const cells = new Map<string, { x: number; y: number }>();
      for (const point of points) for (const neighbor of [point, ...RIVER_DIRECTIONS.map((direction) => riverProbeExpectedReceiver(point, direction, false))])
        cells.set(`${neighbor.x}/${neighbor.y}`, neighbor);
      return [...cells.values()].map(({ x, y }) => ({ x, dy: y - originY,
        terrain: riverLakeNavigationTerrainAt(x, y), elevation: heights[x + y * 60],
      }));
    };
    for (const original of RIVER_ELEVATED_LAKE_CONTROLS) {
      const pair = RIVER_LAKE_NAVIGATION_CONTROLS.filter(({ originalCaseId }) => originalCaseId === original.caseId);
      expect(pair.map(({ inletClass }) => inletClass)).toEqual(["MINOR", "NAVIGABLE"]);
      const masks = pair.map((control) => neighborhood([...control.cells, ...control.inlet, ...control.outlet,
        ...(control.outlet.length ? [riverProbeExpectedReceiver(control.outlet.at(-1)!, "EAST", false)] : [])], control.cells[0]!.y));
      expect(masks[0]).toEqual(masks[1]);
    }
    const marineMasks = RIVER_LAKE_MARINE_CONTROLS.map((control) => neighborhood([...control.reach, control.terminalReceiver], control.terminalReceiver.y));
    expect(marineMasks[0]).toEqual(marineMasks[1]);
  });

  test("explicit revision-six selector has its own label and digest and keeps both older selectors", async () => {
    const { plan, script } = await compiled("authored", "lake-navigation");
    await expectCiv7MapScriptCompatibility(script, "river-lake-navigation-v6.js");
    const manifest = JSON.parse(String(plan.files.find(({ relativePath }) => relativePath === "proof.json")!.content));
    expect(manifest).toMatchObject({ diagnosticRevision: 6, atlasKind: "lake-navigation",
      displayLabel: RIVER_LAKE_NAVIGATION_PROBE.displayLabel, finalizationPasses: 1,
      settings: [false, 25, 2, 2], width: 60, height: 38, playerCount: 4,
      scriptSha256: createHash("sha256").update(script).digest("hex"),
    });
    expect(String(plan.files.find(({ relativePath }) => relativePath === "text/en_us/MapText.xml")!.content)).toContain("River Lake Navigation V6");
    expect(String(plan.files.find(({ relativePath }) => relativePath.endsWith(".modinfo"))!.content)).toContain("River Lake Navigation V6");
    for (const [atlasKind, revision] of [["legacy", 4], ["terrain-admission", 5]] as const) {
      const old = await compiled("authored", atlasKind);
      const oldManifest = JSON.parse(String(old.plan.files.find(({ relativePath }) => relativePath === "proof.json")!.content));
      expect(oldManifest).toMatchObject({ diagnosticRevision: revision, atlasKind });
      expect(oldManifest.scriptSha256).not.toBe(manifest.scriptSha256);
    }
    for (const variant of ["aesthetic", "length", "upstream", "percent"] as const)
      await expect(compiled(variant, "lake-navigation")).rejects.toThrow("authored finalization tuple");
  });

  test("real adapter writes all 34 dry sources once and captures independent lake/shore evidence at nine checkpoints", async () => {
    const runtime = mockRuntime((await compiled("authored", "lake-navigation")).script, { wrapX: true });
    runtime.run();
    const entries = runtime.entries();
    const metadata = entries[0]!.payload;
    expect(metadata).toMatchObject({ diagnosticRevision: 6, atlasKind: "lake-navigation", settings: [false, 25, 2, 2] });
    expect(metadata.lakeNavigationControls).toEqual(RIVER_LAKE_NAVIGATION_CONTROLS);
    expect(metadata.marineControls).toEqual(RIVER_LAKE_MARINE_CONTROLS);
    expect(metadata.lakeNavigationEvidence).toContain("NEW dedicated coast-ring background, not the entire V4 run");
    expect(metadata.dispatch).toMatchObject({ writer: "Civ7Adapter.setRiverInfo", finalizer: "Civ7Adapter.finalizeRivers", capabilities: { source: "native" } });
    expect(metadata.lakeCases).toHaveLength(4);
    expect(metadata.slopeControls).toEqual([]);
    expect(metadata.seam).toEqual({ status: "skipped", reason: "lake-controls-do-not-cross-seam" });
    const writes = entries.filter(({ stage }) => stage === "write");
    expect(writes).toHaveLength(34);
    expect(runtime.calls.filter(({ name }) => name === "setRiverInfo").map(({ args }) => args)).toEqual(
      buildRiverLakeNavigationAtlas(true).map(({ x, y, riverClass }) => [x, y, 70, riverClass === "MINOR" ? 11 : 23]),
    );
    for (const { payload } of writes) {
      expect(payload.gameplayAdjacency).toEqual(payload.expectedReceiver);
      expect(payload.outcome).toEqual({ status: "returned" });
      expect(payload.lakeAdmission.before.source.riverClass).toBe(-1);
      expect(payload.lakeAdmission.after.source.riverClass).toBe(payload.riverClass === "MINOR" ? 11 : 23);
      expect(payload.lakeAdmission.before.receiver.riverClass).toBe(-1);
      expect(payload.lakeAdmission.after.receiver.riverClass).toBe(-1);
      expect(payload.lakeAdmission.before.source.requested.riverClass).toBe(payload.riverClass);
      expect(payload.lakeAdmission.before.source.lake).toBe(false);
    }
    const snapshots = entries.filter(({ stage }) => RIVER_CHECKPOINTS.includes(stage as any));
    expect(snapshots.map(({ stage }) => stage)).toEqual([...RIVER_CHECKPOINTS]);
    for (const { payload } of snapshots) for (const control of metadata.elevatedLakeControls) {
      for (const point of [...control.cells, ...control.shore, ...control.inlet, ...control.outlet]) {
        const observed = payload.surfaces.find((surface: any) => surface.x === point.x && surface.y === point.y);
        expect(observed).toBeDefined();
        expect(observed.elevation).toBe(observed.requested.elevation);
        expect(observed.terrain).toBe(observed.requested.terrain);
        // The VM deliberately reports false even on requested lake cells. Never synthesize native truth.
        expect(observed.lake).toBe(false);
        expect(observed.water).toBe(false);
      }
    }
    expect(runtime.elevationInputs).toEqual([buildRiverLakeNavigationElevation(true)]);
    expect(runtime.calls.filter(({ name }) => name === "setFeatureType")).toHaveLength(0);
    expect(runtime.calls.filter(({ name }) => name === "finalizeRivers").map(({ args }) => args)).toEqual([[false, 25, 2, 2]]);
    const afterFinalize = runtime.calls.slice(runtime.calls.findIndex(({ name }) => name === "finalizeRivers"));
    expect(afterFinalize.some(({ name }) => ["setTerrainType", "setElevation", "setFeatureType", "setRiverInfo"].includes(name))).toBe(false);
    expect(runtime.unsafeOceanCalls).toEqual([]);
    expect(runtime.calls.filter(({ name }) => name === "start")).toHaveLength(4);
    expect(runtime.lines.every((line) => line.length <= 900)).toBe(true);
    expect(decodeBoundedJsonLogSeries(runtime.lines, "[mapgen-complete]")[0]!.payload).toMatchObject({ diagnosticRevision: 6, atlasKind: "lake-navigation", writeFailures: 0, observationsOnly: true });
  });

  test("requested heights never replace actual observations and failures do not gain retries or completion", async () => {
    const { script } = await compiled("authored", "lake-navigation");
    const observed = mockRuntime(script, { elevationReadback: 1234, terrainReadback: 987, featureReadback: 654 });
    observed.run();
    for (const { stage, payload } of observed.entries()) {
      if (RIVER_CHECKPOINTS.includes(stage as any)) for (const surface of payload.surfaces) {
        expect(surface).toMatchObject({ elevation: 1234, terrain: 987, feature: 654 });
        expect(surface.requested.elevation).not.toBe(surface.elevation);
      }
      if (stage === "write") for (const moment of [payload.lakeAdmission.before, payload.lakeAdmission.after]) {
        expect(moment.source).toMatchObject({ elevation: 1234, terrain: 987, feature: 654 });
        expect(moment.receiver).toMatchObject({ elevation: 1234, terrain: 987, feature: 654 });
      }
    }
    const failed = mockRuntime(script, { failWriteAt: RIVER_LAKE_NAVIGATION_CONTROLS[1]!.inlet[3]! });
    failed.run();
    expect(failed.calls.filter(({ name }) => name === "setRiverInfo")).toHaveLength(34);
    expect(failed.entries().filter(({ stage, payload }) => stage === "write" && payload.outcome.status === "unavailable")).toHaveLength(1);
    expect(decodeBoundedJsonLogSeries(failed.lines, "[mapgen-complete]")[0]!.payload).toMatchObject({ writeFailures: 1 });
    const invalid = mockRuntime(script, { invalidNativeEnum: true });
    expect(invalid.run).toThrow("RiverTypes.RIVER_MINOR");
    expect(invalid.calls).toHaveLength(0);
    const finalizer = mockRuntime(script, { failPhase: "finalizeRivers" });
    expect(finalizer.run).toThrow("mock failed finalizeRivers");
    expect(decodeBoundedJsonLogSeries(finalizer.lines, "[mapgen-complete]")).toHaveLength(0);
  });
});

describe("V5 terrain admission artifact (native qualification pending)", () => {
  test("16 paired interior controls share complete six-source downhill ocean paths", () => {
    const heights = buildRiverTerrainElevation();
    const at = ({ x, y }: { x: number; y: number }) => heights[x + y * 60]!;
    expect(RIVER_TERRAIN_CONTROLS).toHaveLength(16);
    expect(new Set(RIVER_TERRAIN_CONTROLS.map(({ surface, testEdgeBarrierRole, riverClass }) => `${surface}/${testEdgeBarrierRole}/${riverClass}`)).size).toBe(16);
    expect(RIVER_TERRAIN_CONTROLS.map(({ barrier }) => barrier.y)).toEqual(Array.from({ length: 16 }, (_, i) => 3 + 2 * i));
    expect(heights).toHaveLength(2280);
    for (const wrapX of [false, true]) {
      const atlas = buildRiverTerrainAtlas(wrapX);
      expect(atlas).toHaveLength(96);
      expect(new Set(atlas.map(({ x, y }) => `${x}/${y}`)).size).toBe(96);
      for (const control of RIVER_TERRAIN_CONTROLS) {
        const writes = atlas.filter(({ caseId }) => caseId === control.caseId);
        expect(writes.map(({ x }) => x)).toEqual([52, 53, 54, 55, 56, 57]);
        expect(writes.map(at)).toEqual([550, 500, 450, 400, 350, 300]);
        expect(control.reachRoles).toEqual(["incoming-receiver", "outgoing-source"]);
        expect(control.barrier).toEqual(control.testEdgeBarrierRole === "source" ? control.testSource : control.testReceiver);
        expect(control.barrier.x).toBeGreaterThan(writes[0]!.x);
        expect(control.barrier.x).toBeLessThan(writes[5]!.x);
        expect(riverTerrainProbeTerrainAt(control.barrier.x, control.barrier.y)).toBe(control.substrate);
        for (const [i, write] of writes.entries()) {
          expect(write.directionSymbol).toBe("EAST");
          expect(write.riverClass).toBe(control.riverClass);
          expect(write.expectedReceiver).toEqual({ x: write.x + 1, y: write.y });
          expect(at(write)).toBeGreaterThan(128);
          expect(at(write.expectedReceiver)).toBeLessThan(at(write));
          expect(write.y).toBeLessThan(34);
          if (i < 5) expect(write.expectedReceiver).toEqual({ x: writes[i + 1]!.x, y: writes[i + 1]!.y });
          if (write.x !== control.barrier.x) expect(riverTerrainProbeTerrainAt(write.x, write.y)).toBe("FLAT");
        }
        expect(writes[5]!.role).toBe("marine-mouth-source");
        expect(writes[5]!.expectedReceiver).toEqual(control.terminalReceiver);
        expect(riverTerrainProbeTerrainAt(57, control.barrier.y)).toBe("FLAT");
        expect(riverTerrainProbeTerrainAt(58, control.barrier.y)).toBe("OCEAN");
        expect(at(control.terminalReceiver)).toBe(0);
        if (control.surface === "VOLCANO") {
          const mountain = RIVER_TERRAIN_CONTROLS.find((other) => other.surface === "MOUNTAIN" && other.testEdgeBarrierRole === control.testEdgeBarrierRole && other.riverClass === control.riverClass)!;
          expect(control.substrate).toBe(mountain.substrate);
          expect(control.reach.map(({ x, elevationInput }) => ({ x, elevationInput }))).toEqual(mountain.reach.map(({ x, elevationInput }) => ({ x, elevationInput })));
          expect(control.feature).toBe("FEATURE_VOLCANO");
          expect(mountain.feature).toBeNull();
        }
      }
    }
    expect(buildRiverTerrainAtlas(false)).toEqual(buildRiverTerrainAtlas(true));
    const neighborhoods = RIVER_TERRAIN_CONTROLS.map((control) => {
      const points = new Map<string, { x: number; y: number }>();
      for (const point of [...control.reach, control.terminalReceiver]) {
        for (const neighbor of [point, ...RIVER_DIRECTIONS.map((direction) => riverProbeExpectedReceiver(point, direction, false))])
          points.set(`${neighbor.x}/${neighbor.y}`, neighbor);
      }
      return [...points.values()].map(({ x, y }) => ({ x, dy: y - control.barrier.y,
        terrain: x === control.barrier.x && y === control.barrier.y ? "FLAT" : riverTerrainProbeTerrainAt(x, y),
      }));
    });
    for (const neighborhood of neighborhoods.slice(1)) expect(neighborhood).toEqual(neighborhoods[0]!);
  });

  test("V5 is an explicit uniquely labeled digest-bound selector; legacy remains V4", async () => {
    const { plan, script } = await compiled("authored", "terrain-admission");
    await expectCiv7MapScriptCompatibility(script, "river-terrain-admission-v5.js");
    const manifest = JSON.parse(String(plan.files.find(({ relativePath }) => relativePath === "proof.json")!.content));
    expect(manifest).toMatchObject({
      diagnosticRevision: 5, atlasKind: "terrain-admission", displayLabel: RIVER_TERRAIN_PROBE.displayLabel,
      finalizationPasses: 1, settings: [false, 25, 2, 2], width: 60, height: 38, playerCount: 4,
      scriptSha256: createHash("sha256").update(script).digest("hex"),
    });
    expect(manifest.evidence).toContain("no native observations");
    expect(String(plan.files.find(({ relativePath }) => relativePath === "text/en_us/MapText.xml")!.content)).toContain("River Terrain Admission V5");
    expect(String(plan.files.find(({ relativePath }) => relativePath.endsWith(".modinfo"))!.content)).toContain("River Terrain Admission V5");
    const legacy = await compiled();
    const legacyManifest = JSON.parse(String(legacy.plan.files.find(({ relativePath }) => relativePath === "proof.json")!.content));
    expect(legacyManifest).toMatchObject({ diagnosticRevision: 4, atlasKind: "legacy", id: manifest.id });
    expect(legacyManifest.scriptSha256).not.toBe(manifest.scriptSha256);
    for (const variant of ["aesthetic", "length", "upstream", "percent"] as const)
      await expect(compiled(variant, "terrain-admission")).rejects.toThrow("authored finalization tuple");
    await expect(compiled("authored", "unknown" as RiverProbeAtlas)).rejects.toThrow("Unknown river probe atlas");
  });

  test("real adapter dispatches all writes once, with role-qualified before/after evidence and nine checkpoints", async () => {
    const runtime = mockRuntime((await compiled("authored", "terrain-admission")).script, { wrapX: false });
    runtime.run();
    const entries = runtime.entries();
    const metadata = entries[0]!.payload;
    expect(metadata).toMatchObject({ diagnosticRevision: 5, atlasKind: "terrain-admission", settings: [false, 25, 2, 2] });
    expect(metadata.terrainControls).toEqual(RIVER_TERRAIN_CONTROLS);
    expect(metadata.terrainEvidence).toContain("whole-reach outcomes do not isolate these roles");
    expect(metadata.dispatch).toMatchObject({
      writer: "Civ7Adapter.setRiverInfo", finalizer: "Civ7Adapter.finalizeRivers",
      capabilities: { source: "native", setRiverInfo: { status: "available" }, finalizeRivers: { status: "available" } },
    });
    expect(metadata.requestedFeatureMeaning).toContain("null means no feature was authored");
    expect(metadata.lakeCases).toEqual([]);
    expect(metadata.slopeControls).toEqual([]);
    const writes = entries.filter(({ stage }) => stage === "write");
    expect(writes).toHaveLength(96);
    expect(runtime.calls.filter(({ name }) => name === "setRiverInfo").map(({ args }) => args)).toEqual(
      buildRiverTerrainAtlas(false).map(({ x, y, riverClass }) => [x, y, 70, riverClass === "MINOR" ? 11 : 23]),
    );
    for (const control of RIVER_TERRAIN_CONTROLS) {
      const caseWrites = writes.filter(({ payload }) => payload.caseId === control.caseId);
      const incoming = caseWrites.filter(({ payload }) => payload.terrainAdmission.barrierInteraction === "incoming-receiver");
      const outgoing = caseWrites.filter(({ payload }) => payload.terrainAdmission.barrierInteraction === "outgoing-source");
      expect(incoming).toHaveLength(1);
      expect(outgoing).toHaveLength(1);
      expect(incoming[0]!.payload.expectedReceiver).toEqual(control.barrier);
      expect(outgoing[0]!.payload).toMatchObject(control.barrier);
      for (const { payload } of caseWrites) {
        expect(payload.outcome).toEqual({ status: "returned" });
        expect(payload.gameplayAdjacency).toEqual(payload.expectedReceiver);
        expect(payload.terrainAdmission.before.source.riverClass).toBe(-1);
        expect(payload.terrainAdmission.after.source.riverClass).toBe(control.riverClass === "MINOR" ? 11 : 23);
        expect(payload.terrainAdmission.before.receiver.riverClass).toBe(-1);
        expect(payload.terrainAdmission.after.receiver.riverClass).toBe(-1);
        expect(payload.terrainAdmission.before.source.requested.riverClass).toBe(control.riverClass);
      }
    }
    const snapshots = entries.filter(({ stage }) => RIVER_CHECKPOINTS.includes(stage as any));
    expect(snapshots.map(({ stage }) => stage)).toEqual([...RIVER_CHECKPOINTS]);
    for (const { payload } of snapshots) {
      expect(payload.surfaces).toHaveLength(116);
      for (const control of RIVER_TERRAIN_CONTROLS) {
        const barrier = payload.surfaces.find((surface: any) => surface.x === control.barrier.x && surface.y === control.barrier.y);
        expect(barrier.requested).toMatchObject({ terrainSymbol: control.substrate, riverClass: control.riverClass, feature: control.feature ? 10 : null });
        expect(barrier.feature).toBe(control.feature ? 10 : 0);
        expect(barrier.terrain).toBe(barrier.requested.terrain);
        expect(barrier.elevation).toBe(barrier.requested.elevation);
        expect(barrier.water).toBe(false);
      }
    }
    const setup = snapshots[0]!.payload.setupTerrainAdmission;
    expect(setup.elevationInputApplied).toBe(false);
    expect(setup.beforeValidation).toHaveLength(16);
    expect(setup.afterValidation).toHaveLength(16);
    expect(setup.beforeValidation.every((point: any) => point.elevation === 0 && point.requested.elevation > 128)).toBe(true);
    expect(setup.afterValidation).toEqual(setup.beforeValidation);
    expect(runtime.elevationInputs).toEqual([buildRiverTerrainElevation()]);
    expect(runtime.calls.filter(({ name }) => name === "setFeatureType")).toHaveLength(4);
    expect(runtime.calls.filter(({ name }) => name === "finalizeRivers").map(({ args }) => args)).toEqual([[false, 25, 2, 2]]);
    const afterFinalize = runtime.calls.slice(runtime.calls.findIndex(({ name }) => name === "finalizeRivers"));
    expect(afterFinalize.some(({ name }) => ["setTerrainType", "setElevation", "setFeatureType", "setRiverInfo"].includes(name))).toBe(false);
    expect(runtime.calls.filter(({ name }) => name === "start")).toHaveLength(4);
    expect(runtime.unsafeOceanCalls).toEqual([]);
    expect(runtime.lines.every((line) => line.length <= 900)).toBe(true);
    const completion = decodeBoundedJsonLogSeries(runtime.lines, "[mapgen-complete]");
    expect(completion).toHaveLength(1);
    expect(completion[0]!.payload).toMatchObject({ diagnosticRevision: 5, atlasKind: "terrain-admission", writeFailures: 0, observationsOnly: true });
  });

  test("readbacks and setup repairs remain observations, never reconstructed requested inputs", async () => {
    const { script } = await compiled("authored", "terrain-admission");
    const runtime = mockRuntime(script, { elevationReadback: 1234, terrainReadback: 987, featureReadback: 654, riverClassReadback: 321 });
    runtime.run();
    for (const { stage, payload } of runtime.entries()) {
      if (RIVER_CHECKPOINTS.includes(stage as any)) for (const surface of payload.surfaces) {
        expect(surface).toMatchObject({ elevation: 1234, terrain: 987, feature: 654, riverClass: 321 });
        expect(surface.requested.elevation).not.toBe(surface.elevation);
        expect(surface.requested.terrain).not.toBe(surface.terrain);
        expect(surface.requested.feature).not.toBe(surface.feature);
      }
      if (stage === "write") for (const moment of [payload.terrainAdmission.before, payload.terrainAdmission.after]) {
        expect(moment.source).toMatchObject({ elevation: 1234, terrain: 987, feature: 654, riverClass: 321 });
        expect(moment.receiver).toMatchObject({ elevation: 1234, terrain: 987, feature: 654, riverClass: 321 });
      }
    }
    const repair = mockRuntime(script, { repairSetupTerrain: true });
    repair.run();
    const initialized = repair.entries().find(({ stage }) => stage === "initialized")!.payload;
    for (const [i, before] of initialized.setupTerrainAdmission.beforeValidation.entries()) {
      const after = initialized.setupTerrainAdmission.afterValidation[i];
      expect(before.terrain).toBe(before.requested.terrain);
      expect(after).toMatchObject({ terrain: 987, feature: 654, elevation: 0 });
      expect(after.requested).toEqual(before.requested);
      expect(initialized.surfaces.find((point: any) => point.x === after.x && point.y === after.y)).toMatchObject({ terrain: 987, feature: 654, elevation: after.requested.elevation });
    }
  });

  test("adapter refusals fail before mutation; write failures are explicit without retries or repair", async () => {
    const { script } = await compiled("authored", "terrain-admission");
    const invalid = mockRuntime(script, { invalidNativeEnum: true });
    expect(invalid.run).toThrow("RiverTypes.RIVER_MINOR");
    expect(invalid.calls).toHaveLength(0);
    expect(decodeBoundedJsonLogSeries(invalid.lines, "[mapgen-complete]")).toHaveLength(0);
    const runtime = mockRuntime(script, { failWriteAt: RIVER_TERRAIN_CONTROLS[4]!.barrier });
    runtime.run();
    const failures = runtime.entries().filter(({ stage, payload }) => stage === "write" && payload.outcome.status === "unavailable");
    expect(failures).toHaveLength(1);
    expect(failures[0]!.payload.outcome).toMatchObject({ member: "Civ7Adapter.setRiverInfo", reason: "threw" });
    expect(failures[0]!.payload.terrainAdmission.after.source.riverClass).toBe(-1);
    expect(runtime.calls.filter(({ name }) => name === "setRiverInfo")).toHaveLength(96);
    expect(runtime.calls.filter(({ name }) => name === "finalizeRivers")).toHaveLength(1);
    expect(decodeBoundedJsonLogSeries(runtime.lines, "[mapgen-complete]")[0]!.payload).toMatchObject({ writeFailures: 1, observationsOnly: true });
    const finalizer = mockRuntime(script, { failPhase: "finalizeRivers" });
    expect(finalizer.run).toThrow("mock failed finalizeRivers");
    expect(finalizer.calls.filter(({ name }) => name === "finalizeRivers")).toHaveLength(1);
    expect(decodeBoundedJsonLogSeries(finalizer.lines, "[mapgen-complete]")).toHaveLength(0);
  });
});

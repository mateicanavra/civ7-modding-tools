import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";

import { decodeBoundedJsonLogSeries } from "@swooper/mapgen-core/lib/log";
import { expectCiv7MapScriptCompatibility } from "../runtime/civ7-map-script-compatibility.fixture.js";
import {
  buildRiverProbeAtlas, buildRiverProbeElevation, RIVER_CHECKPOINTS, RIVER_DIRECTIONS, RIVER_ELEVATED_LAKE_CONTROLS, RIVER_LAKE_CASES,
  RIVER_PROBE, RIVER_PROBE_VARIANTS, RIVER_SLOPE_CONTROLS, riverProbeExpectedReceiver, riverProbeTerrainAt,
  type RiverProbeVariant,
} from "./river-contract-map.fixture.js";
import { buildRiverProbePlan, riverProbeMapScript } from "./river-contract-probe.js";

type LogEntry = { stage: string; payload: Record<string, any>; proofId: string; variant: string };

async function compiled(variant: RiverProbeVariant = "authored") {
  const plan = await buildRiverProbePlan("unit-artifact-only", variant);
  const script = plan.files.find((file) => file.relativePath === "maps/river-contract.js")!.content;
  if (typeof script !== "string") throw new Error("Expected compiled text map script.");
  return { plan, script };
}

function mockRuntime(script: string, options: {
  wrapX?: boolean; missing?: string[]; throws?: string[]; unexpected?: string[];
  failPhase?: string; failWrite?: boolean; networkCount?: number; badAdjacency?: boolean;
  riverIds?: unknown[]; missingRiverId?: boolean; riverPlotCount?: number;
  elevationReadback?: number;
} = {}) {
  const callbacks = new Map<string, (...args: any[]) => void>();
  const lines: string[] = [];
  const calls: { name: string; args: unknown[] }[] = [];
  const unsafeOceanCalls: string[] = [];
  const elevationInputs: number[][] = [];
  let finalizations = 0;
  const terrain = new Array<number>(2280).fill(0);
  const rivers = new Array<number>(2280).fill(-1);
  const heights = new Array<number>(2280).fill(0);
  const terrains = ["OCEAN", "COAST", "FLAT", "MOUNTAIN", "NAVIGABLE_RIVER"];
  // Non-slot values ensure no caller accidentally treats array order as the native enum.
  const directions = Object.fromEntries(RIVER_DIRECTIONS.map((name, i) => [`DIRECTION_${name}`, 70 + i * 7]));
  const call = (name: string, args: unknown[] = []) => {
    calls.push({ name, args });
    if (name === options.failPhase) throw new Error(`mock failed ${name}`);
    if (name === "finalizeRivers") finalizations++;
  };
  const gameplayMap: Record<string, unknown> = {
    getGridWidth: () => 60, getGridHeight: () => 38, getRandomSeed: () => 1018,
    getIndexFromXY: (x: number, y: number) => x + y * 60,
    getTerrainType: (x: number, y: number) => terrain[x + y * 60],
    getRiverType: (x: number, y: number) => rivers[x + y * 60],
    getElevation: (x: number, y: number) => options.elevationReadback ?? heights[x + y * 60],
    getFeatureType: () => 0,
    isWater: () => false, isLake: () => false, isRiver: () => false,
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
  runInNewContext(script, {
    console: { log: (line: string) => lines.push(line) },
    engine: { on: (name: string, callback: (...args: any[]) => void) => callbacks.set(name, callback), call: () => {} },
    GameInfo: {
      Terrains: terrains.map((name, $index) => ({ TerrainType: `TERRAIN_${name}`, $index })),
      Biomes: ["GRASSLAND", "MARINE"].map((name, $index) => ({ BiomeType: `BIOME_${name}`, $index })),
      Features: [{ FeatureType: "FEATURE_VOLCANO", $index: 10 }],
    },
    GameplayMap: gameplayMap,
    TerrainBuilder: {
      ...Object.fromEntries(["setBiomeType", "setRainfall", "setLandmassRegionId", "setFeatureType", "validateAndFixTerrain", "stampContinents", "storeWaterData", "finalizeRivers", "addFloodplains"].map((name) => [name, (...args: unknown[]) => call(name, args)])),
      setTerrainType: (x: number, y: number, value: number) => { call("setTerrainType"); terrain[x + y * 60] = value; },
      setElevation: (values: number[]) => { call("setElevation"); elevationInputs.push([...values]); values.forEach((value, i) => { heights[i] = value; }); },
      setRiverInfo: (x: number, y: number, direction: number, riverClass: number) => {
        call("setRiverInfo", [x, y, direction, riverClass]);
        if (options.failWrite && x === 25 && y === 34) throw new Error("rejected mountain write");
        rivers[x + y * 60] = riverClass;
      },
      modelRivers: () => { throw new Error("Procedural generation is forbidden in this fixture."); },
    },
    DirectionTypes: { ...directions, NO_DIRECTION: -1 },
    RiverTypes: { NO_RIVER: -1, RIVER_MINOR: 11, RIVER_NAVIGABLE: 23 },
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
    AreaBuilder: { recalculateAreas: () => call("areas") },
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

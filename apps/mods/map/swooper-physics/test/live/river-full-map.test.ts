import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { decodeBoundedJsonLogSeries } from "@swooper/mapgen-core/lib/log";
import { sha256Hex, stableStringify } from "@swooper/mapgen-core/trace";
import { expectCiv7MapScriptCompatibility } from "../runtime/civ7-map-script-compatibility.fixture.js";
import { buildRiverProbePlan } from "./river-contract-probe.js";
import {
  FULL_MAP_WET_OUTLETS, installFullMapRiverProbe,
  type FullMapProbeBindings, type FullMapRiverProbeAtlas,
} from "./river-full-map.fixture.js";

type Adapter = Parameters<typeof installFullMapRiverProbe>[0];
type Intent = Parameters<Adapter["setRiverInfo"]>[0];
type Tuple = Parameters<Adapter["finalizeRivers"]>[0];
type Entry = { proofId: string; variant: string; stage: string; payload: Record<string, unknown> };
const directions = ["EAST", "NORTHEAST", "NORTHWEST", "WEST", "SOUTHWEST", "SOUTHEAST"];
const index = (x: number, y: number) => x + y * 106;
const identity = { configHash: sha256Hex("config"), envelopeHash: sha256Hex("envelope"), fixtureSourceSha256: sha256Hex("fixture") };

function mock(variant: FullMapRiverProbeAtlas = "full-map-observe", options: {
  seed?: number; gameSeed?: number; width?: number; players?: number; mapSize?: string; failFinalize?: boolean; failCache?: boolean;
} = {}) {
  const lines: string[] = [];
  const calls: { name: string; owner: unknown; input: unknown }[] = [];
  const riverClasses = new Map<number, number>();
  const wet = new Set(FULL_MAP_WET_OUTLETS.map(({ x, y }) => index(x, y)));
  let finalized = false;
  const oceanCalls: number[] = [];
  const riverIdArguments: number[] = [];
  class FakeAdapter {
    getMapSizeId() { return options.mapSize ?? "MAPSIZE_HUGE"; }
    lookupMapInfo() { return { MapSizeType: this.getMapSizeId() }; }
    getAliveMajorIds() { return Array.from({ length: options.players ?? 10 }, (_, i) => i); }
    setElevation(values: readonly number[]) { calls.push({ name: "elevation", owner: this, input: values }); }
    setRiverInfo(intent: Intent) {
      calls.push({ name: "write", owner: this, input: intent });
      riverClasses.set(index(intent.x, intent.y), intent.riverClass === "MINOR" ? 11 : 23);
    }
    finalizeRivers(args: Tuple) {
      calls.push({ name: "finalize", owner: this, input: args });
      if (options.failFinalize) throw new Error("native finalizer failed");
      finalized = true;
    }
    storeWaterData() {
      calls.push({ name: "cache", owner: this, input: null });
      if (options.failCache) throw new Error("native cache failed");
    }
    setTerrainType() { throw new Error("Forbidden terrain mutation"); }
    getRandomNumber() { throw new Error("Forbidden random draw"); }
  }
  const untouched = { setTerrainType: FakeAdapter.prototype.setTerrainType, getRandomNumber: FakeAdapter.prototype.getRandomNumber };
  const bindings: FullMapProbeBindings = {
    log: (line) => lines.push(line),
    Configuration: { getGameValue: (key: string) => { expect(key).toBe("RandomSeed"); return options.gameSeed ?? 1018; } },
    GameplayMap: {
      getGridWidth: () => options.width ?? 106, getGridHeight: () => 66,
      getRandomSeed: () => options.seed ?? 1018,
      getIndexFromXY: index, getRiverType: (x: number, y: number) => riverClasses.get(index(x, y)) ?? -1,
      isWater: (x: number, y: number) => wet.has(index(x, y)), isLake: (x: number, y: number) => wet.has(index(x, y)),
      getTerrainType: () => 3, getFeatureType: () => -1, getElevation: () => 57,
      isCliffCrossing: () => false,
      getAdjacentPlotLocation: ({ x, y }: { x: number; y: number }, direction: number) => {
        expect(direction).toBe(84);
        return { x: x + (y % 2) - 1, y: y + 1 };
      },
    },
    RiverTypes: { RIVER_MINOR: 11, RIVER_NAVIGABLE: 23 },
    DirectionTypes: Object.fromEntries(directions.map((symbol, i) => [`DIRECTION_${symbol}`, 70 + i * 7])),
    MapRivers: {
      getNumRivers: () => 2,
      getRiverIDByIndex: (ordinal: number) => [42, 97][ordinal],
      getRiverPlots: (riverId: number) => { riverIdArguments.push(riverId); return riverId === 42 ? [index(86, 32), index(85, 33)] : [index(87, 28), index(86, 29)]; },
      isRiverConnectedToOcean: (plotIndex: number) => {
        expect(finalized).toBe(true);
        expect(riverClasses.get(plotIndex)).toBe(23);
        oceanCalls.push(plotIndex);
        return true;
      },
    },
  };
  installFullMapRiverProbe(FakeAdapter.prototype, "full-map-test", variant, identity, bindings);
  const adapter = new FakeAdapter();
  const intents: readonly Intent[] = Object.freeze([
    ...FULL_MAP_WET_OUTLETS.map(({ receiver }) => Object.freeze({ ...receiver, direction: "NORTHWEST", riverClass: "NAVIGABLE" }) as Intent),
    ...Array.from({ length: 654 }, (_, cell) => Object.freeze({ x: cell % 106, y: Math.floor(cell / 106),
      direction: "EAST", riverClass: cell % 2 ? "MINOR" : "NAVIGABLE" }) as Intent),
  ]);
  const elevation = Object.freeze(Array.from({ length: 106 * 66 }, (_, cell) => cell / 10));
  const tuple: Tuple = Object.freeze([false, 25, 2, 2]);
  const prepare = (count = 656) => { adapter.setElevation(elevation); for (const intent of intents.slice(0, count)) adapter.setRiverInfo(intent); };
  const entries = () => decodeBoundedJsonLogSeries(lines, "[river-full-map]").map(({ payload }) => payload as Entry);
  return { adapter, FakeAdapter, bindings, prepare, tuple, intents, elevation, calls, lines, entries, wet,
    untouched, oceanCalls, riverIdArguments, riverClasses };
}

describe("full-map wet outlet adapter instrumentation", () => {
  test.each(["full-map-observe", "full-map-wet-outlets"] as const)("%s preserves original calls and changes only the two selected writes", (variant) => {
    const run = mock(variant);
    const inputsBefore = stableStringify({ intents: run.intents, elevation: run.elevation, tuple: run.tuple });
    run.prepare();
    expect(run.oceanCalls).toEqual([]);
    run.adapter.finalizeRivers(run.tuple);
    run.adapter.storeWaterData();
    const added = variant === "full-map-wet-outlets" ? 2 : 0;
    const writes = run.calls.filter(({ name }) => name === "write");
    expect(writes).toHaveLength(656 + added);
    expect(writes.slice(0, 656).map(({ input }) => input)).toEqual([...run.intents]);
    run.intents.forEach((intent, i) => expect(writes[i]!.input).toBe(intent));
    expect(writes.slice(656).map(({ input }) => input)).toEqual(added ? FULL_MAP_WET_OUTLETS.map(({ x, y }) => ({ x, y, direction: "NORTHWEST", riverClass: "NAVIGABLE" })) : []);
    expect(run.calls.find(({ name }) => name === "elevation")!.input).toBe(run.elevation);
    expect(run.calls.filter(({ name }) => name === "finalize").map(({ input }) => input)).toEqual([run.tuple]);
    expect(run.calls.find(({ name }) => name === "finalize")!.input).toBe(run.tuple);
    expect(run.calls.every(({ owner }) => owner === run.adapter)).toBe(true);
    expect(run.calls.map(({ name }) => name)).toEqual(["elevation", ...Array(656 + added).fill("write"), "finalize", "cache"]);
    expect(stableStringify({ intents: run.intents, elevation: run.elevation, tuple: run.tuple })).toBe(inputsBefore);
    expect(run.FakeAdapter.prototype.setTerrainType).toBe(run.untouched.setTerrainType);
    expect(run.FakeAdapter.prototype.getRandomNumber).toBe(run.untouched.getRandomNumber);
    const entries = run.entries();
    expect(entries.every(({ proofId, variant: actual }) => proofId === "full-map-test" && actual === variant)).toBe(true);
    expect(entries.find(({ stage }) => stage === "installed")!.payload).toMatchObject(identity);
    const inputs = entries.find(({ stage }) => stage === "inputs")!.payload;
    expect(inputs.dryWritesSha256).toBe(sha256Hex(stableStringify(run.intents)));
    expect(inputs.elevationInputs).toEqual([{ length: 6996, sha256: sha256Hex(stableStringify(run.elevation)) }]);
    expect(entries.map(({ stage }) => stage)).toContain("after-finalize");
    expect(entries.map(({ stage }) => stage)).toContain("before-water-cache-1");
    expect(entries.map(({ stage }) => stage)).toContain("after-water-cache-1");
    expect((entries.find(({ stage }) => stage === "after-finalize")!.payload.drySourceClasses as unknown[])).toHaveLength(656);
    expect(run.riverIdArguments.every((value) => value === 42 || value === 97)).toBe(true);
    expect(run.oceanCalls.length).toBeGreaterThan(0);
    expect(run.lines.every((line) => line.length <= 900)).toBe(true);
  });

  test("double installation and any second finalization are refused without a retry", () => {
    const run = mock();
    expect(() => installFullMapRiverProbe(run.FakeAdapter.prototype, "second", "full-map-observe", identity, run.bindings)).toThrow("already installed");
    run.prepare(); run.adapter.finalizeRivers(run.tuple);
    expect(() => run.adapter.finalizeRivers(run.tuple)).toThrow("second finalization");
    expect(run.calls.filter(({ name }) => name === "finalize")).toHaveLength(1);
  });

  test.each([{ seed: 42 }, { gameSeed: 1019 }, { width: 84 }, { players: 4 }, { mapSize: "MAPSIZE_STANDARD" }])("refuses the wrong map identity %j", (options) => {
    const run = mock("full-map-wet-outlets", options);
    expect(() => run.prepare()).toThrow("expected original Huge");
    expect(run.calls).toHaveLength(0);
  });

  test("requires exact dry count, elevation receipt, tuple, and a single adapter", () => {
    const short = mock(); short.prepare(655);
    expect(() => short.adapter.finalizeRivers(short.tuple)).toThrow("656 dry writes");
    const badTuple = mock(); badTuple.prepare();
    expect(() => badTuple.adapter.finalizeRivers([true, 25, 2, 2])).toThrow("authored tuple");
    const noElevation = mock(); for (const intent of noElevation.intents) noElevation.adapter.setRiverInfo(intent);
    expect(() => noElevation.adapter.finalizeRivers(noElevation.tuple)).toThrow("one elevation input");
    const other = mock(); other.prepare();
    expect(() => new other.FakeAdapter().finalizeRivers(other.tuple)).toThrow("multiple adapter instances");
    for (const run of [short, badTuple, noElevation, other]) expect(run.calls.some(({ name }) => name === "finalize")).toBe(false);
  });

  test("preflights both wet/dry pairs before adding either write", () => {
    const run = mock("full-map-wet-outlets"); run.prepare();
    run.wet.delete(index(87, 28));
    expect(() => run.adapter.finalizeRivers(run.tuple)).toThrow("expected wet lake 87,28");
    expect(run.calls.filter(({ name }) => name === "write")).toHaveLength(656);
    expect(run.calls.some(({ name }) => name === "finalize")).toBe(false);
    expect(run.entries().map(({ stage }) => stage)).toContain("before-extra-writes");
    expect(run.entries().map(({ stage }) => stage)).toContain("failed");
  });

  test("fails closed on wrong dry class, native adjacency, or missing direction enum", () => {
    for (const fault of ["class", "adjacency", "direction"]) {
      const run = mock("full-map-wet-outlets"); run.prepare();
      if (fault === "class") run.riverClasses.set(index(86, 29), 11);
      if (fault === "adjacency") run.bindings.GameplayMap.getAdjacentPlotLocation = () => ({ x: 0, y: 0 });
      if (fault === "direction") delete run.bindings.DirectionTypes.DIRECTION_NORTHWEST;
      expect(() => run.adapter.finalizeRivers(run.tuple)).toThrow("Full-map probe refused");
      expect(run.calls.filter(({ name }) => name === "write")).toHaveLength(656);
      expect(run.calls.some(({ name }) => name === "finalize")).toBe(false);
    }
  });

  test("preserves finalizer/cache failures and observations without bypassing production checks", () => {
    const failed = mock("full-map-wet-outlets", { failFinalize: true }); failed.prepare();
    expect(() => failed.adapter.finalizeRivers(failed.tuple)).toThrow("native finalizer failed");
    expect(() => failed.adapter.finalizeRivers(failed.tuple)).toThrow("second finalization");
    expect(failed.calls.filter(({ name }) => name === "finalize")).toHaveLength(1);
    expect(failed.oceanCalls).toHaveLength(0);
    expect(failed.entries().map(({ stage }) => stage)).toContain("before-finalize");
    const cache = mock("full-map-observe", { failCache: true }); cache.prepare(); cache.adapter.finalizeRivers(cache.tuple);
    expect(() => cache.adapter.storeWaterData()).toThrow("native cache failed");
    expect(cache.entries().map(({ stage }) => stage)).toContain("after-water-cache-1");
  });

  test.each(["full-map-observe", "full-map-wet-outlets"] as const)("builds %s from the unchanged catalog with independent script identity", async (atlas) => {
    const plan = await buildRiverProbePlan("full-map-build-test", "authored", atlas);
    const contents = (path: string) => String(plan.files.find(({ relativePath }) => relativePath === path)!.content);
    const script = contents("maps/river-contract.js");
    const proof = JSON.parse(contents("proof.json"));
    expect(proof).toMatchObject({ atlasKind: atlas, sourceConfigId: "swooper-earthlike", width: 106, height: 66,
      mapSeed: 1018, gameSeed: 1018, playerCount: 10, dryWriteCount: 656, settings: [false, 25, 2, 2] });
    expect(proof.scriptSha256).toBe(createHash("sha256").update(script).digest("hex"));
    expect(contents("swooper-river-contract-v1.modinfo")).toContain('<Mod id="base-standard"');
    expect(contents("swooper-river-contract-v1.modinfo")).toContain('<Mod id="swooper-maps"');
    expect(script.includes('sourceConfigId: "swooper-earthlike"')).toBe(true);
    expect(script.includes('"id": "swooper-earthlike"')).toBe(true);
    for (const field of ["configHash", "envelopeHash", "fixtureSourceSha256"]) {
      expect(proof[field]).toMatch(/^[0-9a-f]{64}$/);
      expect(script.includes(proof[field])).toBe(true);
    }
    const installSite = script.indexOf('installFullMapRiverProbe(Civ7Adapter.prototype, "full-map-build-test"');
    expect(installSite).toBeGreaterThan(0);
    expect(installSite).toBeLessThan(script.lastIndexOf("createMap({"));
    await expectCiv7MapScriptCompatibility(script, atlas);
    await expect(buildRiverProbePlan("full-map-build-test", "aesthetic", atlas)).rejects.toThrow("authored finalization tuple");
  });
});

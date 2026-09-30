import { describe, expect, it } from "bun:test";
import { decodeBoundedJsonLogSeries } from "@swooper/mapgen-core/lib/log";
import { sha256Hex, stableStringify } from "@swooper/mapgen-core/trace";
import { CIV7_MAP_INFO_KEYS, getCiv7StandardMapSizePreset } from "@civ7/map-policy";
import standardRecipe, { createUnavailableStandardInitialOptionEvidence, projectStandardInitialSetup } from "@swooper/swooper-physics/standard";
import { loadSwooperMapConfigCatalog } from "@swooper/swooper-physics/tooling/catalog-source";
import { installWaterHeightMaintenanceProbe, projectLakeCutoffInitialSetup, WATER_HEIGHT_MAINTENANCE_PROBE, WATER_HEIGHT_LAKE_CUTOFF_PROBE, WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE, WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE } from "./water-height-maintenance.fixture.js";
import { buildRiverProbePlan, riverProbeMapScript } from "./river-contract-probe.js";

const identity = { configHash: "a".repeat(64), envelopeHash: "b".repeat(64), fixtureSourceSha256: "c".repeat(64) };
type Adapter = Parameters<typeof installWaterHeightMaintenanceProbe>[0];
type MapInfo = ReturnType<Adapter["lookupMapInfo"]>;
const mapInfo = (cutoff: number): MapInfo => ({ MapSizeType: "MAPSIZE_HUGE", LakeSizeCutoff: cutoff, GridWidth: 106, GridHeight: 66 });
function cutoffCapture(cutoff = 20): Parameters<typeof projectLakeCutoffInitialSetup>[0] {
  const preset = getCiv7StandardMapSizePreset("MAPSIZE_HUGE");
  const aliveMajorPlayerIds = [7, 2, 11];
  return {
    mapSeed: 1018, gameSeed: 1018, dimensions: preset.dimensions,
    latitudeBounds: { topLatitude: 70, bottomLatitude: -70 }, mapSizeId: preset.id,
    mapInfo: { ...preset.mapInfo, LakeSizeCutoff: cutoff }, aliveMajorPlayerIds,
    startSlotCapacity: { west: preset.mapInfo.PlayersLandmass1, east: preset.mapInfo.PlayersLandmass2,
      total: preset.mapInfo.PlayersLandmass1 + preset.mapInfo.PlayersLandmass2 },
    options: createUnavailableStandardInitialOptionEvidence("value-unavailable", aliveMajorPlayerIds),
  };
}
function fixture(info: MapInfo = mapInfo(10)) {
  const calls: Array<{ method: string; arg?: unknown }> = [];
  const metadataCalls: Array<{ method: string; arg?: unknown }> = [];
  const lines: string[] = [];
  let height = 10;
  const adapter: Adapter = {
    getMapSizeId: () => { metadataCalls.push({ method: "getMapSizeId" }); return "MAPSIZE_HUGE"; },
    lookupMapInfo: (id) => { metadataCalls.push({ method: "lookupMapInfo", arg: id }); return info; },
    getElevation: () => height, getTerrainType: () => 3, getRiverType: () => -1,
    isWater: (x) => x === 93, isLake: () => false,
    setElevation: (values) => { calls.push({ method: "setElevation", arg: values }); height = 20; },
    setRiverInfo: (intent) => { calls.push({ method: "setRiverInfo", arg: intent }); },
    finalizeRivers: (args) => { calls.push({ method: "finalizeRivers", arg: args }); height = 30; },
    validateAndFixTerrain: () => { calls.push({ method: "validateAndFixTerrain" }); height++; },
    generateCliffsFromElevation: () => { calls.push({ method: "generateCliffsFromElevation" }); },
    recalculateAreas: () => { calls.push({ method: "recalculateAreas" }); },
    storeWaterData: () => { calls.push({ method: "storeWaterData" }); },
  };
  const decode = () => decodeBoundedJsonLogSeries(lines, "[water-height-maintenance]").map((entry) => entry.payload as {
    stage: string; proofId: string; diagnosticRevision: number; atlasKind: string;
    payload: { method?: string; occurrence?: number; points?: Array<{ elevation: number; lake: boolean; body?: number; role: string; x: number; y: number }>;
      focus?: Array<{ body?: number; role: string; x: number; y: number }>;
      writes?: Array<{ wet: boolean; intent: unknown }>; elevations?: Array<{ count: number; sha256: string }>;
      mapSizeId?: string; mapInfo?: MapInfo; expectedLakeSizeCutoff?: number; observedLakeSizeCutoff?: unknown; activation?: string };
  });
  return { adapter, calls, metadataCalls, lines, decode };
}

describe("water height maintenance observation (not native semantics)", () => {
  it.each([20, 6996, 40])("admits the actual cutoff %s through custom selection without weakening official preset admission", async (cutoff) => {
    const capture = cutoffCapture(cutoff);
    const before = structuredClone(capture);
    const official = projectStandardInitialSetup(capture);
    const diagnostic = projectLakeCutoffInitialSetup(capture, cutoff);
    expect(diagnostic).toEqual({ ...official, map: { ...official.map, selection: { ...official.map.selection, kind: "custom" } } });
    expect(diagnostic.map.selection.mapInfo.LakeSizeCutoff).toBe(cutoff);
    expect(capture.mapInfo).toEqual(diagnostic.map.selection.mapInfo);
    expect(capture).toEqual(before);
    const [config] = await loadSwooperMapConfigCatalog({ catalogConfigIds: ["swooper-earthlike"] });
    expect(() => standardRecipe.compileConfig(official, config!.canonicalConfig.config)).toThrow("mapInfo.LakeSizeCutoff");
    expect(() => standardRecipe.compileConfig(diagnostic, config!.canonicalConfig.config)).not.toThrow();
  });

  it.each([20, 6996, 40])("refuses every other official static field drift and non-Huge capture for cutoff %s", (cutoff) => {
    for (const key of CIV7_MAP_INFO_KEYS) {
      const capture = cutoffCapture(cutoff);
      const value = capture.mapInfo[key];
      const changed = typeof value === "number" ? value + 1 : typeof value === "boolean" ? !value : `${String(value)}-drift`;
      expect(() => projectLakeCutoffInitialSetup({ ...capture, mapInfo: { ...capture.mapInfo, [key]: changed } }, cutoff)).toThrow();
    }
    const capture = cutoffCapture(cutoff);
    expect(() => projectLakeCutoffInitialSetup({ ...capture, dimensions: { ...capture.dimensions, width: 105 } }, cutoff)).toThrow("Huge selection");
    expect(() => projectLakeCutoffInitialSetup({ ...capture, startSlotCapacity: { ...capture.startSlotCapacity, total: 11 } }, cutoff)).toThrow("Huge start-slot capacity");
    expect(() => projectLakeCutoffInitialSetup({ ...capture, mapSizeId: "MAPSIZE_STANDARD" }, cutoff)).toThrow("disagrees");
    expect(() => projectLakeCutoffInitialSetup({ ...capture, mapInfo: { ...capture.mapInfo, LakeSizeCutoff: 10 } }, cutoff)).toThrow(`LakeSizeCutoff=${cutoff}`);
    expect(() => projectLakeCutoffInitialSetup(capture, 100)).toThrow("Unsupported diagnostic lake cutoff");
  });

  it("keeps the V11 projector default at 20 and defines V12 from the Huge cell count", () => {
    expect(projectLakeCutoffInitialSetup(cutoffCapture()).map.selection.mapInfo.LakeSizeCutoff).toBe(20);
    expect(() => projectLakeCutoffInitialSetup(cutoffCapture(6996))).toThrow("LakeSizeCutoff=20");
    expect(WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE.expectedLakeSizeCutoff).toBe(106 * 66);
    expect(() => projectLakeCutoffInitialSetup(cutoffCapture(40))).toThrow("LakeSizeCutoff=20");
    expect(WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE).toEqual({ ...WATER_HEIGHT_MAINTENANCE_PROBE,
      diagnosticRevision: 15, displayLabel: "Water Bounded Lake Cutoff V15",
      atlasKind: "full-map-bounded-lake-cutoff", expectedLakeSizeCutoff: 40 });
  });

  it.each([42, 1018, 1234])("admits cutoff40 unchanged for seed %s without a per-seed gate", (seed) => {
    const capture = { ...cutoffCapture(40), mapSeed: seed, gameSeed: seed };
    const setup = projectLakeCutoffInitialSetup(capture, 40);
    expect(setup.map.selection.kind).toBe("custom");
    expect(setup.map.selection.mapInfo.LakeSizeCutoff).toBe(40);
    expect(capture.mapSeed).toBe(seed);
    expect(capture.gameSeed).toBe(seed);
  });

  it.each([WATER_HEIGHT_MAINTENANCE_PROBE, WATER_HEIGHT_LAKE_CUTOFF_PROBE, WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE, WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE])("preserves admitted call order, arguments and count for $atlasKind", (options) => {
    const info = mapInfo(options.expectedLakeSizeCutoff);
    const { adapter, calls, metadataCalls, lines, decode } = fixture(info);
    installWaterHeightMaintenanceProbe(adapter, "maintenance-test", identity, options, (line) => lines.push(line));
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
    expect(calls.map((call) => call.method)).toEqual(["setElevation", "setRiverInfo", "setRiverInfo", "finalizeRivers",
      "validateAndFixTerrain", "generateCliffsFromElevation", "recalculateAreas", "storeWaterData", "validateAndFixTerrain"]);
    expect(calls[0]!.arg).toBe(values);
    expect(calls[1]!.arg).toBe(dry);
    expect(calls[2]!.arg).toBe(wet);
    expect(calls[3]!.arg).toBe(args);
    const records = decode();
    expect(records.every((record) => record.proofId === "maintenance-test")).toBe(true);
    expect(records.every((record) => record.diagnosticRevision === options.diagnosticRevision && record.atlasKind === options.atlasKind)).toBe(true);
    expect(metadataCalls).toEqual([{ method: "getMapSizeId" }, { method: "lookupMapInfo", arg: "MAPSIZE_HUGE" }]);
    expect(records.filter((record) => record.stage === "map-info").map((record) => record.payload)).toEqual([{
      mapSizeId: "MAPSIZE_HUGE", mapInfo: info, expectedLakeSizeCutoff: options.expectedLakeSizeCutoff,
      observedLakeSizeCutoff: options.expectedLakeSizeCutoff, activation: "accepted",
    }]);
    const validations = records.filter((record) => record.payload.method === "validateAndFixTerrain");
    expect(validations.map((record) => [record.stage, record.payload.occurrence, record.payload.points?.[0]?.elevation]))
      .toEqual([["before", 1, 30], ["after", 1, 31], ["before", 2, 31], ["after", 2, 32]]);
    const inputs = records.find((record) => record.stage === "inputs")!.payload;
    expect(inputs.writes).toEqual([{ wet: false, intent: dry }, { wet: true, intent: wet }]);
    expect(inputs.elevations?.[0]).toMatchObject({ count: 6996 });
    expect(inputs.elevations?.[0]?.sha256).toMatch(/^[a-f0-9]{64}$/);
    const legacyLogDigests: Record<string, string> = {
      "full-map-maintenance": "0120dd662a7f6502bf78ce291b292f6c1d4cc1ca188840a53c9102217e2b7bf4",
      "full-map-lake-cutoff": "678067441c3d8db02518d486e461d1592a3adc00f7f0fd744ea45d2725da8e49",
      "full-map-max-lake-cutoff": "379f3e3aa6147464702457d60776aae3ab38f67bd7fa4d1d95c00bf6a2f9957c",
    };
    if (legacyLogDigests[options.atlasKind])
      expect(sha256Hex(stableStringify(records))).toBe(legacyLogDigests[options.atlasKind]);
  });

  it("observes changed lake identity without refusing or changing repeated maintenance calls in V12", () => {
    const { adapter, calls, lines, decode } = fixture(mapInfo(6996));
    adapter.isLake = () => true;
    installWaterHeightMaintenanceProbe(adapter, "marine-discriminator", identity, WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE, (line) => lines.push(line));
    for (let call = 0; call < 17; call++) adapter.validateAndFixTerrain();
    expect(calls).toEqual(Array.from({ length: 17 }, () => ({ method: "validateAndFixTerrain" })));
    const observations = decode().filter((record) => record.stage === "before" || record.stage === "after");
    expect(observations).toHaveLength(34);
    expect(observations.every((record) => record.payload.points?.every((point) => point.lake))).toBe(true);
    expect(decode().find((record) => record.stage === "map-info")!.payload.activation).toBe("accepted");
  });

  it.each([{ mapSeed: 42, gameSeed: 42 }, { mapSeed: 1018, gameSeed: 42 }])("uses fixed-coordinate controls without seed1018 hydraulic claims for $mapSeed/$gameSeed", (seeds) => {
    const reference = fixture(mapInfo(40));
    installWaterHeightMaintenanceProbe(reference.adapter, "reference-focus", identity, WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE,
      (line) => reference.lines.push(line));
    const referenceFocus = reference.decode()[0]!.payload.focus!;
    const expectedFocus = referenceFocus.map(({ x, y }) => ({ role: "fixed-coordinate-control", x, y }));
    const observed = fixture(mapInfo(40));
    installWaterHeightMaintenanceProbe(observed.adapter, "seeded-focus", identity, { ...WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE, ...seeds },
      (line) => observed.lines.push(line));
    expect(observed.decode()[0]!.payload.focus).toEqual(expectedFocus);
    observed.adapter.validateAndFixTerrain();
    expect(observed.calls).toEqual([{ method: "validateAndFixTerrain" }]);
    const snapshots = observed.decode().filter((record) => record.stage === "before" || record.stage === "after");
    expect(snapshots).toHaveLength(2);
    for (const record of snapshots) {
      const points = record.payload.points!;
      expect(points.map(({ role, x, y }) => ({ role, x, y }))).toEqual(expectedFocus);
      expect(points.every((point) => !Object.hasOwn(point, "body"))).toBe(true);
    }
  });

  it("preserves an original failure without retries or a successful after observation", () => {
    const { adapter, lines, decode } = fixture();
    const error = new Error("native failure");
    let calls = 0;
    adapter.validateAndFixTerrain = () => { calls++; throw error; };
    installWaterHeightMaintenanceProbe(adapter, "maintenance-test", identity, WATER_HEIGHT_MAINTENANCE_PROBE, (line) => lines.push(line));
    expect(() => adapter.validateAndFixTerrain()).toThrow(error);
    expect(calls).toBe(1);
    expect(decode().map((record) => record.stage)).toEqual(["installed", "map-info", "before", "failed"]);
  });

  it("refuses invalid activation before any first original call, without converting retries into success", () => {
    const firstCalls: Array<(adapter: Adapter) => void> = [
      (adapter) => adapter.setElevation([20]),
      (adapter) => adapter.setRiverInfo({ x: 93, y: 34, direction: "WEST", riverClass: "NAVIGABLE" }),
      (adapter) => adapter.finalizeRivers([false, 25, 2, 2]),
      (adapter) => adapter.validateAndFixTerrain(),
      (adapter) => adapter.generateCliffsFromElevation(),
      (adapter) => adapter.recalculateAreas(),
      (adapter) => adapter.storeWaterData(),
    ];
    const invalid: Array<{ options: NonNullable<Parameters<typeof installWaterHeightMaintenanceProbe>[3]>; info: MapInfo }> = [
      { options: WATER_HEIGHT_MAINTENANCE_PROBE, info: mapInfo(20) },
      ...[mapInfo(10), { ...mapInfo(20), LakeSizeCutoff: "20" }, { MapSizeType: "MAPSIZE_HUGE" },
        null, mapInfo(Number.NaN), { ...mapInfo(20), MapSizeType: "MAPSIZE_STANDARD" }]
        .map((info) => ({ options: WATER_HEIGHT_LAKE_CUTOFF_PROBE, info: info as MapInfo })),
      ...[mapInfo(10), mapInfo(20), { ...mapInfo(6996), LakeSizeCutoff: "6996" }, { MapSizeType: "MAPSIZE_HUGE" },
        null, mapInfo(Number.NaN), { ...mapInfo(6996), MapSizeType: "MAPSIZE_STANDARD" }]
        .map((info) => ({ options: WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE, info: info as MapInfo })),
      ...[mapInfo(10), mapInfo(20), mapInfo(6996), { ...mapInfo(40), LakeSizeCutoff: "40" }, { MapSizeType: "MAPSIZE_HUGE" },
        null, mapInfo(Number.NaN), { ...mapInfo(40), MapSizeType: "MAPSIZE_STANDARD" }]
        .map((info) => ({ options: WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE, info: info as MapInfo })),
    ];
    for (const { options, info } of invalid) {
      for (const firstCall of firstCalls) {
        const { adapter, calls, metadataCalls, lines, decode } = fixture(info);
        installWaterHeightMaintenanceProbe(adapter, "invalid-activation", identity, options, (line) => lines.push(line));
        expect(() => firstCall(adapter)).toThrow(`numeric LakeSizeCutoff=${options.expectedLakeSizeCutoff}`);
        adapter.lookupMapInfo = () => mapInfo(options.expectedLakeSizeCutoff);
        expect(() => adapter.validateAndFixTerrain()).toThrow(`numeric LakeSizeCutoff=${options.expectedLakeSizeCutoff}`);
        expect(calls).toHaveLength(0);
        expect(metadataCalls).toHaveLength(2);
        expect(decode().map((record) => record.stage)).toEqual(["installed", "map-info"]);
        expect(decode()[1]!.payload).toMatchObject({ activation: "refused", expectedLakeSizeCutoff: options.expectedLakeSizeCutoff });
      }
    }
  });

  it("rejects missing identity and duplicate instrumentation without native calls", () => {
    const { adapter, lines, calls } = fixture();
    expect(() => installWaterHeightMaintenanceProbe(adapter, "test", { ...identity, fixtureSourceSha256: "" })).toThrow();
    installWaterHeightMaintenanceProbe(adapter, "test", identity, WATER_HEIGHT_MAINTENANCE_PROBE, (line) => lines.push(line));
    expect(() => installWaterHeightMaintenanceProbe(adapter, "test", identity)).toThrow();
    expect(calls).toHaveLength(0);
  });

  it("builds a canonical whole-map observation fixture with its own source identity", async () => {
    const plan = await buildRiverProbePlan("maintenance-test", "authored", "full-map-maintenance");
    const proofContent = plan.files.find((file) => file.relativePath === "proof.json")!.content;
    if (typeof proofContent !== "string") throw new Error("Expected a text proof manifest.");
    const proof = JSON.parse(proofContent);
    expect(proof).toMatchObject({ diagnosticRevision: 9, atlasKind: "full-map-maintenance", sourceConfigId: "swooper-earthlike",
      width: 106, height: 66, playerCount: 10, installDirectoryName: "mod-swooper-river-contract-v1", expectedLakeSizeCutoff: 10 });
    expect(proof.intervention).toBeUndefined();
    expect(proof.fixtureSourceSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(plan.files.find((file) => file.relativePath === "maps/river-contract.js")!.content).toContain("[water-height-maintenance]");
    expect(plan.files.some((file) => file.relativePath === "config/lake-cutoff.xml")).toBe(false);
    const modinfo = plan.files.find((file) => file.relativePath.endsWith(".modinfo"))!.content;
    expect(modinfo).not.toContain("MapInUse");
    expect(modinfo).not.toContain("diagnostic-map");
    expect(modinfo).not.toContain("lake-cutoff.xml");
    expect(plan.files.find((file) => file.relativePath === "maps/river-contract.js")!.content).not.toContain("Lake cutoff diagnostic requires");
  });

  it.each([WATER_HEIGHT_LAKE_CUTOFF_PROBE, WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE, WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE])("builds $atlasKind with qualified custom selection scoped to the exact diagnostic map", async (options) => {
    const control = await buildRiverProbePlan("maintenance-control", "authored", "full-map-maintenance");
    const plan = await buildRiverProbePlan("cutoff-treatment", "authored", options.atlasKind);
    const content = (files: typeof plan.files, path: string) => {
      const value = files.find((file) => file.relativePath === path)!.content;
      if (typeof value !== "string") throw new Error(`Expected text file: ${path}`);
      return value;
    };
    const proof = JSON.parse(content(plan.files, "proof.json"));
    const controlProof = JSON.parse(content(control.files, "proof.json"));
    expect(proof).toMatchObject({ diagnosticRevision: options.diagnosticRevision, atlasKind: options.atlasKind, expectedLakeSizeCutoff: options.expectedLakeSizeCutoff,
      sourceConfigId: "swooper-earthlike", mapSeed: 1018, gameSeed: 1018, width: 106, height: 66, playerCount: 10,
      configHash: controlProof.configHash, envelopeHash: controlProof.envelopeHash, fixtureSourceSha256: controlProof.fixtureSourceSha256,
      settings: controlProof.settings, evidence: "built-only; no native observations",
      intervention: { kind: "source-qualified-classification-only", scope: "game", criterion: { MapInUse: riverProbeMapScript },
        table: "Maps", where: { MapSizeType: "MAPSIZE_HUGE" }, set: { LakeSizeCutoff: options.expectedLakeSizeCutoff },
        setupSelection: `custom; captured Huge metadata differs only at numeric LakeSizeCutoff ${options.expectedLakeSizeCutoff}` },
    });
    expect(proof.intervention.qualification).toContain("no height, visual or navigation success claimed");
    expect(proof.scriptSha256).not.toBe(controlProof.scriptSha256);
    expect(content(plan.files, "config/config.xml")).toBe(content(control.files, "config/config.xml"));
    expect(content(plan.files, "config/config.xml")).toContain(`File="${riverProbeMapScript}"`);
    expect(content(plan.files, "config/lake-cutoff.xml")).toBe(`<?xml version="1.0" encoding="utf-8"?>\n<Database><Maps><Update><Where MapSizeType="MAPSIZE_HUGE"/><Set LakeSizeCutoff="${options.expectedLakeSizeCutoff}"/></Update></Maps></Database>`);
    const modinfo = content(plan.files, "swooper-river-contract-v1.modinfo");
    expect(modinfo).toContain(`<Criteria id="diagnostic-map"><MapInUse>${riverProbeMapScript}</MapInUse></Criteria>`);
    expect(modinfo).toContain('<ActionGroup id="game-lake-cutoff" scope="game" criteria="diagnostic-map"><Actions><UpdateDatabase><Item>config/lake-cutoff.xml</Item></UpdateDatabase></Actions></ActionGroup>');
    expect(modinfo.match(/<Item>config\/lake-cutoff\.xml<\/Item>/g)).toHaveLength(1);
    expect(content(plan.files, "maps/river-contract.js")).toContain("[water-height-maintenance]");
    expect(content(plan.files, "maps/river-contract.js")).toContain("Lake cutoff diagnostic requires");
    if (options.diagnosticRevision === 12) {
      expect(proof.intervention.discriminator).toContain("not a product cutoff");
      expect(proof.intervention.discriminator).toContain("changed marine lake identity is a result");
    } else if (options.diagnosticRevision === 15) {
      expect(proof.intervention.discriminator).toContain("cutoff40 versus stock10 on Huge42, then unchanged on Huge1018");
      expect(proof.intervention.discriminator).toContain("not a product cutoff");
      expect(proof.intervention.discriminator).toContain("changed classifications are results, not activation refusals");
      expect(content(plan.files, "maps/river-contract.js")).toContain("projectLakeCutoffInitialSetup(capture, 40)");
    } else {
      expect(proof.intervention.discriminator).toBeUndefined();
    }
  });

  it.each([42, 1018])("selects truthful seed %s metadata for paired stock10/cutoff40 without changing recipe or install identity", async (seed) => {
    const control = await buildRiverProbePlan("bounded-control", "authored", "full-map-maintenance", seed);
    const treatment = await buildRiverProbePlan("bounded-treatment", "authored", "full-map-bounded-lake-cutoff", seed);
    const content = (plan: typeof control, path: string) => String(plan.files.find((file) => file.relativePath === path)!.content);
    const controlProof = JSON.parse(content(control, "proof.json"));
    const treatmentProof = JSON.parse(content(treatment, "proof.json"));
    for (const proof of [controlProof, treatmentProof]) expect(proof).toMatchObject({ mapSeed: seed, gameSeed: seed,
      sourceConfigId: "swooper-earthlike", width: 106, height: 66, playerCount: 10,
      mapScript: riverProbeMapScript, installDirectoryName: "mod-swooper-river-contract-v1" });
    expect(controlProof.expectedLakeSizeCutoff).toBe(10);
    expect(treatmentProof.expectedLakeSizeCutoff).toBe(40);
    for (const key of ["configHash", "envelopeHash", "fixtureSourceSha256", "settings"])
      expect(treatmentProof[key]).toEqual(controlProof[key]);
    expect(content(treatment, "config/lake-cutoff.xml")).toContain('<Set LakeSizeCutoff="40"/>');
    expect(content(treatment, "config/config.xml")).toBe(content(control, "config/config.xml"));
    expect(control.files.some((file) => file.relativePath === "config/lake-cutoff.xml")).toBe(false);
    expect(content(control, "swooper-river-contract-v1.modinfo")).not.toContain("MapInUse");
    for (const plan of [control, treatment]) {
      const source = content(plan, "maps/river-contract.js");
      const registration = source.slice(source.lastIndexOf("installWaterHeightMaintenanceProbe(Civ7Adapter.prototype"));
      expect(new RegExp(`"mapSeed": ${seed}, "gameSeed": ${seed}`).test(registration)).toBe(true);
    }
  });

  it("rejects invalid or unrelated explicit seed metadata before bundling", async () => {
    for (const seed of [Number.NaN, Number.POSITIVE_INFINITY, 1.5, 0x8000_0000, -0x8000_0001])
      await expect(buildRiverProbePlan("bad-seed", "authored", "full-map-bounded-lake-cutoff", seed)).rejects.toThrow("signed 32-bit seed");
    for (const atlas of ["legacy", "terrain-admission", "full-map-observe", "water-connectivity-cutoff-10"] as const)
      await expect(buildRiverProbePlan("unrelated-seed", "authored", atlas, 42)).rejects.toThrow("only for maintenance atlases");
    await expect(buildRiverProbePlan("unsupported", "aesthetic", "full-map-bounded-lake-cutoff")).rejects.toThrow("authored finalization tuple");
  });
});

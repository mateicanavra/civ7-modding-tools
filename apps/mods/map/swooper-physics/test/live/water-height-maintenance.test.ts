import { describe, expect, it } from "bun:test";
import { decodeBoundedJsonLogSeries } from "@swooper/mapgen-core/lib/log";
import { installWaterHeightMaintenanceProbe } from "./water-height-maintenance.fixture.js";
import { buildRiverProbePlan } from "./river-contract-probe.js";

const identity = { configHash: "a".repeat(64), envelopeHash: "b".repeat(64), fixtureSourceSha256: "c".repeat(64) };
type Adapter = Parameters<typeof installWaterHeightMaintenanceProbe>[0];
function fixture() {
  const calls: Array<{ method: string; arg?: unknown }> = [];
  const lines: string[] = [];
  let height = 10;
  const adapter: Adapter = {
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
    stage: string; proofId: string; payload: { method?: string; occurrence?: number; points?: Array<{ elevation: number }>;
      writes?: Array<{ wet: boolean; intent: unknown }>; elevations?: Array<{ count: number; sha256: string }> };
  });
  return { adapter, calls, lines, decode };
}

describe("water height maintenance observation (not native semantics)", () => {
  it("preserves call order, arguments and count while observing every validation occurrence", () => {
    const { adapter, calls, lines, decode } = fixture();
    installWaterHeightMaintenanceProbe(adapter, "maintenance-test", identity, (line) => lines.push(line));
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
    const validations = records.filter((record) => record.payload.method === "validateAndFixTerrain");
    expect(validations.map((record) => [record.stage, record.payload.occurrence, record.payload.points?.[0]?.elevation]))
      .toEqual([["before", 1, 30], ["after", 1, 31], ["before", 2, 31], ["after", 2, 32]]);
    const inputs = records.find((record) => record.stage === "inputs")!.payload;
    expect(inputs.writes).toEqual([{ wet: false, intent: dry }, { wet: true, intent: wet }]);
    expect(inputs.elevations?.[0]).toMatchObject({ count: 6996 });
    expect(inputs.elevations?.[0]?.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("preserves an original failure without retries or a successful after observation", () => {
    const { adapter, lines, decode } = fixture();
    const error = new Error("native failure");
    let calls = 0;
    adapter.validateAndFixTerrain = () => { calls++; throw error; };
    installWaterHeightMaintenanceProbe(adapter, "maintenance-test", identity, (line) => lines.push(line));
    expect(() => adapter.validateAndFixTerrain()).toThrow(error);
    expect(calls).toBe(1);
    expect(decode().map((record) => record.stage)).toEqual(["installed", "before", "failed"]);
  });

  it("rejects missing identity and duplicate instrumentation without native calls", () => {
    const { adapter, lines, calls } = fixture();
    expect(() => installWaterHeightMaintenanceProbe(adapter, "test", { ...identity, fixtureSourceSha256: "" })).toThrow();
    installWaterHeightMaintenanceProbe(adapter, "test", identity, (line) => lines.push(line));
    expect(() => installWaterHeightMaintenanceProbe(adapter, "test", identity)).toThrow();
    expect(calls).toHaveLength(0);
  });

  it("builds a canonical whole-map observation fixture with its own source identity", async () => {
    const plan = await buildRiverProbePlan("maintenance-test", "authored", "full-map-maintenance");
    const proofContent = plan.files.find((file) => file.relativePath === "proof.json")!.content;
    if (typeof proofContent !== "string") throw new Error("Expected a text proof manifest.");
    const proof = JSON.parse(proofContent);
    expect(proof).toMatchObject({ diagnosticRevision: 9, atlasKind: "full-map-maintenance", sourceConfigId: "swooper-earthlike",
      width: 106, height: 66, playerCount: 10, installDirectoryName: "mod-swooper-river-contract-v1" });
    expect(proof.intervention).toBeUndefined();
    expect(proof.fixtureSourceSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(plan.files.find((file) => file.relativePath === "maps/river-contract.js")!.content).toContain("[water-height-maintenance]");
  });
});

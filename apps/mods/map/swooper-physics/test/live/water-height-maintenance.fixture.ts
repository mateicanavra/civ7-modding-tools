import { encodeBoundedJsonLogLines } from "@swooper/mapgen-core/lib/log";
import { sha256Hex, stableStringify } from "@swooper/mapgen-core/trace";
import type { Civ7Adapter } from "../../src/runtime/map-script/adapter.js";
import type { FullMapProbeIdentity } from "./river-full-map.fixture.js";

export const WATER_HEIGHT_MAINTENANCE_ATLAS = "full-map-maintenance";
export const WATER_HEIGHT_LAKE_CUTOFF_ATLAS = "full-map-lake-cutoff";
export const WATER_HEIGHT_MAINTENANCE_PROBE = {
  diagnosticRevision: 9, displayLabel: "Water Height Maintenance V9", atlasKind: WATER_HEIGHT_MAINTENANCE_ATLAS,
  width: 106, height: 66, mapSize: "MAPSIZE_HUGE", mapSeed: 1018, gameSeed: 1018,
  playerCount: 10, sourceConfigId: "swooper-earthlike", expectedLakeSizeCutoff: 10,
} as const;
export const WATER_HEIGHT_LAKE_CUTOFF_PROBE = {
  ...WATER_HEIGHT_MAINTENANCE_PROBE, diagnosticRevision: 10, displayLabel: "Water Lake Cutoff V10",
  atlasKind: WATER_HEIGHT_LAKE_CUTOFF_ATLAS, expectedLakeSizeCutoff: 20,
} as const;
type ProbeOptions = typeof WATER_HEIGHT_MAINTENANCE_PROBE | typeof WATER_HEIGHT_LAKE_CUTOFF_PROBE;
const focus = [
  { body: 56, role: "wet-outlet", x: 86, y: 32 }, { body: 56, role: "dry-receiver", x: 85, y: 33 },
  { body: 42, role: "wet-outlet", x: 85, y: 9 }, { body: 42, role: "dry-receiver", x: 84, y: 9 },
  { body: 63, role: "wet-outlet", x: 82, y: 36 }, { body: 63, role: "dry-receiver", x: 81, y: 36 },
  { body: 67, role: "wet-outlet", x: 57, y: 20 }, { body: 67, role: "dry-receiver", x: 57, y: 21 },
  { body: 69, role: "wet-outlet", x: 93, y: 34 }, { body: 69, role: "dry-receiver", x: 92, y: 34 },
] as const;
const maintenanceMethods = ["validateAndFixTerrain", "generateCliffsFromElevation", "recalculateAreas", "storeWaterData"] as const;
type Adapter = Pick<Civ7Adapter, typeof maintenanceMethods[number] | "setElevation" | "setRiverInfo" | "finalizeRivers"
  | "getElevation" | "getTerrainType" | "getRiverType" | "isWater" | "isLake" | "getMapSizeId" | "lookupMapInfo">;
const installed = new WeakSet<object>();
const digest = (value: unknown) => sha256Hex(stableStringify(value));

/** Read-only instrumentation: admitted runs preserve every original call and its arguments. */
export function installWaterHeightMaintenanceProbe(
  prototype: Adapter, proofId: string, identity: FullMapProbeIdentity,
  options: ProbeOptions = WATER_HEIGHT_MAINTENANCE_PROBE,
  log: (line: string) => void = (line) => console.log(line)
): void {
  if (installed.has(prototype)) throw new Error("Water height maintenance probe already installed.");
  if (!/^[a-zA-Z0-9-]{1,100}$/.test(proofId)
    || ![identity.configHash, identity.envelopeHash, identity.fixtureSourceSha256]
      .every((hash) => /^[0-9a-f]{64}$/.test(hash))) throw new Error("Invalid maintenance probe identity.");
  const originals = Object.fromEntries([...maintenanceMethods, "setElevation", "setRiverInfo", "finalizeRivers"]
    .map((key) => [key, prototype[key as keyof Adapter]]));
  if (Object.values(originals).some((method) => typeof method !== "function")) throw new Error("Missing maintenance adapter method.");
  if (typeof prototype.getMapSizeId !== "function" || typeof prototype.lookupMapInfo !== "function")
    throw new Error("Missing maintenance map metadata method.");
  installed.add(prototype);
  let owner: Adapter | undefined;
  let admissionComplete = false;
  let admissionFailure: { error: unknown } | undefined;
  let sequence = 0;
  const occurrences = new Map<string, number>();
  const writes: Array<{ wet: boolean; intent: Parameters<Adapter["setRiverInfo"]>[0] }> = [];
  const elevations: Array<{ count: number; sha256: string }> = [];
  const emit = (stage: string, payload: unknown) => {
    for (const line of encodeBoundedJsonLogLines({ marker: "[water-height-maintenance]",
      payload: { proofId, stage, diagnosticRevision: options.diagnosticRevision, atlasKind: options.atlasKind, ...identity, payload } })) log(line);
  };
  const admit = (adapter: Adapter) => {
    if (owner && owner !== adapter) throw new Error("Maintenance probe requires one adapter instance.");
    if (admissionComplete) {
      if (admissionFailure) throw admissionFailure.error;
      return;
    }
    owner = adapter;
    try {
      const mapSizeId = adapter.getMapSizeId();
      const mapInfo = adapter.lookupMapInfo(mapSizeId);
      const observedLakeSizeCutoff = mapInfo?.LakeSizeCutoff;
      const accepted = mapInfo?.MapSizeType === options.mapSize
        && typeof observedLakeSizeCutoff === "number" && observedLakeSizeCutoff === options.expectedLakeSizeCutoff;
      emit("map-info", { mapSizeId, mapInfo, expectedLakeSizeCutoff: options.expectedLakeSizeCutoff,
        observedLakeSizeCutoff: observedLakeSizeCutoff ?? null, activation: accepted ? "accepted" : "refused" });
      if (!accepted) throw new Error(`Maintenance probe requires ${options.mapSize} numeric LakeSizeCutoff=${options.expectedLakeSizeCutoff}; observed ${String(mapInfo?.MapSizeType)}/${String(observedLakeSizeCutoff)}.`);
    } catch (error) {
      admissionFailure = { error };
      throw error;
    } finally {
      admissionComplete = true;
    }
  };
  const snapshot = (adapter: Adapter) => focus.map((point) => ({ ...point,
    elevation: adapter.getElevation(point.x, point.y), terrain: adapter.getTerrainType(point.x, point.y),
    riverClass: adapter.getRiverType(point.x, point.y), water: adapter.isWater(point.x, point.y),
    lake: adapter.isLake(point.x, point.y),
  }));
  const observe = <T>(adapter: Adapter, method: string, action: () => T): T => {
    admit(adapter);
    const occurrence = (occurrences.get(method) ?? 0) + 1;
    occurrences.set(method, occurrence);
    const call = ++sequence;
    emit("before", { call, method, occurrence, points: snapshot(adapter) });
    try {
      const result = action();
      emit("after", { call, method, occurrence, points: snapshot(adapter) });
      return result;
    } catch (error) {
      emit("failed", { call, method, occurrence, error: String(error) });
      throw error;
    }
  };
  for (const method of maintenanceMethods) {
    const original = prototype[method];
    prototype[method] = function () { return observe(this, method, () => original.call(this)); };
  }
  const setElevation = prototype.setElevation;
  prototype.setElevation = function (values) {
    admit(this);
    elevations.push({ count: values.length, sha256: digest(Array.from(values)) });
    return observe(this, "setElevation", () => setElevation.call(this, values));
  };
  const setRiverInfo = prototype.setRiverInfo;
  prototype.setRiverInfo = function (intent) {
    admit(this);
    writes.push({ wet: this.isWater(intent.x, intent.y), intent: { ...intent } });
    return setRiverInfo.call(this, intent);
  };
  const finalizeRivers = prototype.finalizeRivers;
  prototype.finalizeRivers = function (args) {
    admit(this);
    emit("inputs", { writes, dryWritesSha256: digest(writes.filter((write) => !write.wet).map((write) => write.intent)),
      wetWritesSha256: digest(writes.filter((write) => write.wet).map((write) => write.intent)),
      elevations, finalizationTuple: args });
    return observe(this, "finalizeRivers", () => finalizeRivers.call(this, args));
  };
  emit("installed", { ...options, focus,
    qualification: "Read-only observation after measured cutoff admission; installation is not activation or success. Admitted runs add, suppress or retry no river, elevation or maintenance calls." });
}

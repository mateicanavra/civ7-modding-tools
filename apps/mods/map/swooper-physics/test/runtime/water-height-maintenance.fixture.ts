import {
  CIV7_MAP_INFO_KEYS,
  type Civ7StandardMapSizeId,
  getCiv7StandardMapSizePreset,
} from "@civ7/map-policy";
import type { MapContext } from "@swooper/mapgen-core";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import { encodeBoundedJsonLogLines } from "@swooper/mapgen-core/lib/log";
import { sha256Hex, stableStringify } from "@swooper/mapgen-core/trace";
import standardRecipe, {
  projectStandardInitialSetup,
  STANDARD_STAGES,
} from "@swooper/swooper-physics/standard";
import type { Civ7Adapter } from "../../src/runtime/map-script/adapter.js";
import type { FullMapProbeIdentity } from "./river-full-map.fixture.js";

export const WATER_HEIGHT_MAINTENANCE_ATLAS = "full-map-maintenance";
export const WATER_HEIGHT_LAKE_CUTOFF_ATLAS = "full-map-lake-cutoff";
export const WATER_HEIGHT_MAX_LAKE_CUTOFF_ATLAS = "full-map-max-lake-cutoff";
export const WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_ATLAS = "full-map-bounded-lake-cutoff";
export const WATER_HEIGHT_MAINTENANCE_PROBE = {
  diagnosticRevision: 9,
  displayLabel: "Water Height Maintenance V9",
  atlasKind: WATER_HEIGHT_MAINTENANCE_ATLAS,
  width: 106,
  height: 66,
  mapSize: "MAPSIZE_HUGE",
  mapSeed: 1018,
  gameSeed: 1018,
  playerCount: 10,
  sourceConfigId: "swooper-earthlike",
  expectedLakeSizeCutoff: 10,
} as const;
export const WATER_HEIGHT_LAKE_CUTOFF_PROBE = {
  ...WATER_HEIGHT_MAINTENANCE_PROBE,
  diagnosticRevision: 11,
  displayLabel: "Water Lake Cutoff V11",
  atlasKind: WATER_HEIGHT_LAKE_CUTOFF_ATLAS,
  expectedLakeSizeCutoff: 20,
} as const;
export const WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE = {
  ...WATER_HEIGHT_MAINTENANCE_PROBE,
  diagnosticRevision: 12,
  displayLabel: "Water Max Lake Cutoff V12",
  atlasKind: WATER_HEIGHT_MAX_LAKE_CUTOFF_ATLAS,
  expectedLakeSizeCutoff:
    WATER_HEIGHT_MAINTENANCE_PROBE.width * WATER_HEIGHT_MAINTENANCE_PROBE.height,
} as const;
export const WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE = {
  ...WATER_HEIGHT_MAINTENANCE_PROBE,
  diagnosticRevision: 15,
  displayLabel: "Water Bounded Lake Cutoff V15",
  atlasKind: WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_ATLAS,
  expectedLakeSizeCutoff: 40,
} as const;
/** Stock metadata control for the post-authentic-recipe preservation discriminator. */
export const WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_ATLAS = "full-map-original-input-control";
/** Reapplies protected original requests after authentic recipe success, never getter values. */
export const WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_ATLAS = "full-map-original-input-replay";
/** Retains exact native dry heights while replaying only protected original wet requests. */
export const WATER_HEIGHT_DRY_RETENTION_REPLAY_ATLAS = "full-map-dry-retention-replay";
/** Finite control identity; its finishing slots observe without additional native maintenance. */
export const WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_PROBE = {
  ...WATER_HEIGHT_MAINTENANCE_PROBE,
  diagnosticRevision: 18,
  displayLabel: "Post-Recipe Original Input Control V18",
  atlasKind: WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_ATLAS,
} as const;
/** Finite treatment identity; only one original elevation replay differs from the control. */
export const WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_PROBE = {
  ...WATER_HEIGHT_MAINTENANCE_PROBE,
  diagnosticRevision: 19,
  displayLabel: "Post-Recipe Original Input Replay V19",
  atlasKind: WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_ATLAS,
} as const;
export const WATER_HEIGHT_DRY_RETENTION_REPLAY_PROBE = {
  ...WATER_HEIGHT_MAINTENANCE_PROBE,
  diagnosticRevision: 20,
  displayLabel: "Post-Recipe Dry Retention Replay V20",
  atlasKind: WATER_HEIGHT_DRY_RETENTION_REPLAY_ATLAS,
} as const;
type ProbeOptions = Readonly<{
  diagnosticRevision: number;
  displayLabel: string;
  atlasKind: string;
  width: number;
  height: number;
  mapSize: Civ7StandardMapSizeId;
  mapSeed: number;
  gameSeed: number;
  playerCount: number;
  sourceConfigId: string;
  expectedLakeSizeCutoff: number;
}>;
const focus = [
  { body: 56, role: "wet-outlet", x: 86, y: 32 },
  { body: 56, role: "dry-receiver", x: 85, y: 33 },
  { body: 42, role: "wet-outlet", x: 85, y: 9 },
  { body: 42, role: "dry-receiver", x: 84, y: 9 },
  { body: 63, role: "wet-outlet", x: 82, y: 36 },
  { body: 63, role: "dry-receiver", x: 81, y: 36 },
  { body: 67, role: "wet-outlet", x: 57, y: 20 },
  { body: 67, role: "dry-receiver", x: 57, y: 21 },
  { body: 69, role: "wet-outlet", x: 93, y: 34 },
  { body: 69, role: "dry-receiver", x: 92, y: 34 },
] as const;
const maintenanceMethods = [
  "validateAndFixTerrain",
  "generateCliffsFromElevation",
  "recalculateAreas",
  "storeWaterData",
] as const;
type Adapter = Pick<
  Civ7Adapter,
  | (typeof maintenanceMethods)[number]
  | "setElevation"
  | "setRiverInfo"
  | "finalizeRivers"
  | "getElevation"
  | "readCurrentMapElevationSnapshot"
  | "getTerrainType"
  | "getFeatureType"
  | "getRiverType"
  | "isWater"
  | "isLake"
  | "getMapSizeId"
  | "lookupMapInfo"
>;
const installed = new WeakSet<object>();
const digest = (value: unknown) => sha256Hex(stableStringify(value));
const lakePlanDefinition = (() => {
  for (const stage of STANDARD_STAGES)
    for (const step of stage.steps) {
      for (const provided of step.contract.provides) {
        if (typeof provided !== "string" && provided.id === "artifact:hydrology.lakePlan")
          return provided;
      }
    }
  throw new Error("Standard recipe does not provide physical lake intent.");
})();
const projectedLakesDefinition = (() => {
  for (const stage of STANDARD_STAGES)
    for (const step of stage.steps) {
      for (const provided of step.contract.provides) {
        if (typeof provided !== "string" && provided.id === "artifact:map.hydrology.projectedLakes")
          return provided;
      }
    }
  throw new Error("Standard recipe does not provide accepted lake projection.");
})();

/** Observes complete physical lake membership and Number heads only after authentic recipe success. */
export function observeWaterHeightPhysicalLakes(
  context: MapContext,
  plan: Parameters<typeof standardRecipe.execute>[1],
  proofId: string,
  identity: FullMapProbeIdentity,
  options: ProbeOptions = WATER_HEIGHT_MAINTENANCE_PROBE,
  log: (line: string) => void = (line) => console.log(line)
): void {
  if (
    !/^[a-zA-Z0-9-]{1,100}$/.test(proofId) ||
    ![identity.configHash, identity.envelopeHash, identity.fixtureSourceSha256].every((hash) =>
      /^[0-9a-f]{64}$/.test(hash)
    )
  )
    throw new Error("Invalid maintenance probe identity.");
  const setup = standardRecipe.inspectPlan(plan).initialSetup.value;
  const { width, height } = context.setup.dimensions;
  if (
    context.setup !== plan.setup ||
    setup.map.mapSeed !== options.mapSeed ||
    setup.gameSeed !== options.gameSeed ||
    width !== options.width ||
    height !== options.height
  )
    throw new Error(
      "Physical lake observation requires the exact selected recipe plan and context."
    );
  const lakePlan = readArtifact(context, lakePlanDefinition);
  const projectedLakes = readArtifact(context, projectedLakesDefinition);
  const cells: [number, number, number][] = [];
  for (let cell = 0; cell < projectedLakes.lakeMask.length; cell++) {
    if (projectedLakes.lakeMask[cell] === 1)
      cells.push([cell, lakePlan.bodyId[cell]!, lakePlan.waterSurface[cell]!]);
  }
  const payload = {
    phase: "post-recipe",
    mapSeed: setup.map.mapSeed,
    gameSeed: setup.gameSeed,
    dimensions: { width, height },
    plannedLakeTileCount: lakePlan.plannedLakeTileCount,
    columns: ["cell", "body", "head"],
    cells,
    bodies: lakePlan.bodies
      .map((body) => ({
        bodyId: body.bodyId,
        componentId: body.componentId,
        poolId: body.poolId,
        level: body.level,
        wetCells: [...body.wetCells],
      }))
      .sort((a, b) => a.bodyId - b.bodyId),
    components: lakePlan.components
      .map((component) => ({
        componentId: component.componentId,
        poolId: component.poolId,
        state: component.state,
        level: component.level,
        bodyIds: [...component.bodyIds],
        memberCells: [...component.memberCells],
      }))
      .sort((a, b) => a.componentId - b.componentId),
    pools: lakePlan.pools
      .map((pool) => ({
        poolId: pool.poolId,
        componentId: pool.componentId,
        state: pool.state,
        level: pool.level,
        leafIds: [...pool.leafIds],
        wetCells: [...pool.wetCells],
      }))
      .sort((a, b) => a.poolId - b.poolId),
  };
  for (const line of encodeBoundedJsonLogLines({
    marker: "[water-height-maintenance]",
    payload: {
      proofId,
      stage: "physical-lakes",
      diagnosticRevision: options.diagnosticRevision,
      atlasKind: options.atlasKind,
      ...identity,
      payload,
    },
  }))
    log(line);
}

/** Admits only the selected official row with its measured diagnostic cutoff; only treatments are custom. */
export function projectLakeCutoffInitialSetup(
  capture: Parameters<typeof projectStandardInitialSetup>[0],
  expectedLakeSizeCutoff: number = WATER_HEIGHT_LAKE_CUTOFF_PROBE.expectedLakeSizeCutoff,
  mapSize: Civ7StandardMapSizeId = "MAPSIZE_HUGE"
): ReturnType<typeof projectStandardInitialSetup> {
  const preset = getCiv7StandardMapSizePreset(mapSize);
  if (
    !Number.isSafeInteger(expectedLakeSizeCutoff) ||
    expectedLakeSizeCutoff <= 0 ||
    expectedLakeSizeCutoff > preset.dimensions.width * preset.dimensions.height
  )
    throw new Error(
      "Diagnostic lake cutoff must be a positive integer no greater than the selected cell count."
    );
  const setup = projectStandardInitialSetup(capture);
  const selection = setup.map.selection;
  if (
    selection.id !== preset.id ||
    selection.dimensions.width !== preset.dimensions.width ||
    selection.dimensions.height !== preset.dimensions.height
  )
    throw new Error(
      `Lake cutoff diagnostic requires the captured ${preset.label} selection and dimensions.`
    );
  for (const key of CIV7_MAP_INFO_KEYS) {
    const expected = key === "LakeSizeCutoff" ? expectedLakeSizeCutoff : preset.mapInfo[key];
    if (selection.mapInfo[key] !== expected)
      throw new Error(
        `Lake cutoff diagnostic requires mapInfo.${key}=${String(expected)}; observed ${String(selection.mapInfo[key])}.`
      );
  }
  if (
    selection.startSlotCapacity.west !== preset.mapInfo.PlayersLandmass1 ||
    selection.startSlotCapacity.east !== preset.mapInfo.PlayersLandmass2 ||
    selection.startSlotCapacity.total !==
      preset.mapInfo.PlayersLandmass1 + preset.mapInfo.PlayersLandmass2
  )
    throw new Error(
      `Lake cutoff diagnostic requires the captured ${preset.label} start-slot capacity.`
    );
  if (expectedLakeSizeCutoff === preset.mapInfo.LakeSizeCutoff) return setup;
  return Object.freeze({
    ...setup,
    map: Object.freeze({
      ...setup.map,
      selection: Object.freeze({ ...selection, kind: "custom" as const }),
    }),
  });
}

/** Preserves authentic calls; V18-V20 return a separately invoked post-recipe discriminator. */
export function installWaterHeightMaintenanceProbe(
  prototype: Adapter,
  proofId: string,
  identity: FullMapProbeIdentity,
  options: ProbeOptions = WATER_HEIGHT_MAINTENANCE_PROBE,
  log: (line: string) => void = (line) => console.log(line)
) {
  if (installed.has(prototype))
    throw new Error("Water height maintenance probe already installed.");
  if (
    !/^[a-zA-Z0-9-]{1,100}$/.test(proofId) ||
    ![identity.configHash, identity.envelopeHash, identity.fixtureSourceSha256].every((hash) =>
      /^[0-9a-f]{64}$/.test(hash)
    )
  )
    throw new Error("Invalid maintenance probe identity.");
  const originals = Object.fromEntries(
    [...maintenanceMethods, "setElevation", "setRiverInfo", "finalizeRivers"].map((key) => [
      key,
      prototype[key as keyof Adapter],
    ])
  );
  if (Object.values(originals).some((method) => typeof method !== "function"))
    throw new Error("Missing maintenance adapter method.");
  if (typeof prototype.getMapSizeId !== "function" || typeof prototype.lookupMapInfo !== "function")
    throw new Error("Missing maintenance map metadata method.");
  installed.add(prototype);
  const observationFocus =
    options.sourceConfigId === WATER_HEIGHT_MAINTENANCE_PROBE.sourceConfigId &&
    options.mapSize === WATER_HEIGHT_MAINTENANCE_PROBE.mapSize &&
    options.width === WATER_HEIGHT_MAINTENANCE_PROBE.width &&
    options.height === WATER_HEIGHT_MAINTENANCE_PROBE.height &&
    options.playerCount === WATER_HEIGHT_MAINTENANCE_PROBE.playerCount &&
    options.mapSeed === WATER_HEIGHT_MAINTENANCE_PROBE.mapSeed &&
    options.gameSeed === WATER_HEIGHT_MAINTENANCE_PROBE.gameSeed
      ? focus
      : focus
          .filter(({ x, y }) => x >= 0 && y >= 0 && x < options.width && y < options.height)
          .map(({ x, y }) => ({ role: "fixed-coordinate-control", x, y }));
  let owner: Adapter | undefined;
  let admissionComplete = false;
  let admissionFailure: { error: unknown } | undefined;
  let sequence = 0;
  const occurrences = new Map<string, number>();
  const writes: Array<{ wet: boolean; intent: Parameters<Adapter["setRiverInfo"]>[0] }> = [];
  const elevations: Array<{ count: number; sha256: string }> = [];
  const dryRetention = options.atlasKind === WATER_HEIGHT_DRY_RETENTION_REPLAY_ATLAS;
  const originalInputArm =
    options.atlasKind === WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_ATLAS ||
    options.atlasKind === WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_ATLAS ||
    dryRetention;
  let originalElevation: number[] | undefined;
  let originalElevationSucceeded = false;
  let finished = false;
  const emit = (stage: string, payload: unknown) => {
    for (const line of encodeBoundedJsonLogLines({
      marker: "[water-height-maintenance]",
      payload: {
        proofId,
        stage,
        diagnosticRevision: options.diagnosticRevision,
        atlasKind: options.atlasKind,
        ...identity,
        payload,
      },
    }))
      log(line);
  };
  const admit = (adapter: Adapter) => {
    if (owner && owner !== adapter)
      throw new Error("Maintenance probe requires one adapter instance.");
    if (admissionComplete) {
      if (admissionFailure) throw admissionFailure.error;
      return;
    }
    owner = adapter;
    try {
      const mapSizeId = adapter.getMapSizeId();
      const mapInfo = adapter.lookupMapInfo(mapSizeId);
      const observedLakeSizeCutoff = mapInfo?.LakeSizeCutoff;
      const accepted =
        mapInfo?.MapSizeType === options.mapSize &&
        mapInfo.GridWidth === options.width &&
        mapInfo.GridHeight === options.height &&
        typeof observedLakeSizeCutoff === "number" &&
        observedLakeSizeCutoff === options.expectedLakeSizeCutoff;
      emit("map-info", {
        mapSizeId,
        mapInfo,
        expectedLakeSizeCutoff: options.expectedLakeSizeCutoff,
        observedLakeSizeCutoff: observedLakeSizeCutoff ?? null,
        activation: accepted ? "accepted" : "refused",
      });
      if (!accepted)
        throw new Error(
          `Maintenance probe requires ${options.mapSize} numeric LakeSizeCutoff=${options.expectedLakeSizeCutoff}; observed ${String(mapInfo?.MapSizeType)}/${String(observedLakeSizeCutoff)}.`
        );
    } catch (error) {
      admissionFailure = { error };
      throw error;
    } finally {
      admissionComplete = true;
    }
  };
  const snapshot = (adapter: Adapter) =>
    observationFocus.map((point) => ({
      ...point,
      elevation: adapter.getElevation(point.x, point.y),
      terrain: adapter.getTerrainType(point.x, point.y),
      riverClass: adapter.getRiverType(point.x, point.y),
      water: adapter.isWater(point.x, point.y),
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
    prototype[method] = function () {
      return observe(this, method, () => original.call(this));
    };
  }
  const setElevation = prototype.setElevation;
  prototype.setElevation = function (values) {
    admit(this);
    if (originalInputArm && originalElevation === undefined) {
      originalElevation = Array.from(values);
      if (
        originalElevation.length !== options.width * options.height ||
        !originalElevation.every(Number.isFinite)
      )
        throw new Error("Original elevation evidence requires a complete finite Number[] request.");
      for (let row = 0; row < options.height; row++) {
        const startCell = row * options.width;
        emit("original-elevation-input-grid", {
          row,
          startCell,
          values: originalElevation.slice(startCell, startCell + options.width),
        });
      }
      emit("original-elevation-input", {
        count: originalElevation.length,
        sha256: digest(originalElevation),
        input:
          "protected Number[] snapshot before the first authentic setter; never native readbacks",
      });
    }
    elevations.push({ count: values.length, sha256: digest(Array.from(values)) });
    const result = observe(this, "setElevation", () => setElevation.call(this, values));
    if (originalInputArm) originalElevationSucceeded = true;
    return result;
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
    emit("inputs", {
      writes,
      dryWritesSha256: digest(writes.filter((write) => !write.wet).map((write) => write.intent)),
      wetWritesSha256: digest(writes.filter((write) => write.wet).map((write) => write.intent)),
      elevations,
      finalizationTuple: args,
    });
    return observe(this, "finalizeRivers", () => finalizeRivers.call(this, args));
  };
  emit("installed", {
    ...options,
    focus: observationFocus,
    qualification: originalInputArm
      ? dryRetention
        ? "Authentic calls are preserved. After recipe success, V20 adds one setter retaining exact native dry heights and protected original wet requests, no other maintenance. This is not the internal prepare-surface repair slot."
        : "Authentic calls are preserved. The generated wrapper invokes equal post-recipe observation slots only after success; V19 adds one original-request setter, no other maintenance. This is not the internal prepare-surface repair slot."
      : "Read-only observation after measured cutoff admission; installation is not activation or success. Admitted runs add, suppress or retry no river, elevation or maintenance calls.",
  });
  return () => {
    if (!originalInputArm)
      throw new Error("This maintenance atlas has no original-input finishing slot.");
    if (finished) throw new Error("Original-input finishing slot already attempted.");
    if (!owner || !originalElevation || !originalElevationSucceeded)
      throw new Error("Original-input finishing requires a successful authentic elevation setter.");
    finished = true;
    const adapter = owner;
    const retainedOriginal = originalElevation;
    const replay = options.atlasKind === WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_ATLAS || dryRetention;
    const capture = (checkpoint: string) => {
      for (let row = 0; row < options.height; row++) {
        const points = Array.from({ length: options.width }, (_, x) => ({ x, y: row }));
        emit("original-replay-grid", {
          checkpoint,
          row,
          startCell: row * options.width,
          elevation: points.map(({ x, y }) => adapter.getElevation(x, y)),
          terrain: points.map(({ x, y }) => adapter.getTerrainType(x, y)),
          feature: points.map(({ x, y }) => adapter.getFeatureType(x, y)),
          riverType: points.map(({ x, y }) => adapter.getRiverType(x, y)),
          water: points.map(({ x, y }) => adapter.isWater(x, y)),
          lake: points.map(({ x, y }) => adapter.isLake(x, y)),
        });
      }
      emit(checkpoint, {
        phase: "post-authentic-recipe",
        action: dryRetention
          ? "replay-original-wet-retain-native-dry"
          : replay
            ? "replay-original-requests"
            : "none",
        cellCount: options.width * options.height,
        rowCount: options.height,
        originalInputSha256: digest(retainedOriginal),
        qualification: dryRetention
          ? "Exact native dry heights and original wet requests; no validation, cliffs, area/cache refresh or selected product preservation policy."
          : "Original requests only; no validation, cliffs, area/cache refresh or preservation policy is selected.",
      });
    };
    try {
      let request = [...retainedOriginal];
      if (dryRetention) {
        if (typeof adapter.readCurrentMapElevationSnapshot !== "function")
          throw new Error("Dry retention requires the exact native elevation snapshot method.");
        const current = adapter.readCurrentMapElevationSnapshot();
        if (
          current?.source !== "native" ||
          current.status !== "available" ||
          current.width !== options.width ||
          current.height !== options.height ||
          !(current.values instanceof Float64Array) ||
          current.values.length !== retainedOriginal.length
        )
          throw new Error(
            "Dry retention requires a complete available exact native elevation snapshot."
          );
        const nativeElevation = Array.from(current.values);
        if (!nativeElevation.every(Number.isFinite))
          throw new Error("Dry retention requires finite native elevations at every cell.");
        const water = Array.from({ length: retainedOriginal.length }, (_, cell) => {
          const value = adapter.isWater(cell % options.width, Math.floor(cell / options.width));
          if (typeof value !== "boolean")
            throw new Error(
              `Dry retention requires a native boolean water observation at cell ${cell}.`
            );
          return value;
        });
        request = nativeElevation.map((value, cell) =>
          water[cell] ? retainedOriginal[cell]! : value
        );
        for (let row = 0; row < options.height; row++) {
          const startCell = row * options.width,
            endCell = startCell + options.width;
          emit("dry-retention-input-grid", {
            row,
            startCell,
            values: request.slice(startCell, endCell),
            nativeElevation: nativeElevation.slice(startCell, endCell),
            water: water.slice(startCell, endCell),
          });
        }
        emit("dry-retention-input", {
          phase: "post-authentic-recipe",
          source: current.source,
          dimensions: { width: current.width, height: current.height },
          count: request.length,
          rowCount: options.height,
          sha256: digest(request),
          originalInputSha256: digest(retainedOriginal),
          selection:
            "isWater=true: protected original request; isWater=false: exact current native elevation; isLake is not a selector",
        });
      }
      capture("before-original-replay");
      if (replay)
        observe(
          adapter,
          dryRetention ? "setElevation-dry-retention-replay" : "setElevation-original-replay",
          () => setElevation.call(adapter, request)
        );
      capture("after-original-replay");
    } catch (error) {
      emit("original-replay-failed", { phase: "post-authentic-recipe", error: String(error) });
      throw error;
    }
  };
}

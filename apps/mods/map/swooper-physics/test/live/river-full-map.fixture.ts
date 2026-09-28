import { encodeBoundedJsonLogLines } from "@swooper/mapgen-core/lib/log";
import { sha256Hex, stableStringify } from "@swooper/mapgen-core/trace";
import { CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR } from "@civ7/map-policy/setup";
import type { Civ7Adapter } from "../../src/runtime/map-script/adapter.js";

export type FullMapRiverProbeAtlas = "full-map-observe" | "full-map-wet-outlets";
export const FULL_MAP_RIVER_PROBE = {
  diagnosticRevision: 7, displayLabel: "Full Map Wet Outlet A/B V7",
  width: 106, height: 66, mapSize: "MAPSIZE_HUGE", mapSeed: 1018, gameSeed: 1018,
  playerCount: 10, dryWriteCount: 656, finalizationPasses: 1, sourceConfigId: "swooper-earthlike",
} as const;
export const FULL_MAP_WET_OUTLETS = [
  { modelBodyId: 56, modelBodyTileCount: 1, x: 86, y: 32, receiver: { x: 85, y: 33 } },
  { modelBodyId: 59, modelBodyTileCount: 1, x: 87, y: 28, receiver: { x: 86, y: 29 } },
] as const;
const directions = ["EAST", "NORTHEAST", "NORTHWEST", "WEST", "SOUTHWEST", "SOUTHEAST"] as const;
const focus = [...FULL_MAP_WET_OUTLETS.flatMap(({ x, y, receiver }) => [{ x, y }, receiver]), { x: 87, y: 31 },
  // Body 42 is observation-only in both variants; it is not an added wet write.
  { x: 85, y: 9 }, { x: 84, y: 9 }, { x: 85, y: 10 }, { x: 86, y: 10 }];
const tuple = [false, 25, 2, 2] as const;
const marker = "[river-full-map]";
const installed = new WeakSet<object>();
type Adapter = Pick<Civ7Adapter, "setElevation" | "setRiverInfo" | "finalizeRivers" | "storeWaterData"
  | "getMapSizeId" | "lookupMapInfo" | "getAliveMajorIds">;
type Intent = Parameters<Adapter["setRiverInfo"]>[0];
type NativeObject = Record<string, unknown>;
export type FullMapProbeBindings = {
  GameplayMap: NativeObject; MapRivers: NativeObject; DirectionTypes: NativeObject; RiverTypes: NativeObject;
  Configuration: NativeObject;
  log: (line: string) => void;
};
export type FullMapProbeIdentity = Readonly<{ configHash: string; envelopeHash: string; fixtureSourceSha256: string }>;
const digest = (value: unknown) => sha256Hex(stableStringify(value));
const unavailable = (member: string, reason: string) => ({ status: "unavailable", member, reason });

function read(owner: NativeObject, member: string, args: readonly unknown[] = []): unknown {
  try {
    const getter = owner[member];
    return typeof getter === "function" ? getter.apply(owner, args) : unavailable(member, "missing-callable");
  } catch (error) { return unavailable(member, `threw: ${String(error).slice(0, 180)}`); }
}
function observed(owner: NativeObject, member: string, args: readonly unknown[], kind: "number" | "boolean" = "number") {
  const value = read(owner, member, args);
  return typeof value === kind && (typeof value !== "number" || Number.isFinite(value))
    ? value : typeof value === "object" && value !== null && "status" in value
      ? value : unavailable(member, `unexpected-${typeof value}`);
}
function nativeBindings(): FullMapProbeBindings {
  const host = globalThis as unknown as Omit<FullMapProbeBindings, "log">;
  return { GameplayMap: host.GameplayMap ?? {}, MapRivers: host.MapRivers ?? {},
    DirectionTypes: host.DirectionTypes ?? {}, RiverTypes: host.RiverTypes ?? {},
    Configuration: host.Configuration ?? {}, log: (line) => console.log(line) };
}

/** Test-only app adapter instrumentation; never replaces a native host function or recipe step. */
export function installFullMapRiverProbe(
  prototype: Adapter, proofId: string, variant: FullMapRiverProbeAtlas,
  identity: FullMapProbeIdentity, bindings = nativeBindings()
): void {
  if (installed.has(prototype)) throw new Error("Full-map river probe already installed.");
  if (!/^[a-zA-Z0-9-]{1,100}$/.test(proofId)) throw new Error("Invalid full-map proof ID.");
  if (variant !== "full-map-observe" && variant !== "full-map-wet-outlets") throw new Error("Unknown full-map variant.");
  if (![identity.configHash, identity.envelopeHash, identity.fixtureSourceSha256].every((hash) => /^[0-9a-f]{64}$/.test(hash)))
    throw new Error("Missing full-map source identity digests.");
  const original = { setElevation: prototype.setElevation, setRiverInfo: prototype.setRiverInfo,
    finalizeRivers: prototype.finalizeRivers, storeWaterData: prototype.storeWaterData };
  if (Object.values(original).some((method) => typeof method !== "function")) throw new Error("Missing app adapter method.");
  installed.add(prototype);
  const { GameplayMap: map, MapRivers: rivers, DirectionTypes: nativeDirections, RiverTypes: classes } = bindings;
  const dryWrites: Intent[] = [];
  const elevations: { length: number; sha256: string }[] = [];
  let owner: Adapter | undefined;
  let attempted = false;
  let finalized = false;
  let extraWrites = 0;
  let cachePass = 0;
  const emit = (stage: string, payload: unknown) => {
    for (const line of encodeBoundedJsonLogLines({ marker, payload: { proofId, variant, stage, payload } })) bindings.log(line);
  };
  const require = (condition: unknown, message: string) => { if (!condition) throw new Error(`Full-map probe refused: ${message}`); };
  const admit = (adapter: Adapter, recheck = false) => {
    require(!owner || owner === adapter, "multiple adapter instances");
    if (owner && !recheck) return;
    const observedIdentity = {
      width: read(map, "getGridWidth"), height: read(map, "getGridHeight"), seed: read(map, "getRandomSeed"),
      gameSeed: read(bindings.Configuration, "getGameValue", [CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR.authoredValueRead.key]),
      mapSize: adapter.lookupMapInfo(adapter.getMapSizeId())?.MapSizeType,
      players: adapter.getAliveMajorIds(),
    };
    require(observedIdentity.width === 106 && observedIdentity.height === 66 && observedIdentity.seed === 1018
      && observedIdentity.gameSeed === 1018 && observedIdentity.mapSize === "MAPSIZE_HUGE" && observedIdentity.players.length === 10
      && new Set(observedIdentity.players).size === 10, "expected original Huge 106x66, both seeds 1018, ten players");
    if (!owner) emit("identity", { ...observedIdentity, ...identity, sourceConfigId: FULL_MAP_RIVER_PROBE.sourceConfigId,
      qualification: "config identity comes from the canonical builder; proof.json script SHA must be verified separately" });
    owner = adapter;
  };
  const networks = () => {
    const qualification = "experimental ordinal-to-ID-to-plots observation; no shipped argument contract; membership is not directed-edge parity";
    let count = observed(rivers, "getNumRivers", []);
    if (typeof count !== "number") count = typeof rivers.numRivers === "number"
      ? rivers.numRivers : observed(rivers, "numRivers", []);
    const maxNetworks = 512;
    const maxPlots = 106 * 66;
    if (!finalized || typeof count !== "number" || !Number.isSafeInteger(count) || count < 0)
      return { qualification, count, enumeration: finalized ? "unavailable-count" : "skipped-before-finalization", maxNetworks, maxPlots };
    const entries = Array.from({ length: Math.min(count, maxNetworks) }, (_, ordinal) => {
      const riverId = observed(rivers, "getRiverIDByIndex", [ordinal]);
      if (typeof riverId !== "number" || !Number.isSafeInteger(riverId) || riverId < 0) return { ordinal, riverId, plots: unavailable("getRiverPlots", "invalid-river-ID") };
      const plots = read(rivers, "getRiverPlots", [riverId]);
      if (!Array.isArray(plots)) return { ordinal, riverId, plots: unavailable("getRiverPlots", "not-an-array") };
      const valid = plots.length <= maxPlots && plots.every((index) => Number.isInteger(index) && index >= 0 && index < maxPlots);
      return { ordinal, riverId, plotCount: plots.length, plots: valid ? {
        sha256: digest(plots), focusMembership: focus.map(({ x, y }) => ({ x, y, member: plots.includes(x + y * 106) })),
      } : unavailable("getRiverPlots", "invalid-or-over-limit-plot-indices") };
    });
    return { qualification, count, maxNetworks, maxPlots, truncated: count > maxNetworks, entries };
  };
  const snapshot = (stage: string, detail = false) => {
    const points = focus.map(({ x, y }) => {
      const riverClass = observed(map, "getRiverType", [x, y]);
      const plotIndex = observed(map, "getIndexFromXY", [x, y]);
      const canReadOcean = finalized && typeof classes.RIVER_NAVIGABLE === "number"
        && riverClass === classes.RIVER_NAVIGABLE && typeof plotIndex === "number"
        && Number.isInteger(plotIndex) && plotIndex >= 0 && plotIndex < 106 * 66;
      return { x, y, plotIndex, riverClass,
        elevation: observed(map, "getElevation", [x, y]), terrain: observed(map, "getTerrainType", [x, y]),
        feature: observed(map, "getFeatureType", [x, y]), water: observed(map, "isWater", [x, y], "boolean"),
        lake: observed(map, "isLake", [x, y], "boolean"),
        connectedToOcean: canReadOcean ? observed(rivers, "isRiverConnectedToOcean", [plotIndex], "boolean")
          : unavailable("isRiverConnectedToOcean", finalized ? "skipped-not-observed-navigable" : "skipped-before-finalization"),
        cliffs: directions.map((direction) => ({ direction, value: typeof nativeDirections[`DIRECTION_${direction}`] === "number"
          ? observed(map, "isCliffCrossing", [x, y, nativeDirections[`DIRECTION_${direction}`]], "boolean")
          : unavailable("isCliffCrossing", "missing-direction-enum") })),
      };
    });
    emit(stage, { finalized, extraWrites, points,
      networks: detail || !finalized ? networks() : { enumeration: "skipped-checkpoint; see after-finalize or first post-cache" },
      drySourceClasses: detail ? dryWrites.map(({ x, y, riverClass }) => ({ x, y, intendedClass: riverClass,
        observedClass: observed(map, "getRiverType", [x, y]) })) : undefined,
      qualification: "native readbacks; model body IDs are explanatory only; no confirmed directed river-edge getter" });
  };
  prototype.setElevation = function (values) {
    admit(this);
    require(!attempted, "elevation input after finalization attempt");
    require(values.length === 106 * 66 && Array.from(values).every(Number.isFinite), "invalid full elevation input");
    elevations.push({ length: values.length, sha256: digest(Array.from(values)) });
    return original.setElevation.call(this, values);
  };
  prototype.setRiverInfo = function (intent) {
    admit(this);
    require(!attempted && dryWrites.length < 656, "unexpected river write count/order");
    require(read(map, "isWater", [intent.x, intent.y]) === false, "original source is not observed dry");
    require(!dryWrites.some(({ x, y }) => x === intent.x && y === intent.y), "duplicate original source");
    dryWrites.push({ ...intent });
    return original.setRiverInfo.call(this, intent);
  };
  prototype.finalizeRivers = function (args) {
    require(!attempted, "second finalization attempt");
    attempted = true;
    try {
      admit(this, true);
      emit("inputs", { dryWriteCount: dryWrites.length, dryWritesSha256: digest(dryWrites), dryWrites,
        elevationInputs: elevations, finalizationTuple: args, wetOutlets: FULL_MAP_WET_OUTLETS,
        hashEncoding: "SHA-256 of portable stableStringify; complete input arrays, no sampling",
        intervention: variant === "full-map-wet-outlets" ? "two NAVIGABLE NORTHWEST writes only" : "none" });
      snapshot("before-extra-writes");
      require(args.length === tuple.length && args.every((value, index) => value === tuple[index]), "expected authored tuple false,25,2,2");
      require(dryWrites.length === 656 && elevations.length === 1, "expected 656 dry writes and one elevation input");
      require(Number.isSafeInteger(classes.RIVER_NAVIGABLE), "missing NAVIGABLE enum");
      const northwest = nativeDirections.DIRECTION_NORTHWEST;
      require(typeof northwest === "number" && Number.isSafeInteger(northwest), "missing NORTHWEST enum");
      // Validate both pairs before either intervention; failure never becomes a partial admission.
      for (const { x, y, receiver } of FULL_MAP_WET_OUTLETS) {
        require(read(map, "isWater", [x, y]) === true && read(map, "isLake", [x, y]) === true, `expected wet lake ${x},${y}`);
        require(read(map, "isWater", [receiver.x, receiver.y]) === false
          && read(map, "getRiverType", [receiver.x, receiver.y]) === classes.RIVER_NAVIGABLE, `expected dry NAV receiver ${receiver.x},${receiver.y}`);
        const adjacent = read(map, "getAdjacentPlotLocation", [{ x, y }, northwest]);
        require(typeof adjacent === "object" && adjacent !== null && "x" in adjacent && "y" in adjacent
          && adjacent.x === receiver.x && adjacent.y === receiver.y, "native NORTHWEST receiver mismatch");
      }
      if (variant === "full-map-wet-outlets") for (const { x, y } of FULL_MAP_WET_OUTLETS) {
        original.setRiverInfo.call(this, { x, y, direction: "NORTHWEST", riverClass: "NAVIGABLE" });
        extraWrites++;
      }
      snapshot("before-finalize");
      original.finalizeRivers.call(this, args);
      finalized = true;
      snapshot("after-finalize", true);
    } catch (error) {
      emit("failed", { error: String(error), finalized, extraWrites });
      throw error;
    }
  };
  prototype.storeWaterData = function () {
    if (!finalized) return original.storeWaterData.call(this);
    require(this === owner, "cache update on another adapter");
    const pass = ++cachePass;
    snapshot(`before-water-cache-${pass}`);
    try { return original.storeWaterData.call(this); }
    finally { snapshot(`after-water-cache-${pass}`, pass === 1); }
  };
  emit("installed", { ...FULL_MAP_RIVER_PROBE, ...identity,
    observationalBody42: { modelBodyTileCount: 5, points: focus.slice(5), intervention: "none" },
    qualification: "instrumentation installed, not native run completion; production lake assertions remain unchanged; final bundle SHA is external proof.json" });
}

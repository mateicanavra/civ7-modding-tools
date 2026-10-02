import {
  CIV7_MAP_INFO_KEYS,
  type Civ7StandardMapSizeId,
  getCiv7StandardMapSizePreset,
} from "@civ7/map-policy";
import type { MapContext } from "@swooper/mapgen-core";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import { encodeBoundedJsonLogLines } from "@swooper/mapgen-core/lib/log";
import { sha256Hex, stableStringify } from "@swooper/mapgen-core/trace";
import standardRecipe, {
  projectStandardInitialSetup,
  STANDARD_STAGES,
} from "@swooper/swooper-physics/standard";
import { Type } from "typebox";
import { Check } from "typebox/value";
import type { Civ7Adapter } from "../../src/runtime/map-script/adapter.js";
import {
  RIVER_AUTHORED_FINALIZATION_VARIANTS,
  RIVER_AUTHORED_WRITE_ORDER_VARIANT,
  RIVER_PROBE_VARIANTS,
} from "./river-contract-map.fixture.js";
import type { FullMapProbeIdentity } from "./river-full-map.fixture.js";

export const WATER_HEIGHT_MAINTENANCE_ATLAS = "full-map-maintenance";
export const WATER_HEIGHT_LAKE_CUTOFF_ATLAS = "full-map-lake-cutoff";
export const WATER_HEIGHT_MAX_LAKE_CUTOFF_ATLAS = "full-map-max-lake-cutoff";
export const WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_ATLAS = "full-map-bounded-lake-cutoff";
export const WATER_HEIGHT_CLIFF_OBSERVATION_REVISION = 23;
export const DIRECTIONAL_CLIFF_MAX_SHORE_EDGES = 206;
export const DIRECTIONAL_CLIFF_WAYPOINTS = [
  "after-first-setElevation",
  "before-generateCliffsFromElevation",
  "after-generateCliffsFromElevation",
  "after-second-setElevation",
  "post-authentic-recipe",
] as const;
const cliffLocationSchema = Type.Object(
  { x: Type.Integer({ minimum: 0 }), y: Type.Integer({ minimum: 0 }) },
  { additionalProperties: false }
);
const directionalCliffStudySchema = Type.Object(
  {
    studyId: Type.String({ pattern: "^[a-zA-Z0-9-]{1,100}$" }),
    physicalPayloadSha256: Type.String({ pattern: "^[0-9a-f]{64}$" }),
    dimensions: Type.Object(
      {
        width: Type.Integer({ minimum: 1, maximum: 10000 }),
        height: Type.Integer({ minimum: 1, maximum: 10000 }),
      },
      { additionalProperties: false }
    ),
    shoreEdges: Type.Array(
      Type.Object(
        {
          from: cliffLocationSchema,
          to: cliffLocationSchema,
          role: Type.Union([Type.Literal("finite-shore"), Type.Literal("external-shore")]),
        },
        { additionalProperties: false }
      ),
      { minItems: 1, maxItems: DIRECTIONAL_CLIFF_MAX_SHORE_EDGES }
    ),
    dryControls: Type.Array(
      Type.Object(
        {
          from: cliffLocationSchema,
          to: cliffLocationSchema,
          role: Type.Union([Type.Literal("dry-steep"), Type.Literal("dry-flat")]),
        },
        { additionalProperties: false }
      ),
      { minItems: 2, maxItems: 2 }
    ),
  },
  { additionalProperties: false }
);
type CliffLocation = Readonly<{ x: number; y: number }>;
type CliffEdge<Role extends string> = Readonly<{
  from: CliffLocation;
  to: CliffLocation;
  role: Role;
}>;
export type DirectionalCliffStudy = Readonly<{
  studyId: string;
  physicalPayloadSha256: string;
  dimensions: Readonly<{ width: number; height: number }>;
  shoreEdges: readonly CliffEdge<"finite-shore" | "external-shore">[];
  dryControls: readonly CliffEdge<"dry-steep" | "dry-flat">[];
}>;
/** Private diagnostic bindings, not generated native API declarations or a public control facade. */
export type DirectionalCliffBindings = Readonly<{
  GameplayMap: Record<string, unknown>;
  DirectionTypes: Record<string, unknown>;
}>;

/** Parses supplied study data before installing observers; geometry and native flags are not inferred. */
export function readDirectionalCliffStudy(
  value: unknown,
  dimensions: Readonly<{ width: number; height: number }>
): DirectionalCliffStudy {
  if (!Check(directionalCliffStudySchema, value))
    throw new Error("Invalid directional cliff study manifest.");
  if (value.dimensions.width !== dimensions.width || value.dimensions.height !== dimensions.height)
    throw new Error("Directional cliff study dimensions must match the selected diagnostic.");
  const pairs = new Set<string>();
  for (const edge of [...value.shoreEdges, ...value.dryControls]) {
    for (const point of [edge.from, edge.to])
      if (point.x >= dimensions.width || point.y >= dimensions.height)
        throw new Error("Directional cliff study endpoint is outside the selected grid.");
    const from = edge.from.x + edge.from.y * dimensions.width;
    const to = edge.to.x + edge.to.y * dimensions.width;
    const pair = `${Math.min(from, to)}:${Math.max(from, to)}`;
    if (from === to || pairs.has(pair))
      throw new Error("Directional cliff study contains a self-edge or duplicate undirected edge.");
    pairs.add(pair);
  }
  if (new Set(value.dryControls.map((edge) => edge.role)).size !== 2)
    throw new Error("Directional cliff study requires one dry-steep and one dry-flat control.");
  const protect = <Role extends string>(edge: CliffEdge<Role>): CliffEdge<Role> =>
    Object.freeze({
      ...edge,
      from: Object.freeze({ ...edge.from }),
      to: Object.freeze({ ...edge.to }),
    });
  return Object.freeze({
    studyId: value.studyId,
    physicalPayloadSha256: value.physicalPayloadSha256,
    dimensions: Object.freeze({ ...value.dimensions }),
    shoreEdges: Object.freeze(value.shoreEdges.map(protect)),
    dryControls: Object.freeze(value.dryControls.map(protect)),
  });
}
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
  diagnosticRevision: 22,
  displayLabel: "Water Bounded Lake Cutoff V22",
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
  directionalCliffs?: DirectionalCliffStudy;
  finalizationIntervention?: Readonly<{
    variant: keyof typeof RIVER_AUTHORED_FINALIZATION_VARIANTS;
    requestedTuple: readonly [boolean, number, number, number];
    appliedTuple: readonly [boolean, number, number, number];
    qualification: string;
  }>;
  riverWriteOrderIntervention?: Readonly<{
    variant: typeof RIVER_AUTHORED_WRITE_ORDER_VARIANT;
    qualification: string;
  }>;
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
const cliffDirections = [
  "EAST",
  "NORTHEAST",
  "NORTHWEST",
  "WEST",
  "SOUTHWEST",
  "SOUTHEAST",
] as const;
export const APP_UI_NAV_CLIFF_MAX_SOURCE_CELLS = 400;
const appUiNavCliffSchema = Type.Object(
  {
    proofId: Type.String({ pattern: "^[a-zA-Z0-9-]{1,100}$" }),
    expected: Type.Object(
      {
        width: Type.Integer({ minimum: 1, maximum: 10000 }),
        height: Type.Integer({ minimum: 1, maximum: 10000 }),
        mapSeed: Type.Integer({ minimum: -0x8000_0000, maximum: 0x7fff_ffff }),
      },
      { additionalProperties: false }
    ),
    navSources: Type.Array(cliffLocationSchema, {
      minItems: 1,
      maxItems: APP_UI_NAV_CLIFF_MAX_SOURCE_CELLS,
    }),
  },
  { additionalProperties: false }
);

/** Test-only app-owned read diagnostic for public game exec; no hooks, writes or movement claim. */
export function buildAppUiNavWaterCliffDiagnosticScript(value: unknown): string {
  if (!Check(appUiNavCliffSchema, value))
    throw new Error("Invalid bounded AppUI NAV cliff diagnostic input.");
  const { width, height, mapSeed } = value.expected;
  const cells = new Set<number>();
  if (![width, height, mapSeed].every(Number.isSafeInteger))
    throw new Error("AppUI NAV cliff diagnostic identity requires finite integers.");
  for (const { x, y } of value.navSources) {
    if (!Number.isSafeInteger(x) || !Number.isSafeInteger(y) || x >= width || y >= height)
      throw new Error("AppUI NAV source is outside the expected grid.");
    const cell = x + y * width;
    if (cells.has(cell)) throw new Error("Duplicate AppUI NAV source coordinate.");
    cells.add(cell);
  }
  if (cells.size > width * height)
    throw new Error("AppUI NAV source count exceeds the expected cell budget.");
  return `JSON.stringify((() => {
    const input = ${JSON.stringify(value)};
    const symbols = ${JSON.stringify(cliffDirections.map((symbol) => `DIRECTION_${symbol}`))};
    const host = globalThis;
    const result = {
      diagnostic: "app-ui-nav-water-cliffs-v1", proofId: input.proofId,
      purpose: "Bounded test-only observation of directed NAV to ordinary-water edges on an already running normal map.",
      qualification: "Native cliff booleans, classification and height are independent observations; no cliff threshold, movement, navigation success or product policy is inferred.",
      expected: input.expected, sourceCellBudget: ${APP_UI_NAV_CLIFF_MAX_SOURCE_CELLS},
      requestedSourceCount: input.navSources.length, identity: { realm: "AppUI" },
      nativeDirections: [], nativeRiverClass: null, sources: [], records: [], status: "refused"
    };
    const refuse = (source, reason) => { throw { source, reason }; };
    const fact = (source, read, kind, integer = false) => {
      let value;
      try { value = read(); } catch (error) {
        return { source, status: "unavailable", reason: "threw: " + String(error).slice(0, 180) };
      }
      return typeof value === kind && (kind !== "number" ||
        (Number.isFinite(value) && (!integer || Number.isSafeInteger(value))))
        ? { source, status: "available", value }
        : { source, status: "unavailable", reason: "unexpected-" + (value === null ? "null" : typeof value) };
    };
    const requireFact = (observed) => {
      if (observed.status !== "available") refuse(observed.source, observed.reason);
      return observed.value;
    };
    const call = (owner, member, args = []) => {
      if (!owner || typeof owner[member] !== "function") throw new Error("missing-callable");
      return owner[member].apply(owner, args);
    };
    const mapFact = (member, args = [], kind = "number", integer = false) =>
      fact("GameplayMap." + member, () => call(host.GameplayMap, member, args), kind, integer);
    const pointFacts = (point) => {
      const args = [point.x, point.y];
      const observed = {
        ...point, elevation: mapFact("getElevation", args),
        terrain: mapFact("getTerrainType", args, "number", true),
        riverType: mapFact("getRiverType", args, "number", true),
        water: mapFact("isWater", args, "boolean"), lake: mapFact("isLake", args, "boolean")
      };
      for (const key of ["elevation", "terrain", "riverType", "water", "lake"])
        requireFact(observed[key]);
      return observed;
    };
    try {
      Object.assign(result.identity, {
        inGame: fact("UI.isInGame", () => call(host.UI, "isInGame"), "boolean"),
        inShell: fact("UI.isInShell", () => call(host.UI, "isInShell"), "boolean"),
        inLoading: fact("UI.isInLoading", () => call(host.UI, "isInLoading"), "boolean"),
        turn: fact("Game.turn", () => host.Game.turn, "number", true),
        mapSeed: fact("Configuration.getMap().mapSeed", () => call(host.Configuration, "getMap").mapSeed, "number", true),
        nativeMapSeed: mapFact("getRandomSeed", [], "number", true),
        width: mapFact("getGridWidth", [], "number", true),
        height: mapFact("getGridHeight", [], "number", true)
      });
      const identity = result.identity;
      for (const key of ["inGame", "inShell", "inLoading", "turn", "mapSeed", "nativeMapSeed", "width", "height"])
        requireFact(identity[key]);
      if (!identity.inGame.value || identity.inShell.value || identity.inLoading.value || identity.turn.value < 0)
        refuse("AppUI", "not-a-running-game");
      if (identity.width.value !== input.expected.width || identity.height.value !== input.expected.height ||
          identity.mapSeed.value !== input.expected.mapSeed || identity.nativeMapSeed.value !== input.expected.mapSeed)
        refuse("AppUI", "expected-grid-or-map-seed-mismatch");
      result.nativeDirections = symbols.map((symbol) => ({
        symbol, ...fact("DirectionTypes." + symbol, () => host.DirectionTypes[symbol], "number", true)
      }));
      const directions = result.nativeDirections.map(requireFact);
      if (directions.some((direction) => direction < 0) || new Set(directions).size !== 6)
        refuse("DirectionTypes", "six-unique-nonnegative-native-directions-required");
      result.nativeRiverClass = fact("RiverTypes.RIVER_NAVIGABLE", () => host.RiverTypes.RIVER_NAVIGABLE, "number", true);
      const nav = requireFact(result.nativeRiverClass);
      if (nav < 0) refuse("RiverTypes.RIVER_NAVIGABLE", "invalid-native-class");
      result.sources = input.navSources.map(pointFacts);
      for (const from of result.sources)
        if (from.riverType.value !== nav) refuse("GameplayMap.getRiverType", "supplied-source-is-not-NAV");
      const records = [];
      for (const from of result.sources) for (const direction of result.nativeDirections) {
        let raw;
        try { raw = call(host.GameplayMap, "getAdjacentPlotLocation", [{ x: from.x, y: from.y }, direction.value]); }
        catch (error) { refuse("GameplayMap.getAdjacentPlotLocation", "threw: " + String(error).slice(0, 180)); }
        if (!raw || !Number.isSafeInteger(raw.x) || !Number.isSafeInteger(raw.y))
          refuse("GameplayMap.getAdjacentPlotLocation", "invalid-native-coordinate");
        const nativeAdjacent = { source: "GameplayMap.getAdjacentPlotLocation", raw: { x: raw.x, y: raw.y } };
        if (raw.y < 0 || raw.y >= input.expected.height) {
          records.push({ from, nativeDirection: direction, nativeAdjacent: { ...nativeAdjacent, status: "boundary", reason: "y-outside-grid" }, cliff: { source: "GameplayMap.isCliffCrossing", status: "not-read", reason: "y-outside-grid" } });
          continue;
        }
        const to = pointFacts({ x: ((raw.x % input.expected.width) + input.expected.width) % input.expected.width, y: raw.y });
        const cliff = mapFact("isCliffCrossing", [from.x, from.y, direction.value], "boolean");
        requireFact(cliff);
        records.push({ from, to, nativeDirection: direction,
          nativeAdjacent: { ...nativeAdjacent, status: "available", location: { x: to.x, y: to.y } },
          ordinaryWaterReceiver: to.water.value && to.riverType.value !== nav, cliff });
      }
      result.records = records;
      result.directedRecordCount = records.length;
      result.navToOrdinaryWaterCount = records.filter((record) => record.ordinaryWaterReceiver === true).length;
      result.status = "observed";
    } catch (error) {
      result.refusal = error && typeof error.source === "string" ? error : { source: "diagnostic", reason: String(error).slice(0, 180) };
    }
    return result;
  })())`;
}
type CliffUnavailable = Readonly<{ status: "unavailable"; member: string; reason: string }>;
type AuthenticCall = Readonly<{ call: number; method: string; occurrence: number }>;
const cliffUnavailable = (member: string, reason: string): CliffUnavailable => ({
  status: "unavailable",
  member,
  reason,
});
function nativeCliffBindings(): DirectionalCliffBindings {
  const host = globalThis as unknown as Partial<DirectionalCliffBindings>;
  return { GameplayMap: host.GameplayMap ?? {}, DirectionTypes: host.DirectionTypes ?? {} };
}

function downstreamRiverDelivery(
  writes: readonly { intent: Parameters<Adapter["setRiverInfo"]>[0] }[],
  dimensions: Readonly<{ width: number; height: number }>,
  bindings: DirectionalCliffBindings
) {
  const { width, height } = dimensions;
  const adjacent = bindings.GameplayMap.getAdjacentPlotLocation;
  if (typeof adjacent !== "function")
    throw new Error("Downstream delivery requires native getAdjacentPlotLocation.");
  if (writes.length === 0 || writes.length > width * height)
    throw new Error("Downstream delivery requires a nonempty bounded declaration population.");
  const nativeDirections = new Map<string, number>();
  for (const symbol of cliffDirections) {
    const value = bindings.DirectionTypes[`DIRECTION_${symbol}`];
    if (
      typeof value !== "number" ||
      !Number.isSafeInteger(value) ||
      value < 0 ||
      [...nativeDirections.values()].includes(value)
    )
      throw new Error("Downstream delivery requires unique native geographic directions.");
    nativeDirections.set(symbol, value);
  }
  const sourceOrdinals = new Map<number, number>();
  const receiverCells = writes.map(({ intent }, ordinal) => {
    const { x, y, direction, riverClass } = intent;
    if (
      !Number.isSafeInteger(x) ||
      !Number.isSafeInteger(y) ||
      x < 0 ||
      x >= width ||
      y < 0 ||
      y >= height ||
      !nativeDirections.has(direction) ||
      (riverClass !== "MINOR" && riverClass !== "NAVIGABLE")
    )
      throw new Error("Downstream delivery requires valid authored declarations.");
    const sourceCell = x + y * width;
    if (sourceOrdinals.has(sourceCell))
      throw new Error("Downstream delivery refuses duplicate source declarations.");
    sourceOrdinals.set(sourceCell, ordinal);
    const receiver: unknown = adjacent.call(
      bindings.GameplayMap,
      { x, y },
      nativeDirections.get(direction)
    );
    if (
      typeof receiver !== "object" ||
      receiver === null ||
      !("x" in receiver) ||
      !("y" in receiver) ||
      typeof receiver.x !== "number" ||
      !Number.isSafeInteger(receiver.x) ||
      typeof receiver.y !== "number" ||
      !Number.isSafeInteger(receiver.y) ||
      receiver.y < 0 ||
      receiver.y >= height ||
      (receiver.x < 0 && !(receiver.x === -1 && x === 0)) ||
      (receiver.x >= width && !(receiver.x === width && x === width - 1))
    )
      throw new Error("Downstream delivery requires a valid native adjacent receiver.");
    // The selected Civ7 cylindrical map admits one native X-boundary step, never Y wrapping.
    const receiverX = (receiver.x + width) % width;
    const receiverCell = receiverX + receiver.y * width;
    if (!getHexNeighborIndicesOddQ(x, y, width, height).includes(receiverCell))
      throw new Error("Downstream delivery requires a valid native adjacent receiver.");
    return receiverCell;
  });
  const remaining = receiverCells.map((cell) => Number(sourceOrdinals.has(cell)));
  const upstream = writes.map(() => [] as number[]);
  receiverCells.forEach((cell, ordinal) => {
    const receiverOrdinal = sourceOrdinals.get(cell);
    if (receiverOrdinal !== undefined) upstream[receiverOrdinal]!.push(ordinal);
  });
  const ready = remaining.flatMap((count, ordinal) => (count === 0 ? [ordinal] : []));
  const appliedOrdinals: number[] = [];
  while (ready.length) {
    ready.sort((a, b) => a - b);
    const ordinal = ready.shift()!;
    appliedOrdinals.push(ordinal);
    for (const source of upstream[ordinal]!) {
      remaining[source] = remaining[source]! - 1;
      if (remaining[source] === 0) ready.push(source);
    }
  }
  if (appliedOrdinals.length !== writes.length)
    throw new Error("Downstream delivery refuses a cyclic declaration graph.");
  return { appliedOrdinals, receiverCells };
}

function directionalCliffObserver(
  study: DirectionalCliffStudy,
  bindings: DirectionalCliffBindings,
  emit: (stage: string, payload: unknown) => void
) {
  const { GameplayMap: map, DirectionTypes: enums } = bindings;
  const manifestSha256 = digest(study);
  const resolved = new Map<string, (typeof cliffDirections)[number]>();
  const invoke = (
    member: string,
    args: readonly unknown[]
  ): { ok: true; value: unknown } | { ok: false; error: CliffUnavailable } => {
    try {
      const getter = map[member];
      return typeof getter === "function"
        ? { ok: true, value: getter.apply(map, args) }
        : { ok: false, error: cliffUnavailable(member, "missing-callable") };
    } catch (error) {
      return {
        ok: false,
        error: cliffUnavailable(member, `threw: ${String(error).slice(0, 180)}`),
      };
    }
  };
  const fact = (member: string, args: readonly unknown[], kind: "number" | "boolean") => {
    const result = invoke(member, args);
    if (!result.ok) return result.error;
    const { value } = result;
    if (typeof value === kind && (typeof value !== "number" || Number.isFinite(value)))
      return value;
    return cliffUnavailable(member, `unexpected-${typeof value}`);
  };
  const pointFacts = (point: CliffLocation) => ({
    ...point,
    elevation: fact("getElevation", [point.x, point.y], "number"),
    terrain: fact("getTerrainType", [point.x, point.y], "number"),
    riverType: fact("getRiverType", [point.x, point.y], "number"),
    water: fact("isWater", [point.x, point.y], "boolean"),
    lake: fact("isLake", [point.x, point.y], "boolean"),
  });
  const adjacent = (from: CliffLocation, direction: number): CliffLocation | CliffUnavailable => {
    const result = invoke("getAdjacentPlotLocation", [from, direction]);
    if (!result.ok) return result.error;
    const { value } = result;
    if (
      typeof value === "object" &&
      value !== null &&
      "x" in value &&
      "y" in value &&
      typeof value.x === "number" &&
      Number.isSafeInteger(value.x) &&
      typeof value.y === "number" &&
      Number.isSafeInteger(value.y)
    ) {
      if (
        value.x < 0 ||
        value.x >= study.dimensions.width ||
        value.y < 0 ||
        value.y >= study.dimensions.height
      )
        return cliffUnavailable("getAdjacentPlotLocation", "outside-selected-grid");
      return { x: value.x, y: value.y };
    }
    return cliffUnavailable("getAdjacentPlotLocation", "unexpected-location");
  };
  return (waypoint: string, authenticCall: AuthenticCall) => {
    const nativeDirections = cliffDirections.map((symbol) => {
      const member = `DIRECTION_${symbol}`;
      let value: unknown;
      try {
        value = enums[member];
      } catch (error) {
        return {
          symbol,
          value: cliffUnavailable(
            `DirectionTypes.${member}`,
            `threw: ${String(error).slice(0, 180)}`
          ),
        };
      }
      return {
        symbol,
        value:
          typeof value === "number" && Number.isSafeInteger(value) && value >= 0
            ? value
            : cliffUnavailable(`DirectionTypes.${member}`, "missing-or-invalid-enum"),
      };
    });
    const enumValues = nativeDirections.map(({ value }) => value);
    const validEnums =
      enumValues.every((value) => typeof value === "number") &&
      new Set(enumValues).size === cliffDirections.length;
    const records = [...study.shoreEdges, ...study.dryControls].flatMap((edge, edgeOrdinal) =>
      ([false, true] as const).map((reverse) => {
        const from = reverse ? edge.to : edge.from;
        const to = reverse ? edge.from : edge.to;
        const key = `${from.x},${from.y}:${to.x},${to.y}`;
        let symbol = resolved.get(key);
        const directionResolution: Array<{
          symbol: string;
          adjacent: CliffLocation | CliffUnavailable;
        }> = [];
        if (validEnums && !symbol) {
          const matches = nativeDirections.filter(({ symbol: candidate, value }) => {
            if (typeof value !== "number") return false;
            const receiver = adjacent(from, value);
            directionResolution.push({ symbol: candidate, adjacent: receiver });
            return "x" in receiver && receiver.x === to.x && receiver.y === to.y;
          });
          if (matches.length === 1) {
            symbol = matches[0]!.symbol;
            resolved.set(key, symbol);
          }
        }
        const direction = nativeDirections.find((entry) => entry.symbol === symbol);
        const nativeDirection =
          validEnums && typeof direction?.value === "number"
            ? { symbol: direction.symbol, value: direction.value }
            : cliffUnavailable(
                "DirectionTypes",
                validEnums ? "no-unique-native-adjacency" : "incomplete-or-duplicate-enums"
              );
        const receiver =
          "value" in nativeDirection
            ? adjacent(from, nativeDirection.value)
            : cliffUnavailable("getAdjacentPlotLocation", "direction-unavailable");
        const receiverMatches = "x" in receiver && receiver.x === to.x && receiver.y === to.y;
        return {
          edgeOrdinal,
          reverse,
          role: edge.role,
          from: pointFacts(from),
          to: pointFacts(to),
          nativeDirection,
          nativeAdjacent: receiver,
          ...(directionResolution.length > 0 ? { directionResolution } : {}),
          cliff:
            receiverMatches && "value" in nativeDirection
              ? fact("isCliffCrossing", [from.x, from.y, nativeDirection.value], "boolean")
              : cliffUnavailable("isCliffCrossing", "native-adjacency-not-confirmed"),
        };
      })
    );
    emit("directional-cliffs", {
      waypoint,
      authenticCall,
      studyId: study.studyId,
      physicalPayloadSha256: study.physicalPayloadSha256,
      manifestSha256,
      dimensions: study.dimensions,
      shoreEdgeCount: study.shoreEdges.length,
      dryControlEdgeCount: study.dryControls.length,
      directedRecordCount: records.length,
      nativeDirections,
      observedFlagCount: records.filter((record) => typeof record.cliff === "boolean").length,
      records,
      qualification:
        "Read-only native directional flags and endpoint facts. Roles are prescribed study membership, not inferred native class, cliff thresholds, movement or freshwater semantics.",
    });
  };
}
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
const topographyDefinition = (() => {
  for (const stage of STANDARD_STAGES)
    for (const step of stage.steps)
      for (const provided of step.contract.provides)
        if (typeof provided !== "string" && provided.id === "artifact:morphology.topography")
          return provided;
  throw new Error("Standard recipe does not provide physical topography.");
})();
const hydrographyDefinition = (() => {
  for (const stage of STANDARD_STAGES)
    for (const step of stage.steps)
      for (const provided of step.contract.provides)
        if (typeof provided !== "string" && provided.id === "artifact:hydrology.hydrography")
          return provided;
  throw new Error("Standard recipe does not provide resolved physical exposure.");
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
  const currentCensus = options.atlasKind === WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_ATLAS;
  const physicalBoundary = currentCensus
    ? (() => {
        const topography = readArtifact(context, topographyDefinition);
        const hydrography = readArtifact(context, hydrographyDefinition);
        return {
          seaLevel: topography.seaLevel,
          ground: Array.from(topography.elevation),
          externalWaterMask: Array.from(topography.externalWaterMask),
          exposedLandMask: Array.from(hydrography.exposedLandMask),
        };
      })()
    : {};
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
    ...physicalBoundary,
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
        ...(currentCensus ? { closure: pool.closure ?? null } : {}),
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
  log: (line: string) => void = (line) => console.log(line),
  cliffBindings?: DirectionalCliffBindings
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
  const intervention = options.finalizationIntervention;
  const writeOrderIntervention = options.riverWriteOrderIntervention;
  const sameTuple = (actual: unknown, expected: readonly unknown[]) =>
    Array.isArray(actual) &&
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index]);
  if (
    intervention !== undefined &&
    (intervention === null ||
      typeof intervention !== "object" ||
      options.atlasKind !== WATER_HEIGHT_MAINTENANCE_ATLAS ||
      !Object.hasOwn(RIVER_AUTHORED_FINALIZATION_VARIANTS, intervention.variant) ||
      !sameTuple(intervention.requestedTuple, RIVER_PROBE_VARIANTS.authored) ||
      !sameTuple(
        intervention.appliedTuple,
        RIVER_AUTHORED_FINALIZATION_VARIANTS[intervention.variant]
      ) ||
      typeof intervention.qualification !== "string" ||
      !intervention.qualification.trim())
  )
    throw new Error(
      "Invalid authored finalizer ablation; only declared maintenance tuples are admitted."
    );
  if (
    writeOrderIntervention !== undefined &&
    (writeOrderIntervention === null ||
      typeof writeOrderIntervention !== "object" ||
      options.atlasKind !== WATER_HEIGHT_MAINTENANCE_ATLAS ||
      intervention !== undefined ||
      writeOrderIntervention.variant !== RIVER_AUTHORED_WRITE_ORDER_VARIANT ||
      typeof writeOrderIntervention.qualification !== "string" ||
      !writeOrderIntervention.qualification.trim())
  )
    throw new Error(
      "Invalid downstream delivery intervention; only declared maintenance ordering is admitted."
    );
  const appliedTuple =
    intervention === undefined
      ? undefined
      : RIVER_AUTHORED_FINALIZATION_VARIANTS[intervention.variant];
  const cliffStudy =
    options.directionalCliffs === undefined
      ? undefined
      : readDirectionalCliffStudy(options.directionalCliffs, options);
  if (
    cliffStudy &&
    (options.atlasKind !== WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_ATLAS ||
      options.diagnosticRevision !== WATER_HEIGHT_CLIFF_OBSERVATION_REVISION)
  )
    throw new Error(
      "Directional cliff observations require explicitly selected bounded V23 diagnostics."
    );
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
  let lastAuthenticCall: AuthenticCall | undefined;
  const occurrences = new Map<string, number>();
  const writes: Array<{ wet: boolean; intent: Parameters<Adapter["setRiverInfo"]>[0] }> = [];
  let deliveryAttempted = false;
  let deliveryComplete = false;
  const refuseInterleavedMutation = () => {
    if (writeOrderIntervention && writes.length > 0 && !deliveryComplete)
      throw new Error("Downstream delivery refuses an interleaved authentic mutation.");
  };
  const elevations: Array<{ count: number; sha256: string }> = [];
  const dryRetention = options.atlasKind === WATER_HEIGHT_DRY_RETENTION_REPLAY_ATLAS;
  const originalInputArm =
    options.atlasKind === WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_ATLAS ||
    options.atlasKind === WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_ATLAS ||
    dryRetention ||
    options.atlasKind === WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_ATLAS;
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
  const observeCliffs = cliffStudy
    ? directionalCliffObserver(cliffStudy, cliffBindings ?? nativeCliffBindings(), emit)
    : undefined;
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
  const sourceNumber = (
    adapter: Adapter,
    member: "getRiverType" | "getTerrainType",
    x: number,
    y: number
  ) => {
    const unavailable = (reason: string) => ({ status: "unavailable" as const, member, reason });
    if (
      !Number.isSafeInteger(x) ||
      !Number.isSafeInteger(y) ||
      x < 0 ||
      y < 0 ||
      x >= options.width ||
      y >= options.height
    ) {
      return unavailable("source-coordinates-out-of-bounds");
    }
    try {
      const getter = adapter[member];
      if (typeof getter !== "function") return unavailable("missing-callable");
      const value = getter.call(adapter, x, y);
      return Number.isSafeInteger(value) ? value : unavailable("not-a-safe-integer");
    } catch (error) {
      return unavailable(`threw: ${String(error).slice(0, 180)}`);
    }
  };
  // Observe all authentic dry and wet source writes, not just the historical lake focus.
  const riverSourceRows = (adapter: Adapter) =>
    writes.map(({ intent }) => ({
      x: intent.x,
      y: intent.y,
      intendedClass: intent.riverClass,
      observedClass: sourceNumber(adapter, "getRiverType", intent.x, intent.y),
      terrain: sourceNumber(adapter, "getTerrainType", intent.x, intent.y),
    }));
  const observe = <T>(adapter: Adapter, method: string, action: () => T): T => {
    admit(adapter);
    const occurrence = (occurrences.get(method) ?? 0) + 1;
    occurrences.set(method, occurrence);
    const call = ++sequence;
    const authenticCall = { call, method, occurrence };
    emit("before", {
      call,
      method,
      occurrence,
      points: snapshot(adapter),
      riverSourceRows: riverSourceRows(adapter),
    });
    if (method === "generateCliffsFromElevation" && occurrence === 1)
      observeCliffs?.("before-generateCliffsFromElevation", authenticCall);
    try {
      const result = action();
      lastAuthenticCall = authenticCall;
      emit("after", {
        call,
        method,
        occurrence,
        points: snapshot(adapter),
        riverSourceRows: riverSourceRows(adapter),
      });
      if (method === "setElevation" && occurrence <= 2)
        observeCliffs?.(
          occurrence === 1 ? "after-first-setElevation" : "after-second-setElevation",
          authenticCall
        );
      if (method === "generateCliffsFromElevation" && occurrence === 1)
        observeCliffs?.("after-generateCliffsFromElevation", authenticCall);
      return result;
    } catch (error) {
      emit("failed", { call, method, occurrence, error: String(error) });
      throw error;
    }
  };
  for (const method of maintenanceMethods) {
    const original = prototype[method];
    prototype[method] = function () {
      refuseInterleavedMutation();
      return observe(this, method, () => original.call(this));
    };
  }
  const setElevation = prototype.setElevation;
  prototype.setElevation = function (values) {
    refuseInterleavedMutation();
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
    if (writeOrderIntervention && deliveryAttempted)
      throw new Error("Downstream delivery refuses writes after its single delivery attempt.");
    admit(this);
    writes.push({ wet: this.isWater(intent.x, intent.y), intent: { ...intent } });
    if (writeOrderIntervention) return;
    return setRiverInfo.call(this, intent);
  };
  const finalizeRivers = prototype.finalizeRivers;
  prototype.finalizeRivers = function (args) {
    if ((appliedTuple || writeOrderIntervention) && !sameTuple(args, RIVER_PROBE_VARIANTS.authored))
      throw new Error(
        "Authored finalizer ablation requires the authentic requested tuple false,25,2,2."
      );
    admit(this);
    let delivery: ReturnType<typeof downstreamRiverDelivery> | undefined;
    if (writeOrderIntervention) {
      if (deliveryAttempted)
        throw new Error("Downstream delivery already attempted; no replay is admitted.");
      // Preflight the complete graph before delivering any buffered native river write.
      delivery = downstreamRiverDelivery(writes, options, cliffBindings ?? nativeCliffBindings());
      deliveryAttempted = true;
    }
    emit("inputs", {
      writes,
      dryWritesSha256: digest(writes.filter((write) => !write.wet).map((write) => write.intent)),
      wetWritesSha256: digest(writes.filter((write) => write.wet).map((write) => write.intent)),
      elevations,
      finalizationTuple: args,
      ...(intervention ? { finalizationIntervention: intervention } : {}),
      ...(delivery
        ? {
            riverWriteOrderIntervention: {
              ...writeOrderIntervention,
              ...delivery,
              includedWetWriteCount: writes.filter((write) => write.wet).length,
            },
          }
        : {}),
    });
    if (delivery) {
      for (const ordinal of delivery.appliedOrdinals) {
        try {
          setRiverInfo.call(this, { ...writes[ordinal]!.intent });
        } catch (error) {
          emit("failed", {
            method: "setRiverInfo",
            originalOrdinal: ordinal,
            error: String(error),
          });
          throw error;
        }
      }
      deliveryComplete = true;
    }
    return observe(this, "finalizeRivers", () =>
      finalizeRivers.call(
        this,
        appliedTuple ? [appliedTuple[0], appliedTuple[1], appliedTuple[2], appliedTuple[3]] : args
      )
    );
  };
  emit("installed", {
    ...options,
    focus: observationFocus,
    qualification: writeOrderIntervention
      ? "Experimental downstream-first native delivery permutation; every declaration and authored finalizer tuple are retained, with no replay."
      : intervention
        ? "Experimental authored finalizer minima ablation; forwards one selected native tuple, no other authentic call changes."
        : originalInputArm
          ? dryRetention
            ? "Authentic calls are preserved. After recipe success, V20 adds one setter retaining exact native dry heights and protected original wet requests, no other maintenance. This is not the internal prepare-surface repair slot."
            : options.atlasKind === WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_ATLAS
              ? "Authentic calls are preserved. Both bounded cutoff arms protect first-setter requests and observe equal post-recipe grids without replay or additional maintenance. Classification and height are independent outcomes."
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
      if (lastAuthenticCall) observeCliffs?.("post-authentic-recipe", lastAuthenticCall);
    } catch (error) {
      emit("original-replay-failed", { phase: "post-authentic-recipe", error: String(error) });
      throw error;
    }
  };
}

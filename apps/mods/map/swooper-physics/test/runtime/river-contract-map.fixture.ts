import { encodeBoundedJsonLogLines } from "@swooper/mapgen-core/lib/log";
import type { Civ7Adapter } from "../../src/runtime/map-script/adapter.js";
import type {
  WaterConnectivityAtlas,
  WaterConnectivityFixture,
  WaterLowerBoundAtlas,
  WaterLowerBoundFixture,
} from "./water-connectivity.fixture.js";

export const RIVER_PROBE = {
  id: "swooper-river-contract-v1",
  diagnosticRevision: 4,
  finalizationPasses: 1,
  width: 60,
  height: 38,
  mapSeed: 1018,
  gameSeed: 1019,
  playerCount: 4,
} as const;

export const RIVER_TERRAIN_PROBE = {
  ...RIVER_PROBE,
  diagnosticRevision: 5,
  displayLabel: "River Terrain Admission V5",
} as const;
export const RIVER_LAKE_NAVIGATION_PROBE = {
  ...RIVER_PROBE,
  diagnosticRevision: 6,
  displayLabel: "River Lake Navigation V6",
} as const;
export type RiverProbeAtlas =
  | "legacy"
  | "terrain-admission"
  | "lake-navigation"
  | WaterConnectivityAtlas
  | WaterLowerBoundAtlas;

// Argument order comes from shipped scripts/common-generation.js, not the adapter.
export const RIVER_PROBE_VARIANTS = {
  authored: [false, 25, 2, 2],
  aesthetic: [true, 25, 2, 2],
  length: [true, 25, 4, 2],
  upstream: [true, 25, 2, 0],
  percent: [true, 0, 2, 2],
} as const;
export type RiverProbeVariant = keyof typeof RIVER_PROBE_VARIANTS;
export const RIVER_DIRECTIONS = [
  "EAST",
  "NORTHEAST",
  "NORTHWEST",
  "WEST",
  "SOUTHWEST",
  "SOUTHEAST",
] as const;
export const RIVER_CHECKPOINTS = [
  "initialized",
  "after-write",
  "after-finalize-once",
  "after-floodplains",
  "after-validate",
  "after-areas",
  "after-water-cache",
  "after-fertility",
  "after-starts",
] as const;

type XY = Readonly<{ x: number; y: number }>;
type Direction = (typeof RIVER_DIRECTIONS)[number];
type RiverClass = "MINOR" | "NAVIGABLE";
type Terrain = "OCEAN" | "COAST" | "FLAT" | "HILL" | "MOUNTAIN";
type NativeObject = Record<string, unknown>;
type Unavailable = { status: "unavailable"; member: string; reason: string; detail?: string };
type Observation = number | boolean | XY | Unavailable;
export type RiverProbeWrite = XY & {
  caseId: string;
  role: string;
  directionSymbol: Direction;
  riverClass: RiverClass;
  expectedReceiver: XY;
};

// App-owned diagnostic host bindings only. These are not portable API declarations.
declare const engine: {
  on(
    event: "RequestMapInitData",
    callback: (data: { width: number; height: number; wrapX?: boolean }) => void
  ): void;
  on(event: "GenerateMap", callback: () => void): void;
  call(event: "SetMapInitData", data: unknown): void;
};
declare const GameInfo: {
  Terrains: {
    find(
      predicate: (row: { TerrainType: string; $index: number }) => boolean
    ): { $index: number } | undefined;
  };
  Biomes: {
    find(
      predicate: (row: { BiomeType: string; $index: number }) => boolean
    ): { $index: number } | undefined;
  };
  Features: {
    find(
      predicate: (row: { FeatureType: string; $index: number }) => boolean
    ): { $index: number } | undefined;
  };
};
declare const GameplayMap: NativeObject & {
  getGridWidth(): number;
  getGridHeight(): number;
  getRandomSeed(): number;
  getIndexFromXY(x: number, y: number): number;
};
declare const TerrainBuilder: NativeObject & {
  setTerrainType(x: number, y: number, terrain: number): void;
  setBiomeType(x: number, y: number, biome: number): void;
  setRainfall(x: number, y: number, rainfall: number): void;
  setLandmassRegionId(x: number, y: number, region: number): void;
  setFeatureType(
    x: number,
    y: number,
    feature: { Feature: number; Direction: number; Elevation: number }
  ): void;
  setElevation(values: number[]): void;
  setRiverInfo(x: number, y: number, direction: number, riverType: number): void;
  finalizeRivers(aesthetic: boolean, percent: number, minLength: number, upstream: number): void;
  addFloodplains(minLength: number, maxLength: number): void;
  validateAndFixTerrain(): void;
  stampContinents(): void;
  storeWaterData(): void;
};
declare const AreaBuilder: NativeObject & { recalculateAreas(): void };
declare const FertilityBuilder: { recalculate(): void };
declare const Players: { getAliveMajorIds(): number[] };
declare const StartPositioner: { setStartPosition(plotIndex: number, player: number): void };
declare const LandmassRegion: { LANDMASS_REGION_WEST: number; LANDMASS_REGION_EAST: number };
declare const DirectionTypes: NativeObject;
declare const RiverTypes: NativeObject;
declare const MapRivers: NativeObject;

const starts = [4, 18, 34, 50].map((x) => ({ x, y: 34 }));
const key = ({ x, y }: XY) => `${x},${y}`;
const index = ({ x, y }: XY) => x + y * RIVER_PROBE.width;

/** V5 changes only the tested interior landform, keeping class-paired ocean-reaching paths identical. */
export const RIVER_TERRAIN_CONTROLS = (["FLAT", "HILL", "MOUNTAIN", "VOLCANO"] as const).flatMap(
  (surface, surfaceIndex) =>
    (["source", "receiver"] as const).flatMap((barrierRole, roleIndex) =>
      (["MINOR", "NAVIGABLE"] as const).map((riverClass, classIndex) => {
        const y = 3 + 2 * (surfaceIndex * 4 + roleIndex * 2 + classIndex);
        return {
          caseId: `terrain-${surface.toLowerCase()}-${barrierRole}-${riverClass.toLowerCase()}`,
          surface,
          testEdgeBarrierRole: barrierRole,
          riverClass,
          reachRoles: ["incoming-receiver", "outgoing-source"],
          testSource: { x: 54, y },
          testReceiver: { x: 55, y },
          barrier: { x: barrierRole === "source" ? 54 : 55, y },
          substrate: surface === "VOLCANO" ? "MOUNTAIN" : surface,
          feature: surface === "VOLCANO" ? "FEATURE_VOLCANO" : null,
          reach: [550, 500, 450, 400, 350, 300].map((elevationInput, offset) => ({
            x: 52 + offset,
            y,
            elevationInput,
          })),
          terminalReceiver: { x: 58, y },
        } as const;
      })
    )
);

export function buildRiverTerrainAtlas(wrapX: boolean): RiverProbeWrite[] {
  return RIVER_TERRAIN_CONTROLS.flatMap((control) =>
    control.reach.map(({ x, y }) => ({
      caseId: control.caseId,
      x,
      y,
      directionSymbol: "EAST" as const,
      riverClass: control.riverClass,
      role:
        x === control.testSource.x
          ? "tested-source"
          : x === control.testReceiver.x
            ? "tested-receiver-and-downstream-source"
            : x === 57
              ? "marine-mouth-source"
              : "reach-source",
      expectedReceiver: riverProbeExpectedReceiver({ x, y }, "EAST", wrapX),
    }))
  );
}

export function riverTerrainProbeTerrainAt(x: number, y: number): Terrain {
  const control = RIVER_TERRAIN_CONTROLS.find(
    (entry) => entry.barrier.x === x && entry.barrier.y === y
  );
  if (control) return control.substrate;
  // The last authored source is dry land; its receiver is original ocean, not an unwritten dry gap.
  if (x === 57 && RIVER_TERRAIN_CONTROLS.some((entry) => entry.barrier.y === y)) return "FLAT";
  if (x < 2 || x >= 58 || y < 1 || y >= 37) return "OCEAN";
  if (x === 2 || x === 57 || y === 1 || y === 36) return "COAST";
  return "FLAT";
}

export function buildRiverTerrainElevation(): number[] {
  const values: number[] = Array.from(
    { length: RIVER_PROBE.width * RIVER_PROBE.height },
    (_, cell) => {
      const terrain = riverTerrainProbeTerrainAt(
        cell % RIVER_PROBE.width,
        Math.floor(cell / RIVER_PROBE.width)
      );
      return terrain === "OCEAN" || terrain === "COAST" ? 0 : 700;
    }
  );
  for (const control of RIVER_TERRAIN_CONTROLS) {
    for (const point of control.reach) values[index(point)] = point.elevationInput;
  }
  return values;
}

export const RIVER_SLOPE_CONTROLS = [
  { caseId: "slope-east-downhill", x: 20, y: 3, directionSymbol: "EAST", receiverDelta: -2 },
  { caseId: "slope-east-level", x: 26, y: 3, directionSymbol: "EAST", receiverDelta: 0 },
  { caseId: "slope-east-uphill", x: 32, y: 3, directionSymbol: "EAST", receiverDelta: 2 },
  { caseId: "slope-west-downhill", x: 38, y: 3, directionSymbol: "WEST", receiverDelta: -2 },
  { caseId: "slope-west-level", x: 44, y: 3, directionSymbol: "WEST", receiverDelta: 0 },
  { caseId: "slope-west-uphill", x: 50, y: 3, directionSymbol: "WEST", receiverDelta: 2 },
] as const;

/** Independent geographical hypothesis: odd rows offset east, north increases Y.
 * Deliberately does not consume native adjacency or the grid helper's non-native slot order.
 */
export function riverProbeExpectedReceiver({ x, y }: XY, direction: Direction, wrapX: boolean): XY {
  const eastDiagonal = y % 2;
  const offsets: Record<Direction, XY> = {
    EAST: { x: 1, y: 0 },
    WEST: { x: -1, y: 0 },
    NORTHEAST: { x: eastDiagonal, y: 1 },
    NORTHWEST: { x: eastDiagonal - 1, y: 1 },
    SOUTHEAST: { x: eastDiagonal, y: -1 },
    SOUTHWEST: { x: eastDiagonal - 1, y: -1 },
  };
  const offset = offsets[direction];
  const nextX = x + offset.x;
  return { x: wrapX ? (nextX + RIVER_PROBE.width) % RIVER_PROBE.width : nextX, y: y + offset.y };
}

// V4 asks whether elevated lakes admit land-only inlets and independent outlets without
// a river through water. Civ levels lakes against their lowest shore; readbacks, not inputs, are evidence.
export const RIVER_ELEVATED_LAKE_CONTROLS: readonly {
  caseId: string;
  lakeElevationInput: number;
  shoreElevationInput: number;
  cells: readonly XY[];
  inlet: readonly (XY & { elevation: number })[];
  outlet: readonly (XY & { elevation: number })[];
}[] = [
  {
    caseId: "elevated-open-lake",
    lakeElevationInput: 572,
    shoreElevationInput: 700,
    cells: [
      { x: 50, y: 18 },
      { x: 51, y: 18 },
      { x: 50, y: 19 },
      { x: 51, y: 19 },
    ],
    inlet: [900, 850, 800, 750].map((elevation, i) => ({ x: 46 + i, y: 18, elevation })),
    outlet: [450, 380, 310, 240, 170].map((elevation, i) => ({ x: 52 + i, y: 18, elevation })),
  },
  {
    caseId: "elevated-closed-lake",
    lakeElevationInput: 572,
    shoreElevationInput: 700,
    cells: [
      { x: 33, y: 23 },
      { x: 34, y: 23 },
      { x: 33, y: 24 },
      { x: 34, y: 24 },
    ],
    inlet: [900, 850, 800, 750].map((elevation, i) => ({ x: 29 + i, y: 23, elevation })),
    outlet: [],
  },
];

/** V6 requalifies V4 local profiles on a dedicated background, with class-only translated pairs. */
export const RIVER_LAKE_NAVIGATION_CONTROLS = RIVER_ELEVATED_LAKE_CONTROLS.flatMap((original) =>
  (["MINOR", "NAVIGABLE"] as const).map((inletClass) => {
    const dy = inletClass === "MINOR" ? -10 : 0;
    return {
      caseId: `${original.caseId}-${inletClass.toLowerCase()}`,
      originalCaseId: original.caseId,
      geometryTranslation: { x: 0, y: dy },
      inletClass,
      lakeElevationInput: original.lakeElevationInput,
      shoreElevationInput: original.shoreElevationInput,
      cells: original.cells.map((point) => ({ ...point, y: point.y + dy })),
      inlet: original.inlet.map((point) => ({ ...point, y: point.y + dy })),
      outlet: original.outlet.map((point) => ({ ...point, y: point.y + dy })),
    };
  })
);

export const RIVER_LAKE_MARINE_CONTROLS = (["MINOR", "NAVIGABLE"] as const).map(
  (riverClass, i) => ({
    caseId: `lake-navigation-marine-${riverClass.toLowerCase()}`,
    riverClass,
    reach: [900, 850, 800, 750].map((elevation, j) => ({ x: 53 + j, y: 28 + 2 * i, elevation })),
    terminalReceiver: { x: 57, y: 28 + 2 * i },
  })
);

export function buildRiverLakeNavigationAtlas(wrapX: boolean): RiverProbeWrite[] {
  const writes: RiverProbeWrite[] = [];
  const add = (caseId: string, point: XY, riverClass: RiverClass, role: string) =>
    writes.push({
      caseId,
      ...point,
      directionSymbol: "EAST",
      riverClass,
      role,
      expectedReceiver: riverProbeExpectedReceiver(point, "EAST", wrapX),
    });
  for (const control of RIVER_LAKE_NAVIGATION_CONTROLS) {
    for (const point of control.inlet)
      add(control.caseId, { x: point.x, y: point.y }, control.inletClass, "inlet");
    for (const point of control.outlet)
      add(control.caseId, { x: point.x, y: point.y }, "NAVIGABLE", "outlet");
  }
  for (const control of RIVER_LAKE_MARINE_CONTROLS)
    for (const point of control.reach)
      add(control.caseId, { x: point.x, y: point.y }, control.riverClass, "direct-marine-control");
  return writes;
}

export function riverLakeNavigationTerrainAt(x: number, y: number): Terrain {
  if (
    RIVER_LAKE_NAVIGATION_CONTROLS.some((control) =>
      control.cells.some((cell) => cell.x === x && cell.y === y)
    )
  )
    return "COAST";
  if (x < 2 || x >= 58 || y < 1 || y >= 37) return "OCEAN";
  if (x === 2 || x === 57 || y === 1 || y === 36) return "COAST";
  return "FLAT";
}

export function buildRiverLakeNavigationElevation(wrapX: boolean): number[] {
  const values = Array.from({ length: RIVER_PROBE.width * RIVER_PROBE.height }, (_, cell) => {
    const x = cell % RIVER_PROBE.width;
    const terrain = riverLakeNavigationTerrainAt(x, Math.floor(cell / RIVER_PROBE.width));
    return terrain === "OCEAN" || terrain === "COAST" ? 0 : 100 + 2 * (60 - x);
  });
  for (const control of RIVER_LAKE_NAVIGATION_CONTROLS) {
    for (const cell of control.cells) values[index(cell)] = control.lakeElevationInput;
    for (const point of elevatedLakeShore(control.cells, wrapX))
      values[index(point)] = control.shoreElevationInput;
    for (const point of [...control.inlet, ...control.outlet])
      values[index(point)] = point.elevation;
  }
  for (const control of RIVER_LAKE_MARINE_CONTROLS)
    for (const point of control.reach) values[index(point)] = point.elevation;
  return values;
}

function elevatedLakeShore(cells: readonly XY[], wrapX: boolean): XY[] {
  const water = new Set(cells.map(key));
  const shore = new Map<string, XY>();
  for (const cell of cells)
    for (const direction of RIVER_DIRECTIONS) {
      const point = riverProbeExpectedReceiver(cell, direction, wrapX);
      if (!water.has(key(point))) shore.set(key(point), point);
    }
  return [...shore.values()];
}

/** Synthetic planned/accepted masks isolate the already-known mountain/volcano exclusions.
 * They are fixture inputs, not claims that Civ classified the accepted coast cells as lakes.
 */
export const RIVER_LAKE_CASES: readonly {
  caseId: string;
  cells: readonly (XY & { accepted: boolean; reason: string })[];
}[] = [
  {
    caseId: "lake-inlet-outlet",
    cells: [
      { x: 38, y: 27, accepted: true, reason: "admitted" },
      { x: 39, y: 27, accepted: true, reason: "admitted" },
      { x: 38, y: 28, accepted: true, reason: "admitted" },
      { x: 39, y: 28, accepted: true, reason: "admitted" },
    ],
  },
  {
    caseId: "lake-wholly-rejected",
    cells: [
      { x: 8, y: 34, accepted: false, reason: "mountain" },
      { x: 9, y: 34, accepted: false, reason: "volcano" },
    ],
  },
  {
    caseId: "lake-partially-accepted",
    cells: [
      { x: 24, y: 34, accepted: true, reason: "admitted" },
      { x: 25, y: 34, accepted: false, reason: "mountain" },
    ],
  },
  ...RIVER_ELEVATED_LAKE_CONTROLS.map(({ caseId, cells }) => ({
    caseId,
    cells: cells.map((cell) => ({ ...cell, accepted: true, reason: "admitted" })),
  })),
] as const;

export function buildRiverProbeAtlas(wrapX: boolean): RiverProbeWrite[] {
  const writes: RiverProbeWrite[] = [];
  const add = (
    caseId: string,
    x: number,
    y: number,
    directionSymbol: Direction,
    riverClass: RiverClass,
    role = "segment"
  ) => {
    writes.push({
      caseId,
      x,
      y,
      directionSymbol,
      riverClass,
      role,
      expectedReceiver: riverProbeExpectedReceiver({ x, y }, directionSymbol, wrapX),
    });
  };
  for (const [classIndex, riverClass] of (["MINOR", "NAVIGABLE"] as const).entries()) {
    for (const [parity, y] of [6 + classIndex * 10, 11 + classIndex * 10].entries()) {
      RIVER_DIRECTIONS.forEach((direction, slot) =>
        add(
          `isolated-${riverClass.toLowerCase()}-${parity}-${direction.toLowerCase()}`,
          6 + slot * 8,
          y,
          direction,
          riverClass
        )
      );
    }
    for (const length of [1, 2, 3]) {
      for (let i = 0; i < length; i++)
        add(
          `reach-${riverClass.toLowerCase()}-${length}`,
          6 + (length - 1) * 8 + i,
          26 + classIndex * 4,
          "EAST",
          riverClass
        );
    }
  }
  for (let i = 0; i < 4; i++)
    add("class-transition", 30 + i, 26, "EAST", i < 2 ? "MINOR" : "NAVIGABLE");
  for (let i = 0; i < 4; i++)
    add("nav-minor-nav-transition", 36 + i, 31, "EAST", i === 1 ? "MINOR" : "NAVIGABLE");
  add("confluence", 45, 29, "SOUTHEAST", "MINOR", "north-tributary");
  add("confluence", 45, 27, "NORTHEAST", "MINOR", "south-tributary");
  for (const x of [46, 47, 48])
    add("confluence", x, 28, "EAST", "NAVIGABLE", "shared-main-channel");
  for (const x of [53, 54, 55, 56]) add("marine-mouth", x, 26, "EAST", "NAVIGABLE");
  for (const x of [30, 31, 32]) add("closed-termination", x, 30, "EAST", "MINOR");
  for (const x of [36, 37, 38, 39, 40, 41])
    add(
      "lake-inlet-outlet",
      x,
      27,
      "EAST",
      x < 38 ? "MINOR" : "NAVIGABLE",
      x < 38 ? "inlet" : x < 40 ? "accepted-lake-cell" : "outlet"
    );
  for (const x of [6, 7])
    add("lake-wholly-rejected", x, 34, "EAST", "MINOR", "inlet-to-rejected-plan");
  for (const x of [22, 23, 24, 25, 26])
    add(
      "lake-partially-accepted",
      x,
      34,
      "EAST",
      x < 24 ? "MINOR" : "NAVIGABLE",
      x < 24
        ? "inlet"
        : x === 24
          ? "accepted-lake-cell"
          : x === 25
            ? "rejected-lake-cell"
            : "outlet"
    );
  for (const control of RIVER_SLOPE_CONTROLS)
    add(control.caseId, control.x, control.y, control.directionSymbol, "MINOR", "slope-control");
  for (const x of [8, 7, 6, 5, 4, 3])
    add("marine-confluence", x, 13, "WEST", "NAVIGABLE", "marine-main-channel");
  add("marine-confluence", 10, 14, "WEST", "MINOR", "north-branch");
  add("marine-confluence", 9, 14, "SOUTHWEST", "MINOR", "north-junction");
  add("marine-confluence", 10, 12, "WEST", "MINOR", "south-branch");
  add("marine-confluence", 9, 12, "NORTHWEST", "MINOR", "south-junction");
  for (const x of [10, 9, 8, 7, 6, 5, 4, 3])
    add("marine-nav-minor-nav", x, 8, "WEST", x === 8 || x === 7 ? "MINOR" : "NAVIGABLE");
  add("lake-marine-extension", 42, 27, "SOUTHEAST", "NAVIGABLE");
  for (let x = 43; x <= 52; x++) add("lake-marine-extension", x, 26, "EAST", "NAVIGABLE");
  for (const control of RIVER_ELEVATED_LAKE_CONTROLS) {
    for (const { x, y } of control.inlet) add(control.caseId, x, y, "EAST", "MINOR", "inlet");
    for (const { x, y } of control.outlet) add(control.caseId, x, y, "EAST", "NAVIGABLE", "outlet");
  }
  if (wrapX) {
    add("seam-east-even-minor", 59, 6, "EAST", "MINOR");
    add("seam-east-odd-navigable", 59, 11, "EAST", "NAVIGABLE");
    add("seam-west-even-navigable", 0, 16, "WEST", "NAVIGABLE");
    add("seam-west-odd-minor", 0, 21, "WEST", "MINOR");
  }
  return writes;
}

export function riverProbeTerrainAt(x: number, y: number, wrapX: boolean): Terrain {
  const lake = RIVER_LAKE_CASES.flatMap((entry) => entry.cells).find(
    (cell) => cell.x === x && cell.y === y
  );
  if (lake) return lake.accepted ? "COAST" : "MOUNTAIN";
  // Land bridges make seam probes about direction, not accidental ocean writes.
  if (wrapX && (x <= 2 || x >= 57) && [6, 11, 16, 21].some((row) => Math.abs(row - y) <= 1))
    return "FLAT";
  if (x < 2 || x >= 58 || y < 1 || y >= 37) return "OCEAN";
  if (x === 2 || x === 57 || y === 1 || y === 36) return "COAST";
  return "FLAT";
}

/** Named controls only. V4 preserves every V3 sample, including the original zero-height lake. */
export function buildRiverProbeElevation(wrapX: boolean): number[] {
  const values = Array.from({ length: RIVER_PROBE.width * RIVER_PROBE.height }, (_, i) => {
    const x = i % RIVER_PROBE.width;
    const terrain = riverProbeTerrainAt(x, Math.floor(i / RIVER_PROBE.width), wrapX);
    return terrain === "OCEAN" || terrain === "COAST"
      ? 0
      : terrain === "MOUNTAIN"
        ? 700
        : 100 + 2 * (60 - x);
  });
  for (const control of RIVER_SLOPE_CONTROLS) {
    values[index(control)] = 300;
    values[index(riverProbeExpectedReceiver(control, control.directionSymbol, wrapX))] =
      300 + control.receiverDelta;
  }
  for (let x = 3; x <= 8; x++) values[index({ x, y: 13 })] = 160 + 4 * (x - 3);
  for (const y of [12, 14]) for (const x of [9, 10]) values[index({ x, y })] = 160 + 4 * (x - 3);
  for (let x = 3; x <= 10; x++) values[index({ x, y: 8 })] = 160 + 4 * (x - 3);
  for (const control of RIVER_ELEVATED_LAKE_CONTROLS) {
    for (const cell of control.cells) values[index(cell)] = control.lakeElevationInput;
    for (const point of elevatedLakeShore(control.cells, wrapX))
      values[index(point)] = control.shoreElevationInput;
    for (const point of [...control.inlet, ...control.outlet])
      values[index(point)] = point.elevation;
  }
  return values;
}

function unavailable(member: string, reason: string, detail?: string): Unavailable {
  return {
    status: "unavailable",
    member,
    reason,
    ...(detail ? { detail: detail.slice(0, 180) } : {}),
  };
}
function observe(
  owner: NativeObject | undefined,
  ownerName: string,
  member: string,
  args: unknown[],
  kind: "number" | "boolean" | "xy" = "number"
): Observation {
  const label = `${ownerName}.${member}`;
  try {
    const getter = owner?.[member];
    if (typeof getter !== "function") return unavailable(label, "missing-callable");
    const value: unknown = getter.apply(owner, args);
    if (kind === "number" && typeof value === "number" && Number.isFinite(value)) return value;
    if (kind === "boolean" && typeof value === "boolean") return value;
    if (kind === "xy" && value && typeof value === "object") {
      const point = value as XY;
      if (Number.isInteger(point.x) && Number.isInteger(point.y)) return { x: point.x, y: point.y };
    }
    return unavailable(label, "unexpected-readback", typeof value);
  } catch (cause) {
    return unavailable(label, "threw", String(cause));
  }
}
function requireInteger(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value))
    throw new Error(`Missing integer: ${label}`);
  return value;
}

function passiveMembers(owner: NativeObject | undefined, label: string): unknown {
  if (!owner) return unavailable(label, "missing-object");
  try {
    const names = Object.keys(owner)
      .filter((name) => /river|fresh|adjacent/i.test(name))
      .sort();
    return {
      qualification:
        "enumerable names only; absence is not proof that a native member does not exist",
      names: names.slice(0, 64),
      truncated: names.length > 64,
    };
  } catch (cause) {
    return unavailable(label, "inventory-threw", String(cause));
  }
}

/** Explicit V3 experiment, not a shipped argument contract or production network reader. */
function observeNetworks(owner: NativeObject | undefined, finalized: boolean): unknown {
  const getNumRivers = observe(owner, "MapRivers", "getNumRivers", []);
  let numRivers: Observation;
  try {
    const value = owner?.numRivers;
    numRivers =
      typeof value === "function"
        ? observe(owner, "MapRivers", "numRivers", [])
        : typeof value === "number" && Number.isInteger(value) && value >= 0
          ? value
          : unavailable("MapRivers.numRivers", "missing-or-unexpected-property");
  } catch (cause) {
    numRivers = unavailable("MapRivers.numRivers", "threw", String(cause));
  }
  const count = typeof getNumRivers === "number" ? getNumRivers : numRivers;
  const memberArity = Object.fromEntries(
    ["getRiverIDByIndex", "getRiverPlots"].map((name) => {
      try {
        const member = owner?.[name];
        return [
          name,
          typeof member === "function"
            ? member.length
            : unavailable(`MapRivers.${name}`, "missing-callable"),
        ];
      } catch (cause) {
        return [name, unavailable(`MapRivers.${name}`, "arity-threw", String(cause))];
      }
    })
  );
  const samples: unknown[] = [];
  if (finalized && typeof count === "number" && Number.isSafeInteger(count) && count >= 0) {
    for (let ordinal = 0; ordinal < Math.min(count, 64); ordinal++) {
      const riverId = observe(owner, "MapRivers", "getRiverIDByIndex", [ordinal]);
      let plots: unknown;
      try {
        const getter = owner?.getRiverPlots;
        if (typeof riverId !== "number" || !Number.isSafeInteger(riverId) || riverId < 0)
          plots = unavailable("MapRivers.getRiverPlots", "river-id-unavailable-or-invalid");
        else if (typeof getter !== "function")
          plots = unavailable("MapRivers.getRiverPlots", "missing-callable");
        else {
          const raw: unknown = getter.call(owner, riverId);
          plots = Array.isArray(raw)
            ? {
                count: raw.length,
                truncated: raw.length > 64,
                values: raw.slice(0, 64).map((plot: unknown) => {
                  if (typeof plot === "number" && Number.isInteger(plot)) return plot;
                  return unavailable(
                    "MapRivers.getRiverPlots",
                    "unexpected-plot-entry",
                    typeof plot
                  );
                }),
              }
            : unavailable("MapRivers.getRiverPlots", "unexpected-readback", typeof raw);
        }
      } catch (cause) {
        plots = unavailable("MapRivers.getRiverPlots", "threw", String(cause));
      }
      samples.push({ ordinal, riverId, plots });
    }
  }
  return {
    qualification:
      "experimental ordinal-to-ID-to-plots observation; no shipped argument contract; membership is not edge/direction parity",
    getNumRivers,
    numRivers,
    memberArity,
    samples,
    maxNetworks: 64,
    maxPlotsPerNetwork: 64,
    enumeration: !finalized
      ? { status: "skipped", reason: "before-finalization" }
      : typeof count === "number" && Number.isSafeInteger(count) && count >= 0
        ? { status: "attempted" }
        : unavailable("MapRivers", "count-unavailable-or-invalid"),
    truncated:
      typeof count === "number" && Number.isSafeInteger(count) && count >= 0
        ? count > 64
        : unavailable("MapRivers", "count-unavailable-or-invalid"),
  };
}

export function registerRiverContractProbe(
  proofId: string,
  variant: RiverProbeVariant,
  atlasKind: RiverProbeAtlas = "legacy",
  createAdapter?: (
    width: number,
    height: number
  ) => Pick<Civ7Adapter, "getRiverCapabilities" | "setRiverInfo" | "finalizeRivers"> &
    Partial<Pick<Civ7Adapter, "getMapSizeId" | "lookupMapInfo">>,
  waterConnectivity?: WaterConnectivityFixture | WaterLowerBoundFixture
): void {
  const settings = RIVER_PROBE_VARIANTS[variant];
  if (!settings) throw new Error(`Unknown river probe variant: ${variant}`);
  const isLowerBoundAtlas = atlasKind === "water-closed-lower-bound";
  const isWaterAtlas =
    atlasKind === "water-connectivity-cutoff-5" ||
    atlasKind === "water-connectivity-cutoff-10" ||
    isLowerBoundAtlas;
  if (
    atlasKind !== "legacy" &&
    atlasKind !== "terrain-admission" &&
    atlasKind !== "lake-navigation" &&
    !isWaterAtlas
  )
    throw new Error(`Unknown river probe atlas: ${atlasKind}`);
  if (
    isWaterAtlas !== Boolean(waterConnectivity) ||
    (waterConnectivity && waterConnectivity.probe.atlasKind !== atlasKind)
  )
    throw new Error("Water-connectivity atlas requires its matching fixture.");
  if (atlasKind !== "legacy" && variant !== "authored")
    throw new Error("Adapter atlases require the authored finalization tuple.");
  if (atlasKind !== "legacy" && !createAdapter)
    throw new Error("Adapter atlases require the app adapter factory.");
  const isTerrainAtlas = atlasKind === "terrain-admission";
  const isLakeAtlas = atlasKind === "lake-navigation";
  const usesAdapter = atlasKind !== "legacy";
  const probe =
    waterConnectivity?.probe ??
    (isTerrainAtlas
      ? RIVER_TERRAIN_PROBE
      : isLakeAtlas
        ? RIVER_LAKE_NAVIGATION_PROBE
        : RIVER_PROBE);
  const emit = (stage: string, payload: unknown, marker = "[river-contract]") => {
    for (const line of encodeBoundedJsonLogLines({
      marker,
      payload: {
        proofId,
        variant,
        stage,
        payload,
        ...(waterConnectivity
          ? {
              atlasKind,
              diagnosticRevision: probe.diagnosticRevision,
              fixtureSourceSha256: waterConnectivity.fixtureSourceSha256,
            }
          : {}),
      },
    }))
      console.log(line);
  };
  let requestedWrapX: boolean | undefined;
  engine.on("RequestMapInitData", (data) => {
    if (data.width !== RIVER_PROBE.width || data.height !== RIVER_PROBE.height)
      throw new Error("River probe requires stock Tiny 60x38.");
    requestedWrapX = typeof data.wrapX === "boolean" ? data.wrapX : undefined;
    engine.call("SetMapInitData", data);
  });
  engine.on("GenerateMap", () => {
    let stage = "initialize";
    try {
      if (
        GameplayMap.getGridWidth() !== RIVER_PROBE.width ||
        GameplayMap.getGridHeight() !== RIVER_PROBE.height
      )
        throw new Error("Unexpected probe grid.");
      if (GameplayMap.getRandomSeed() !== RIVER_PROBE.mapSeed)
        throw new Error("River probe requires map seed 1018.");
      const players = Players.getAliveMajorIds();
      if (players.length !== starts.length)
        throw new Error("River probe requires four alive major players.");
      for (const name of ["setRiverInfo", "finalizeRivers"])
        if (typeof TerrainBuilder[name] !== "function")
          throw new Error(`Missing TerrainBuilder.${name}`);
      const wrapX = requestedWrapX === true;
      const writes =
        waterConnectivity?.writes ??
        (isTerrainAtlas
          ? buildRiverTerrainAtlas(wrapX)
          : isLakeAtlas
            ? buildRiverLakeNavigationAtlas(wrapX)
            : buildRiverProbeAtlas(wrapX));
      const adapter = usesAdapter ? createAdapter!(probe.width, probe.height) : null;
      const riverCapabilities = adapter?.getRiverCapabilities();
      if (riverCapabilities?.setRiverInfo.status === "unavailable")
        throw new Error(riverCapabilities.setRiverInfo.reason);
      if (riverCapabilities?.finalizeRivers.status === "unavailable")
        throw new Error(riverCapabilities.finalizeRivers.reason);
      if (waterConnectivity) {
        const mapSizeId = adapter?.getMapSizeId?.();
        const mapInfo = mapSizeId === undefined ? undefined : adapter?.lookupMapInfo?.(mapSizeId);
        const expected = waterConnectivity.probe;
        const accepted =
          mapInfo?.MapSizeType === expected.mapSize &&
          mapInfo?.GridWidth === expected.width &&
          mapInfo?.GridHeight === expected.height &&
          mapInfo?.LakeSizeCutoff === expected.expectedLakeSizeCutoff;
        emit("map-info", {
          mapSizeId: mapSizeId ?? null,
          mapInfo: mapInfo ?? null,
          expectedLakeSizeCutoff: expected.expectedLakeSizeCutoff,
          activation: accepted ? "accepted" : "refused",
        });
        if (!accepted)
          throw new Error(
            `Water-connectivity probe requires Tiny numeric LakeSizeCutoff=${expected.expectedLakeSizeCutoff} and 60x38 metadata.`
          );
      }
      const terrainAt = (x: number, y: number) =>
        waterConnectivity
          ? waterConnectivity.terrainAt(x, y)
          : isTerrainAtlas
            ? riverTerrainProbeTerrainAt(x, y)
            : isLakeAtlas
              ? riverLakeNavigationTerrainAt(x, y)
              : riverProbeTerrainAt(x, y, wrapX);
      const lakeCases = waterConnectivity
        ? [...waterConnectivity.controls, ...waterConnectivity.isolated].map(
            ({ caseId, cells }) => ({
              caseId,
              cells: cells.map((cell) => ({
                ...cell,
                accepted: true,
                reason: "requested-source-water-not-native-lake-proof",
              })),
            })
          )
        : isTerrainAtlas
          ? []
          : isLakeAtlas
            ? RIVER_LAKE_NAVIGATION_CONTROLS.map(({ caseId, cells }) => ({
                caseId,
                cells: cells.map((cell) => ({ ...cell, accepted: true, reason: "admitted" })),
              }))
            : RIVER_LAKE_CASES;
      const grid = Array.from({ length: RIVER_PROBE.width * RIVER_PROBE.height }, (_, i) => ({
        x: i % RIVER_PROBE.width,
        y: Math.floor(i / RIVER_PROBE.width),
      }));
      const directions = Object.fromEntries(
        RIVER_DIRECTIONS.map((symbol) => [
          symbol,
          requireInteger(
            typeof DirectionTypes === "undefined"
              ? undefined
              : DirectionTypes[`DIRECTION_${symbol}`],
            `DirectionTypes.DIRECTION_${symbol}`
          ),
        ])
      );
      const classes = Object.fromEntries(
        ["NO_RIVER", "RIVER_MINOR", "RIVER_NAVIGABLE"].map((symbol) => [
          symbol,
          requireInteger(
            typeof RiverTypes === "undefined" ? undefined : RiverTypes[symbol],
            `RiverTypes.${symbol}`
          ),
        ])
      );
      const terrainIds = Object.fromEntries(
        [
          "OCEAN",
          "COAST",
          "FLAT",
          "MOUNTAIN",
          "NAVIGABLE_RIVER",
          ...(isTerrainAtlas ? ["HILL"] : []),
        ].map((name) => [
          name,
          requireInteger(
            GameInfo.Terrains.find((row) => row.TerrainType === `TERRAIN_${name}`)?.$index,
            name
          ),
        ])
      );
      const landBiome = requireInteger(
        GameInfo.Biomes.find((row) => row.BiomeType === "BIOME_GRASSLAND")?.$index,
        "BIOME_GRASSLAND"
      );
      const waterBiome = requireInteger(
        GameInfo.Biomes.find((row) => row.BiomeType === "BIOME_MARINE")?.$index,
        "BIOME_MARINE"
      );
      const volcano = requireInteger(
        GameInfo.Features.find((row) => row.FeatureType === "FEATURE_VOLCANO")?.$index,
        "FEATURE_VOLCANO"
      );
      const nativeRivers = typeof MapRivers === "undefined" ? undefined : MapRivers;
      const noDirection = requireInteger(
        typeof DirectionTypes === "undefined" ? undefined : DirectionTypes.NO_DIRECTION,
        "DirectionTypes.NO_DIRECTION"
      );
      const heights =
        waterConnectivity?.heights ??
        (isTerrainAtlas
          ? buildRiverTerrainElevation()
          : isLakeAtlas
            ? buildRiverLakeNavigationElevation(wrapX)
            : buildRiverProbeElevation(wrapX));
      const elevatedLakeControls = (
        isTerrainAtlas || isWaterAtlas
          ? []
          : isLakeAtlas
            ? RIVER_LAKE_NAVIGATION_CONTROLS
            : RIVER_ELEVATED_LAKE_CONTROLS
      ).map((control) => ({
        ...control,
        shore: elevatedLakeShore(control.cells, wrapX).map((point) => ({
          ...point,
          elevationInput: heights[index(point)],
        })),
      }));
      const requestedFeatureAt = (x: number, y: number): number | null =>
        isTerrainAtlas
          ? RIVER_TERRAIN_CONTROLS.some(
              (control) =>
                control.surface === "VOLCANO" && control.barrier.x === x && control.barrier.y === y
            )
            ? volcano
            : null
          : !isLakeAtlas && !isWaterAtlas && x === 9 && y === 34
            ? volcano
            : null;
      const requestedAt = (x: number, y: number) => ({
        terrainSymbol: terrainAt(x, y),
        terrain: terrainIds[terrainAt(x, y)],
        elevation: heights[index({ x, y })],
        feature: requestedFeatureAt(x, y),
        riverClass: writes.find((write) => write.x === x && write.y === y)?.riverClass ?? null,
      });
      const observeTerrainPoint = ({ x, y }: XY) => ({
        x,
        y,
        requested: requestedAt(x, y),
        terrain: observe(GameplayMap, "GameplayMap", "getTerrainType", [x, y]),
        elevation: observe(GameplayMap, "GameplayMap", "getElevation", [x, y]),
        feature: observe(GameplayMap, "GameplayMap", "getFeatureType", [x, y]),
        riverClass: observe(GameplayMap, "GameplayMap", "getRiverType", [x, y]),
        water: observe(GameplayMap, "GameplayMap", "isWater", [x, y], "boolean"),
        ...(isLakeAtlas
          ? { lake: observe(GameplayMap, "GameplayMap", "isLake", [x, y], "boolean") }
          : {}),
      });
      const observeBarriers = () =>
        RIVER_TERRAIN_CONTROLS.map((control) => ({
          caseId: control.caseId,
          ...observeTerrainPoint(control.barrier),
        }));
      emit(stage, {
        ...probe,
        atlasKind,
        actualSeed: GameplayMap.getRandomSeed(),
        settings,
        terrainIds,
        classes,
        directions,
        players,
        starts,
        ...(waterConnectivity
          ? {
              waterConnectivity: {
                controls: waterConnectivity.controls,
                isolated: waterConnectivity.isolated,
                qualification: waterConnectivity.qualification,
                fixtureSourceSha256: waterConnectivity.fixtureSourceSha256,
              },
            }
          : {}),
        ...(isTerrainAtlas
          ? {
              terrainControls: RIVER_TERRAIN_CONTROLS,
              terrainEvidence:
                "Same six-source downhill profile and explicit original-ocean receiver. Source/receiver labels refer ONLY to the interior test edge x54 -> x55. Every barrier is an incoming receiver AND an outgoing source in its full reach; whole-reach outcomes do not isolate these roles. Before/after observations bracket each write. Volcano is mountain substrate plus requested feature, paired against mountain-only. Requested inputs never substitute for native observations.",
            }
          : {}),
        ...(isLakeAtlas
          ? {
              lakeNavigationControls: RIVER_LAKE_NAVIGATION_CONTROLS,
              marineControls: RIVER_LAKE_MARINE_CONTROLS,
              lakeNavigationEvidence:
                "Controlled requalification of V4 local body/shore/reach profiles on a NEW dedicated coast-ring background, not the entire V4 run. Each open/closed pair differs only in inlet class after its parity-preserving translation. Four-source direct-marine controls hold class and length explicit. Native initialized and later lake/shore/reach observations are independent of requested elevations; no river writes inside water, no required single ID or navigation through the lake.",
            }
          : {}),
        ...(usesAdapter
          ? {
              dispatch: {
                writer: "Civ7Adapter.setRiverInfo",
                finalizer: "Civ7Adapter.finalizeRivers",
                capabilities: riverCapabilities,
              },
              requestedFeatureMeaning:
                "null means no feature was authored, not proof that the engine reports no feature",
            }
          : {}),
        wrapX: requestedWrapX ?? unavailable("RequestMapInitData.wrapX", "missing-boolean"),
        seam: usesAdapter
          ? {
              status: "skipped",
              reason: isWaterAtlas
                ? "water-connectivity-controls-do-not-cross-seam"
                : isTerrainAtlas
                  ? "terrain-controls-do-not-cross-seam"
                  : "lake-controls-do-not-cross-seam",
            }
          : wrapX
            ? { status: "included", count: 4 }
            : {
                status: "skipped",
                reason: requestedWrapX === false ? "wrapX-false" : "wrapX-unavailable",
              },
        order: "x + y * width",
        nativeIndices: grid.map(({ x, y }) => GameplayMap.getIndexFromXY(x, y)),
        lakeCases,
        lakeEvidence:
          "synthetic planned/accepted fixture inputs; native isLake observed separately",
        elevatedLakeControls,
        elevatedLakeEvidence:
          "land-only writes; inlet and outlet authored separately; no river object through water required; native elevation readbacks, not setter inputs, determine lake/shore gradients",
        atlas: writes,
        slopeControls: usesAdapter ? [] : RIVER_SLOPE_CONTROLS,
        expectedReceiverEvidence:
          "independent odd-row geographical hypothesis; native adjacency logged separately",
        passiveMembers: {
          GameplayMap: passiveMembers(GameplayMap, "GameplayMap"),
          MapRivers: passiveMembers(nativeRivers, "MapRivers"),
        },
        observationLaw:
          "Native false and zero are observations; missing, throwing, and unexpected readbacks are unavailable, never false or zero.",
        edgeDirectionReadback: unavailable(
          "river-edge/direction",
          "no-confirmed-getter; adjacency is not river direction parity"
        ),
        checkpoints: RIVER_CHECKPOINTS,
      });
      for (const { x, y } of grid) {
        const terrain = terrainAt(x, y);
        TerrainBuilder.setTerrainType(x, y, terrainIds[terrain]!);
        TerrainBuilder.setBiomeType(
          x,
          y,
          terrain === "OCEAN" || terrain === "COAST" ? waterBiome : landBiome
        );
        TerrainBuilder.setRainfall(x, y, 100);
        TerrainBuilder.setLandmassRegionId(
          x,
          y,
          x < 30 ? LandmassRegion.LANDMASS_REGION_WEST : LandmassRegion.LANDMASS_REGION_EAST
        );
      }
      for (const { x, y } of grid) {
        const feature = requestedFeatureAt(x, y);
        if (feature !== null)
          TerrainBuilder.setFeatureType(x, y, {
            Feature: feature,
            Direction: noDirection,
            Elevation: 0,
          });
      }
      const beforeSetupValidation = isTerrainAtlas ? observeBarriers() : null;
      TerrainBuilder.validateAndFixTerrain();
      const afterSetupValidation = isTerrainAtlas ? observeBarriers() : null;
      AreaBuilder.recalculateAreas();
      TerrainBuilder.stampContinents();
      TerrainBuilder.setElevation(heights);
      if (!isLowerBoundAtlas) TerrainBuilder.storeWaterData();
      const samplePoints = new Map<string, XY>();
      for (const point of [
        ...writes,
        ...writes.map((write) => write.expectedReceiver),
        ...lakeCases.flatMap((entry) => entry.cells),
        ...elevatedLakeControls.flatMap((entry) => entry.shore),
        ...(isLowerBoundAtlas && waterConnectivity
          ? waterConnectivity.isolated.flatMap((control) =>
              "shore" in control ? control.shore : []
            )
          : []),
        ...starts,
      ])
        samplePoints.set(key(point), { x: point.x, y: point.y });
      // Nearby unwritten controls expose freshwater/adjacency without equating them with network identity.
      for (const write of writes.filter((write) => write.caseId.startsWith("isolated"))) {
        const point = { x: write.x, y: write.y + 1 };
        samplePoints.set(key(point), point);
      }
      let finalized = false;
      const captureWaterConnectivity = () => {
        const water = grid.map(({ x, y }) =>
          observe(GameplayMap, "GameplayMap", "isWater", [x, y], "boolean")
        );
        const lake = grid.map(({ x, y }) =>
          observe(GameplayMap, "GameplayMap", "isLake", [x, y], "boolean")
        );
        const elevation = grid.map(({ x, y }) =>
          observe(GameplayMap, "GameplayMap", "getElevation", [x, y])
        );
        const areaId = grid.map(({ x, y }) =>
          observe(GameplayMap, "GameplayMap", "getAreaId", [x, y])
        );
        const areaIsWater = grid.map(({ x, y }) =>
          observe(GameplayMap, "GameplayMap", "getAreaIsWater", [x, y], "boolean")
        );
        const landmassRegionId = grid.map(({ x, y }) =>
          observe(GameplayMap, "GameplayMap", "getLandmassRegionId", [x, y])
        );
        const waterAreaIds = [
          ...new Set(
            areaId.filter(
              (value, cell): value is number =>
                typeof value === "number" &&
                Number.isInteger(value) &&
                value >= 0 &&
                areaIsWater[cell] === true
            )
          ),
        ];
        // Row batches bound failure-heavy payloads too; a missing getter can otherwise repeat
        // thousands of unavailable records in one expensive transport series.
        for (let row = 0; row < probe.height; row++) {
          const startCell = row * probe.width,
            endCell = startCell + probe.width;
          emit("water-connectivity-grid", {
            checkpoint: stage,
            row,
            startCell,
            water: water.slice(startCell, endCell),
            lake: lake.slice(startCell, endCell),
            elevation: elevation.slice(startCell, endCell),
            areaId: areaId.slice(startCell, endCell),
            areaIsWater: areaIsWater.slice(startCell, endCell),
            landmassRegionId: landmassRegionId.slice(startCell, endCell),
          });
        }
        const riverOceanConnectivity = finalized
          ? grid.flatMap(({ x, y }) => {
              if (
                observe(GameplayMap, "GameplayMap", "getRiverType", [x, y]) !==
                classes.RIVER_NAVIGABLE
              )
                return [];
              const plotIndex = observe(GameplayMap, "GameplayMap", "getIndexFromXY", [x, y]);
              return [
                {
                  cell: index({ x, y }),
                  plotIndex,
                  connectedToOcean:
                    typeof plotIndex === "number" &&
                    Number.isInteger(plotIndex) &&
                    plotIndex >= 0 &&
                    plotIndex < grid.length
                      ? observe(
                          nativeRivers,
                          "MapRivers",
                          "isRiverConnectedToOcean",
                          [plotIndex],
                          "boolean"
                        )
                      : unavailable(
                          "MapRivers.isRiverConnectedToOcean",
                          "plot-index-unavailable-or-invalid"
                        ),
                },
              ];
            })
          : [];
        return {
          cellCount: grid.length,
          rowCount: probe.height,
          dataStage: "water-connectivity-grid",
          // Shipped map-utilities.js guards this area-ID call by getAreaIsWater and nonnegative ID.
          waterAreaOceanConnectivity: waterAreaIds.map((id) => ({
            areaId: id,
            connectedToOcean: observe(
              AreaBuilder,
              "AreaBuilder",
              "isAreaConnectedToOcean",
              [id],
              "boolean"
            ),
          })),
          riverOceanConnectivity,
          riverOceanConnectivityGate: finalized
            ? "observed-navigable-cells-only"
            : "before-finalization",
          qualification:
            "All arrays use x+y*width. Terrain and riverClass are the adjacent full-grid arrays. LandmassRegionId is the authored player region, not a connected-water identity. Area ocean calls require observed water-area membership; river ocean calls require finalized observed NAV. Omitted cells are not negative connectivity observations.",
        };
      };
      const capture = () =>
        emit(stage, {
          ...(waterConnectivity ? { waterConnectivity: captureWaterConnectivity() } : {}),
          ...(isLowerBoundAtlas && stage === "after-elevation-write" && waterConnectivity
            ? {
                lowerBoundAdjacency: waterConnectivity.isolated.map(({ caseId, cells }) => ({
                  caseId,
                  cells: cells.map((point) => ({
                    ...point,
                    neighbors: RIVER_DIRECTIONS.map((directionSymbol) => ({
                      directionSymbol,
                      location: observe(
                        GameplayMap,
                        "GameplayMap",
                        "getAdjacentPlotLocation",
                        [point, directions[directionSymbol]],
                        "xy"
                      ),
                    })),
                  })),
                })),
              }
            : {}),
          ...(isTerrainAtlas && stage === "initialized"
            ? {
                setupTerrainAdmission: {
                  elevationInputApplied: false,
                  qualification:
                    "These two setup snapshots bracket terrain validation before setElevation; initialized surface observations below follow elevation authorship.",
                  beforeValidation: beforeSetupValidation,
                  afterValidation: afterSetupValidation,
                },
              }
            : {}),
          terrain: grid.map(({ x, y }) =>
            observe(GameplayMap, "GameplayMap", "getTerrainType", [x, y])
          ),
          riverClass: grid.map(({ x, y }) =>
            observe(GameplayMap, "GameplayMap", "getRiverType", [x, y])
          ),
          surfaces: [...samplePoints.values()].map(({ x, y }) => {
            const plotIndex = observe(GameplayMap, "GameplayMap", "getIndexFromXY", [x, y]);
            const riverClass = observe(GameplayMap, "GameplayMap", "getRiverType", [x, y]);
            // Match the shipped navigable-class precondition; never probe an unfinished river object.
            const oceanConnectivity = !finalized
              ? { status: "skipped", reason: "before-finalization" }
              : riverClass !== classes.RIVER_NAVIGABLE
                ? typeof riverClass === "number"
                  ? { status: "skipped", reason: "not-observed-navigable" }
                  : unavailable("MapRivers.isRiverConnectedToOcean", "river-class-unavailable")
                : typeof plotIndex === "number" &&
                    Number.isInteger(plotIndex) &&
                    plotIndex >= 0 &&
                    plotIndex < grid.length
                  ? observe(
                      nativeRivers,
                      "MapRivers",
                      "isRiverConnectedToOcean",
                      [plotIndex],
                      "boolean"
                    )
                  : unavailable(
                      "MapRivers.isRiverConnectedToOcean",
                      "plot-index-unavailable-or-invalid"
                    );
            return {
              x,
              y,
              arrayIndex: index({ x, y }),
              plotIndex,
              ...(usesAdapter ? { requested: requestedAt(x, y) } : {}),
              terrain: observe(GameplayMap, "GameplayMap", "getTerrainType", [x, y]),
              riverClass,
              elevation: observe(GameplayMap, "GameplayMap", "getElevation", [x, y]),
              feature: observe(GameplayMap, "GameplayMap", "getFeatureType", [x, y]),
              water: observe(GameplayMap, "GameplayMap", "isWater", [x, y], "boolean"),
              lake: observe(GameplayMap, "GameplayMap", "isLake", [x, y], "boolean"),
              river: observe(GameplayMap, "GameplayMap", "isRiver", [x, y], "boolean"),
              navigable: observe(GameplayMap, "GameplayMap", "isNavigableRiver", [x, y], "boolean"),
              freshwater: observe(GameplayMap, "GameplayMap", "isFreshWater", [x, y], "boolean"),
              adjacentToRivers: observe(
                GameplayMap,
                "GameplayMap",
                "isAdjacentToRivers",
                [x, y, 1],
                "boolean"
              ),
              // Shipped map-utilities.js passes a PLOT index here, never a network ordinal.
              oceanConnectivity,
            };
          }),
          networks: observeNetworks(nativeRivers, finalized),
          edgeDirectionReadback: unavailable("river-edge/direction", "no-confirmed-getter"),
        });
      if (isLowerBoundAtlas) {
        stage = "after-elevation-write";
        capture();
        stage = "initialize-water-cache";
        TerrainBuilder.storeWaterData();
      }
      stage = "initialized";
      capture();
      stage = "write";
      let writeFailures = 0;
      for (const write of writes) {
        const nativeDirection = directions[write.directionSymbol]!;
        const nativeClass = classes[`RIVER_${write.riverClass}`]!;
        const args = [{ x: write.x, y: write.y }, nativeDirection];
        const gameplayAdjacency = observe(
          GameplayMap,
          "GameplayMap",
          "getAdjacentPlotLocation",
          args,
          "xy"
        );
        const control = isTerrainAtlas
          ? RIVER_TERRAIN_CONTROLS.find((entry) => entry.caseId === write.caseId)
          : undefined;
        const barrierInteraction = !control
          ? null
          : key(write) === key(control.barrier)
            ? "outgoing-source"
            : key(write.expectedReceiver) === key(control.barrier)
              ? "incoming-receiver"
              : "neither";
        const before = usesAdapter
          ? {
              source: observeTerrainPoint(write),
              receiver: observeTerrainPoint(write.expectedReceiver),
            }
          : null;
        let outcome: unknown = { status: "returned" };
        try {
          if (adapter)
            adapter.setRiverInfo({
              x: write.x,
              y: write.y,
              direction: write.directionSymbol,
              riverClass: write.riverClass,
            });
          else TerrainBuilder.setRiverInfo(write.x, write.y, nativeDirection, nativeClass);
        } catch (cause) {
          writeFailures++;
          outcome = unavailable(
            adapter ? "Civ7Adapter.setRiverInfo" : "TerrainBuilder.setRiverInfo",
            "threw",
            String(cause)
          );
        }
        emit(stage, {
          ...write,
          nativeDirection,
          nativeClass,
          gameplayAdjacency,
          outcome,
          ...(isTerrainAtlas
            ? {
                terrainAdmission: {
                  barrierInteraction,
                  before,
                  after: {
                    source: observeTerrainPoint(write),
                    receiver: observeTerrainPoint(write.expectedReceiver),
                  },
                },
              }
            : {}),
          ...(isLakeAtlas
            ? {
                lakeAdmission: {
                  role: write.role,
                  before,
                  after: {
                    source: observeTerrainPoint(write),
                    receiver: observeTerrainPoint(write.expectedReceiver),
                  },
                },
              }
            : {}),
        });
      }
      const phases: ReadonlyArray<readonly [string, () => void]> = [
        ["after-write", () => {}],
        [
          "after-finalize-once",
          () => {
            if (adapter) adapter.finalizeRivers(settings);
            else TerrainBuilder.finalizeRivers(settings[0], settings[1], settings[2], settings[3]);
            finalized = true;
          },
        ],
        ["after-floodplains", () => TerrainBuilder.addFloodplains(4, 10)],
        ["after-validate", () => TerrainBuilder.validateAndFixTerrain()],
        ["after-areas", () => AreaBuilder.recalculateAreas()],
        ["after-water-cache", () => TerrainBuilder.storeWaterData()],
        ["after-fertility", () => FertilityBuilder.recalculate()],
        [
          "after-starts",
          () =>
            starts.forEach(({ x, y }, i) =>
              StartPositioner.setStartPosition(GameplayMap.getIndexFromXY(x, y), players[i]!)
            ),
        ],
      ];
      for (const [name, run] of phases) {
        stage = name;
        run();
        capture();
      }
      for (const line of encodeBoundedJsonLogLines({
        marker: "[mapgen-complete]",
        payload: {
          proofId,
          variant,
          atlasKind,
          diagnosticRevision: probe.diagnosticRevision,
          seed: GameplayMap.getRandomSeed(),
          fixture: probe.id,
          observationsOnly: true,
          completedCheckpoints: RIVER_CHECKPOINTS,
          ...(isLowerBoundAtlas ? { immediateElevationCheckpoint: "after-elevation-write" } : {}),
          writeFailures,
          ...(waterConnectivity
            ? {
                fixtureSourceSha256: waterConnectivity.fixtureSourceSha256,
                expectedLakeSizeCutoff: waterConnectivity.probe.expectedLakeSizeCutoff,
              }
            : {}),
          parityClaim: "none; native edge/direction semantics remain unconfirmed",
        },
      }))
        console.log(line);
    } catch (cause) {
      emit(stage, { message: String(cause).slice(0, 180) }, "[mapgen-failure]");
      throw cause;
    }
  });
}

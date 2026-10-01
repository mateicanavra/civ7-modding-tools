import { getCiv7StandardMapSizePreset } from "@civ7/map-policy";
import {
  RIVER_DIRECTIONS,
  RIVER_PROBE,
  type RiverProbeWrite,
  riverProbeExpectedReceiver,
} from "./river-contract-map.fixture.js";

/** Two otherwise identical Tiny maps isolate the native DB cutoff from authored connectivity. */
export const WATER_CONNECTIVITY_ATLASES = [
  "water-connectivity-cutoff-5",
  "water-connectivity-cutoff-10",
] as const;
export type WaterConnectivityAtlas = (typeof WATER_CONNECTIVITY_ATLASES)[number];
type XY = Readonly<{ x: number; y: number }>;
type Terrain = "OCEAN" | "COAST" | "FLAT";

/** Source geometry, not a statement about the native component or lake classification. */
export const WATER_CONNECTIVITY_CONTROLS = (
  ["coast-strait", "navigable-outlet", "minor-outlet", "closed"] as const
).flatMap((connection, mode) =>
  ([5, 6] as const).map((size, pair) => {
    const y = 3 + mode * 8 + pair * 4;
    const cells = Array.from({ length: size }, (_, index) => ({
      x: 10 + (index % 3),
      y: y + Math.floor(index / 3),
    }));
    return {
      caseId: `${connection}-${size}`,
      connection,
      size,
      cells,
      wetOutlet: { x: 10, y },
      connector: [450, 380, 310, 240, 200, 180, 160].map((elevation, index) => ({
        x: 9 - index,
        y,
        elevation,
      })),
      oceanReceiver: { x: 2, y },
    };
  })
);

/** Neighbors of both thresholds expose strict-versus-inclusive classification without fitting it. */
export const WATER_CONNECTIVITY_ISOLATED = [4, 5, 6, 9, 10, 11].map((size, index) => ({
  caseId: `isolated-${size}`,
  size,
  cells: Array.from({ length: size }, (_, cell) => ({
    x: 30 + (index % 2) * 13 + (cell % 4),
    y: 6 + Math.floor(index / 2) * 8 + Math.floor(cell / 4),
  })),
}));

/** Exact selector admission shared by the existing builder and registration path. */
export function isWaterConnectivityAtlas(atlas: string): atlas is WaterConnectivityAtlas {
  return (WATER_CONNECTIVITY_ATLASES as readonly string[]).includes(atlas);
}

/** Unique revisions leave every earlier river and water-height treatment unchanged. */
export function waterConnectivityProbe(atlasKind: WaterConnectivityAtlas) {
  if (!isWaterConnectivityAtlas(atlasKind))
    throw new Error(`Unknown water-connectivity atlas: ${atlasKind}`);
  const cutoff = atlasKind === "water-connectivity-cutoff-5" ? 5 : 10;
  return {
    ...RIVER_PROBE,
    diagnosticRevision: cutoff === 5 ? 13 : 14,
    displayLabel: `Water Connectivity Cutoff ${cutoff} V${cutoff === 5 ? 13 : 14}`,
    atlasKind,
    mapSize: "MAPSIZE_TINY",
    expectedLakeSizeCutoff: cutoff,
  } as const;
}

const key = ({ x, y }: XY) => `${x},${y}`;
const basinCells = new Set(
  [...WATER_CONNECTIVITY_CONTROLS, ...WATER_CONNECTIVITY_ISOLATED].flatMap(({ cells }) =>
    cells.map(key)
  )
);
const straitCells = new Set(
  WATER_CONNECTIVITY_CONTROLS.filter(({ connection }) => connection === "coast-strait").flatMap(
    ({ connector }) => connector.map(key)
  )
);

/** The only terrain difference between translated connection cases is ordinary strait water. */
export function waterConnectivityTerrainAt(x: number, y: number): Terrain {
  if (basinCells.has(key({ x, y })) || straitCells.has(key({ x, y }))) return "COAST";
  if (x < 2 || x >= 58 || y < 1 || y >= 37) return "OCEAN";
  if (x === 2 || x === 57 || y === 1 || y === 36) return "COAST";
  return "FLAT";
}

/** Basin, shore and connector heights are held across classes and DB-cutoff treatments. */
export function buildWaterConnectivityElevation(): number[] {
  const values: number[] = Array.from(
    { length: RIVER_PROBE.width * RIVER_PROBE.height },
    (_, cell) => {
      const x = cell % RIVER_PROBE.width,
        y = Math.floor(cell / RIVER_PROBE.width);
      return x <= 2 || x >= 57 || y <= 1 || y >= 36 ? 0 : 700;
    }
  );
  for (const control of [...WATER_CONNECTIVITY_CONTROLS, ...WATER_CONNECTIVITY_ISOLATED]) {
    for (const point of control.cells) values[point.x + point.y * RIVER_PROBE.width] = 572;
  }
  for (const control of WATER_CONNECTIVITY_CONTROLS) {
    for (const point of control.connector)
      values[point.x + point.y * RIVER_PROBE.width] = point.elevation;
  }
  return values;
}

/** Only NAV gets the qualified wet-outlet declaration; MINOR has dry sources and no invented wet write. */
export function buildWaterConnectivityWrites(): RiverProbeWrite[] {
  const writes: RiverProbeWrite[] = [];
  for (const control of WATER_CONNECTIVITY_CONTROLS) {
    if (control.connection !== "navigable-outlet" && control.connection !== "minor-outlet")
      continue;
    const riverClass = control.connection === "navigable-outlet" ? "NAVIGABLE" : "MINOR";
    const add = (point: XY, role: string) =>
      writes.push({
        ...point,
        caseId: control.caseId,
        role,
        directionSymbol: "WEST",
        riverClass,
        expectedReceiver: riverProbeExpectedReceiver(point, "WEST", true),
      });
    for (const point of control.connector) add(point, "dry-outlet");
    if (riverClass === "NAVIGABLE") add(control.wetOutlet, "qualified-wet-nav-outlet");
  }
  return writes;
}

/** Composition input for the existing river atlas lifecycle, not another diagnostic harness. */
export function buildWaterConnectivityFixture(
  atlasKind: WaterConnectivityAtlas,
  fixtureSourceSha256: string
) {
  if (!/^[0-9a-f]{64}$/.test(fixtureSourceSha256))
    throw new Error("Invalid water-connectivity source identity.");
  return {
    probe: waterConnectivityProbe(atlasKind),
    fixtureSourceSha256,
    terrainAt: waterConnectivityTerrainAt,
    heights: buildWaterConnectivityElevation(),
    writes: buildWaterConnectivityWrites(),
    controls: WATER_CONNECTIVITY_CONTROLS,
    isolated: WATER_CONNECTIVITY_ISOLATED,
    qualification:
      "Source-requested water geometry only. Native lake, water area, heights and ocean access are independent observations. NAV has a qualified wet outlet; MINOR deliberately has no wet source. Completion is not connectivity or movement acceptance.",
  };
}

/** The narrowly scoped extension accepted by the existing atlas registration function. */
export type WaterConnectivityFixture = ReturnType<typeof buildWaterConnectivityFixture>;

/** A separate stock-Tiny arm measures native wet and dry requests around the observed land floor. */
export const WATER_LOWER_BOUND_ATLAS = "water-closed-lower-bound";
export type WaterLowerBoundAtlas = typeof WATER_LOWER_BOUND_ATLAS;
const lowerBoundTiny = getCiv7StandardMapSizePreset("MAPSIZE_TINY");

/** Public Tiny metadata is held; this arm introduces no lake-cutoff database treatment. */
export const WATER_LOWER_BOUND_PROBE = {
  ...RIVER_PROBE,
  diagnosticRevision: 15,
  displayLabel: "Closed Water Lower Bound V15",
  atlasKind: WATER_LOWER_BOUND_ATLAS,
  width: lowerBoundTiny.dimensions.width,
  height: lowerBoundTiny.dimensions.height,
  playerCount: lowerBoundTiny.defaultPlayers,
  mapSize: lowerBoundTiny.id,
  expectedLakeSizeCutoff: lowerBoundTiny.mapInfo.LakeSizeCutoff,
} as const;

/** Translations preserve row parity and body shape; every adjacent dry shore is requested explicitly. */
export const WATER_LOWER_BOUND_CONTROLS = [
  { caseId: "wet-0-shore-129", wetElevationInput: 0, shoreElevationInput: 129 },
  { caseId: "wet-0-shore-128", wetElevationInput: 0, shoreElevationInput: 128 },
  { caseId: "wet-0-shore-127", wetElevationInput: 0, shoreElevationInput: 127 },
  { caseId: "wet-minus-1-shore-128", wetElevationInput: -1, shoreElevationInput: 128 },
].map((control, index) => {
  const cells = Array.from({ length: 4 }, (_, cell) => ({
    x: 10 + (index % 2) * 12 + (cell % 2),
    y: 8 + Math.floor(index / 2) * 12 + Math.floor(cell / 2),
  }));
  const water = new Set(cells.map(key));
  const shore = new Map<string, XY>();
  for (const cell of cells) {
    for (const direction of RIVER_DIRECTIONS) {
      const point = riverProbeExpectedReceiver(cell, direction, false);
      if (!water.has(key(point))) shore.set(key(point), point);
    }
  }
  return { ...control, size: cells.length, cells, shore: [...shore.values()] };
});

const lowerBoundBasinCells = new Set(
  WATER_LOWER_BOUND_CONTROLS.flatMap(({ cells }) => cells.map(key))
);

/** The four closed COAST bodies share an otherwise fixed land interior and original marine border. */
export function waterLowerBoundTerrainAt(x: number, y: number): Terrain {
  if (lowerBoundBasinCells.has(key({ x, y }))) return "COAST";
  if (x < 2 || x >= 58 || y < 1 || y >= 37) return "OCEAN";
  if (x === 2 || x === 57 || y === 1 || y === 36) return "COAST";
  return "FLAT";
}

/** These are native numeric setter requests, not physical terrain, water heads, or product calibration. */
export function buildWaterLowerBoundElevation(): number[] {
  const values: number[] = Array.from(
    { length: lowerBoundTiny.dimensions.width * lowerBoundTiny.dimensions.height },
    (_, cell) => {
      const x = cell % lowerBoundTiny.dimensions.width;
      const y = Math.floor(cell / lowerBoundTiny.dimensions.width);
      return x <= 2 || x >= 57 || y <= 1 || y >= 36 ? 0 : 700;
    }
  );
  for (const control of WATER_LOWER_BOUND_CONTROLS) {
    for (const point of control.cells)
      values[point.x + point.y * lowerBoundTiny.dimensions.width] = control.wetElevationInput;
    for (const point of control.shore)
      values[point.x + point.y * lowerBoundTiny.dimensions.width] = control.shoreElevationInput;
  }
  return values;
}

/** Reuses the existing diagnostic lifecycle and bounded observations without river writes or a new harness. */
export function buildWaterLowerBoundFixture(fixtureSourceSha256: string) {
  if (!/^[0-9a-f]{64}$/.test(fixtureSourceSha256))
    throw new Error("Invalid water-lower-bound source identity.");
  const writes: RiverProbeWrite[] = [];
  return {
    probe: WATER_LOWER_BOUND_PROBE,
    fixtureSourceSha256,
    terrainAt: waterLowerBoundTerrainAt,
    heights: buildWaterLowerBoundElevation(),
    writes,
    controls: [],
    isolated: WATER_LOWER_BOUND_CONTROLS,
    qualification:
      "Native numeric requests only: four translated closed 4-cell COAST bodies and complete adjacent dry shores under the declared odd-row geometry. The wet setter may ignore a requested value; all body and shore native readbacks immediately after setElevation and at every maintenance checkpoint are independent evidence. Stock Tiny metadata is held. No physical terrain, lake-head policy, movement, or lower-bound acceptance claim.",
  };
}

/** The sole finite lower-bound fixture accepted by the existing atlas registration. */
export type WaterLowerBoundFixture = ReturnType<typeof buildWaterLowerBoundFixture>;

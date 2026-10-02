import { getCiv7StandardMapSizePreset } from "@civ7/map-policy";
import { sha256Hex, stableStringify } from "@swooper/mapgen-core/trace";
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
/** Stock Tiny control for the original-input replay slot, without a database treatment. */
export const WATER_CONNECTIVITY_STOCK_ATLAS = "water-connectivity-stock-6";
/** The sole treatment replays original requests after validation, not native readbacks. */
export const WATER_CONNECTIVITY_REPLAY_ATLAS = "water-connectivity-stock-6-original-replay";
export type WaterConnectivityAtlas =
  | (typeof WATER_CONNECTIVITY_ATLASES)[number]
  | typeof WATER_CONNECTIVITY_STOCK_ATLAS
  | typeof WATER_CONNECTIVITY_REPLAY_ATLAS;
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
  return (
    (WATER_CONNECTIVITY_ATLASES as readonly string[]).includes(atlas) ||
    atlas === WATER_CONNECTIVITY_STOCK_ATLAS ||
    atlas === WATER_CONNECTIVITY_REPLAY_ATLAS
  );
}

/** Unique revisions leave every earlier river and water-height treatment unchanged. */
export function waterConnectivityProbe(atlasKind: WaterConnectivityAtlas) {
  if (!isWaterConnectivityAtlas(atlasKind))
    throw new Error(`Unknown water-connectivity atlas: ${atlasKind}`);
  if (
    atlasKind === WATER_CONNECTIVITY_STOCK_ATLAS ||
    atlasKind === WATER_CONNECTIVITY_REPLAY_ATLAS
  ) {
    const replay = atlasKind === WATER_CONNECTIVITY_REPLAY_ATLAS;
    return {
      ...RIVER_PROBE,
      diagnosticRevision: replay ? 17 : 16,
      displayLabel: replay
        ? "Stock Tiny Original Elevation Replay V17"
        : "Stock Tiny Water Control V16",
      atlasKind,
      width: lowerBoundTiny.dimensions.width,
      height: lowerBoundTiny.dimensions.height,
      playerCount: lowerBoundTiny.defaultPlayers,
      mapSize: lowerBoundTiny.id,
      expectedLakeSizeCutoff: lowerBoundTiny.mapInfo.LakeSizeCutoff,
    } as const;
  }
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

/** Declared physical heads, not generated hydrology or native setter acceptance. */
export const WATER_DECLARED_FINITE_HEAD_ATLAS = "water-declared-finite-head";
export type WaterDeclaredFiniteHeadAtlas = typeof WATER_DECLARED_FINITE_HEAD_ATLAS;
export const WATER_DECLARED_FINITE_HEAD_PROBE = {
  ...WATER_LOWER_BOUND_PROBE,
  diagnosticRevision: 25,
  displayLabel: "Declared Finite Water Head V25",
  atlasKind: WATER_DECLARED_FINITE_HEAD_ATLAS,
} as const;

/** Six primary cases hold physical ground separately from water head and complete shore ground. */
export function buildDeclaredFiniteHeadModel() {
  const { width, height } = lowerBoundTiny.dimensions;
  const ground = Array<number>(width * height).fill(70);
  const externalWaterMask = Array<number>(width * height).fill(0);
  const acceptedWaterMask = Array<number>(width * height).fill(0);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (x <= 2 || x >= 57 || y <= 1 || y >= 36) {
        ground[x + y * width] = 0;
        externalWaterMask[x + y * width] = 1;
      }
  const seaLevel = 10;
  const body = (caseId: string, x: number, y: number, bed: number, head: number) => {
    const cells = Array.from({ length: 4 }, (_, cell) => ({
      x: x + (cell % 2),
      y: y + Math.floor(cell / 2),
    }));
    const wet = new Set(cells.map(key));
    const shore = new Map<string, XY>();
    for (const point of cells)
      for (const direction of RIVER_DIRECTIONS) {
        const adjacent = riverProbeExpectedReceiver(point, direction, false);
        if (!wet.has(key(adjacent))) shore.set(key(adjacent), adjacent);
      }
    for (const point of cells) {
      ground[point.x + point.y * width] = bed;
      acceptedWaterMask[point.x + point.y * width] = 1;
    }
    for (const point of shore.values()) ground[point.x + point.y * width] = 13;
    return { caseId, size: cells.length, cells, shore: [...shore.values()], ground: bed, head };
  };
  const controls = ([11, 10, 9] as const).flatMap((head, row) => {
    const y = 4 + row * 10;
    return [
      {
        ...body(`closed-head-${head}`, 30, y, 7, head),
        state: "closed" as const,
        outlet: null,
        connector: [] as Array<XY & { ground: number }>,
        receiverCaseId: null,
      },
      {
        ...body(`open-head-${head}`, 16, y, 7, head),
        state: "open" as const,
        outlet: { x: 16, y },
        connector: [head, head, head - 1, head - 1, 8, 8].map((value, cell) => ({
          x: 15 - cell,
          y,
          ground: value,
        })),
        receiverCaseId: `finite-receiver-${head}`,
      },
    ];
  });
  const receivers = ([11, 10, 9] as const).map((head, row) => ({
    ...body(`finite-receiver-${head}`, 8, 4 + row * 10, 6, 8),
    state: "closed" as const,
  }));
  for (const control of controls)
    for (const point of control.connector) ground[point.x + point.y * width] = point.ground;
  const complete = <T extends { shore: XY[] }>(control: T) => {
    const { shore, ...body } = control;
    return {
      ...body,
      shore: shore.map((point) => ({ ...point, ground: ground[point.x + point.y * width]! })),
      spill: Math.min(...shore.map((point) => ground[point.x + point.y * width]!)),
    };
  };
  return {
    width,
    height,
    seaLevel,
    nativeHeadScale: 10,
    ground,
    externalWaterMask,
    acceptedWaterMask,
    controls: controls.map(complete),
    receivers: receivers.map(complete),
    qualification:
      "Declared projection-consumer data only, not a procedural or certified hydrology solve. Primary closed heads lie below complete shore sills; open heads equal their outlet sill and drain toward lower finite receivers, never the higher marine datum. Native class and native numeric water level remain independent observations.",
  };
}
export type DeclaredFiniteHeadModel = ReturnType<typeof buildDeclaredFiniteHeadModel>;

/** Refuses malformed declarations before the existing atlas can mutate the native map. */
export function assertDeclaredFiniteHeadModel(model: DeclaredFiniteHeadModel): void {
  const size = model.width * model.height;
  if (
    model.width !== 60 ||
    model.height !== 38 ||
    model.seaLevel !== 10 ||
    model.nativeHeadScale !== 10
  )
    throw new Error("Declared finite-head witness requires the fixed stock Tiny physical datum.");
  for (const values of [model.ground, model.externalWaterMask, model.acceptedWaterMask])
    if (values.length !== size)
      throw new Error("Incomplete declared finite-head physical surface.");
  for (let cell = 0; cell < size; cell++) {
    if (
      !Number.isInteger(model.ground[cell]) ||
      model.ground[cell]! < -32768 ||
      model.ground[cell]! > 32767
    )
      throw new Error("Declared physical ground must retain exact Int16 samples.");
    for (const mask of [model.externalWaterMask, model.acceptedWaterMask])
      if (mask[cell] !== 0 && mask[cell] !== 1) throw new Error("Nonbinary declared water mask.");
    if (model.externalWaterMask[cell] === 1 && model.acceptedWaterMask[cell] === 1)
      throw new Error("External and finite water declarations overlap.");
  }
  if (model.controls.length !== 6 || model.receivers.length !== 3)
    throw new Error(
      "Declared finite-head witness requires six primary bodies and three finite receivers."
    );
  const primaryKinds = new Set(model.controls.map(({ state, head }) => `${state}/${head}`));
  if (
    ["closed", "open"].some((state) =>
      [9, 10, 11].some((head) => !primaryKinds.has(`${state}/${head}`))
    )
  )
    throw new Error(
      "Declared finite-head witness requires every closed/open head regime exactly once."
    );
  const membership = new Set<string>();
  const ids = new Set<string>();
  for (const control of [...model.controls, ...model.receivers]) {
    if (
      ids.has(control.caseId) ||
      control.cells.length !== 4 ||
      control.size !== 4 ||
      !Number.isFinite(control.head) ||
      !Number.isFinite(control.spill) ||
      !(control.ground < control.head)
    )
      throw new Error("Invalid declared finite-water body or head.");
    ids.add(control.caseId);
    const wet = new Set(control.cells.map(key));
    const expectedShore = new Set<string>();
    for (const point of control.cells) {
      const cell = point.x + point.y * model.width;
      if (
        !Number.isInteger(point.x) ||
        !Number.isInteger(point.y) ||
        point.x < 3 ||
        point.x > 56 ||
        point.y < 2 ||
        point.y > 35 ||
        membership.has(key(point)) ||
        model.acceptedWaterMask[cell] !== 1 ||
        model.externalWaterMask[cell] !== 0 ||
        model.ground[cell] !== control.ground
      )
        throw new Error("Declared finite-water membership is not exact and disjoint.");
      membership.add(key(point));
      for (const direction of RIVER_DIRECTIONS) {
        const adjacent = riverProbeExpectedReceiver(point, direction, false);
        if (!wet.has(key(adjacent))) expectedShore.add(key(adjacent));
      }
    }
    const actualShore = new Set(control.shore.map(key));
    if (
      actualShore.size !== control.shore.length ||
      actualShore.size !== expectedShore.size ||
      [...expectedShore].some((point) => !actualShore.has(point)) ||
      control.shore.some(
        (point) =>
          model.acceptedWaterMask[point.x + point.y * model.width] !== 0 ||
          model.externalWaterMask[point.x + point.y * model.width] !== 0 ||
          point.ground !== model.ground[point.x + point.y * model.width]
      ) ||
      Math.min(...control.shore.map((point) => point.ground)) !== control.spill ||
      control.head > control.spill
    )
      throw new Error("Declared finite-water shore or sill is incomplete or inconsistent.");
  }
  if (model.acceptedWaterMask.reduce((sum, value) => sum + value, 0) !== membership.size)
    throw new Error("Unowned declared finite-water cells.");
  for (const control of model.controls) {
    if (control.state === "closed") {
      if (
        !(control.head < control.spill) ||
        control.outlet !== null ||
        control.connector.length !== 0 ||
        control.receiverCaseId !== null
      )
        throw new Error("Invalid closed partial-fill declaration.");
      continue;
    }
    const receiver = model.receivers.find(({ caseId }) => caseId === control.receiverCaseId);
    if (
      !receiver ||
      !(receiver.head < control.head) ||
      control.head !== control.spill ||
      !control.outlet ||
      !control.cells.some((point) => key(point) === key(control.outlet!)) ||
      control.connector.length !== 6
    )
      throw new Error(
        "Open water requires its exact sill and a lower finite receiver, not marine water."
      );
    let from: XY = control.outlet;
    let previousGround = control.head;
    for (const point of control.connector) {
      if (
        key(riverProbeExpectedReceiver(from, "WEST", false)) !== key(point) ||
        model.ground[point.x + point.y * model.width] !== point.ground ||
        point.ground > previousGround ||
        model.acceptedWaterMask[point.x + point.y * model.width] !== 0 ||
        model.externalWaterMask[point.x + point.y * model.width] !== 0
      )
        throw new Error("Invalid finite descending outlet geometry.");
      from = point;
      previousGround = point.ground;
    }
    const destination = riverProbeExpectedReceiver(from, "WEST", false);
    if (!receiver.cells.some((point) => key(point) === key(destination)))
      throw new Error("Declared outlet does not terminate in its lower finite receiver.");
  }
}

/** Runtime consumes the authentic build-time Standard requests; it never reimplements projection. */
export function buildWaterDeclaredFiniteHeadFixture(
  fixtureSourceSha256: string,
  nativeRequests: readonly number[],
  physicalPayloadSha256: string,
  nativeRequestsSha256: string
) {
  const physical = buildDeclaredFiniteHeadModel();
  assertDeclaredFiniteHeadModel(physical);
  if (
    ![fixtureSourceSha256, physicalPayloadSha256, nativeRequestsSha256].every((hash) =>
      /^[0-9a-f]{64}$/.test(hash)
    ) ||
    sha256Hex(stableStringify(physical)) !== physicalPayloadSha256 ||
    nativeRequests.length !== physical.width * physical.height ||
    nativeRequests.some((value) => !Number.isSafeInteger(value) || value < 0 || value > 65535) ||
    sha256Hex(stableStringify(nativeRequests)) !== nativeRequestsSha256
  )
    throw new Error("Declared finite-head physical or Standard request identity is invalid.");
  const writes: RiverProbeWrite[] = physical.controls.flatMap((control) =>
    control.outlet
      ? [control.outlet, ...control.connector].map((point, index) => ({
          x: point.x,
          y: point.y,
          caseId: control.caseId,
          role: index === 0 ? "qualified-wet-nav-outlet" : "dry-finite-outlet",
          directionSymbol: "WEST" as const,
          riverClass: "NAVIGABLE" as const,
          expectedReceiver: riverProbeExpectedReceiver(point, "WEST", true),
        }))
      : []
  );
  return {
    probe: WATER_DECLARED_FINITE_HEAD_PROBE,
    fixtureSourceSha256,
    terrainAt: (x: number, y: number): Terrain =>
      physical.acceptedWaterMask[x + y * physical.width] === 1
        ? "COAST"
        : waterLowerBoundTerrainAt(x, y) === "OCEAN"
          ? "OCEAN"
          : physical.externalWaterMask[x + y * physical.width] === 1
            ? "COAST"
            : "FLAT",
    heights: [...nativeRequests],
    writes,
    controls: physical.controls,
    isolated: physical.receivers,
    declaredFiniteHead: {
      physical,
      physicalPayloadSha256,
      standardProjection: {
        stageId: "map-elevation",
        stepId: "build-elevation",
        invocation:
          "public STANDARD_STAGES step with existing SDK test dependencies; build-time mock only",
        nativeRequests: [...nativeRequests],
        nativeRequestsSha256,
      },
    },
    qualification: physical.qualification,
  };
}
export type WaterDeclaredFiniteHeadFixture = ReturnType<typeof buildWaterDeclaredFiniteHeadFixture>;

import { encodeBoundedJsonLogLines } from "@swooper/mapgen-core/lib/log";

export const ELEVATION_PROBE = {
  id: "swooper-elevation-contract-v1",
  diagnosticRevision: 2,
  width: 60,
  height: 38,
  mapSeed: 1018,
  gameSeed: 1019,
  playerCount: 4,
} as const;

export const ELEVATION_SURFACES = [
  { name: "ocean", x: 0, y: 10 },
  { name: "coast", x: 2, y: 10 },
  { name: "enclosed-water-candidate", x: 22, y: 18 },
  { name: "flat", x: 8, y: 8 },
  { name: "hill", x: 12, y: 8 },
  { name: "mountain", x: 16, y: 8 },
  { name: "volcano", x: 20, y: 8 },
] as const;

const cliffSample = { name: "coastal-cliff-land", x: 3, y: 10 };
const starts = [8, 20, 38, 50].map((x) => ({ x, y: 26 }));
const scaleValues = [0, 1, 25, 100, 200, 350, 700, 1100, 1550];
const directions = ["EAST", "NORTHEAST", "NORTHWEST", "WEST", "SOUTHWEST", "SOUTHEAST"];

export const LAKE_LEVEL_CONTROLS = [
  { name: "low-input", lake: 0, shore: 500, outlet: 500 },
  { name: "candidate-surface-input", lake: 372, shore: 500, outlet: 500 },
  { name: "high-input", lake: 900, shore: 500, outlet: 500 },
  { name: "raised-shore", lake: 900, shore: 700, outlet: 700 },
  { name: "lowered-outlet", lake: 900, shore: 700, outlet: 450 },
] as const;

type XY = Readonly<{ x: number; y: number }>;
type TerrainName = "OCEAN" | "COAST" | "FLAT" | "HILL" | "MOUNTAIN";
type ProbeCase = "positive" | "zero" | "negative" | "fractional";

// These are private diagnostic host bindings, not inferred native API declarations.
declare const engine: {
  on(
    event: "RequestMapInitData",
    callback: (data: { width: number; height: number }) => void
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
declare const GameplayMap: {
  getGridWidth(): number;
  getGridHeight(): number;
  getRandomSeed(): number;
  getIndexFromXY(x: number, y: number): number;
  [key: string]: unknown;
};
declare const TerrainBuilder: {
  setTerrainType(x: number, y: number, terrain: number): void;
  setBiomeType(x: number, y: number, biome: number): void;
  setRainfall(x: number, y: number, rainfall: number): void;
  setLandmassRegionId(x: number, y: number, region: number): void;
  setFeatureType(
    x: number,
    y: number,
    feature: { Feature: number; Direction: number; Elevation: number }
  ): void;
  validateAndFixTerrain(): void;
  stampContinents(): void;
  buildElevation(): void;
  setElevation(values: number[]): void;
  generateCliffsFromElevation(): void;
  modelRivers(minLength: number, maxLength: number, terrain: number): void;
  addFloodplains(minLength: number, maxLength: number): void;
  storeWaterData(): void;
};
declare const AreaBuilder: { recalculateAreas(): void };
declare const FertilityBuilder: { recalculate(): void };
declare const Players: { getAliveMajorIds(): number[] };
declare const StartPositioner: { setStartPosition(plotIndex: number, player: number): void };
declare const LandmassRegion: { LANDMASS_REGION_WEST: number; LANDMASS_REGION_EAST: number };
declare const DirectionTypes: Record<string, unknown>;

export function probeTerrainAt(x: number, y: number): TerrainName {
  if (x < 2 || y < 2 || x >= ELEVATION_PROBE.width - 2 || y >= ELEVATION_PROBE.height - 2)
    return "OCEAN";
  if (x === 2 || y === 2 || x === ELEVATION_PROBE.width - 3 || y === ELEVATION_PROBE.height - 3)
    return "COAST";
  if (x >= 22 && x <= 23 && y >= 18 && y <= 19) return "COAST";
  if (y === 8 && (x === 16 || x === 20)) return "MOUNTAIN";
  if (y === 8 && x === 12) return "HILL";
  return "FLAT";
}

/** Full JS arrays, indexed x + y * width; no engine readback participates in the inputs. */
export function buildElevationProbeInput(probeCase: ProbeCase): number[] {
  const values = Array.from(
    { length: ELEVATION_PROBE.width * ELEVATION_PROBE.height },
    (_, index) => {
      const x = index % ELEVATION_PROBE.width;
      const y = Math.floor(index / ELEVATION_PROBE.width);
      const terrain = probeTerrainAt(x, y);
      return terrain === "OCEAN" || terrain === "COAST" ? 0 : 100 + 3 * x + 19 * y;
    }
  );
  scaleValues.forEach((value, index) => {
    values[10 + index * 3 + 12 * ELEVATION_PROBE.width] = value;
  });
  values[cliffSample.x + cliffSample.y * ELEVATION_PROBE.width] = 1550;
  if (probeCase !== "positive") {
    ELEVATION_SURFACES.forEach(({ x, y }, index) => {
      values[x + y * ELEVATION_PROBE.width] =
        probeCase === "zero" ? 0 : probeCase === "negative" ? -1 : [0.5, 25.75, 350.5][index % 3]!;
    });
  }
  return values;
}

/** Independent lake and shore controls; no assumed native leveling formula in the fixture. */
export function buildLakeElevationProbeInput(control: typeof LAKE_LEVEL_CONTROLS[number]): number[] {
  const values = buildElevationProbeInput("positive");
  for (let y = 17; y <= 20; y++) {
    for (let x = 21; x <= 24; x++) {
      values[x + y * ELEVATION_PROBE.width] =
        x >= 22 && x <= 23 && y >= 18 && y <= 19 ? control.lake : control.shore;
    }
  }
  values[24 + 18 * ELEVATION_PROBE.width] = control.outlet;
  return values;
}

function points(): XY[] {
  return Array.from({ length: ELEVATION_PROBE.width * ELEVATION_PROBE.height }, (_, index) => ({
    x: index % ELEVATION_PROBE.width,
    y: Math.floor(index / ELEVATION_PROBE.width),
  }));
}

function requireIndex(row: { $index: number } | undefined, label: string): number {
  if (!row || !Number.isInteger(row.$index)) throw new Error(`Missing game definition: ${label}`);
  return row.$index;
}

/** Missing, throwing, and non-JSON primitive observations remain distinct from native zero. */
function observe(name: string, args: readonly unknown[]): unknown {
  const getter = GameplayMap[name];
  if (typeof getter !== "function") return { status: "unavailable", member: name };
  try {
    const value: unknown = getter.apply(GameplayMap, args);
    if (typeof value === "number")
      return Number.isFinite(value) ? value : { status: "nonfinite", value: String(value) };
    if (typeof value === "boolean" || typeof value === "string" || value === null) return value;
    return { status: "unexpected-type", type: typeof value, value: String(value) };
  } catch (cause) {
    return { status: "threw", message: String(cause) };
  }
}

/** Installs only the diagnostic map's normal Civ7 lifecycle callbacks. */
export function registerElevationContractProbe(proofId: string): void {
  const emit = (stage: string, payload: unknown, marker = "[elevation-contract]") => {
    for (const line of encodeBoundedJsonLogLines({ marker, payload: { proofId, stage, payload } }))
      console.log(line);
  };
  engine.on("RequestMapInitData", (data) => {
    if (data.width !== ELEVATION_PROBE.width || data.height !== ELEVATION_PROBE.height)
      throw new Error("Elevation probe requires stock Tiny 60x38.");
    engine.call("SetMapInitData", data);
  });
  engine.on("GenerateMap", () => {
    let stage = "initialize";
    try {
      if (
        GameplayMap.getGridWidth() !== ELEVATION_PROBE.width ||
        GameplayMap.getGridHeight() !== ELEVATION_PROBE.height
      )
        throw new Error("Unexpected probe grid.");
      const grid = points();
      const terrainIds = Object.fromEntries(
        ["OCEAN", "COAST", "FLAT", "HILL", "MOUNTAIN", "NAVIGABLE_RIVER"].map((name) => [
          name,
          requireIndex(
            GameInfo.Terrains.find((row) => row.TerrainType === `TERRAIN_${name}`),
            name
          ),
        ])
      );
      const landBiome = requireIndex(
        GameInfo.Biomes.find((row) => row.BiomeType === "BIOME_GRASSLAND"),
        "BIOME_GRASSLAND"
      );
      const waterBiome = requireIndex(
        GameInfo.Biomes.find((row) => row.BiomeType === "BIOME_MARINE"),
        "BIOME_MARINE"
      );
      const volcano = requireIndex(
        GameInfo.Features.find((row) => row.FeatureType === "FEATURE_VOLCANO"),
        "FEATURE_VOLCANO"
      );
      const players = Players.getAliveMajorIds();
      if (players.length !== starts.length)
        throw new Error("Elevation probe requires four alive major players.");
      emit(stage, {
        ...ELEVATION_PROBE,
        actualSeed: GameplayMap.getRandomSeed(),
        terrainIds,
        landBiome,
        waterBiome,
        volcano,
        players,
        order: "x + y * width",
        nativeIndices: grid.map(({ x, y }) => GameplayMap.getIndexFromXY(x, y)),
        surfaces: ELEVATION_SURFACES,
        scaleValues,
      });
      for (const { x, y } of grid) {
        const terrain = probeTerrainAt(x, y);
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
          x < ELEVATION_PROBE.width / 2
            ? LandmassRegion.LANDMASS_REGION_WEST
            : LandmassRegion.LANDMASS_REGION_EAST
        );
      }
      TerrainBuilder.setFeatureType(20, 8, { Feature: volcano, Direction: -1, Elevation: 0 });
      TerrainBuilder.validateAndFixTerrain();
      AreaBuilder.recalculateAreas();
      TerrainBuilder.stampContinents();
      TerrainBuilder.storeWaterData();
      const capture = (extra: unknown = null) =>
        emit(stage, {
          extra,
          elevation:
            typeof GameplayMap.getElevation === "function"
              ? grid.map(({ x, y }) => observe("getElevation", [x, y]))
              : { status: "unavailable", member: "getElevation" },
          terrain: grid.map(({ x, y }) => observe("getTerrainType", [x, y])),
          surfaces: [...ELEVATION_SURFACES, cliffSample].map(({ name, x, y }) => ({
            name,
            x,
            y,
            elevation: observe("getElevation", [x, y]),
            terrain: observe("getTerrainType", [x, y]),
            feature: observe("getFeatureType", [x, y]),
            water: observe("isWater", [x, y]),
            lake: observe("isLake", [x, y]),
            cliffs: directions.map((name) => {
              const direction =
                typeof DirectionTypes === "undefined"
                  ? undefined
                  : DirectionTypes[`DIRECTION_${name}`];
              return {
                direction: name,
                value:
                  typeof direction === "number"
                    ? observe("isCliffCrossing", [x, y, direction])
                    : { status: "unavailable", member: `DirectionTypes.DIRECTION_${name}` },
              };
            }),
          })),
        });
      stage = "stock-build-elevation";
      TerrainBuilder.buildElevation();
      capture();
      for (const probeCase of ["positive", "zero", "negative", "fractional", "positive"] as const) {
        stage = `set-elevation-${probeCase}`;
        const input = buildElevationProbeInput(probeCase);
        let outcome: unknown = { status: "returned" };
        try {
          TerrainBuilder.setElevation(input);
        } catch (cause) {
          outcome = { status: "threw", message: String(cause) };
          if (probeCase === "positive") throw cause;
        }
        capture({ input, outcome });
      }
      for (const control of LAKE_LEVEL_CONTROLS) {
        stage = `lake-level-${control.name}`;
        const input = buildLakeElevationProbeInput(control);
        TerrainBuilder.setElevation(input);
        capture({ control, input });
      }
      stage = "restore-authored-elevation";
      TerrainBuilder.setElevation(buildElevationProbeInput("positive"));
      capture();
      // One stock baseline only: never rebuild elevation after the authored arrays.
      const phases: ReadonlyArray<readonly [string, () => void]> = [
        ["cliffs-first", () => TerrainBuilder.generateCliffsFromElevation()],
        ["cliffs-repeat-before-model-rivers", () => TerrainBuilder.generateCliffsFromElevation()],
        // Existing procedural river behavior, not authored river integration.
        [
          "after-model-rivers-5-15",
          () => TerrainBuilder.modelRivers(5, 15, terrainIds.NAVIGABLE_RIVER!),
        ],
        ["after-floodplains-4-10", () => TerrainBuilder.addFloodplains(4, 10)],
        ["after-validate", () => TerrainBuilder.validateAndFixTerrain()],
        ["after-recalculate-areas", () => AreaBuilder.recalculateAreas()],
        ["after-store-water-data", () => TerrainBuilder.storeWaterData()],
        ["after-fertility", () => FertilityBuilder.recalculate()],
        [
          "after-start-positions",
          () =>
            starts.forEach(({ x, y }, index) =>
              StartPositioner.setStartPosition(GameplayMap.getIndexFromXY(x, y), players[index]!)
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
          seed: GameplayMap.getRandomSeed(),
          fixture: ELEVATION_PROBE.id,
          observationsOnly: true,
        },
      }))
        console.log(line);
    } catch (cause) {
      emit(stage, { message: String(cause) }, "[mapgen-failure]");
      throw cause;
    }
  });
}

import type {
  Civ7ControlOrpcMapGridResult,
  Civ7ControlOrpcPlotSnapshotResult,
} from "./dependencies/direct-control";

type RuntimeProbe<T> = Readonly<
  | { ok: true; value: T }
  | { ok: false; error: string }
>;

type PlotField =
  Civ7ControlOrpcMapGridResult["fields"] extends ReadonlyArray<infer Field>
    ? Field
    : never;

type MapLocation = Readonly<{ x: number; y: number }>;
type MapBounds = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type Civ7GameUiMapReadTarget = Readonly<{
  GameplayMap?: {
    getGridWidth?: () => unknown;
    getGridHeight?: () => unknown;
    isValidXY?: (x: number, y: number) => unknown;
    getIndexFromXY?: (x: number, y: number) => unknown;
    getTerrainType?: (x: number, y: number) => unknown;
    getBiomeType?: (x: number, y: number) => unknown;
    getFeatureType?: (x: number, y: number) => unknown;
    getResourceType?: (x: number, y: number) => unknown;
    getElevation?: (x: number, y: number) => unknown;
    getRainfall?: (x: number, y: number) => unknown;
    getFertilityType?: (x: number, y: number) => unknown;
    getRiverType?: (x: number, y: number) => unknown;
    isWater?: (x: number, y: number) => unknown;
    getYields?: (x: number, y: number) => unknown;
    getOwner?: (x: number, y: number) => unknown;
    getOwnerName?: (x: number, y: number) => unknown;
    getAreaId?: (x: number, y: number) => unknown;
    getRegionId?: (x: number, y: number) => unknown;
    getLandmassId?: (x: number, y: number) => unknown;
    getPlotTag?: (x: number, y: number) => unknown;
    getRevealedState?: (playerId: number, x: number, y: number) => unknown;
  };
  Visibility?: {
    isVisible?: (playerId: number, x: number, y: number) => unknown;
  };
  MapCities?: {
    getCity?: (x: number, y: number) => unknown;
  };
  MapUnits?: {
    getUnits?: (x: number, y: number) => unknown;
  };
}>;

export function civ7GameUiWorldMapReadsAvailable(
  target: Civ7GameUiMapReadTarget,
): boolean {
  return typeof target.GameplayMap?.getGridWidth === "function"
    && typeof target.GameplayMap?.getGridHeight === "function"
    && typeof target.GameplayMap?.isValidXY === "function"
    && typeof target.GameplayMap?.getIndexFromXY === "function";
}

export async function getCiv7GameUiPlotSnapshot(
  input: Readonly<{
    x: number;
    y: number;
    fields?: readonly PlotField[];
    playerId?: number;
    includeHidden?: boolean;
  }>,
  target: Civ7GameUiMapReadTarget = globalThis as Civ7GameUiMapReadTarget,
): Promise<Civ7ControlOrpcPlotSnapshotResult> {
  if (!civ7GameUiWorldMapReadsAvailable(target)) {
    throw new Error("Civ7 game UI world map dependency is unavailable.");
  }
  return {
    ...gameUiRuntimeIdentity(),
    ...plotSnapshot(
      {
        x: boundedInteger(input.x, 0, 1_000_000, "x"),
        y: boundedInteger(input.y, 0, 1_000_000, "y"),
        fields: normalizePlotFields(input.fields),
        playerId: input.playerId,
        includeHidden: input.includeHidden,
      },
      target,
    ),
  };
}

export async function getCiv7GameUiMapGrid(
  input: Readonly<{
    bounds?: MapBounds;
    locations?: readonly MapLocation[];
    fields: readonly PlotField[];
    playerId?: number;
    includeHidden?: boolean;
    maxPlots?: number;
  }>,
  target: Civ7GameUiMapReadTarget = globalThis as Civ7GameUiMapReadTarget,
): Promise<Civ7ControlOrpcMapGridResult> {
  if (!civ7GameUiWorldMapReadsAvailable(target)) {
    throw new Error("Civ7 game UI world map dependency is unavailable.");
  }
  const maxPlots = boundedInteger(input.maxPlots ?? 256, 1, 10_000, "maxPlots");
  const fields = normalizePlotFields(input.fields);
  const bounds = input.bounds == null ? undefined : mapBounds(input.bounds);
  const explicitLocations = input.locations?.map(mapLocation);
  if (bounds == null && explicitLocations == null) {
    throw new Error("Civ7 game UI map grid reads require bounds or locations.");
  }
  if (bounds != null && explicitLocations != null) {
    throw new Error("Civ7 game UI map grid reads accept bounds or locations, not both.");
  }

  const requestedCount = explicitLocations?.length ?? bounds!.width * bounds!.height;
  const locations = (explicitLocations ?? locationsFromBounds(bounds!, maxPlots))
    .slice(0, maxPlots);

  return {
    ...gameUiRuntimeIdentity(),
    ...(bounds == null ? {} : { bounds }),
    fields: Array.from(fields),
    plotCount: requestedCount,
    omitted: Math.max(0, requestedCount - locations.length),
    hiddenInfoPolicy: hiddenInfoPolicy(input),
    map: {
      width: probe(() => Number(target.GameplayMap!.getGridWidth!())),
      height: probe(() => Number(target.GameplayMap!.getGridHeight!())),
    },
    plots: locations.map((location) =>
      plotSnapshot({
        ...location,
        fields,
        playerId: input.playerId,
        includeHidden: input.includeHidden,
      }, target)
    ),
  };
}

function plotSnapshot(
  input: Readonly<{
    x: number;
    y: number;
    fields: readonly PlotField[];
    playerId?: number;
    includeHidden?: boolean;
  }>,
  target: Civ7GameUiMapReadTarget,
): Omit<Civ7ControlOrpcPlotSnapshotResult, "host" | "port" | "state"> {
  const visibility = visibilityFor(input, target);
  if (target.GameplayMap?.isValidXY?.(input.x, input.y) !== true) {
    return {
      location: {
        x: input.x,
        y: input.y,
        index: { ok: false, error: "invalid location" },
      },
      hiddenInfoPolicy: visibility.policy,
      facts: {},
    };
  }

  const facts: Record<string, RuntimeProbe<unknown>> = {};
  const include = visibility.policy === "not-player-scoped"
    || visibility.includeFacts === true;
  const add = (key: string, value: RuntimeProbe<unknown>) => {
    facts[key] = value;
  };

  if (include) {
    if (input.fields.includes("terrain")) {
      add("terrain", mapProbe(target, "getTerrainType", input));
    }
    if (input.fields.includes("biome")) {
      add("biome", mapProbe(target, "getBiomeType", input));
    }
    if (input.fields.includes("feature")) {
      add("feature", mapProbe(target, "getFeatureType", input));
    }
    if (input.fields.includes("resource")) {
      add("resource", mapProbe(target, "getResourceType", input));
    }
    if (input.fields.includes("climate")) {
      add("elevation", mapProbe(target, "getElevation", input));
      add("rainfall", mapProbe(target, "getRainfall", input));
      add("fertility", mapProbe(target, "getFertilityType", input));
    }
    if (input.fields.includes("hydrology")) {
      add("riverType", mapProbe(target, "getRiverType", input));
      add("water", mapProbe(target, "isWater", input));
    }
    if (input.fields.includes("yields")) {
      add("yields", mapProbe(target, "getYields", input));
    }
    if (input.fields.includes("owner")) {
      add("owner", mapProbe(target, "getOwner", input));
      add("ownerName", mapProbe(target, "getOwnerName", input));
    }
    if (input.fields.includes("areaRegion")) {
      add("areaId", mapProbe(target, "getAreaId", input));
      add("regionId", mapProbe(target, "getRegionId", input));
      add("landmassId", mapProbe(target, "getLandmassId", input));
    }
    if (input.fields.includes("tags")) {
      add("plotTag", mapProbe(target, "getPlotTag", input));
    }
    if (input.fields.includes("city")) {
      add("city", probe(() => target.MapCities?.getCity?.(input.x, input.y) ?? null));
    }
    if (input.fields.includes("units")) {
      add("units", probe(() => target.MapUnits?.getUnits?.(input.x, input.y) ?? []));
    }
  }

  if (input.fields.includes("visibility")) {
    add(
      "revealedState",
      visibility.revealedState ?? { ok: false, error: "playerId required" },
    );
    add(
      "visible",
      visibility.visible ?? { ok: false, error: "playerId required" },
    );
  }

  return {
    location: {
      x: input.x,
      y: input.y,
      index: probe(() => Number(target.GameplayMap!.getIndexFromXY!(input.x, input.y))),
    },
    ...(visibility.revealedState ? { revealedState: visibility.revealedState } : {}),
    ...(visibility.visible ? { visible: visibility.visible } : {}),
    hiddenInfoPolicy: visibility.policy,
    facts,
  };
}

function visibilityFor(
  input: Readonly<{
    x: number;
    y: number;
    playerId?: number;
    includeHidden?: boolean;
  }>,
  target: Civ7GameUiMapReadTarget,
): Readonly<{
  policy: Civ7ControlOrpcPlotSnapshotResult["hiddenInfoPolicy"];
  revealedState?: RuntimeProbe<number | string>;
  visible?: RuntimeProbe<boolean>;
  includeFacts?: boolean;
}> {
  if (input.playerId == null) return { policy: "not-player-scoped" };
  const revealedState = probe(() =>
    target.GameplayMap!.getRevealedState!(input.playerId!, input.x, input.y) as number | string
  );
  const visible = probe(() => {
    if (typeof target.Visibility?.isVisible === "function") {
      return Boolean(target.Visibility.isVisible(input.playerId!, input.x, input.y));
    }
    return revealedState.ok && revealedState.value !== 0;
  });
  return {
    policy: input.includeHidden === true
      ? "include-hidden"
      : "visibility-filtered",
    revealedState,
    visible,
    includeFacts: input.includeHidden === true
      || (visible.ok && visible.value === true)
      || (revealedState.ok && revealedState.value !== 0),
  };
}

function mapProbe(
  target: Civ7GameUiMapReadTarget,
  name: Exclude<keyof NonNullable<Civ7GameUiMapReadTarget["GameplayMap"]>,
    "getGridWidth" | "getGridHeight" | "isValidXY" | "getIndexFromXY"
    | "getRevealedState">,
  location: MapLocation,
): RuntimeProbe<unknown> {
  return probe(() => {
    const fn = target.GameplayMap?.[name];
    if (typeof fn !== "function") {
      throw new Error(`GameplayMap.${name} is not a function`);
    }
    return fn(location.x, location.y);
  });
}

function locationsFromBounds(
  bounds: MapBounds,
  maxPlots: number,
): MapLocation[] {
  const out: MapLocation[] = [];
  outer: for (let y = bounds.y; y < bounds.y + bounds.height; y += 1) {
    for (let x = bounds.x; x < bounds.x + bounds.width; x += 1) {
      out.push({ x, y });
      if (out.length >= maxPlots) break outer;
    }
  }
  return out;
}

function normalizePlotFields(
  fields: readonly PlotField[] | undefined,
): readonly PlotField[] {
  const selected: readonly PlotField[] = fields?.length
    ? fields
    : defaultPlotFields;
  for (const field of selected) {
    if (!allPlotFields.includes(field)) {
      throw new Error(`Unsupported Civ7 plot field: ${field}`);
    }
  }
  return Array.from(new Set(selected));
}

function hiddenInfoPolicy(
  input: Readonly<{ playerId?: number; includeHidden?: boolean }>,
): Civ7ControlOrpcMapGridResult["hiddenInfoPolicy"] {
  if (input.playerId == null) return "not-player-scoped";
  return input.includeHidden === true ? "include-hidden" : "visibility-filtered";
}

function mapBounds(bounds: MapBounds): MapBounds {
  return {
    x: boundedInteger(bounds.x, 0, 1_000_000, "bounds.x"),
    y: boundedInteger(bounds.y, 0, 1_000_000, "bounds.y"),
    width: boundedInteger(bounds.width, 1, 10_000, "bounds.width"),
    height: boundedInteger(bounds.height, 1, 10_000, "bounds.height"),
  };
}

function mapLocation(location: MapLocation): MapLocation {
  return {
    x: boundedInteger(location.x, 0, 1_000_000, "location.x"),
    y: boundedInteger(location.y, 0, 1_000_000, "location.y"),
  };
}

function boundedInteger(
  value: number,
  min: number,
  max: number,
  label: string,
): number {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${label} must be an integer ${min}..${max}.`);
  }
  return value;
}

function gameUiRuntimeIdentity() {
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
  } as const;
}

function probe<T>(fn: () => T): RuntimeProbe<T> {
  try {
    return { ok: true, value: fn() };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

const defaultPlotFields: readonly PlotField[] = [
  "terrain",
  "biome",
  "feature",
  "resource",
  "owner",
  "visibility",
  "areaRegion",
];

const allPlotFields: readonly PlotField[] = [
  "terrain",
  "biome",
  "feature",
  "resource",
  "climate",
  "hydrology",
  "yields",
  "owner",
  "visibility",
  "areaRegion",
  "tags",
  "city",
  "units",
];

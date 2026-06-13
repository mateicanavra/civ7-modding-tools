import { Civ7DirectControlError } from "../../direct-control-error.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { probeHelperSource } from "../../runtime/probe.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7Command, executeCiv7TunerCommand } from "../../session/execute.js";

import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerStateSelection,
} from "../../session/types.js";
import { boundedInteger } from "../../validation.js";
import { DEFAULT_CIV7_MAP_GRID_MAX_PLOTS, HARD_CIV7_MAP_GRID_MAX_PLOTS } from "./constants.js";
import type {
  Civ7MapBounds,
  Civ7MapGridInput,
  Civ7MapGridResult,
  Civ7MapLocation,
  Civ7MapSummaryInput,
  Civ7MapSummaryOptions,
  Civ7MapSummaryResult,
  Civ7NativeRiverObjectsInput,
  Civ7NativeRiverObjectsResult,
  Civ7PlotSnapshotField,
  Civ7PlotSnapshotInput,
  Civ7PlotSnapshotResult,
} from "./types.js";
import { validateMapBounds, validateMapLocation } from "./validation.js";

type MapReadDependencies = Readonly<{
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  defaultMapGridMaxPlots: number;
  executeCommand: (
    options: Civ7DirectControlOptions &
      Readonly<{ command: string; state?: Civ7TunerStateSelection }>
  ) => Promise<Civ7CommandResult>;
  executeTunerCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>
  ) => Promise<Civ7CommandResult>;
  hardMapGridMaxPlots: number;
  jsLiteral: (value: unknown) => string;
  parseMapGrid: (result: Civ7CommandResult, label: string) => Civ7MapGridResult;
  parseMapSummary: (result: Civ7CommandResult, label: string) => Civ7MapSummaryResult;
  parseNativeRiverObjects: (
    result: Civ7CommandResult,
    label: string
  ) => Civ7NativeRiverObjectsResult;
  parsePlotSnapshot: (result: Civ7CommandResult, label: string) => Civ7PlotSnapshotResult;
  probeHelperSource: () => string;
  validateMapBounds: (bounds: Civ7MapBounds) => void;
  validateMapLocation: (location: Civ7MapLocation) => void;
}>;

export type MapSummaryReadDependencies = Pick<
  MapReadDependencies,
  "boundedInteger" | "executeCommand" | "jsLiteral" | "parseMapSummary" | "probeHelperSource"
>;

export type PlotSnapshotReadDependencies = Pick<
  MapReadDependencies,
  | "executeTunerCommand"
  | "jsLiteral"
  | "parsePlotSnapshot"
  | "probeHelperSource"
  | "validateMapLocation"
>;

export type MapGridReadDependencies = Pick<
  MapReadDependencies,
  | "boundedInteger"
  | "defaultMapGridMaxPlots"
  | "executeTunerCommand"
  | "hardMapGridMaxPlots"
  | "jsLiteral"
  | "parseMapGrid"
  | "probeHelperSource"
  | "validateMapBounds"
  | "validateMapLocation"
>;

export type NativeRiverObjectsReadDependencies = Pick<
  MapReadDependencies,
  | "boundedInteger"
  | "executeTunerCommand"
  | "jsLiteral"
  | "parseNativeRiverObjects"
  | "probeHelperSource"
>;

export async function getCiv7MapSummary(
  options: Civ7MapSummaryOptions = {},
  dependencies: MapSummaryReadDependencies = defaultMapReadDependencies
): Promise<Civ7MapSummaryResult> {
  const result = await dependencies.executeCommand({
    ...options,
    state: options.state ?? { role: "tuner" },
    command: buildMapSummaryCommand(
      {
        includeAreaRegionCounts: options.includeAreaRegionCounts === true,
        maxIds: dependencies.boundedInteger(options.maxIds ?? 512, 0, 1_000_000, "maxIds"),
      },
      dependencies
    ),
  });
  return dependencies.parseMapSummary(result, "Civ7 map summary");
}

export async function getCiv7PlotSnapshot(
  input: Civ7PlotSnapshotInput,
  options: Civ7DirectControlOptions = {},
  dependencies: PlotSnapshotReadDependencies = defaultMapReadDependencies
): Promise<Civ7PlotSnapshotResult> {
  dependencies.validateMapLocation(input);
  const fields = normalizePlotFields(input.fields);
  const result = await dependencies.executeTunerCommand({
    ...options,
    command: buildPlotSnapshotCommand({ ...input, fields: Array.from(fields) }, dependencies),
  });
  return dependencies.parsePlotSnapshot(result, "Civ7 plot snapshot");
}

export async function getCiv7MapGrid(
  input: Civ7MapGridInput,
  options: Civ7DirectControlOptions = {},
  dependencies: MapGridReadDependencies = defaultMapReadDependencies
): Promise<Civ7MapGridResult> {
  const maxPlots = dependencies.boundedInteger(
    input.maxPlots ?? dependencies.defaultMapGridMaxPlots,
    1,
    dependencies.hardMapGridMaxPlots,
    "maxPlots"
  );
  validateMapGridInput(input, maxPlots, dependencies);
  const result = await dependencies.executeTunerCommand({
    ...options,
    command: buildMapGridCommand(
      {
        ...input,
        fields: normalizePlotFields(input.fields),
        maxPlots,
      },
      dependencies
    ),
  });
  return dependencies.parseMapGrid(result, "Civ7 map grid");
}

export async function getCiv7NativeRiverObjects(
  input: Civ7NativeRiverObjectsInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: NativeRiverObjectsReadDependencies = defaultMapReadDependencies
): Promise<Civ7NativeRiverObjectsResult> {
  const maxSamples = dependencies.boundedInteger(input.maxSamples ?? 16, 0, 256, "maxSamples");
  const maxPlotsPerRiver = dependencies.boundedInteger(
    input.maxPlotsPerRiver ?? 256,
    0,
    2048,
    "maxPlotsPerRiver"
  );
  const result = await dependencies.executeTunerCommand({
    ...options,
    command: buildNativeRiverObjectsCommand({ maxSamples, maxPlotsPerRiver }, dependencies),
  });
  return dependencies.parseNativeRiverObjects(result, "Civ7 native river objects");
}

function buildMapSummaryCommand(
  options: Civ7MapSummaryInput & { includeAreaRegionCounts: boolean; maxIds: number },
  dependencies: MapSummaryReadDependencies
): string {
  return `(() => {
    ${dependencies.probeHelperSource()}
    const cap = ${dependencies.jsLiteral(options.maxIds)};
    const map = {
      width: probe(() => GameplayMap.getGridWidth()),
      height: probe(() => GameplayMap.getGridHeight()),
      plotCount: probe(() => GameplayMap.getPlotCount()),
      mapSize: probe(() => GameplayMap.getMapSize()),
      randomSeed: probe(() => GameplayMap.getRandomSeed()),
    };
    const game = {
      turn: probe(() => Game.turn),
      age: probe(() => Game.age),
      maxTurns: probe(() => Game.maxTurns),
      turnDate: probe(() => Game.getTurnDate()),
      hash: probe(() => Game.getHash()),
    };
    const limitIds = (probeResult) => {
      if (!probeResult.ok || !Array.isArray(probeResult.value)) return probeResult;
      return { ok: true, value: probeResult.value.slice(0, cap) };
    };
    const rawAreas = ${options.includeAreaRegionCounts}
      ? {
          areaIds: limitIds(probe(() => typeof MapAreas !== "undefined" ? MapAreas.getAreaIds() : [])),
          regionIds: limitIds(probe(() => typeof MapRegions !== "undefined" ? MapRegions.getRegionIds() : [])),
        }
      : undefined;
    const areas = rawAreas
      ? {
          ...rawAreas,
          truncated:
            (rawAreas.areaIds.ok && rawAreas.areaIds.value.length >= cap) ||
            (rawAreas.regionIds.ok && rawAreas.regionIds.value.length >= cap),
        }
      : undefined;
    return JSON.stringify({ map, game, ...(areas ? { areas } : {}) });
  })()`;
}

function buildPlotSnapshotCommand(
  input: Civ7PlotSnapshotInput & { fields: ReadonlyArray<Civ7PlotSnapshotField> },
  dependencies: PlotSnapshotReadDependencies
): string {
  return `(() => {
    ${plotSnapshotScriptSource(dependencies)}
    return JSON.stringify(readPlotSnapshot(${dependencies.jsLiteral(input)}));
  })()`;
}

function buildMapGridCommand(
  input: Civ7MapGridInput & {
    fields: ReadonlyArray<Civ7PlotSnapshotField>;
    maxPlots: number;
  },
  dependencies: MapGridReadDependencies
): string {
  return `(() => {
    ${plotSnapshotScriptSource(dependencies)}
    const input = ${dependencies.jsLiteral(input)};
    const width = probe(() => GameplayMap.getGridWidth());
    const height = probe(() => GameplayMap.getGridHeight());
    const locationsFromBounds = (bounds, maxPlots) => {
      const out = [];
      outer: for (let y = bounds.y; y < bounds.y + bounds.height; y += 1) {
        for (let x = bounds.x; x < bounds.x + bounds.width; x += 1) {
          out.push({ x, y });
          if (out.length >= maxPlots) break outer;
        }
      }
      return out;
    };
    const maxPlots = input.maxPlots;
    const requestedCount = input.locations ? input.locations.length : input.bounds.width * input.bounds.height;
    const locations = input.locations ? input.locations.slice(0, maxPlots) : locationsFromBounds(input.bounds, maxPlots);
    return JSON.stringify({
      bounds: input.bounds,
      fields: input.fields,
      plotCount: requestedCount,
      omitted: Math.max(0, requestedCount - locations.length),
      hiddenInfoPolicy: input.playerId === undefined ? "not-player-scoped" : input.includeHidden ? "include-hidden" : "visibility-filtered",
      map: { width, height },
      plots: locations.map((location) => readPlotSnapshot({ ...input, ...location })),
    });
  })()`;
}

function buildNativeRiverObjectsCommand(
  input: Required<Civ7NativeRiverObjectsInput>,
  dependencies: NativeRiverObjectsReadDependencies
): string {
  return `(() => {
    ${dependencies.probeHelperSource()}
    const input = ${dependencies.jsLiteral(input)};
    const exists = typeof MapRivers !== "undefined" && MapRivers !== null;
    const numRivers = exists
      ? probe(() => {
          const raw = typeof MapRivers.numRivers === "function"
            ? MapRivers.numRivers()
            : MapRivers.numRivers;
          if (!Number.isInteger(raw)) throw new Error("MapRivers.numRivers did not return an integer");
          return raw;
        })
      : { ok: false, error: "MapRivers unavailable" };
    const riverCount = numRivers.ok ? Math.max(0, numRivers.value) : 0;
    const sampleCount = Math.min(riverCount, input.maxSamples);
    const safeRawPlot = (plot) => {
      if (plot === null || typeof plot === "number" || typeof plot === "string" || typeof plot === "boolean") return plot;
      if (plot && typeof plot === "object") {
        const out = {};
        for (const key of ["index", "Index", "$index", "plotIndex", "x", "y"]) {
          if (typeof plot[key] === "number" || typeof plot[key] === "string" || typeof plot[key] === "boolean" || plot[key] === null) {
            out[key] = plot[key];
          }
        }
        return out;
      }
      return String(plot);
    };
    const numericPlotIndex = (plot) => {
      if (Number.isInteger(plot)) return plot;
      if (typeof plot === "string" && plot.trim() !== "" && Number.isInteger(Number(plot))) return Number(plot);
      if (plot && typeof plot === "object") {
        for (const key of ["index", "Index", "$index", "plotIndex"]) {
          if (Number.isInteger(plot[key])) return plot[key];
          if (typeof plot[key] === "string" && plot[key].trim() !== "" && Number.isInteger(Number(plot[key]))) return Number(plot[key]);
        }
        if (Number.isInteger(plot.x) && Number.isInteger(plot.y)) {
          const indexResult = probe(() => GameplayMap.getIndexFromXY(plot.x, plot.y));
          if (indexResult.ok && Number.isInteger(indexResult.value)) return indexResult.value;
        }
      }
      return null;
    };
    const locationFromIndex = (index) => {
      if (!Number.isInteger(index) || index < 0) return null;
      const location = probe(() => GameplayMap.getLocationFromIndex(index));
      if (!location.ok || !location.value || !Number.isInteger(location.value.x) || !Number.isInteger(location.value.y)) return null;
      return { x: location.value.x, y: location.value.y };
    };
    const locationFromPlot = (plot, index) => {
      if (plot && typeof plot === "object" && Number.isInteger(plot.x) && Number.isInteger(plot.y)) {
        return { x: plot.x, y: plot.y };
      }
      return locationFromIndex(index);
    };
    const normalizeRiverPlots = (plots) => {
      if (!plots.ok) return plots;
      if (!Array.isArray(plots.value)) return { ok: true, value: [] };
      const selected = plots.value.slice(0, input.maxPlotsPerRiver);
      return {
        ok: true,
        value: selected.map((plot) => {
          const index = numericPlotIndex(plot);
          return {
            raw: safeRawPlot(plot),
            index,
            location: locationFromPlot(plot, index),
          };
        }),
      };
    };
    const samples = [];
    for (let index = 0; index < sampleCount; index += 1) {
      const plots = probe(() => typeof MapRivers.getRiverPlots === "function"
        ? MapRivers.getRiverPlots(index)
        : null);
      const normalizedPlots = normalizeRiverPlots(plots);
      const plotCount = plots.ok && plots.value && typeof plots.value.length === "number"
        ? plots.value.length
        : null;
      samples.push({
        index,
        riverType: probe(() => typeof MapRivers.getRiverTypeByIndex === "function"
          ? MapRivers.getRiverTypeByIndex(index)
          : null),
        plotCount: plots.ok ? { ok: true, value: plotCount } : plots,
        plotSampleCount: normalizedPlots.ok ? normalizedPlots.value.length : 0,
        plotTruncated: typeof plotCount === "number" && plotCount > input.maxPlotsPerRiver,
        plots: normalizedPlots,
        connectedToOcean: probe(() => typeof MapRivers.isRiverConnectedToOcean === "function"
          ? MapRivers.isRiverConnectedToOcean(index)
          : null),
      });
    }
    return JSON.stringify({
      exists,
      numRivers,
      samples,
      truncated: riverCount > sampleCount,
    });
  })()`;
}

function plotSnapshotScriptSource(
  dependencies: Pick<MapReadDependencies, "probeHelperSource">
): string {
  return `${dependencies.probeHelperSource()}
    const callPlot = (name, x, y) => {
      const fn = GameplayMap[name];
      if (typeof fn !== "function") throw new Error("GameplayMap." + name + " is not a function");
      try {
        return fn.call(GameplayMap, x, y);
      } catch (first) {
        try {
          return fn.call(GameplayMap, { x, y });
        } catch {
          throw first;
        }
      }
    };
    const safeMapCall = (name, x, y) => probe(() => callPlot(name, x, y));
    const visibilityFor = (input) => {
      if (input.playerId === undefined) return { policy: "not-player-scoped" };
      const revealedState = probe(() => GameplayMap.getRevealedState(input.playerId, input.x, input.y));
      const visible = probe(() => typeof Visibility !== "undefined" && typeof Visibility.isVisible === "function"
        ? Visibility.isVisible(input.playerId, input.x, input.y)
        : revealedState.ok && revealedState.value !== 0);
      const includeFacts = input.includeHidden === true || (visible.ok && visible.value === true) || (revealedState.ok && revealedState.value !== 0);
      return {
        policy: input.includeHidden ? "include-hidden" : "visibility-filtered",
        revealedState,
        visible,
        includeFacts,
      };
    };
    const readPlotSnapshot = (input) => {
      if (!GameplayMap.isValidXY(input.x, input.y)) {
        return {
          location: { x: input.x, y: input.y, index: { ok: false, error: "invalid location" } },
          hiddenInfoPolicy: input.playerId === undefined ? "not-player-scoped" : input.includeHidden ? "include-hidden" : "visibility-filtered",
          facts: {},
        };
      }
      const visibility = visibilityFor(input);
      const fields = input.fields ?? [];
      const facts = {};
      const include = visibility.policy === "not-player-scoped" || visibility.includeFacts === true;
      const add = (key, value) => { facts[key] = value; };
      if (include) {
        if (fields.includes("terrain")) add("terrain", safeMapCall("getTerrainType", input.x, input.y));
        if (fields.includes("biome")) add("biome", safeMapCall("getBiomeType", input.x, input.y));
        if (fields.includes("feature")) add("feature", safeMapCall("getFeatureType", input.x, input.y));
        if (fields.includes("resource")) add("resource", safeMapCall("getResourceType", input.x, input.y));
        if (fields.includes("climate")) {
          add("elevation", safeMapCall("getElevation", input.x, input.y));
          add("rainfall", safeMapCall("getRainfall", input.x, input.y));
          add("fertility", safeMapCall("getFertilityType", input.x, input.y));
        }
        if (fields.includes("hydrology")) {
          add("riverType", safeMapCall("getRiverType", input.x, input.y));
          add("river", safeMapCall("isRiver", input.x, input.y));
          add("navigableRiver", safeMapCall("isNavigableRiver", input.x, input.y));
          add("water", safeMapCall("isWater", input.x, input.y));
          add("lake", safeMapCall("isLake", input.x, input.y));
        }
        if (fields.includes("yields")) add("yields", safeMapCall("getYields", input.x, input.y));
        if (fields.includes("owner")) {
          add("owner", safeMapCall("getOwner", input.x, input.y));
          add("ownerName", safeMapCall("getOwnerName", input.x, input.y));
        }
        if (fields.includes("areaRegion")) {
          add("areaId", safeMapCall("getAreaId", input.x, input.y));
          add("regionId", safeMapCall("getRegionId", input.x, input.y));
          add("landmassId", safeMapCall("getLandmassId", input.x, input.y));
        }
        if (fields.includes("tags")) add("plotTag", safeMapCall("getPlotTag", input.x, input.y));
        if (fields.includes("city")) add("city", probe(() => typeof MapCities !== "undefined" ? MapCities.getCity(input.x, input.y) : null));
        if (fields.includes("units")) add("units", probe(() => typeof MapUnits !== "undefined" ? MapUnits.getUnits(input.x, input.y) : []));
      }
      if (fields.includes("visibility")) {
        add("revealedState", visibility.revealedState ?? { ok: false, error: "playerId required" });
        add("visible", visibility.visible ?? { ok: false, error: "playerId required" });
      }
      return {
        location: { x: input.x, y: input.y, index: probe(() => GameplayMap.getIndexFromXY(input.x, input.y)) },
        ...(visibility.revealedState ? { revealedState: visibility.revealedState } : {}),
        ...(visibility.visible ? { visible: visibility.visible } : {}),
        hiddenInfoPolicy: visibility.policy,
        facts,
      };
    };`;
}

function normalizePlotFields(
  fields: ReadonlyArray<Civ7PlotSnapshotField> | undefined
): ReadonlyArray<Civ7PlotSnapshotField> {
  const selected: ReadonlyArray<Civ7PlotSnapshotField> = fields?.length
    ? fields
    : ["terrain", "biome", "feature", "resource", "owner", "visibility", "areaRegion"];
  for (const field of selected) {
    if (!ALL_CIV7_PLOT_FIELDS.includes(field)) {
      throw new Civ7DirectControlError("command-failed", `Unsupported Civ7 plot field: ${field}`);
    }
  }
  return Array.from(new Set(selected));
}

function validateMapGridInput(
  input: Civ7MapGridInput,
  maxPlots: number,
  dependencies: MapGridReadDependencies
): void {
  if (!input.bounds && !input.locations) {
    throw new Civ7DirectControlError(
      "command-failed",
      "Map grid reads require explicit bounds or locations"
    );
  }
  if (input.bounds && input.locations) {
    throw new Civ7DirectControlError(
      "command-failed",
      "Map grid reads accept bounds or locations, not both"
    );
  }
  if (input.bounds) dependencies.validateMapBounds(input.bounds);
  const locations = input.locations ?? [];
  if (locations.length > dependencies.hardMapGridMaxPlots) {
    throw new Civ7DirectControlError(
      "command-failed",
      `Map grid location lists must not exceed ${dependencies.hardMapGridMaxPlots} entries`
    );
  }
  for (const location of locations.slice(0, maxPlots)) dependencies.validateMapLocation(location);
}

const ALL_CIV7_PLOT_FIELDS: ReadonlyArray<Civ7PlotSnapshotField> = [
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

const defaultMapReadDependencies: MapReadDependencies = {
  boundedInteger,
  defaultMapGridMaxPlots: DEFAULT_CIV7_MAP_GRID_MAX_PLOTS,
  executeCommand: executeCiv7Command,
  executeTunerCommand: executeCiv7TunerCommand,
  hardMapGridMaxPlots: HARD_CIV7_MAP_GRID_MAX_PLOTS,
  jsLiteral,
  parseMapGrid: (result, label) => jsonPayloadFromCommandResult<Civ7MapGridResult>(result, label),
  parseMapSummary: (result, label) =>
    jsonPayloadFromCommandResult<Civ7MapSummaryResult>(result, label),
  parseNativeRiverObjects: (result, label) =>
    jsonPayloadFromCommandResult<Civ7NativeRiverObjectsResult>(result, label),
  parsePlotSnapshot: (result, label) =>
    jsonPayloadFromCommandResult<Civ7PlotSnapshotResult>(result, label),
  probeHelperSource,
  validateMapBounds,
  validateMapLocation,
};

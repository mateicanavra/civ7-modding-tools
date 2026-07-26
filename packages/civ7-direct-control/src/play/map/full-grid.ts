import { Civ7DirectControlError } from "../../direct-control-error.js";
import type { Civ7RuntimeProbe } from "../../runtime/probe.js";
import {
  type Civ7DirectControlSession,
  withCiv7DirectControlSession,
} from "../../session/session.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";
import { boundedInteger } from "../../validation.js";
import { HARD_CIV7_MAP_GRID_MAX_PLOTS } from "./constants.js";
import { getCiv7MapGrid, getCiv7MapSummary, normalizeCiv7PlotFields } from "./reads.js";
import type {
  Civ7FullMapGridIdentityCheck,
  Civ7FullMapGridInput,
  Civ7FullMapGridResult,
  Civ7HiddenInfoPolicy,
  Civ7MapBounds,
  Civ7MapGridReadChunk,
  Civ7MapGridResult,
  Civ7MapReadIdentityField,
  Civ7MapSummaryResult,
  Civ7PlotSnapshot,
} from "./types.js";
import { validateMapBounds } from "./validation.js";

/**
 * Reads the complete requested Civ7 map area in bounded one-wire chunks and
 * refuses a result when the map identity or turn changes between summaries.
 *
 * One direct-control session owns every summary and grid command. Supplying
 * `options.session` reuses the caller-owned session without closing it;
 * otherwise this function acquires and closes exactly one session.
 */
export async function getCiv7FullMapGrid(
  input: Civ7FullMapGridInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7FullMapGridResult> {
  return await withCiv7DirectControlSession(options, async (session) => {
    return await readCiv7FullMapGridInSession(input, session, {
      ...options,
      session,
    });
  });
}

async function readCiv7FullMapGridInSession(
  input: Civ7FullMapGridInput,
  session: Civ7DirectControlSession,
  options: Civ7DirectControlOptions
): Promise<Civ7FullMapGridResult> {
  const summary = await getCiv7MapSummary({
    ...options,
    includeAreaRegionCounts: false,
  });
  const connectionEpoch = requirePhysicalConnectionEpoch(session, "initial map summary");
  const mapWidth = requiredProbeNumber(summary.map.width, "GameplayMap.getGridWidth");
  const mapHeight = requiredProbeNumber(summary.map.height, "GameplayMap.getGridHeight");
  const bounds = input.bounds ?? { x: 0, y: 0, width: mapWidth, height: mapHeight };
  validateMapBounds(bounds);
  const maxPlotsPerRead = boundedInteger(
    input.maxPlotsPerRead ?? HARD_CIV7_MAP_GRID_MAX_PLOTS,
    1,
    HARD_CIV7_MAP_GRID_MAX_PLOTS,
    "maxPlotsPerRead"
  );
  const readBounds = planCiv7MapGridReadBounds(bounds, maxPlotsPerRead);
  const fields = normalizeCiv7PlotFields(input.fields);
  const plots: Civ7PlotSnapshot[] = [];
  const chunks: Civ7MapGridReadChunk[] = [];
  let omitted = 0;
  let hiddenInfoPolicy: Civ7HiddenInfoPolicy =
    input.playerId === undefined
      ? "not-player-scoped"
      : input.includeHidden === true
        ? "include-hidden"
        : "visibility-filtered";
  let lastGrid: Civ7MapGridResult | undefined;

  for (const chunkBounds of readBounds) {
    const grid = await getCiv7MapGrid(
      {
        bounds: chunkBounds,
        fields,
        ...(input.playerId === undefined ? {} : { playerId: input.playerId }),
        ...(input.includeHidden === undefined ? {} : { includeHidden: input.includeHidden }),
        maxPlots: maxPlotsPerRead,
      },
      options
    );
    assertPhysicalConnectionEpochStable(session, connectionEpoch, "map-grid chunk");
    assertFullMapGridWireIdentityStable(summary, grid);
    assertFullMapGridChunkContract(summary, grid, chunkBounds, fields);
    lastGrid = grid;
    hiddenInfoPolicy = grid.hiddenInfoPolicy;
    omitted += grid.omitted;
    chunks.push({
      bounds: chunkBounds,
      plotCount: grid.plotCount,
      omitted: grid.omitted,
    });
    plots.push(...grid.plots);
  }

  plots.sort((a, b) => {
    const ai = probeNumberOr(a.location.index, Number.MAX_SAFE_INTEGER);
    const bi = probeNumberOr(b.location.index, Number.MAX_SAFE_INTEGER);
    return ai - bi;
  });
  const postReadSummary = await getCiv7MapSummary({
    ...options,
    includeAreaRegionCounts: false,
  });
  assertPhysicalConnectionEpochStable(session, connectionEpoch, "closing map summary");
  assertFullMapGridWireIdentityStable(summary, postReadSummary);
  const identityCheck = assertFullMapGridSummaryIdentityStable(
    summary,
    postReadSummary,
    connectionEpoch
  );

  return {
    host: lastGrid?.host ?? summary.host,
    port: lastGrid?.port ?? summary.port,
    state: lastGrid?.state ?? summary.state,
    bounds,
    fields,
    plotCount: bounds.width * bounds.height,
    omitted,
    hiddenInfoPolicy,
    map: { width: mapWidth, height: mapHeight },
    summary,
    postReadSummary,
    identityCheck,
    chunks,
    plots,
  };
}

/** Plans row-major rectangular reads whose area never exceeds the wire cap. */
export function planCiv7MapGridReadBounds(
  bounds: Civ7MapBounds,
  maxPlotsPerRead = HARD_CIV7_MAP_GRID_MAX_PLOTS
): Civ7MapBounds[] {
  validateMapBounds(bounds);
  const maxPlots = boundedInteger(
    maxPlotsPerRead,
    1,
    HARD_CIV7_MAP_GRID_MAX_PLOTS,
    "maxPlotsPerRead"
  );
  const chunks: Civ7MapBounds[] = [];
  const chunkWidth = Math.min(bounds.width, maxPlots);
  const chunkHeight = Math.max(1, Math.floor(maxPlots / chunkWidth));

  for (let y = bounds.y; y < bounds.y + bounds.height; y += chunkHeight) {
    const height = Math.min(chunkHeight, bounds.y + bounds.height - y);
    for (let x = bounds.x; x < bounds.x + bounds.width; x += chunkWidth) {
      const width = Math.min(chunkWidth, bounds.x + bounds.width - x);
      chunks.push({ x, y, width, height });
    }
  }

  return chunks;
}

function requiredProbeNumber(probe: Civ7RuntimeProbe<number>, label: string): number {
  if (!probe.ok || !Number.isFinite(probe.value)) {
    throw new Civ7DirectControlError("command-failed", `${label} did not return a bounded number`);
  }
  return probe.value;
}

function assertFullMapGridSummaryIdentityStable(
  before: Civ7MapSummaryResult,
  after: Civ7MapSummaryResult,
  connectionEpoch: number
): Civ7FullMapGridIdentityCheck {
  const fields: ReadonlyArray<
    Readonly<{
      label: Civ7MapReadIdentityField;
      before: Civ7RuntimeProbe<unknown>;
      after: Civ7RuntimeProbe<unknown>;
    }>
  > = [
    { label: "map.width", before: before.map.width, after: after.map.width },
    { label: "map.height", before: before.map.height, after: after.map.height },
    { label: "map.plotCount", before: before.map.plotCount, after: after.map.plotCount },
    { label: "map.randomSeed", before: before.map.randomSeed, after: after.map.randomSeed },
    { label: "game.turn", before: before.game.turn, after: after.game.turn },
  ];
  const checked: Civ7MapReadIdentityField[] = [
    "wire.connectionEpoch",
    "wire.endpoint.host",
    "wire.endpoint.port",
    "wire.tunerState.id",
    "wire.tunerState.name",
  ];
  for (const field of fields) {
    if (!field.before.ok || !field.after.ok) {
      throw new Civ7DirectControlError(
        "command-failed",
        `Civ7 full-grid identity could not verify ${field.label}`
      );
    }
    checked.push(field.label);
    if (field.before.value !== field.after.value) {
      throw new Civ7DirectControlError(
        "command-failed",
        `Civ7 full-grid identity changed during read: ${field.label} ${String(field.before.value)} -> ${String(field.after.value)}`
      );
    }
  }
  return { stable: true, connectionEpoch, checked };
}

function requirePhysicalConnectionEpoch(
  session: Civ7DirectControlSession,
  observation: string
): number {
  const epoch = session.connectionEpoch;
  if (!Number.isSafeInteger(epoch) || epoch < 1) {
    throw new Civ7DirectControlError(
      "command-failed",
      `Civ7 full-grid ${observation} did not establish a physical connection epoch`
    );
  }
  return epoch;
}

function assertPhysicalConnectionEpochStable(
  session: Civ7DirectControlSession,
  expected: number,
  observation: string
): void {
  const observed = session.connectionEpoch;
  if (observed !== expected) {
    throw new Civ7DirectControlError(
      "command-failed",
      `Civ7 full-grid physical connection epoch changed during ${observation}: ${expected} -> ${observed}`
    );
  }
}

function assertFullMapGridWireIdentityStable(
  expected: WireIdentityObservation,
  observed: WireIdentityObservation
): void {
  const fields: ReadonlyArray<
    Readonly<{ label: string; expected: string | number; observed: string | number }>
  > = [
    { label: "wire.endpoint.host", expected: expected.host, observed: observed.host },
    { label: "wire.endpoint.port", expected: expected.port, observed: observed.port },
    {
      label: "wire.tunerState.id",
      expected: expected.state.id,
      observed: observed.state.id,
    },
    {
      label: "wire.tunerState.name",
      expected: expected.state.name,
      observed: observed.state.name,
    },
  ];
  for (const field of fields) {
    if (field.expected !== field.observed) {
      throw new Civ7DirectControlError(
        "command-failed",
        `Civ7 full-grid identity changed during read: ${field.label} ${String(field.expected)} -> ${String(field.observed)}`
      );
    }
  }
}

type WireIdentityObservation = Readonly<{
  host: string;
  port: number;
  state: Readonly<{
    id: string;
    name: string;
  }>;
}>;

function assertFullMapGridChunkContract(
  initialSummary: Civ7MapSummaryResult,
  grid: Civ7MapGridResult,
  expectedBounds: Civ7MapBounds,
  expectedFields: ReadonlyArray<Civ7FullMapGridInput["fields"][number]>
): void {
  if (!grid.bounds || !sameMapBounds(grid.bounds, expectedBounds)) {
    throw new Civ7DirectControlError(
      "command-failed",
      "Civ7 full-grid chunk returned bounds that do not match the requested read"
    );
  }
  if (
    grid.fields.length !== expectedFields.length ||
    grid.fields.some((field, index) => field !== expectedFields[index])
  ) {
    throw new Civ7DirectControlError(
      "command-failed",
      "Civ7 full-grid chunk returned fields that do not match the requested read"
    );
  }
  const expectedPlotCount = expectedBounds.width * expectedBounds.height;
  if (grid.plotCount !== expectedPlotCount) {
    throw new Civ7DirectControlError(
      "command-failed",
      `Civ7 full-grid chunk declared ${grid.plotCount} plots for a ${expectedPlotCount}-plot read`
    );
  }
  if (!grid.map) {
    throw new Civ7DirectControlError(
      "command-failed",
      "Civ7 full-grid chunk omitted its map-dimension evidence"
    );
  }
  assertFullMapGridProbeIdentityStable("map.width", initialSummary.map.width, grid.map.width);
  assertFullMapGridProbeIdentityStable("map.height", initialSummary.map.height, grid.map.height);
}

function assertFullMapGridProbeIdentityStable(
  label: string,
  expected: Civ7RuntimeProbe<unknown>,
  observed: Civ7RuntimeProbe<unknown>
): void {
  if (!expected.ok || !observed.ok) {
    throw new Civ7DirectControlError(
      "command-failed",
      `Civ7 full-grid identity could not verify ${label}`
    );
  }
  if (expected.value !== observed.value) {
    throw new Civ7DirectControlError(
      "command-failed",
      `Civ7 full-grid identity changed during read: ${label} ${String(expected.value)} -> ${String(observed.value)}`
    );
  }
}

function sameMapBounds(left: Civ7MapBounds, right: Civ7MapBounds): boolean {
  return (
    left.x === right.x &&
    left.y === right.y &&
    left.width === right.width &&
    left.height === right.height
  );
}

function probeNumberOr(probe: Civ7RuntimeProbe<unknown>, fallback: number): number {
  if (!probe.ok) return fallback;
  const value = Number(probe.value);
  return Number.isFinite(value) ? value : fallback;
}

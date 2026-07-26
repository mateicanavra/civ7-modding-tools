import { Civ7DirectControlError } from "../../direct-control-error.js";
import type { Civ7RuntimeProbe } from "../../runtime/probe.js";
import {
  type Civ7DirectControlSession,
  withCiv7DirectControlSession,
} from "../../session/session.js";
import type { Civ7DirectControlOptions, Civ7TunerState } from "../../session/types.js";
import { getCiv7FullMapGrid } from "./full-grid.js";
import { getCiv7MapSummary, getCiv7NativeRiverObjects } from "./reads.js";
import type {
  Civ7FullMapGridInput,
  Civ7FullMapGridResult,
  Civ7MapReadIdentityField,
  Civ7MapSummaryResult,
  Civ7NativeRiverObjectsInput,
  Civ7NativeRiverObjectsResult,
  Civ7PlotSnapshot,
} from "./types.js";

/** Stable identity channels that one complete Civ7 map observation verifies. */
export type Civ7MapSurfaceObservationIdentityField = Civ7MapReadIdentityField;

/**
 * Identity projected from the verified observation window.
 *
 * `stable` is literal `true`: any unavailable identity probe, wire or map
 * change, or turn drift rejects the observation instead of returning a weaker
 * state that a caller could accidentally accept.
 */
export type Civ7MapSurfaceObservationIdentity = Readonly<{
  stable: true;
  checked: ReadonlyArray<Civ7MapSurfaceObservationIdentityField>;
  wire: Readonly<{
    connectionEpoch: number;
    endpoint: Readonly<{
      host: string;
      port: number;
    }>;
    tunerState: Civ7TunerState;
  }>;
  map: Readonly<{
    width: number;
    height: number;
    plotCount: number;
    randomSeed: number;
  }>;
  game: Readonly<{
    turn: number;
  }>;
}>;

/**
 * Full-map row-major plot shape.
 *
 * `plotsByIndex[index]` is the exact plot whose Civ7 index is `index`, or
 * `null` when that plot was absent from the bounded readback.
 * `missingPlotIndices` retains those gaps as explicit evidence.
 */
export type Civ7MapSurfaceObservationShape = Readonly<{
  width: number;
  height: number;
  plotCount: number;
  observedPlotCount: number;
  plotsByIndex: ReadonlyArray<Civ7PlotSnapshot | null>;
  missingPlotIndices: ReadonlyArray<number>;
}>;

/**
 * Inputs for a coherent full-map observation. Bounds are intentionally absent:
 * this aggregate always observes the complete current Civ7 map.
 */
export type Civ7MapSurfaceObservationInput = Readonly<{
  fullGrid: Omit<Civ7FullMapGridInput, "bounds">;
  nativeRiverObjects?: Civ7NativeRiverObjectsInput;
}>;

/**
 * One coherent Civ7 map-surface observation, including the existing raw
 * readback DTOs, a row-major plot projection, and the final identity summary.
 */
export type Civ7MapSurfaceObservationResult = Readonly<{
  identity: Civ7MapSurfaceObservationIdentity;
  surface: Civ7MapSurfaceObservationShape;
  fullGrid: Civ7FullMapGridResult;
  nativeRiverObjects: Civ7NativeRiverObjectsResult;
  finalSummary: Civ7MapSummaryResult;
}>;

/**
 * Observes the complete Civ7 map grid and native river objects inside one
 * bounded direct-control session.
 *
 * The function performs no polling, retry, progress reporting, or mutation.
 * It reuses a caller-owned session without closing it; otherwise it owns
 * exactly one session and closes it through the standard session lifecycle.
 * A final summary closes the observation window, and any wire or map identity
 * change or turn drift across that window refuses the result.
 *
 * This is a bounded compound read, not a point-in-time engine transaction:
 * identity checks detect observable drift but do not pause Civ7 or exclude
 * unrelated callers from the shared Tuner session.
 */
export async function getCiv7MapSurfaceObservation(
  input: Civ7MapSurfaceObservationInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7MapSurfaceObservationResult> {
  return await withCiv7DirectControlSession(options, async (session) => {
    const sessionOptions: Civ7DirectControlOptions = {
      ...options,
      session,
    };
    const fullGrid = await getCiv7FullMapGrid(input.fullGrid, sessionOptions);
    const connectionEpoch = fullGrid.identityCheck.connectionEpoch;
    assertObservationConnectionEpochStable(session, connectionEpoch, "full-grid read");
    const nativeRiverObjects = await getCiv7NativeRiverObjects(
      input.nativeRiverObjects,
      sessionOptions
    );
    assertObservationConnectionEpochStable(session, connectionEpoch, "native-river read");
    const finalSummary = await getCiv7MapSummary({
      ...sessionOptions,
      includeAreaRegionCounts: false,
    });
    assertObservationConnectionEpochStable(session, connectionEpoch, "final map summary");
    const identity = verifiedObservationIdentity(
      fullGrid,
      nativeRiverObjects,
      finalSummary,
      connectionEpoch
    );
    const surface = shapeObservedPlots(fullGrid, identity);

    return {
      identity,
      surface,
      fullGrid,
      nativeRiverObjects,
      finalSummary,
    };
  });
}

const OBSERVATION_IDENTITY_FIELDS: ReadonlyArray<Civ7MapSurfaceObservationIdentityField> = [
  "wire.connectionEpoch",
  "wire.endpoint.host",
  "wire.endpoint.port",
  "wire.tunerState.id",
  "wire.tunerState.name",
  "map.width",
  "map.height",
  "map.plotCount",
  "map.randomSeed",
  "game.turn",
];

function verifiedObservationIdentity(
  fullGrid: Civ7FullMapGridResult,
  nativeRiverObjects: Civ7NativeRiverObjectsResult,
  finalSummary: Civ7MapSummaryResult,
  connectionEpoch: number
): Civ7MapSurfaceObservationIdentity {
  if (fullGrid.identityCheck.stable !== true) {
    throw identityError("Civ7 full-grid identity check was not stable");
  }

  const summaries = [fullGrid.summary, fullGrid.postReadSummary, finalSummary];
  assertWireIdentityStable(fullGrid.summary, [
    fullGrid,
    fullGrid.postReadSummary,
    nativeRiverObjects,
    finalSummary,
  ]);
  assertProbeIdentityStable(
    "map.width",
    summaries.map((summary) => summary.map.width)
  );
  assertProbeIdentityStable(
    "map.height",
    summaries.map((summary) => summary.map.height)
  );
  assertProbeIdentityStable(
    "map.plotCount",
    summaries.map((summary) => summary.map.plotCount)
  );
  assertProbeIdentityStable(
    "map.randomSeed",
    summaries.map((summary) => summary.map.randomSeed)
  );
  assertProbeIdentityStable(
    "game.turn",
    summaries.map((summary) => summary.game.turn)
  );

  const map = {
    width: requiredIdentityNumber(fullGrid.summary.map.width, "map.width"),
    height: requiredIdentityNumber(fullGrid.summary.map.height, "map.height"),
    plotCount: requiredIdentityNumber(fullGrid.summary.map.plotCount, "map.plotCount"),
    randomSeed: requiredIdentityNumber(fullGrid.summary.map.randomSeed, "map.randomSeed"),
  };
  const game = {
    turn: requiredIdentityNumber(fullGrid.summary.game.turn, "game.turn"),
  };
  assertPositiveInteger(map.width, "map.width");
  assertPositiveInteger(map.height, "map.height");
  assertPositiveInteger(map.plotCount, "map.plotCount");
  if (map.plotCount !== map.width * map.height) {
    throw identityError(
      `Civ7 map identity is incoherent: map.plotCount ${map.plotCount} does not equal ${map.width} x ${map.height}`
    );
  }
  if (fullGrid.map.width !== map.width || fullGrid.map.height !== map.height) {
    throw identityError("Civ7 full-grid dimensions do not match the verified map identity");
  }
  if (
    fullGrid.bounds.x !== 0 ||
    fullGrid.bounds.y !== 0 ||
    fullGrid.bounds.width !== map.width ||
    fullGrid.bounds.height !== map.height ||
    fullGrid.plotCount !== map.plotCount
  ) {
    throw identityError("Civ7 full-grid readback does not cover the verified complete map");
  }

  return {
    stable: true,
    checked: Array.from(OBSERVATION_IDENTITY_FIELDS),
    wire: {
      connectionEpoch,
      endpoint: {
        host: fullGrid.summary.host,
        port: fullGrid.summary.port,
      },
      tunerState: fullGrid.summary.state,
    },
    map,
    game,
  };
}

function assertObservationConnectionEpochStable(
  session: Civ7DirectControlSession,
  expected: number,
  observation: string
): void {
  const observed = session.connectionEpoch;
  if (observed !== expected) {
    throw identityError(
      `Civ7 map-surface observation physical connection epoch changed during ${observation}: ${expected} -> ${observed}`
    );
  }
}

function assertWireIdentityStable(
  expected: WireIdentityObservation,
  observations: ReadonlyArray<WireIdentityObservation>
): void {
  for (const observation of observations) {
    assertIdentityValue("wire.endpoint.host", expected.host, observation.host);
    assertIdentityValue("wire.endpoint.port", expected.port, observation.port);
    assertIdentityValue("wire.tunerState.id", expected.state.id, observation.state.id);
    assertIdentityValue("wire.tunerState.name", expected.state.name, observation.state.name);
  }
}

type WireIdentityObservation = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
}>;

function assertProbeIdentityStable(
  field: Civ7MapSurfaceObservationIdentityField,
  probes: ReadonlyArray<Civ7RuntimeProbe<unknown>>
): void {
  const first = probes[0];
  if (!first?.ok) {
    throw identityError(`Civ7 map-surface observation could not verify ${field}`);
  }
  for (const probe of probes.slice(1)) {
    if (!probe.ok) {
      throw identityError(`Civ7 map-surface observation could not verify ${field}`);
    }
    assertIdentityValue(field, first.value, probe.value);
  }
}

function assertIdentityValue(
  field: Civ7MapSurfaceObservationIdentityField,
  expected: unknown,
  observed: unknown
): void {
  if (expected !== observed) {
    throw identityError(
      `Civ7 map-surface observation identity changed: ${field} ${String(expected)} -> ${String(observed)}`
    );
  }
}

function requiredIdentityNumber(
  probe: Civ7RuntimeProbe<number>,
  field: Civ7MapSurfaceObservationIdentityField
): number {
  if (!probe.ok || !Number.isFinite(probe.value)) {
    throw identityError(`Civ7 map-surface observation could not verify ${field}`);
  }
  return probe.value;
}

function assertPositiveInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 1) {
    throw identityError(`${field} must be a positive integer, received ${String(value)}`);
  }
}

function shapeObservedPlots(
  fullGrid: Civ7FullMapGridResult,
  identity: Civ7MapSurfaceObservationIdentity
): Civ7MapSurfaceObservationShape {
  const { width, height, plotCount } = identity.map;
  const plotsByIndex: Array<Civ7PlotSnapshot | null> = Array.from(
    { length: plotCount },
    () => null
  );

  for (const plot of fullGrid.plots) {
    const indexProbe = plot.location.index;
    if (!indexProbe.ok || !Number.isInteger(indexProbe.value)) {
      throw identityError(
        `Civ7 map-surface plot (${plot.location.x},${plot.location.y}) has no integer index`
      );
    }
    const index = indexProbe.value;
    if (index < 0 || index >= plotCount) {
      throw identityError(
        `Civ7 map-surface plot index ${index} is outside the verified range 0..${plotCount - 1}`
      );
    }
    if (
      !Number.isInteger(plot.location.x) ||
      !Number.isInteger(plot.location.y) ||
      plot.location.x < 0 ||
      plot.location.y < 0 ||
      plot.location.x >= width ||
      plot.location.y >= height
    ) {
      throw identityError(
        `Civ7 map-surface plot index ${index} has an out-of-range location (${plot.location.x},${plot.location.y})`
      );
    }
    const coordinateIndex = plot.location.y * width + plot.location.x;
    if (coordinateIndex !== index) {
      throw identityError(
        `Civ7 map-surface plot index ${index} does not match row-major location index ${coordinateIndex}`
      );
    }
    if (plotsByIndex[index] !== null) {
      throw identityError(`Civ7 map-surface readback contains duplicate plot index ${index}`);
    }
    plotsByIndex[index] = plot;
  }

  const missingPlotIndices: number[] = [];
  for (let index = 0; index < plotsByIndex.length; index += 1) {
    if (plotsByIndex[index] === null) missingPlotIndices.push(index);
  }

  return {
    width,
    height,
    plotCount,
    observedPlotCount: plotCount - missingPlotIndices.length,
    plotsByIndex,
    missingPlotIndices,
  };
}

function identityError(message: string): Civ7DirectControlError {
  return new Civ7DirectControlError("command-failed", message);
}

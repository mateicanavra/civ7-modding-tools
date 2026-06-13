import { Type, type Static } from "typebox";

import { Civ7DirectControlError } from "../../direct-control-error.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../../session/types.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import {
  Civ7RuntimeProbeSchema,
  probeHelperSource,
  probeValue,
  type Civ7RuntimeProbe,
} from "../../runtime/probe.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7TunerCommand } from "../../session/execute.js";
import { boundedInteger, validatePlayerId } from "../../validation.js";
import { DEFAULT_CIV7_MAP_GRID_MAX_PLOTS, HARD_CIV7_MAP_GRID_MAX_PLOTS } from "./constants.js";
import type { Civ7MapBounds, Civ7MapLocation } from "./types.js";
import { Civ7MapBoundsSchema, Civ7MapLocationSchema } from "./types.js";
import { validateMapBounds } from "./validation.js";

const civ7TunerStateSchema = Type.Object(
  {
    id: Type.String(),
    name: Type.String(),
  },
  { additionalProperties: false }
);

export const Civ7VisibilitySummaryInputSchema = Type.Unsafe<
  Readonly<{
    playerId: number;
    bounds?: Civ7MapBounds;
    includeGrid?: boolean;
    maxPlots?: number;
  }>
>({
  type: "object",
  additionalProperties: false,
  properties: {
    playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
    bounds: Civ7MapBoundsSchema,
    includeGrid: Type.Boolean(),
    maxPlots: Type.Integer({ minimum: 1, maximum: HARD_CIV7_MAP_GRID_MAX_PLOTS }),
  },
  required: ["playerId"],
  anyOf: [
    { not: { properties: { includeGrid: { const: true } }, required: ["includeGrid"] } },
    { properties: { includeGrid: { const: true } }, required: ["includeGrid", "bounds"] },
  ],
});

export type Civ7VisibilitySummaryInput = Readonly<Static<typeof Civ7VisibilitySummaryInputSchema>>;

export const Civ7VisibilityGridStateSchema = Type.Object(
  {
    ...Civ7MapLocationSchema.properties,
    state: Civ7RuntimeProbeSchema(Type.Union([Type.Number(), Type.String()])),
    visible: Civ7RuntimeProbeSchema(Type.Boolean()),
  },
  { additionalProperties: false }
);

export const Civ7VisibilitySummaryResultSchema = Type.Object(
  {
    host: Type.String(),
    port: Type.Number(),
    state: civ7TunerStateSchema,
    playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
    numPlotsRevealed: Civ7RuntimeProbeSchema(Type.Number()),
    numPlotsVisible: Civ7RuntimeProbeSchema(Type.Number()),
    mapPlotCount: Civ7RuntimeProbeSchema(Type.Number()),
    counts: Type.Record(Type.String(), Type.Number()),
    grid: Type.Optional(
      Type.Object(
        {
          bounds: Civ7MapBoundsSchema,
          plotCount: Type.Number(),
          omitted: Type.Number(),
          states: Type.Array(Civ7VisibilityGridStateSchema),
        },
        { additionalProperties: false }
      )
    ),
  },
  { additionalProperties: false }
);

export type Civ7VisibilitySummaryResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  playerId: number;
  numPlotsRevealed: Civ7RuntimeProbe<number>;
  numPlotsVisible: Civ7RuntimeProbe<number>;
  mapPlotCount: Civ7RuntimeProbe<number>;
  counts: Record<string, number>;
  grid?: Readonly<{
    bounds: Civ7MapBounds;
    plotCount: number;
    omitted: number;
    states: ReadonlyArray<
      Readonly<
        Civ7MapLocation & {
          state: Civ7RuntimeProbe<number | string>;
          visible: Civ7RuntimeProbe<boolean>;
        }
      >
    >;
  }>;
}>;

export type Civ7RevealMapResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  playerId: number;
  before: Civ7VisibilitySummaryResult;
  after: Civ7VisibilitySummaryResult;
  command: Civ7CommandResult;
  classification: "revealed" | "already-revealed" | "unverified";
}>;

export type Civ7ExploreGrantInput = Readonly<{
  playerId: number;
}>;

export type Civ7ExploreGrantResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  grantId: number;
  grantedPlots: number;
  plotCount: number;
}>;

export type Civ7ExploreReleaseInput = Readonly<{
  playerId: number;
  grantId: number;
}>;

export type Civ7ExploreReleaseResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  released: boolean;
}>;

export type VisibilityReadDependencies = Readonly<{
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  defaultMapGridMaxPlots: number;
  executeTunerCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>
  ) => Promise<Civ7CommandResult>;
  hardMapGridMaxPlots: number;
  jsLiteral: (value: unknown) => string;
  parseVisibilitySummary: (result: Civ7CommandResult, label: string) => Civ7VisibilitySummaryResult;
  probeHelperSource: () => string;
  validateMapBounds: (bounds: Civ7MapBounds) => void;
  validatePlayerId: (playerId: number) => number;
}>;

type VisibilityRevealDependencies = VisibilityReadDependencies &
  Readonly<{
    getVisibilitySummary: (
      input: Civ7VisibilitySummaryInput,
      options?: Civ7DirectControlOptions
    ) => Promise<Civ7VisibilitySummaryResult>;
    probeValue: <T>(probe: Civ7RuntimeProbe<T>) => T | undefined;
  }>;

export type VisibilityGrantDependencies = Readonly<{
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  executeTunerCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>
  ) => Promise<Civ7CommandResult>;
  parseExploreGrant: (result: Civ7CommandResult, label: string) => ExploreGrantPayload;
  parseExploreRelease: (result: Civ7CommandResult, label: string) => ExploreReleasePayload;
  validatePlayerId: (playerId: number) => number;
}>;

type ExploreGrantPayload = Readonly<{
  grantId: number;
  grantedPlots: number;
  plotCount: number;
}>;

type ExploreReleasePayload = Readonly<{
  released: boolean;
}>;

export async function getCiv7VisibilitySummary(
  input: Civ7VisibilitySummaryInput,
  options: Civ7DirectControlOptions = {},
  dependencies: VisibilityReadDependencies = defaultVisibilityReadDependencies
): Promise<Civ7VisibilitySummaryResult> {
  dependencies.validatePlayerId(input.playerId);
  const maxPlots = dependencies.boundedInteger(
    input.maxPlots ?? dependencies.defaultMapGridMaxPlots,
    1,
    dependencies.hardMapGridMaxPlots,
    "maxPlots"
  );
  if (input.includeGrid && !input.bounds) {
    throw new Civ7DirectControlError(
      "command-failed",
      "Visibility grid reads require explicit bounds"
    );
  }
  if (input.bounds) dependencies.validateMapBounds(input.bounds);
  const result = await dependencies.executeTunerCommand({
    ...options,
    command: buildVisibilitySummaryCommand(
      {
        ...input,
        maxPlots,
      },
      dependencies
    ),
  });
  return dependencies.parseVisibilitySummary(result, "Civ7 visibility summary");
}

export async function revealCiv7MapForPlayer(
  input: Readonly<{ playerId: number }>,
  options: Civ7DirectControlOptions = {},
  dependencies: VisibilityRevealDependencies = defaultVisibilityRevealDependencies
): Promise<Civ7RevealMapResult> {
  const playerId = dependencies.validatePlayerId(input.playerId);
  const before = await dependencies.getVisibilitySummary({ playerId }, options);
  const command = await dependencies.executeTunerCommand({
    ...options,
    command: `Visibility.revealAllPlots(${playerId})`,
  });
  const after = await dependencies.getVisibilitySummary({ playerId }, options);
  const beforeCount = dependencies.probeValue(before.numPlotsRevealed);
  const afterCount = dependencies.probeValue(after.numPlotsRevealed);
  const classification =
    beforeCount !== undefined && afterCount !== undefined && afterCount > beforeCount
      ? "revealed"
      : beforeCount !== undefined && afterCount !== undefined && afterCount === beforeCount
        ? "already-revealed"
        : "unverified";
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    playerId,
    before,
    after,
    command,
    classification,
  };
}

/**
 * Applies a tracked visibility grant over every plot for the player — the
 * wire atom behind explore semantics (terrain becomes known/REVEALED while
 * the grant is held; visible count reverts on release, revealed persists —
 * live-verified HIDDEN→VISIBLE→REVEALED with zero leaked visibility
 * refcounts). One Tuner exec; the suspend/drain/resume orchestration around
 * it lives in the Effect layer (@civ7/control-orpc display.explore.request).
 */
export async function applyCiv7ExploreGrant(
  input: Civ7ExploreGrantInput,
  options: Civ7DirectControlOptions = {},
  dependencies: VisibilityGrantDependencies = defaultVisibilityGrantDependencies
): Promise<Civ7ExploreGrantResult> {
  const playerId = dependencies.validatePlayerId(input.playerId);
  const result = await dependencies.executeTunerCommand({
    ...options,
    command: buildExploreGrantCommand(playerId),
  });
  const payload = dependencies.parseExploreGrant(result, "Civ7 explore grant");
  return {
    host: result.host,
    port: result.port,
    state: result.state,
    grantId: payload.grantId,
    grantedPlots: payload.grantedPlots,
    plotCount: payload.plotCount,
  };
}

/**
 * Releases a tracked visibility grant previously applied with
 * applyCiv7ExploreGrant. One Tuner exec.
 */
export async function releaseCiv7ExploreGrant(
  input: Civ7ExploreReleaseInput,
  options: Civ7DirectControlOptions = {},
  dependencies: VisibilityGrantDependencies = defaultVisibilityGrantDependencies
): Promise<Civ7ExploreReleaseResult> {
  const playerId = dependencies.validatePlayerId(input.playerId);
  const grantId = dependencies.boundedInteger(input.grantId, 0, Number.MAX_SAFE_INTEGER, "grantId");
  const result = await dependencies.executeTunerCommand({
    ...options,
    command: buildExploreReleaseCommand(playerId, grantId),
  });
  const payload = dependencies.parseExploreRelease(result, "Civ7 explore grant release");
  return {
    host: result.host,
    port: result.port,
    state: result.state,
    released: payload.released,
  };
}

/** clamp(15s..120s, plotCount * 10ms) — FOW render streaming scales with map size. */
export function defaultExploreSettleMs(plotCount: number): number {
  return Math.min(120_000, Math.max(15_000, Math.round(plotCount * 10)));
}

function buildExploreGrantCommand(playerId: number): string {
  return `(() => {
    const playerId = ${playerId};
    if (typeof Visibility === "undefined" || Visibility === null) throw new Error("Visibility unavailable");
    if (typeof Visibility.setTrackedVisibilityGrant !== "function") {
      throw new Error("Visibility.setTrackedVisibilityGrant unavailable");
    }
    const width = GameplayMap.getGridWidth();
    const height = GameplayMap.getGridHeight();
    const plots = [];
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        plots.push(GameplayMap.getIndexFromXY(x, y));
      }
    }
    const grantId = Visibility.setTrackedVisibilityGrant(playerId, 1, plots);
    return JSON.stringify({ grantId, grantedPlots: plots.length, plotCount: width * height });
  })()`;
}

function buildExploreReleaseCommand(playerId: number, grantId: number): string {
  return `(() => {
    const released = Visibility.removeTrackedVisibilityGrant(${playerId}, ${grantId});
    return JSON.stringify({ released: Boolean(released) });
  })()`;
}

function buildVisibilitySummaryCommand(
  input: Civ7VisibilitySummaryInput & { maxPlots: number },
  dependencies: VisibilityReadDependencies
): string {
  return `(() => {
    ${dependencies.probeHelperSource()}
    const input = ${dependencies.jsLiteral(input)};
    const readState = (x, y) => probe(() => GameplayMap.getRevealedState(input.playerId, x, y));
    const readVisible = (x, y) => probe(() => typeof Visibility !== "undefined" && typeof Visibility.isVisible === "function"
      ? Visibility.isVisible(input.playerId, x, y)
      : false);
    const counts = {};
    const statesFromBounds = () => {
      if (!input.bounds) return [];
      const out = [];
      outer: for (let y = input.bounds.y; y < input.bounds.y + input.bounds.height; y += 1) {
        for (let x = input.bounds.x; x < input.bounds.x + input.bounds.width; x += 1) {
          const state = readState(x, y);
          const key = state.ok ? String(state.value) : "error";
          counts[key] = (counts[key] ?? 0) + 1;
          out.push({ x, y, state, visible: readVisible(x, y) });
          if (out.length >= input.maxPlots) break outer;
        }
      }
      return out;
    };
    const gridStates = input.includeGrid ? statesFromBounds() : [];
    const requestedCount = input.bounds ? input.bounds.width * input.bounds.height : gridStates.length;
    return JSON.stringify({
      playerId: input.playerId,
      numPlotsRevealed: probe(() => typeof Visibility !== "undefined" && typeof Visibility.getPlotsRevealedCount === "function"
        ? Visibility.getPlotsRevealedCount(input.playerId)
        : Players.LiveOpsStats.get(input.playerId).numPlotsRevealed),
      numPlotsVisible: probe(() => typeof Visibility !== "undefined" && typeof Visibility.getPlotsVisibleCount === "function"
        ? Visibility.getPlotsVisibleCount(input.playerId)
        : 0),
      mapPlotCount: probe(() => GameplayMap.getGridWidth() * GameplayMap.getGridHeight()),
      counts,
      ...(input.includeGrid ? {
        grid: {
          bounds: input.bounds,
          plotCount: requestedCount,
          omitted: Math.max(0, requestedCount - gridStates.length),
          states: gridStates,
        },
      } : {}),
    });
  })()`;
}

const defaultVisibilityReadDependencies: VisibilityReadDependencies = {
  boundedInteger,
  defaultMapGridMaxPlots: DEFAULT_CIV7_MAP_GRID_MAX_PLOTS,
  executeTunerCommand: executeCiv7TunerCommand,
  hardMapGridMaxPlots: HARD_CIV7_MAP_GRID_MAX_PLOTS,
  jsLiteral,
  parseVisibilitySummary: (result, label) =>
    jsonPayloadFromCommandResult<Civ7VisibilitySummaryResult>(result, label),
  probeHelperSource,
  validateMapBounds,
  validatePlayerId,
};

const defaultVisibilityRevealDependencies: VisibilityRevealDependencies = {
  ...defaultVisibilityReadDependencies,
  getVisibilitySummary: getCiv7VisibilitySummary,
  probeValue,
};

const defaultVisibilityGrantDependencies: VisibilityGrantDependencies = {
  boundedInteger,
  executeTunerCommand: executeCiv7TunerCommand,
  parseExploreGrant: (result, label) =>
    jsonPayloadFromCommandResult<ExploreGrantPayload>(result, label),
  parseExploreRelease: (result, label) =>
    jsonPayloadFromCommandResult<ExploreReleasePayload>(result, label),
  validatePlayerId,
};

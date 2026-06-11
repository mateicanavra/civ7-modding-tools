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
import { sleep } from "../../timing.js";
import { boundedInteger, validatePlayerId } from "../../validation.js";
import {
  closeCiv7Displays,
  resumeCiv7DisplayQueue,
  suspendCiv7DisplayQueue,
  type Civ7CloseDisplaysInput,
  type Civ7CloseDisplaysResult,
  type Civ7DisplayQueueHoldResult,
} from "../operations/display-queue.js";
import {
  DEFAULT_CIV7_MAP_GRID_MAX_PLOTS,
  HARD_CIV7_MAP_GRID_MAX_PLOTS,
} from "./constants.js";
import type { Civ7MapBounds, Civ7MapLocation } from "./types.js";
import { Civ7MapBoundsSchema, Civ7MapLocationSchema } from "./types.js";
import { validateMapBounds } from "./validation.js";

const civ7TunerStateSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
}, { additionalProperties: false });

export const Civ7VisibilitySummaryInputSchema = Type.Unsafe<Readonly<{
  playerId: number;
  bounds?: Civ7MapBounds;
  includeGrid?: boolean;
  maxPlots?: number;
}>>({
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

export const Civ7VisibilityGridStateSchema = Type.Object({
  ...Civ7MapLocationSchema.properties,
  state: Civ7RuntimeProbeSchema(Type.Union([Type.Number(), Type.String()])),
  visible: Civ7RuntimeProbeSchema(Type.Boolean()),
}, { additionalProperties: false });

export const Civ7VisibilitySummaryResultSchema = Type.Object({
  host: Type.String(),
  port: Type.Number(),
  state: civ7TunerStateSchema,
  playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
  numPlotsRevealed: Civ7RuntimeProbeSchema(Type.Number()),
  numPlotsVisible: Civ7RuntimeProbeSchema(Type.Number()),
  counts: Type.Record(Type.String(), Type.Number()),
  grid: Type.Optional(Type.Object({
    bounds: Civ7MapBoundsSchema,
    plotCount: Type.Number(),
    omitted: Type.Number(),
    states: Type.Array(Civ7VisibilityGridStateSchema),
  }, { additionalProperties: false })),
}, { additionalProperties: false });

export type Civ7VisibilitySummaryResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  playerId: number;
  numPlotsRevealed: Civ7RuntimeProbe<number>;
  numPlotsVisible: Civ7RuntimeProbe<number>;
  counts: Record<string, number>;
  grid?: Readonly<{
    bounds: Civ7MapBounds;
    plotCount: number;
    omitted: number;
    states: ReadonlyArray<Readonly<Civ7MapLocation & {
      state: Civ7RuntimeProbe<number | string>;
      visible: Civ7RuntimeProbe<boolean>;
    }>>;
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

export type Civ7ExploreMapInput = Readonly<{
  playerId: number;
  /**
   * How long the tracked visibility grant stays active before release, giving
   * the FOW renderer time to stream the reveal (it paints progressively) and
   * gameplay time to enqueue discovery displays into the suspended queue.
   * Default adapts to map size: clamp(15s..120s, plotCount * 10ms).
   */
  settleMs?: number;
}>;

export const Civ7ExploreMapInputSchema = Type.Object({
  playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
  settleMs: Type.Optional(Type.Integer({ minimum: 0, maximum: 600_000 })),
}, { additionalProperties: false });

export const Civ7ExploreSideEffectSchema = Type.Object({
  category: Type.String(),
  closed: Type.Integer({ minimum: 1 }),
}, { additionalProperties: false });

export type Civ7ExploreSideEffect = Readonly<{
  category: string;
  closed: number;
}>;

export type Civ7ExploreMapResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  playerId: number;
  before: Civ7VisibilitySummaryResult;
  after: Civ7VisibilitySummaryResult;
  grantId: number;
  grantedPlots: number;
  grantReleased: boolean;
  settleMs: number;
  /**
   * Display requests (wonder-discovery cinematics, unlock/triumph popups, ...)
   * that gameplay enqueued during the grant. They were parked by the suspended
   * DisplayQueueManager and purged through the official close path — nothing
   * was ever shown on screen.
   */
  suppressedDisplays: ReadonlyArray<Civ7ExploreSideEffect>;
  mutation: "Visibility.setTrackedVisibilityGrant";
  /**
   * Exploring marks plots REVEALED, which is a real first-sight discovery
   * gameplay-side (wonders count as discovered, explore challenges progress).
   * Only the UI side effects are suppressed; use disposable sessions.
   */
  discoveryPosture: "ui-suppressed-gameplay-discovers";
  classification: "explored" | "already-explored" | "unverified";
}>;

export type VisibilityReadDependencies = Readonly<{
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  defaultMapGridMaxPlots: number;
  executeTunerCommand: (options: Civ7DirectControlOptions & Readonly<{ command: string }>) => Promise<Civ7CommandResult>;
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
      options?: Civ7DirectControlOptions,
    ) => Promise<Civ7VisibilitySummaryResult>;
    probeValue: <T>(probe: Civ7RuntimeProbe<T>) => T | undefined;
  }>;

type VisibilityExploreDependencies = VisibilityRevealDependencies &
  Readonly<{
    closeDisplays: (
      input: Civ7CloseDisplaysInput,
      options?: Civ7DirectControlOptions,
    ) => Promise<Civ7CloseDisplaysResult>;
    parseExploreGrant: (result: Civ7CommandResult, label: string) => ExploreGrantPayload;
    parseExploreRelease: (result: Civ7CommandResult, label: string) => ExploreReleasePayload;
    resumeDisplayQueue: (options?: Civ7DirectControlOptions) => Promise<Civ7DisplayQueueHoldResult>;
    sleep: (ms: number) => Promise<void>;
    suspendDisplayQueue: (options?: Civ7DirectControlOptions) => Promise<Civ7DisplayQueueHoldResult>;
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
  dependencies: VisibilityReadDependencies = defaultVisibilityReadDependencies,
): Promise<Civ7VisibilitySummaryResult> {
  dependencies.validatePlayerId(input.playerId);
  const maxPlots = dependencies.boundedInteger(
    input.maxPlots ?? dependencies.defaultMapGridMaxPlots,
    1,
    dependencies.hardMapGridMaxPlots,
    "maxPlots",
  );
  if (input.includeGrid && !input.bounds) {
    throw new Civ7DirectControlError("command-failed", "Visibility grid reads require explicit bounds");
  }
  if (input.bounds) dependencies.validateMapBounds(input.bounds);
  const result = await dependencies.executeTunerCommand({
    ...options,
    command: buildVisibilitySummaryCommand(
      {
        ...input,
        maxPlots,
      },
      dependencies,
    ),
  });
  return dependencies.parseVisibilitySummary(result, "Civ7 visibility summary");
}

export async function revealCiv7MapForPlayer(
  input: Readonly<{ playerId: number }>,
  options: Civ7DirectControlOptions = {},
  dependencies: VisibilityRevealDependencies = defaultVisibilityRevealDependencies,
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
 * Explores the whole map for a player — terrain becomes known (REVEALED /
 * fogged) without granting live vision — through the engine's tracked
 * visibility grants, with every UI side effect suppressed:
 *
 *   1. suspend the DisplayQueueManager (App UI) so nothing can mount,
 *   2. Visibility.setTrackedVisibilityGrant over every plot (Tuner),
 *   3. hold the grant for settleMs (FOW renderer paints progressively;
 *      releasing too early live-verifiably strands the paint mid-sweep),
 *   4. purge the parked discovery displays via the official close path,
 *   5. resume the queue, then release the grant (visible count reverts,
 *      revealed state persists — that IS explore semantics, live-verified
 *      HIDDEN→VISIBLE→REVEALED with zero leaked visibility refcounts).
 *
 * This is the gameplay-side equivalent of the native debug console's
 * "Explore All" button (an ImGui render-only override with no scripting
 * binding). Unlike that button, sight is real here: wonders genuinely get
 * discovered and explore challenges progress — only their popups/cinematics
 * are suppressed. Reveal (revealAllPlots) stays a separate, rare-use command.
 */
export async function exploreCiv7MapForPlayer(
  input: Civ7ExploreMapInput,
  options: Civ7DirectControlOptions = {},
  dependencies: VisibilityExploreDependencies = defaultVisibilityExploreDependencies,
): Promise<Civ7ExploreMapResult> {
  const playerId = dependencies.validatePlayerId(input.playerId);
  const before = await dependencies.getVisibilitySummary({ playerId }, options);

  await dependencies.suspendDisplayQueue(options);
  let grant: ExploreGrantPayload;
  try {
    grant = dependencies.parseExploreGrant(
      await dependencies.executeTunerCommand({
        ...options,
        command: buildExploreGrantCommand(playerId),
      }),
      "Civ7 explore grant",
    );
    const settleMs = dependencies.boundedInteger(
      input.settleMs ?? defaultExploreSettleMs(grant.plotCount),
      0,
      600_000,
      "settleMs",
    );
    await dependencies.sleep(settleMs);
    const purge = await dependencies.closeDisplays({}, options);
    await dependencies.resumeDisplayQueue(options);
    const release = dependencies.parseExploreRelease(
      await dependencies.executeTunerCommand({
        ...options,
        command: buildExploreReleaseCommand(playerId, grant.grantId),
      }),
      "Civ7 explore grant release",
    );
    const after = await dependencies.getVisibilitySummary({ playerId }, options);
    const beforeRevealed = dependencies.probeValue(before.numPlotsRevealed);
    const afterRevealed = dependencies.probeValue(after.numPlotsRevealed);
    const classification =
      beforeRevealed !== undefined && afterRevealed !== undefined && afterRevealed > beforeRevealed
        ? "explored"
        : beforeRevealed !== undefined && afterRevealed !== undefined && afterRevealed === beforeRevealed
          ? "already-explored"
          : "unverified";
    return {
      host: after.host,
      port: after.port,
      state: after.state,
      playerId,
      before,
      after,
      grantId: grant.grantId,
      grantedPlots: grant.grantedPlots,
      grantReleased: release.released,
      settleMs,
      suppressedDisplays: purge.closed.map((row) => ({ category: row.category, closed: row.closed })),
      mutation: "Visibility.setTrackedVisibilityGrant",
      discoveryPosture: "ui-suppressed-gameplay-discovers",
      classification,
    };
  } catch (error) {
    // Never leave the queue suspended: a suspended queue silently swallows
    // every later display in the session.
    await dependencies.resumeDisplayQueue(options).catch(() => undefined);
    throw error;
  }
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
  dependencies: VisibilityReadDependencies,
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

const defaultVisibilityExploreDependencies: VisibilityExploreDependencies = {
  ...defaultVisibilityRevealDependencies,
  closeDisplays: closeCiv7Displays,
  parseExploreGrant: (result, label) => jsonPayloadFromCommandResult<ExploreGrantPayload>(result, label),
  parseExploreRelease: (result, label) => jsonPayloadFromCommandResult<ExploreReleasePayload>(result, label),
  resumeDisplayQueue: resumeCiv7DisplayQueue,
  sleep,
  suspendDisplayQueue: suspendCiv7DisplayQueue,
};

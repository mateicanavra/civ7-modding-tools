import { Type } from "typebox";

import { progressDashboardSource } from "./progress-dashboard.js";
import { traditionsViewSource } from "./traditions.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7AppUiCommand } from "../../session/execute.js";
import { validatePlayerId } from "../../validation.js";
import { Civ7RuntimeProbeSchema } from "../../runtime/probe.js";

import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../../session/types.js";
import type { Civ7RuntimeProbe } from "../../runtime/probe.js";

const civ7TunerStateSchema = Type.Object(
  {
    id: Type.String(),
    name: Type.String(),
  },
  { additionalProperties: false }
);

export const Civ7TraditionsViewInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024 })),
  },
  { additionalProperties: false }
);

export type Civ7TraditionActionKind = "activate" | "deactivate";

export const Civ7TraditionActionKindSchema = Type.Union([
  Type.Literal("activate"),
  Type.Literal("deactivate"),
]);

export const Civ7TraditionActionSchema = Type.Object(
  {
    kind: Civ7TraditionActionKindSchema,
    action: Type.Union([Type.Number(), Type.Null()]),
    operationType: Type.Literal("CHANGE_TRADITION"),
    args: Type.Object(
      {
        TraditionType: Type.Number(),
        Action: Type.Union([Type.Number(), Type.Null()]),
      },
      { additionalProperties: false }
    ),
    validation: Civ7RuntimeProbeSchema(Type.Unknown()),
  },
  { additionalProperties: false }
);

export type Civ7TraditionAction = Readonly<{
  kind: Civ7TraditionActionKind;
  action: number | null;
  operationType: "CHANGE_TRADITION";
  args: Readonly<{
    TraditionType: number;
    Action: number | null;
  }>;
  validation: Civ7RuntimeProbe<unknown>;
}>;

export const Civ7TraditionSummarySchema = Type.Object(
  {
    id: Type.Number(),
    type: Type.Union([Type.String(), Type.Null()]),
    name: Type.Union([Type.String(), Type.Null()]),
    description: Type.Union([Type.String(), Type.Null()]),
    ageType: Type.Union([Type.String(), Type.Null()]),
    cultureSlotType: Type.Union([Type.String(), Type.Null()]),
    traitType: Type.Union([Type.String(), Type.Null()]),
    isCrisis: Type.Boolean(),
    active: Type.Boolean(),
    unlocked: Type.Boolean(),
    recentUnlock: Type.Boolean(),
    actionHints: Type.Array(Civ7TraditionActionSchema),
  },
  { additionalProperties: false }
);

export type Civ7TraditionSummary = Readonly<{
  id: number;
  type: string | null;
  name: string | null;
  description: string | null;
  ageType: string | null;
  cultureSlotType: string | null;
  traitType: string | null;
  isCrisis: boolean;
  active: boolean;
  unlocked: boolean;
  recentUnlock: boolean;
  actionHints: ReadonlyArray<Civ7TraditionAction>;
}>;

export type Civ7TraditionsViewInput = Readonly<{
  playerId?: number;
}>;

export const Civ7TraditionsViewResultSchema = Type.Object(
  {
    host: Type.String(),
    port: Type.Number(),
    state: civ7TunerStateSchema,
    playerId: Type.Number(),
    turn: Civ7RuntimeProbeSchema(Type.Number()),
    turnDate: Civ7RuntimeProbeSchema(Type.String()),
    governmentType: Civ7RuntimeProbeSchema(Type.Number()),
    government: Type.Object(
      {
        type: Type.Union([Type.String(), Type.Null()]),
        name: Type.Union([Type.String(), Type.Null()]),
      },
      { additionalProperties: false }
    ),
    slots: Type.Object(
      {
        total: Civ7RuntimeProbeSchema(Type.Number()),
        normal: Civ7RuntimeProbeSchema(Type.Number()),
        crisis: Civ7RuntimeProbeSchema(Type.Number()),
        active: Type.Number(),
        unlocked: Type.Number(),
        available: Type.Number(),
        open: Type.Number(),
      },
      { additionalProperties: false }
    ),
    actions: Type.Object(
      {
        activate: Type.Union([Type.Number(), Type.Null()]),
        deactivate: Type.Union([Type.Number(), Type.Null()]),
      },
      { additionalProperties: false }
    ),
    active: Type.Array(Civ7TraditionSummarySchema),
    available: Type.Array(Civ7TraditionSummarySchema),
    recentUnlocks: Type.Array(Civ7TraditionSummarySchema),
    traditions: Type.Array(Civ7TraditionSummarySchema),
    hiddenInfoPolicy: Type.Literal("player-culture-runtime"),
    notes: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);

export type Civ7TraditionsViewResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  playerId: number;
  turn: Civ7RuntimeProbe<number>;
  turnDate: Civ7RuntimeProbe<string>;
  governmentType: Civ7RuntimeProbe<number>;
  government: Readonly<{
    type: string | null;
    name: string | null;
  }>;
  slots: Readonly<{
    total: Civ7RuntimeProbe<number>;
    normal: Civ7RuntimeProbe<number>;
    crisis: Civ7RuntimeProbe<number>;
    active: number;
    unlocked: number;
    available: number;
    open: number;
  }>;
  actions: Readonly<{
    activate: number | null;
    deactivate: number | null;
  }>;
  active: ReadonlyArray<Civ7TraditionSummary>;
  available: ReadonlyArray<Civ7TraditionSummary>;
  recentUnlocks: ReadonlyArray<Civ7TraditionSummary>;
  traditions: ReadonlyArray<Civ7TraditionSummary>;
  hiddenInfoPolicy: "player-culture-runtime";
  notes: ReadonlyArray<string>;
}>;

export type Civ7ProgressDashboardInput = Readonly<{
  playerId?: number;
}>;

export const Civ7ProgressDashboardInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024 })),
  },
  { additionalProperties: false }
);

export const Civ7ProgressDashboardMilestoneSchema = Type.Object(
  {
    ageProgressionMilestoneType: Type.Union([Type.String(), Type.Null()]),
    legacyPathType: Type.Union([Type.String(), Type.Null()]),
    requiredPathPoints: Type.Union([Type.Number(), Type.Null()]),
    finalMilestone: Type.Boolean(),
    progressionPoints: Civ7RuntimeProbeSchema(Type.Unknown()),
    complete: Civ7RuntimeProbeSchema(Type.Unknown()),
    reachedByScore: Type.Union([Type.Boolean(), Type.Null()]),
  },
  { additionalProperties: false }
);

export const Civ7ProgressDashboardLegacyPathSchema = Type.Object(
  {
    legacyPathType: Type.Union([Type.String(), Type.Null()]),
    legacyPathClassType: Type.Union([Type.String(), Type.Null()]),
    ageType: Type.Union([Type.String(), Type.Null()]),
    name: Type.Union([Type.String(), Type.Null()]),
    description: Type.Union([Type.String(), Type.Null()]),
    enabledByDefault: Type.Boolean(),
    enabledForPlayer: Type.Union([Type.Boolean(), Type.Null()]),
    score: Civ7RuntimeProbeSchema(Type.Number()),
    finalRequiredPathPoints: Type.Union([Type.Number(), Type.Null()]),
    nextMilestone: Type.Union([Civ7ProgressDashboardMilestoneSchema, Type.Null()]),
    milestones: Type.Array(Civ7ProgressDashboardMilestoneSchema),
  },
  { additionalProperties: false }
);

export type Civ7ProgressDashboardLegacyPath = Readonly<{
  legacyPathType: string | null;
  legacyPathClassType: string | null;
  ageType: string | null;
  name: string | null;
  description: string | null;
  enabledByDefault: boolean;
  enabledForPlayer: boolean | null;
  score: Civ7RuntimeProbe<number>;
  finalRequiredPathPoints: number | null;
  nextMilestone: unknown;
  milestones: ReadonlyArray<unknown>;
}>;

export const Civ7ProgressDashboardResultSchema = Type.Object(
  {
    host: Type.String(),
    port: Type.Number(),
    state: civ7TunerStateSchema,
    localPlayerId: Type.Number(),
    playerId: Type.Number(),
    turn: Civ7RuntimeProbeSchema(Type.Number()),
    turnDate: Civ7RuntimeProbeSchema(Type.String()),
    age: Type.Object(
      {
        hash: Type.Unknown(),
        ageType: Type.Union([Type.String(), Type.Null()]),
        name: Type.Union([Type.String(), Type.Null()]),
        chronologyIndex: Type.Unknown(),
        isFinalAge: Civ7RuntimeProbeSchema(Type.Boolean()),
        isSingleAge: Civ7RuntimeProbeSchema(Type.Boolean()),
        isExtendedGame: Civ7RuntimeProbeSchema(Type.Boolean()),
        isAgeOver: Civ7RuntimeProbeSchema(Type.Boolean()),
        currentAgeProgressionPoints: Civ7RuntimeProbeSchema(Type.Number()),
        maxAgeProgressionPoints: Civ7RuntimeProbeSchema(Type.Number()),
        primaryAgeProgression: Civ7RuntimeProbeSchema(Type.Unknown()),
      },
      { additionalProperties: false }
    ),
    player: Type.Object(
      {
        team: Type.Unknown(),
        historicalLegacyPointCountForTeam: Civ7RuntimeProbeSchema(Type.Number()),
      },
      { additionalProperties: false }
    ),
    legacyPaths: Type.Array(Civ7ProgressDashboardLegacyPathSchema),
    victories: Type.Object(
      {
        rows: Type.Array(
          Type.Object(
            {
              victoryType: Type.Union([Type.String(), Type.Null()]),
              victoryClassType: Type.Union([Type.String(), Type.Null()]),
              name: Type.Union([Type.String(), Type.Null()]),
              description: Type.Union([Type.String(), Type.Null()]),
            },
            { additionalProperties: false }
          )
        ),
      },
      { additionalProperties: false }
    ),
    triumphs: Type.Object(
      {
        count: Type.Number(),
        rows: Type.Array(
          Type.Object(
            {
              type: Type.Union([Type.String(), Type.Null()]),
              name: Type.Union([Type.String(), Type.Null()]),
              description: Type.Union([Type.String(), Type.Null()]),
            },
            { additionalProperties: false }
          )
        ),
        source: Type.Literal("runtime-gameinfo"),
      },
      { additionalProperties: false }
    ),
    proof: Type.Object(
      {
        victoryManagerGlobal: Civ7RuntimeProbeSchema(Type.String()),
        sources: Type.Array(Type.String()),
      },
      { additionalProperties: false }
    ),
    hiddenInfoPolicy: Type.Literal("local-player-runtime-progress"),
    notes: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);

export type Civ7ProgressDashboardResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  playerId: number;
  turn: Civ7RuntimeProbe<number>;
  turnDate: Civ7RuntimeProbe<string>;
  age: Readonly<{
    hash: unknown;
    ageType: string | null;
    name: string | null;
    chronologyIndex: unknown;
    isFinalAge: Civ7RuntimeProbe<boolean>;
    isSingleAge: Civ7RuntimeProbe<boolean>;
    isExtendedGame: Civ7RuntimeProbe<boolean>;
    isAgeOver: Civ7RuntimeProbe<boolean>;
    currentAgeProgressionPoints: Civ7RuntimeProbe<number>;
    maxAgeProgressionPoints: Civ7RuntimeProbe<number>;
    primaryAgeProgression: Civ7RuntimeProbe<unknown>;
  }>;
  player: Readonly<{
    team: unknown;
    historicalLegacyPointCountForTeam: Civ7RuntimeProbe<number>;
  }>;
  legacyPaths: ReadonlyArray<Civ7ProgressDashboardLegacyPath>;
  victories: Readonly<{
    rows: ReadonlyArray<unknown>;
  }>;
  triumphs: Readonly<{
    count: number;
    rows: ReadonlyArray<unknown>;
    source: "runtime-gameinfo";
  }>;
  proof: Readonly<{
    victoryManagerGlobal: Civ7RuntimeProbe<string>;
    sources: ReadonlyArray<string>;
  }>;
  hiddenInfoPolicy: "local-player-runtime-progress";
  notes: ReadonlyArray<string>;
}>;

type ProgressionReadBaseDependencies = Readonly<{
  validatePlayerId: (playerId: number) => void;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>
  ) => Promise<Civ7CommandResult>;
}>;

export type TraditionsViewDependencies = ProgressionReadBaseDependencies &
  Readonly<{
    parseTraditionsView: (result: Civ7CommandResult, label: string) => Civ7TraditionsViewResult;
  }>;

export type ProgressDashboardDependencies = ProgressionReadBaseDependencies &
  Readonly<{
    parseProgressDashboard: (
      result: Civ7CommandResult,
      label: string
    ) => Civ7ProgressDashboardResult;
  }>;

export async function getCiv7TraditionsView(
  input: Civ7TraditionsViewInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: TraditionsViewDependencies = defaultTraditionsViewDependencies
): Promise<Civ7TraditionsViewResult> {
  if (input.playerId !== undefined) dependencies.validatePlayerId(input.playerId);
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildTraditionsViewCommand(input),
  });
  return dependencies.parseTraditionsView(result, "Civ7 traditions view");
}

export async function getCiv7ProgressDashboard(
  input: Civ7ProgressDashboardInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: ProgressDashboardDependencies = defaultProgressDashboardDependencies
): Promise<Civ7ProgressDashboardResult> {
  if (input.playerId !== undefined) dependencies.validatePlayerId(input.playerId);
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildProgressDashboardCommand(input),
  });
  return dependencies.parseProgressDashboard(result, "Civ7 progress dashboard");
}

function buildTraditionsViewCommand(input: Civ7TraditionsViewInput): string {
  return `(() => {
    ${traditionsViewSource()}
    return JSON.stringify(readTraditionsView(${jsLiteral(input)}));
  })()`;
}

function buildProgressDashboardCommand(input: Civ7ProgressDashboardInput): string {
  return `(() => {
    ${progressDashboardSource()}
    return JSON.stringify(readProgressDashboard(${jsLiteral(input)}));
  })()`;
}

const defaultTraditionsViewDependencies: TraditionsViewDependencies = {
  validatePlayerId,
  executeAppUiCommand: executeCiv7AppUiCommand,
  parseTraditionsView: (result, label) =>
    jsonPayloadFromCommandResult<Civ7TraditionsViewResult>(result, label),
};

const defaultProgressDashboardDependencies: ProgressDashboardDependencies = {
  validatePlayerId,
  executeAppUiCommand: executeCiv7AppUiCommand,
  parseProgressDashboard: (result, label) =>
    jsonPayloadFromCommandResult<Civ7ProgressDashboardResult>(result, label),
};

import { progressDashboardSource } from "./progress-dashboard.js";
import { traditionsViewSource } from "./traditions.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7AppUiCommand } from "../../session/execute.js";
import { validatePlayerId } from "../../validation.js";

import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../../session/types.js";
import type { Civ7RuntimeProbe } from "../../runtime/probe.js";

export type Civ7TraditionActionKind = "activate" | "deactivate";

export type Civ7TraditionAction = Readonly<{
  kind: Civ7TraditionActionKind;
  action: number | null;
  operationType: "CHANGE_TRADITION";
  args: Readonly<{
    TraditionType: number;
    Action: number | null;
  }>;
  validation: Civ7RuntimeProbe<unknown>;
  cli: string;
}>;

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
  recommendedCli: ReadonlyArray<string>;
  hiddenInfoPolicy: "player-culture-runtime";
  notes: ReadonlyArray<string>;
}>;

export type Civ7ProgressDashboardInput = Readonly<{
  playerId?: number;
}>;

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
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
}>;

type TraditionsViewDependencies = ProgressionReadBaseDependencies & Readonly<{
  parseTraditionsView: (result: Civ7CommandResult, label: string) => Civ7TraditionsViewResult;
}>;

type ProgressDashboardDependencies = ProgressionReadBaseDependencies & Readonly<{
  parseProgressDashboard: (result: Civ7CommandResult, label: string) => Civ7ProgressDashboardResult;
}>;

export async function getCiv7TraditionsView(
  input: Civ7TraditionsViewInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: TraditionsViewDependencies = defaultTraditionsViewDependencies,
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
  dependencies: ProgressDashboardDependencies = defaultProgressDashboardDependencies,
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

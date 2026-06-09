import { Civ7DirectControlError } from "../../direct-control-error";
import { progressDashboardSource } from "./progress-dashboard";
import { traditionsViewSource } from "./traditions";

import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7ProgressDashboardInput,
  Civ7ProgressDashboardResult,
  Civ7TraditionsViewInput,
  Civ7TraditionsViewResult,
} from "../../index";

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
  dependencies: TraditionsViewDependencies,
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
  dependencies: ProgressDashboardDependencies,
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

function jsLiteral(value: unknown): string {
  const json = JSON.stringify(value);
  if (json === undefined) {
    throw new Civ7DirectControlError("command-failed", "Cannot serialize Civ7 command input");
  }
  return json;
}

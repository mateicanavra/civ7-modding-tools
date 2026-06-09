import { withCiv7DirectControlSession } from "./session.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
  Civ7TunerStateSelection,
} from "./types.js";

export async function queryCiv7TunerStates(options: Civ7DirectControlOptions = {}): Promise<ReadonlyArray<Civ7TunerState>> {
  return await withCiv7DirectControlSession(options, async (session) => await session.queryStates());
}

export async function executeCiv7Command(options: Civ7DirectControlOptions & {
  command: string;
  state?: Civ7TunerStateSelection;
}): Promise<Civ7CommandResult> {
  return await withCiv7DirectControlSession(options, async (session) => await session.executeCommand(options));
}

export async function executeCiv7AppUiCommand(options: Civ7DirectControlOptions & {
  command: string;
}): Promise<Civ7CommandResult> {
  return await executeCiv7Command({
    ...options,
    state: { role: "app-ui" },
  });
}

export async function executeCiv7TunerCommand(options: Civ7DirectControlOptions & {
  command: string;
}): Promise<Civ7CommandResult> {
  return await executeCiv7Command({
    ...options,
    state: { role: "tuner" },
  });
}

import { Civ7DirectControlSession } from "./session.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
  Civ7TunerStateSelection,
} from "./types.js";

export async function queryCiv7TunerStates(options: Civ7DirectControlOptions = {}): Promise<ReadonlyArray<Civ7TunerState>> {
  const session = new Civ7DirectControlSession(options);
  try {
    return await session.queryStates();
  } finally {
    await session.close();
  }
}

export async function executeCiv7Command(options: Civ7DirectControlOptions & {
  command: string;
  state?: Civ7TunerStateSelection;
}): Promise<Civ7CommandResult> {
  const session = new Civ7DirectControlSession(options);
  try {
    return await session.executeCommand(options);
  } finally {
    await session.close();
  }
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

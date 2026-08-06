import type { Civ7Tuner, Civ7TunerFailure } from "@civ7/tuner";
import { Effect } from "effect";

declare const tuner: Civ7Tuner;

const states = tuner.queryStates();
const command = tuner.execute({
  command: "Game.getCurrentGameTurn()",
  state: { role: "app-ui" },
});
const checkedStates = states.pipe(Effect.mapError((failure): Civ7TunerFailure => failure));
const checkedCommand = command.pipe(Effect.mapError((failure): Civ7TunerFailure => failure));

void states;
void command;
void checkedStates;
void checkedCommand;

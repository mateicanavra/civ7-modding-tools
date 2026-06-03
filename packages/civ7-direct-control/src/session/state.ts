import { Civ7DirectControlError } from "../direct-control-error.js";
import {
  CIV7_TUNER_APP_UI_STATE_NAME,
  CIV7_TUNER_STATE_NAME,
} from "./constants.js";
import type {
  Civ7TunerState,
  Civ7TunerStateSelection,
} from "./types.js";

export function selectCiv7TunerState(
  states: ReadonlyArray<Civ7TunerState>,
  selection: Civ7TunerStateSelection = { role: "app-ui" },
): Civ7TunerState {
  const requested = normalizeStateSelection(selection);
  const state = states.find((candidate) => {
    if (requested.id && candidate.id === requested.id) return true;
    if (requested.name && candidate.name === requested.name) return true;
    return false;
  });
  if (!state) {
    const requestedLabel = requested.name ?? requested.id ?? "unknown";
    throw new Civ7DirectControlError(
      "state-not-found",
      `Civ7 tuner state "${requestedLabel}" was not available; states: ${states.map((s) => s.name).join(", ")}`,
      { details: { requested, states } },
    );
  }
  return state;
}

function normalizeStateSelection(selection: Civ7TunerStateSelection): { id?: string; name?: string } {
  if (typeof selection === "string") {
    return selection === CIV7_TUNER_APP_UI_STATE_NAME || selection === CIV7_TUNER_STATE_NAME
      ? { name: selection }
      : { id: selection, name: selection };
  }
  if (selection.role === "app-ui") return { name: CIV7_TUNER_APP_UI_STATE_NAME };
  if (selection.role === "tuner") return { name: CIV7_TUNER_STATE_NAME };
  return { id: selection.id, name: selection.name };
}

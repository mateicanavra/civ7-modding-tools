// localStorage bridge for run-in-game request correlation across dev-server
// reloads. These key strings are a persistence CONTRACT — they are reproduced
// verbatim from `App.tsx` (app-decomposition slice) and must not change.
import { parseRunInGameSourceSnapshot, type RunInGameSourceSnapshot } from "./clientState";

export const RUN_IN_GAME_LAST_REQUEST_KEY = "mapgen-studio.runInGame.lastRequestId.v1";
export const RUN_IN_GAME_LAST_SNAPSHOT_KEY = "mapgen-studio.runInGame.lastSnapshot.v1";
export const RUN_IN_GAME_LAST_SOURCE_KEY = "mapgen-studio.runInGame.lastSource.v1";

export function readStoredRunInGameSourceSnapshot(): RunInGameSourceSnapshot | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return parseRunInGameSourceSnapshot(localStorage.getItem(RUN_IN_GAME_LAST_SOURCE_KEY));
  } catch {
    return null;
  }
}

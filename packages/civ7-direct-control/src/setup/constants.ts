import {
  CIV7_GAME_OPTION_IDS,
  CIV7_MAP_OPTION_IDS,
  CIV7_PLAYER_OPTION_IDS,
  CIV7_SETUP_LIFECYCLE_PARAMETER_IDS,
} from "@civ7/map-policy/setup";

export const CIV7_RESTART_COMMAND = "Network.restartGame()";
export const CIV7_BEGIN_GAME_COMMAND = "UI.notifyUIReady()";
export const CIV7_EXIT_TO_MAIN_MENU_COMMAND = 'engine.call("exitToMainMenu")';
export const CIV7_RELOAD_UI_COMMAND = "UI.reloadUI()";
export {
  CIV7_UI_LOADING_STATES,
  type Civ7UiLoadingStateName,
} from "../game-ui/loading-states.js";

/** GameSetup parameters observed by the default setup snapshot. */
export const DEFAULT_CIV7_SETUP_PARAMETER_IDS = Object.freeze([
  ...CIV7_SETUP_LIFECYCLE_PARAMETER_IDS,
  ...CIV7_GAME_OPTION_IDS,
  ...CIV7_MAP_OPTION_IDS,
]);

/** Player GameSetup parameters observed by the default setup snapshot. */
export const DEFAULT_CIV7_PLAYER_SETUP_PARAMETER_IDS = CIV7_PLAYER_OPTION_IDS;
